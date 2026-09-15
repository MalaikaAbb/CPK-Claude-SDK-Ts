/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ADAPT THIS FILE — 2 of 3
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The DOM contract: how the recorder finds the chat surface it has to drive.
 *
 * This is the file that changes when the *frontend* changes rather than the
 * backend — a React project using CopilotKit's prebuilt components and an
 * Angular one rendering its own chat need different answers here, even though
 * both document the same features.
 *
 * These are Playwright selectors, so `:has-text()` and friends are available.
 * Keep each one as narrow as the app allows; a selector that matches a wrapping
 * container will still "work" and then position the cursor somewhere useless.
 *
 * `npm run doctor --online` checks each of these against a live demo page and
 * reports which ones match nothing, so you find out here rather than by
 * watching seventeen videos.
 */

export interface SelectorContract {
  /** The prompt box. First match wins, so order matters. */
  chatInput: string;

  /**
   * Send control. Optional: when it matches nothing the recorder presses Enter,
   * which is what happens on CopilotKit v2 — its send button carries no `type`,
   * no `aria-label` and no text, only `cpk:` utility classes, so there is
   * nothing stable to target. `doctor --online` reports a no-match as a warning
   * rather than an error for that reason.
   *
   * Worth setting if this frontend has a targetable send button: the cursor then
   * visibly travels to it and clicks, which reads better on video.
   */
  chatSubmit: string;

  /**
   * Assistant messages, used to detect that a reply started and finished.
   * Must match *only* messages — matching a container makes every reply look
   * complete the instant it starts.
   *
   * Pages that replace the message view via a slot need their own selector;
   * pass it per-call rather than changing this default.
   */
  assistantMessage: string;

  /** Any of these appearing means the demo has rendered enough to drive. */
  chatReady: string;

  /** Doc page has painted enough to start reading. */
  docContentReady: string;

  /** Code blocks on the doc page, so the cursor can rest on one. */
  docCodeBlock: string;
}

export const SELECTORS: SelectorContract = {
  // CopilotKit v2 tags every part of its chat surface with a `data-testid`.
  // Targeting those rather than tag names is what makes one contract cover
  // CopilotChat, CopilotSidebar and CopilotPopup without caring which one a
  // route mounted -- all three render the same input, send button and message
  // nodes underneath. Verified against every demo route in this repo; see the
  // note in `actions/index.ts` about the two routes that render neither.
  chatInput: '[data-testid="copilot-chat-textarea"], textarea',

  // The send button does carry a testid, so the cursor visibly travels to it
  // and clicks instead of falling back to the Enter key.
  chatSubmit: '[data-testid="copilot-send-button"]',

  // One node per assistant reply. The legacy class is kept as a fallback for
  // any surface still rendering v1 markup.
  assistantMessage:
    '[data-testid="copilot-assistant-message"], .copilotKitAssistantMessage',

  chatReady:
    '[data-testid="copilot-chat"], [data-testid="copilot-chat-textarea"], textarea, input, [contenteditable="true"]',

  docContentReady: 'h1, article, main, [class*="content"], pre',

  docCodeBlock: 'pre, div[class*="code"], code',
};
