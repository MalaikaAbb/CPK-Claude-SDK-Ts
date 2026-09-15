import { type Page } from 'playwright';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { CPK, assertNoErrorBanner, restOn, sleep, textOf } from './_shared';

/**
 * `change_background` -- a tool whose handler runs in the browser.
 *
 * The page's claim is not "the agent can talk about backgrounds". It is that
 * the handler closes over `setBackground` and therefore has direct access to
 * component state, because it executes on the client rather than on the agent
 * server. A prose answer looks identical on video and proves none of that.
 *
 * So the check is the state itself. The page prints the live value as
 * `current: <css>`, so reading it before and after the turn is the difference
 * between "the model described a gradient" and "the model changed the page".
 */
const CURRENT_LINE = 'main p.font-mono';

export const runFrontendToolsAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  const before = await textOf(page, CURRENT_LINE);
  console.log(`   [Frontend tools] Background before the turn: ${before || '(not rendered)'}`);
  await restOn(page, page.locator(CURRENT_LINE).first(), 1500, { x: 400, y: 300 });

  console.log(`   [Frontend tools] Asking the agent to change it...`);
  const msgCount = await sendPrompt(page, config.prompt);

  // The agent's confirmation only arrives after the browser-side handler
  // returned its result over AG-UI, so waiting for the reply also waits for the
  // round trip -- but the reply is not the proof, the changed value is.
  await waitForAgentResponseCompletion(page, 1500, msgCount);
  await assertNoErrorBanner(page);

  let after = await textOf(page, CURRENT_LINE);
  if (after === before) {
    // The state write lands a render after the tool result, which can be a beat
    // behind the reply finishing.
    await sleep(2000);
    after = await textOf(page, CURRENT_LINE);
  }

  if (!after || after === before) {
    throw new Error(
      `The page background never changed (still ${after || 'unrendered'}). The ` +
        'agent answered without calling `change_background`, or the frontend ' +
        'tool was not forwarded in the AG-UI run input -- a frontend tool travels ' +
        'in `input.tools` and ClaudeAgentAdapter turns it into its own ag_ui MCP ' +
        'server, so nothing should need registering on the agent server.',
    );
  }

  console.log(`   ✓ the browser-side handler ran: ${after}`);
  await restOn(page, page.locator(CURRENT_LINE).first(), 2500, { x: 400, y: 300 });
  await restOn(page, page.locator(CPK.assistantMessage).last(), config.waitAfterPromptMs ?? 3000);
};
