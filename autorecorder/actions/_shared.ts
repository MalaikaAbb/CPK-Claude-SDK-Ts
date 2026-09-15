/**
 * Helpers every handler in this folder leans on.
 *
 * `core/actions.ts` owns the two big ones -- `sendPrompt` and
 * `waitForAgentResponseCompletion`. What was missing was the small stuff each
 * handler had been reimplementing: move the virtual cursor onto an element and
 * click it, rest on something long enough for a viewer to read it, and assert
 * that a thing this repo's demo is *supposed* to render actually did.
 *
 * All of it is framework-agnostic except `CPK`, which is this frontend's DOM
 * contract and therefore belongs in the adaptation surface.
 */

import { type Locator, type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../core/overlays/cursor';

/**
 * CopilotKit v2's own test ids, as this app renders them.
 *
 * These are shipped by the library, not added by this repo, and they are the
 * same on every surface -- `<CopilotChat>`, `<CopilotSidebar>` and
 * `<CopilotPopup>` all mount the same input, send button and message nodes
 * underneath. That is why `selectors.config.ts` can describe all three with one
 * contract, and why a handler never has to know which component a route chose.
 */
export const CPK = {
  chat: '[data-testid="copilot-chat"]',
  textarea: '[data-testid="copilot-chat-textarea"]',
  send: '[data-testid="copilot-send-button"]',
  messageList: '[data-testid="copilot-message-list"]',
  userMessage: '[data-testid="copilot-user-message"]',
  assistantMessage: '[data-testid="copilot-assistant-message"]',
  assistantToolbar: '[data-testid="copilot-assistant-toolbar"]',
  welcomeScreen: '[data-testid="copilot-welcome-screen"]',
  errorBanner: '[data-testid="copilot-error-banner"]',
  /** Sidebar/popup launcher. Doubles as the close control while open. */
  toggle: '[data-testid="copilot-chat-toggle"]',
  /** The × inside an open sidebar/popup header. */
  closeButton: '[data-testid="copilot-close-button"]',
  addMenuButton: '[data-testid="copilot-add-menu-button"]',
} as const;

/**
 * The simulated taskbar is `position:fixed; bottom:0; height:48px` with
 * `pointer-events:auto` and the maximum z-index, so anything in the bottom 48px
 * of the viewport receives its clicks instead of the page.
 *
 * Read from the live viewport rather than assuming 1080, so this stays correct
 * if the engine ever records at another size.
 */
const TASKBAR_HEIGHT = 48;

async function taskbarTop(page: Page): Promise<number> {
  const height = await page
    .evaluate('window.innerHeight')
    .then((h) => (typeof h === 'number' ? h : 1080))
    .catch(() => 1080);
  return height - TASKBAR_HEIGHT;
}

/**
 * Click something the way the camera should see it: glide there, then press.
 *
 * Falls back to a direct Playwright click when the element has no box, and --
 * the part that matters -- when it sits under the simulated taskbar, where a
 * real mouse press would be eaten by the overlay instead of reaching the page.
 */
export async function clickLikeAPerson(
  page: Page,
  locator: Locator,
  label: string,
  { timeoutMs = 8000 }: { timeoutMs?: number } = {},
): Promise<void> {
  await locator.waitFor({ state: 'visible', timeout: timeoutMs });
  const box = await locator.boundingBox();

  if (!box) {
    await locator.click({ timeout: timeoutMs });
    return;
  }

  const cy = box.y + box.height / 2;
  await humanGlide(page, box.x + box.width / 2, cy, 20);

  if (cy >= (await taskbarTop(page))) {
    // Cursor is there for the video; the press has to bypass the overlay.
    console.log(`   ↳ ${label} sits under the taskbar overlay -- dispatching the click directly.`);
    await locator.click({ force: true, timeout: timeoutMs });
    return;
  }

  await humanClick(page);
}

/** Park the cursor on something and hold, so it reads on the recording. */
export async function restOn(
  page: Page,
  locator: Locator,
  ms = 2000,
  fallback: { x: number; y: number } = { x: 960, y: 500 },
): Promise<boolean> {
  // Short, explicit timeout: `boundingBox()` auto-waits for visibility on its
  // own 30s budget, and this is only ever framing for the camera. A hidden
  // target should cost a glance, not half a minute of dead footage.
  const box = await locator.first().boundingBox({ timeout: 4000 }).catch(() => null);
  if (box) {
    await humanGlide(
      page,
      box.x + Math.min(box.width / 2, 300),
      box.y + Math.min(box.height / 2, 80),
      22,
    );
    await sleep(ms);
    return true;
  }
  await humanGlide(page, fallback.x, fallback.y, 22);
  await sleep(ms);
  return false;
}

/**
 * Assert that a demo actually produced the thing it exists to produce.
 *
 * A reply arriving is not the same as the feature working: a page whose whole
 * subject is a rendered card can answer in prose and still be broken. Handlers
 * call this for the element that *is* the feature, and let a reply-only page
 * pass on `waitForAgentResponseCompletion` alone.
 */
export async function requireVisible(
  page: Page,
  selector: string,
  what: string,
  { timeoutMs = 30000 }: { timeoutMs?: number } = {},
): Promise<Locator> {
  const locator = page.locator(selector).first();
  const ok = await locator
    .waitFor({ state: 'visible', timeout: timeoutMs })
    .then(() => true)
    .catch(() => false);

  if (!ok) {
    throw new Error(
      `${what} never rendered: nothing matched "${selector}" within ` +
        `${Math.round(timeoutMs / 1000)}s. The agent answered without driving ` +
        'the feature this page exists to demonstrate, or the selector has drifted.',
    );
  }
  return locator;
}

/**
 * Same wait, but absence is an expected outcome rather than a failure.
 *
 * Several routes here are documented gaps -- the doc page describes a backend
 * tool whose registration bridge the framework's docs never publish, so the
 * model is never offered it and nothing renders. Those pages should still be
 * recorded, and the recording should show the gap. Failing them would hide a
 * finding the README already tracks; passing them silently would claim a
 * feature works. So: look, say what was found, carry on.
 */
export async function noteIfVisible(
  page: Page,
  selector: string,
  what: string,
  { timeoutMs = 8000 }: { timeoutMs?: number } = {},
): Promise<boolean> {
  const seen = await page
    .locator(selector)
    .first()
    .waitFor({ state: 'visible', timeout: timeoutMs })
    .then(() => true)
    .catch(() => false);

  console.log(seen ? `   ✓ ${what} rendered.` : `   ℹ ${what} did not render (documented gap).`);
  return seen;
}

/** Text of an element, trimmed and whitespace-collapsed. Empty when absent. */
export async function textOf(page: Page, selector: string): Promise<string> {
  return page
    .locator(selector)
    .first()
    .textContent({ timeout: 4000 })
    .then((t) => (t ?? '').replace(/\s+/g, ' ').trim())
    .catch(() => '');
}

/**
 * Surface a CopilotKit error banner as a run failure.
 *
 * The banner is how the chat reports that the agent run itself failed -- a 404
 * from the agent server, a transport error, a refused stream. Without this the
 * run fails thirty seconds later as "agent never produced a response", which is
 * true but says nothing about why.
 */
export async function assertNoErrorBanner(page: Page): Promise<void> {
  const banner = page.locator(CPK.errorBanner).first();
  if (!(await banner.isVisible({ timeout: 500 }).catch(() => false))) return;

  const message = (await banner.textContent().catch(() => '')) ?? '';
  throw new Error(
    `The chat surfaced an error banner instead of a reply: "${message.trim().slice(0, 300)}". ` +
      'Check the agent server is the one this repo ships (GET /agents should list ' +
      'the ids in backend/src/agents/registry.ts) and that the route for this ' +
      "page's agentId exists on it.",
  );
}

export { sleep };
