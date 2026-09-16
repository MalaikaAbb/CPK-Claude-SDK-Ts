import { type Page } from 'playwright';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { waitForAgentResponseCompletion } from '../core/actions';
import { CPK, assertNoErrorBanner, clickLikeAPerson, restOn, sleep } from './_shared';

/**
 * Running and stopping an agent with nothing typed.
 *
 * `agent.addMessage(...)` + `copilotkit.runAgent({ agent })` starts a turn
 * because the application decided to, and `copilotkit.stopAgent({ agent })`
 * ends one the same way. The composer is never touched.
 *
 * The sequence:
 *
 *   1. Run agent            -> a run starts; Stop enables
 *   2. wait 10 seconds      -> the reply is mid-stream (or done)
 *   3. Stop                 -> stopAgent cuts the run; Run agent re-enables
 *   4. Run agent again      -> a second run starts and is allowed to finish
 *
 * Step 3 only has a visible effect while a run is still going, so it is
 * clicked through `force` when the button has already disabled itself -- the
 * click is part of the demonstration either way, and a run that finished
 * inside ten seconds is not a failure.
 *
 * The pass condition is the second run: a reply has to arrive after the stop,
 * which proves stopAgent left the agent in a state runAgent can start again.
 */
const RUN = 'button:text-is("Run agent")';
const STOP = 'button:text-is("Stop")';
const FIRST_RUN_MS = 10_000;

/** Waits for the page's own button with exactly this label to be enabled. */
async function waitForEnabled(page: Page, label: string, timeoutMs: number): Promise<boolean> {
  return page
    .waitForFunction(
      (text) =>
        Array.from(document.querySelectorAll('button')).some(
          (b) => b.textContent?.trim() === text && !(b as HTMLButtonElement).disabled,
        ),
      label,
      { timeout: timeoutMs },
    )
    .then(() => true)
    .catch(() => false);
}

export const runProgrammaticAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  const run = page.locator(RUN).first();
  const stop = page.locator(STOP).first();
  await run.waitFor({ state: 'visible', timeout: 20000 });

  console.log(`   [Programmatic control] 1/4: Run agent...`);
  await restOn(page, run, 1200);
  await clickLikeAPerson(page, run, 'Run agent');

  const stopEnabled = await waitForEnabled(page, 'Stop', 10000);
  console.log(
    stopEnabled
      ? '   ✓ run started -- Stop is enabled.'
      : '   ⚠ Stop did not enable; the run may have been too quick to catch.',
  );

  console.log(`   [Programmatic control] 2/4: letting it run for ${FIRST_RUN_MS / 1000}s...`);
  await restOn(page, page.locator(CPK.messageList).first(), FIRST_RUN_MS, { x: 1480, y: 400 });

  console.log(`   [Programmatic control] 3/4: Stop...`);
  const stillRunning = await stop.isEnabled().catch(() => false);
  if (stillRunning) {
    await clickLikeAPerson(page, stop, 'Stop');
    console.log('   ✓ stopAgent called mid-run.');
  } else {
    // Glide there anyway so the step is on video, then press without the
    // enabled check -- a disabled button just ignores it.
    await restOn(page, stop, 600);
    await stop.click({ force: true, timeout: 3000 }).catch(() => {});
    console.log('   ℹ the first run had already finished, so Stop had nothing to cut.');
  }

  // Run agent re-enables once the stop has settled; clicking before that is a
  // no-op (`if (agent.isRunning) return`).
  if (!(await waitForEnabled(page, 'Run agent', 15000))) {
    throw new Error(
      'Run agent never re-enabled after Stop: `agent.isRunning` stayed true, so ' +
        'stopAgent did not actually end the run.',
    );
  }
  await sleep(800);

  console.log(`   [Programmatic control] 4/4: Run agent again...`);
  const before = await page.locator(CPK.assistantMessage).count().catch(() => 0);
  await clickLikeAPerson(page, run, 'Run agent');

  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, before);
  await assertNoErrorBanner(page);
  console.log('   ✓ the second run completed after the stop.');
};
