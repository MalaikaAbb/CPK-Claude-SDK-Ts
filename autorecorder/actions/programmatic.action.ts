import { type Page } from 'playwright';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { waitForAgentResponseCompletion } from '../core/actions';
import { CPK, assertNoErrorBanner, clickLikeAPerson, restOn, sleep } from './_shared';

/**
 * Running an agent with nothing typed.
 *
 * `agent.addMessage(...)` followed by `copilotkit.runAgent({ agent })` is the
 * whole subject of this page: a turn starts because the application decided it
 * should, not because someone pressed send. Typing into the sidebar would
 * record a video of an ordinary chat and demonstrate the opposite.
 *
 * So the composer is never touched. The handler presses the page's own "Run
 * agent" button, which appends a fixed message and calls `runAgent` itself, and
 * then waits on the sidebar the message appears in -- the message list is a
 * normal `<CopilotSidebar>`, so the default detector applies.
 *
 * `Stop` is left alone deliberately. `copilotkit.stopAgent` is the page's other
 * half, but aborting mid-stream means the recording ends on a truncated reply,
 * so the button is shown rather than pressed.
 */
const RUN = 'button:text-is("Run agent")';
const STOP = 'button:text-is("Stop")';

export const runProgrammaticAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  const run = page.locator(RUN).first();
  await run.waitFor({ state: 'visible', timeout: 20000 });

  console.log(`   [Programmatic control] The page drives the run, not the composer...`);
  await restOn(page, run, 1800);

  const before = await page.locator(CPK.assistantMessage).count().catch(() => 0);
  await clickLikeAPerson(page, run, 'Run agent');
  await sleep(800);

  // While it runs both buttons flip: Run disables, Stop enables. Showing that
  // is the cheapest way to make `agent.isRunning` visible on video.
  console.log(`   [Programmatic control] agent.isRunning gates both controls...`);
  await restOn(page, page.locator(STOP).first(), 1500);

  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, before);
  await assertNoErrorBanner(page);
};
