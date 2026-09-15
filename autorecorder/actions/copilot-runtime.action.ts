import { type Page } from 'playwright';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { waitForAgentResponseCompletion } from '../core/actions';
import { assertNoErrorBanner, clickLikeAPerson, restOn, sleep } from './_shared';

/**
 * The AG-UI protocol capture, which renders none of CopilotKit's chrome.
 *
 * This route subscribes to `agent.subscribe` and prints every protocol callback
 * beside the transcript those events assemble into. That means no
 * `copilot-chat-textarea`, no `copilot-assistant-message`, and no send button --
 * so every selector the shared helpers default to matches nothing here, and
 * `actions/index.ts` hands `waitForPageReady` this page's own input instead.
 *
 * The composer arrives pre-populated with the page's own suggestion, which has
 * to be cleared before typing or the two prompts concatenate.
 *
 * The pass condition is the event stream, not the reply. A transcript can fill
 * from cached state; `RUN_STARTED` through `RUN_FINISHED` appearing in the left
 * pane is the only thing that proves a run actually went over the wire, which
 * is what this page exists to make inspectable.
 */
const RUN_BUTTON = 'button:text-is("Run")';
const EVENT_ROW = 'ol li';
/**
 * Assistant paragraphs in the right-hand transcript. Both roles render a `<p>`;
 * the assistant's is the one with the top-left corner squared off
 * (`rounded-tl-sm`), the user's squares the top-right. Nothing in the event
 * pane carries either class.
 */
const TRANSCRIPT_ASSISTANT = 'p.rounded-tl-sm';

export const runCopilotRuntimeAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  const input = page.locator('input').first();
  await input.waitFor({ state: 'visible', timeout: 20000 });

  console.log(`   [Copilot Runtime] Both panes start empty -- events left, transcript right.`);
  await restOn(page, page.locator('h2').first(), 1800, { x: 400, y: 120 });

  console.log(`   [Copilot Runtime] Replacing the suggested prompt...`);
  await clickLikeAPerson(page, input, 'prompt field');
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(config.prompt, { delay: 30 });
  await sleep(400);

  const typed = (await input.inputValue().catch(() => '')).trim();
  if (typed !== config.prompt.trim()) {
    throw new Error(
      `The prompt field holds "${typed}" rather than the configured prompt. The ` +
        'field arrives pre-populated, so it has to be cleared before typing.',
    );
  }

  await clickLikeAPerson(page, page.locator(RUN_BUTTON).first(), 'Run');

  const sawStart = await page
    .waitForFunction(
      (sel) => {
        const rows = Array.from(document.querySelectorAll(sel as string));
        return rows.some((r) => (r.textContent || '').includes('RUN_STARTED'));
      },
      EVENT_ROW,
      { timeout: 30000 },
    )
    .then(() => true)
    .catch(() => false);

  if (!sawStart) {
    throw new Error(
      'No RUN_STARTED row appeared in the AG-UI event pane within 30s. Per this ' +
        "route's own notes: \"No events at all means the runtime route itself is " +
        'not reachable."',
    );
  }
  console.log(`   ✓ RUN_STARTED captured -- the protocol is flowing.`);
  await restOn(page, page.locator(EVENT_ROW).first(), 2000, { x: 400, y: 300 });

  // The transcript is this page's own markup, so the shared detector needs to
  // be pointed at it: assistant paragraphs carry `rounded-tl-sm`, the user's
  // carry `rounded-tr-sm`.
  await waitForAgentResponseCompletion(page, 2000, 0, TRANSCRIPT_ASSISTANT);
  await assertNoErrorBanner(page);

  // The route's `<TryIt>` block names the exact sequence that counts as a pass:
  // RUN_STARTED -> TEXT_MESSAGE_START -> a counted burst of
  // TEXT_MESSAGE_CONTENT deltas -> TEXT_MESSAGE_END -> RUN_FINISHED. Checking
  // the whole chain rather than just the ends is the point of the page: it is
  // the one surface that can tell a broken stream from a broken renderer.
  const captured: string[] = await page
    .locator(EVENT_ROW)
    .allTextContents()
    .catch(() => []);

  const EXPECTED = [
    'RUN_STARTED',
    'TEXT_MESSAGE_START',
    'TEXT_MESSAGE_CONTENT',
    'TEXT_MESSAGE_END',
    'RUN_FINISHED',
  ];

  // In order, not merely present: the events have to arrive as a lifecycle.
  let cursor = 0;
  const missing: string[] = [];
  for (const type of EXPECTED) {
    const at = captured.findIndex((row, i) => i >= cursor && row.includes(type));
    if (at === -1) missing.push(type);
    else cursor = at + 1;
  }

  if (captured.some((row) => row.includes('RUN_FAILED'))) {
    throw new Error(
      'The event pane recorded RUN_FAILED. Per this route’s own notes: ' +
        '"RUN_STARTED followed straight by RUN_FAILED means the runtime reached ' +
        'the server and the run errored -- check the agent server’s console."',
    );
  }

  if (missing.length > 0) {
    throw new Error(
      `The AG-UI lifecycle is incomplete: ${missing.join(', ')} never arrived in ` +
        `order. Captured ${captured.length} rows: ` +
        `${captured.map((r) => r.trim().split(/\s{2,}/)[1] ?? r.trim()).slice(0, 12).join(' -> ')}`,
    );
  }
  console.log(`   ✓ full lifecycle captured: ${EXPECTED.join(' -> ')}.`);

  console.log(`   [Copilot Runtime] Resting on the event list...`);
  await restOn(page, page.locator(EVENT_ROW).last(), config.waitAfterPromptMs ?? 3000, {
    x: 400,
    y: 600,
  });
};
