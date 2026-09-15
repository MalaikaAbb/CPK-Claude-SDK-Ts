import { type Page } from 'playwright';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { CPK, assertNoErrorBanner, clickLikeAPerson, restOn, sleep } from './_shared';

/**
 * The three prebuilt surfaces, one route each.
 *
 * Unlike the reference implementation this folder came from, this app does not
 * tab all three onto one page -- `/prebuilt-components/{chat,sidebar,popup}` are
 * separate doc pages and separate demos, so each gets its own short handler.
 *
 * `<CopilotChat>` needs nothing beyond the standard action: it is the chat, and
 * sending a prompt is the whole demonstration. The sidebar and the popup each
 * make a claim about *layout* that only shows when the surface is closed and
 * reopened, so those two are driven.
 */

/**
 * The sidebar's point is that it is a sibling of the page, not a wrapper: the
 * column beside it keeps its width when the sidebar collapses. So the run
 * closes it, holds on the unreflowed page, and reopens it.
 */
export const runSidebarAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Sidebar] Sending a prompt into the docked sidebar...`);
  const before = await sendPrompt(page, config.prompt);
  await waitForAgentResponseCompletion(page, 1500, before);
  await assertNoErrorBanner(page);

  console.log(`   [Sidebar] Collapsing it -- the main column should not reflow...`);
  await clickLikeAPerson(page, page.locator(CPK.closeButton).first(), 'sidebar close');
  await sleep(600);
  await restOn(page, page.locator('main h1').first(), 2200, { x: 700, y: 300 });

  console.log(`   [Sidebar] Reopening from the launcher...`);
  await clickLikeAPerson(page, page.locator(CPK.toggle).first(), 'sidebar launcher');
  await sleep(1200);

  await restOn(page, page.locator(CPK.assistantMessage).last(), config.waitAfterPromptMs ?? 3000);
};

/**
 * The popup makes the opposite claim: it floats *over* the page rather than
 * beside it. Same shape of proof -- close it, show the page is untouched
 * underneath, bring it back from the bottom-right launcher.
 */
export const runPopupAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Popup] Sending a prompt into the floating popup...`);
  const before = await sendPrompt(page, config.prompt);
  await waitForAgentResponseCompletion(page, 1500, before);
  await assertNoErrorBanner(page);

  console.log(`   [Popup] Dismissing it to show the page underneath is unchanged...`);
  await clickLikeAPerson(page, page.locator(CPK.closeButton).first(), 'popup close');
  await sleep(800);
  await restOn(page, page.locator('main p').first(), 2200, { x: 700, y: 300 });

  console.log(`   [Popup] Reopening from the launcher...`);
  await clickLikeAPerson(page, page.locator(CPK.toggle).first(), 'popup launcher');
  await sleep(1200);

  await restOn(page, page.locator(CPK.assistantMessage).last(), config.waitAfterPromptMs ?? 3000);
};

/**
 * Open/close and feedback, which are two separate claims on one page.
 *
 * The doc's `OpenChatButton` reads `isModalOpen` off the chat configuration
 * context and flips it -- no ref, no imperative handle -- so its label toggles
 * between "Open chat" and "Close chat" and the sidebar follows. That round trip
 * is the first half.
 *
 * The second half is the `messageView.assistantMessage` feedback handlers. The
 * thumbs controls only exist because `onThumbsUp`/`onThumbsDown` were passed,
 * and each handler receives the assistant `message` -- which the page proves by
 * appending `up · <message.id>` to a list. Clicking one and then finding that
 * row is what separates "the buttons render" from "the handler ran with the
 * right message", and only the second is what the page claims.
 */
const FEEDBACK_ROW = 'main ul li.font-mono';

export const runChatControlsAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  const docButton = page.locator('main button:has-text("chat")').first();

  console.log(`   [Chat controls] 1/3: the doc's OpenChatButton closes the sidebar...`);
  await clickLikeAPerson(page, docButton, 'OpenChatButton');
  await sleep(1200);
  await restOn(page, docButton, 1800);

  console.log(`   [Chat controls] ...and reopens it, from the same context value.`);
  await clickLikeAPerson(page, docButton, 'OpenChatButton');
  await sleep(1200);

  console.log(`   [Chat controls] 2/3: sending a prompt so there is a reply to rate...`);
  const before = await sendPrompt(page, config.prompt);
  await waitForAgentResponseCompletion(page, 1500, before);
  await assertNoErrorBanner(page);

  console.log(`   [Chat controls] 3/3: rating the reply through the feedback slot...`);
  // The thumbs buttons live in the assistant toolbar and only exist because
  // handlers were supplied. Match on the toolbar's own buttons rather than a
  // guessed test id, then take the thumbs-up -- the toolbar's first control is
  // copy, which every surface renders.
  const toolbar = page.locator(CPK.assistantToolbar).last();
  await toolbar.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  const buttons = toolbar.locator('button');
  const count = await buttons.count().catch(() => 0);

  if (count < 2) {
    throw new Error(
      `The assistant toolbar rendered ${count} control(s); the feedback handlers ` +
        'should have added thumbs-up and thumbs-down alongside copy. The ' +
        '`messageView.assistantMessage` slot is not receiving onThumbsUp/onThumbsDown.',
    );
  }

  await clickLikeAPerson(page, buttons.nth(1), 'thumbs-up');
  await sleep(1200);

  const row = page.locator(FEEDBACK_ROW).first();
  if (!(await row.isVisible({ timeout: 6000 }).catch(() => false))) {
    throw new Error(
      'The feedback list stayed empty after clicking a rating control: the ' +
        'handler passed to the assistant-message slot never fired, so the page ' +
        'rendered the buttons without wiring them.',
    );
  }
  console.log(`   ✓ feedback captured: "${(await row.textContent())?.trim()}"`);

  await restOn(page, row, config.waitAfterPromptMs ?? 3000);
};
