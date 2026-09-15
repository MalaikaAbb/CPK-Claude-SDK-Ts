import { type Page } from 'playwright';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { waitForAgentResponseCompletion } from '../core/actions';
import { humanGlide } from '../core/overlays/cursor';
import { restOn, sleep } from './_shared';
import { waitForDomSettled } from './page-ready';

/**
 * Deliberately NOT routed through `sendPrompt`.
 *
 * This page renders no CopilotKit chrome at all -- `useAgent` plus
 * `useCopilotKit`, an `<input>` and a `<button>` of its own. Two consequences,
 * and both are why the shared helper cannot serve it:
 *
 *   1. There is no `data-testid="copilot-chat-textarea"`, so the global
 *      selector contract matches nothing. `actions/index.ts` hands
 *      `waitForPageReady` this page's own input selector for the same reason.
 *
 *   2. The composer is pinned to the bottom of a `h-full` column, which at
 *      1080p puts it at roughly y=1026..1064 -- underneath the simulated
 *      taskbar, which owns the bottom 48px and swallows clicks. A real mouse
 *      press on the input never lands, focus never moves, and every typed
 *      character goes nowhere; the video then shows an empty box and no
 *      conversation.
 *
 * So the cursor glides there for the camera and focus is set programmatically,
 * which no overlay can intercept. Submitting goes through the form's Enter
 * handler for the same reason.
 */
const INPUT = 'input[placeholder="Your own composer…"]';

/**
 * The page's own assistant bubbles.
 *
 * `AssistantBubble` is a `flex flex-col items-start gap-2` wrapper around a
 * `<p>`; `UserBubble` is `flex justify-end`. Keying on `items-start` is what
 * separates them -- both roles otherwise render the same element.
 */
const ASSISTANT_BUBBLE = 'div.flex.flex-col.items-start > p';

export const runHeadlessUiAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Headless UI] Waiting for the hand-built interface to settle...`);
  const input = page.locator(INPUT).first();
  await input.waitFor({ state: 'visible', timeout: 20000 });
  await waitForDomSettled(page, { settleMs: 800 });

  // Show the empty state first -- "no CopilotChat here" is the page's claim.
  await restOn(page, page.locator('p.italic').first(), 1800, { x: 700, y: 320 });

  const box = await input.boundingBox();
  if (box) {
    await humanGlide(page, box.x + 80, box.y + box.height / 2, 20);
  }
  await input.focus();
  await sleep(400);

  console.log(`   [Headless UI] Typing "${config.prompt}"...`);
  const before = await page.locator(ASSISTANT_BUBBLE).count().catch(() => 0);
  await page.keyboard.type(config.prompt, { delay: 35 });
  await sleep(350);

  // A controlled input that never received the keystrokes reads back empty --
  // catch that here rather than discovering it on the finished video.
  let value = await input.inputValue().catch(() => '');
  if (!value) {
    await input.fill(config.prompt);
    await input.focus();
    await sleep(200);
    value = await input.inputValue().catch(() => '');
  }
  if (!value.trim()) {
    throw new Error(
      `Headless UI prompt was never entered: "${INPUT}" is still empty after typing. ` +
        'The composer sits under the taskbar overlay, so focus has to be set ' +
        'programmatically rather than by clicking -- check that is still happening.',
    );
  }

  await page.keyboard.press('Enter');
  await sleep(700);
  if ((await input.inputValue().catch(() => '')).trim().length > 0) {
    await page.keyboard.press('Enter');
  }

  // Shared detector, pointed at this page's own bubbles -- so a page that never
  // answers fails the run instead of producing a video of an idle chat.
  await waitForAgentResponseCompletion(
    page,
    config.waitAfterPromptMs ?? 4000,
    before,
    ASSISTANT_BUBBLE,
  );
};
