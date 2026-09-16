/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ADAPT THIS DIRECTORY
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * What the recorder *does* on each demo page once it is open.
 *
 * The registry lives here rather than in `core/` on purpose: adding or removing
 * a page must never mean editing frozen code. A page with no entry falls back
 * to `runStandardAction` -- type the prompt, submit, wait for the reply -- which
 * is right for a page whose whole subject is the chat itself.
 *
 * ── How this map was built ─────────────────────────────────────────────────
 * Every handler here was written against this repo's actual demo DOM, read off
 * the live routes rather than inferred from the doc pages. A page keeps
 * `runStandardAction` only when sending a prompt genuinely *is* the whole
 * demonstration; everything else gets a handler, because for those pages a
 * streamed reply and a working feature are different claims:
 *
 *   - /frontend-tools answers in prose whether or not the browser-side handler
 *     ran, so the handler reads the page state it is supposed to mutate.
 *   - /human-in-the-loop/governed-actions pauses twice -- on an AG-UI
 *     interrupt, then on a HITL tool -- and passes on the audit ledger the
 *     server writes, not on the model's prose.
 *   - /human-in-the-loop suspends the run on a tool call. Nothing further
 *     streams until a slot is clicked, so a prompt-and-wait handler hangs.
 *   - /custom-look-and-feel/slots renders its welcome-screen override only
 *     while the message list is empty, so it has to be shown before prompting.
 *   - /custom-look-and-feel/headless-ui and /backend/copilot-runtime render no
 *     CopilotKit chrome at all, so the global selectors match nothing on them.
 *
 * Four routes are documented gaps rather than bugs -- the doc page describes a
 * *backend* tool, and registering one needs `buildBackendToolServer`, which the
 * Quickstart calls and which no page in this framework's docs defines. Their
 * handlers record the gap and pass on the reply alone; see README §9 and the
 * comment on each.
 *
 * Handlers should build on the helpers in `core/actions.ts` and `./_shared`:
 *
 *   sendPrompt(page, prompt, opts)          types and submits, returns the
 *                                           assistant-message count from before
 *                                           submitting
 *   waitForAgentResponseCompletion(...)     waits for the reply to finish, and
 *                                           throws if none ever arrives
 *   promptsFor(config)                      the page's prompts[], or [prompt]
 *   requireVisible / noteIfVisible          assert a feature rendered, or note
 *                                           that a documented gap did not
 *   clickLikeAPerson / restOn               drive and frame for the camera
 *
 * Pass that returned count into waitForAgentResponseCompletion on multi-turn
 * pages, or the previous turn's reply is mistaken for this one's.
 */

import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { runStandardAction } from '../core/actions';
import { type Page } from 'playwright';

import { waitForPageReady } from './page-ready';

import { runAgentConfigAction, runSubagentsAction } from './agent-config.action';
import { runCopilotRuntimeAction } from './copilot-runtime.action';
import { runFrontendToolsAction } from './frontend-tools.action';
import {
  runA2uiDynamicAction,
  runA2uiFixedAction,
  runToolBasedAction,
  runToolRenderingAction,
} from './generative-ui.action';
import { runHeadlessUiAction } from './headless-ui.action';
import { runGovernedActionsAction } from './governed-actions.action';
import { runHumanInTheLoopAction } from './human-in-the-loop.action';
import { runMultimodalAction, runVoiceAction } from './multimodal.action';
import {
  runChatControlsAction,
  runPopupAction,
  runSidebarAction,
} from './prebuilt-surfaces.action';
import { runProgrammaticAction } from './programmatic.action';
import { runReasoningAction } from './reasoning.action';
import {
  runAgentReadonlyAction,
  runSharedStateAction,
  runSharedStateCanvasAction,
} from './shared-state.action';
import { runSlotsAction } from './slots.action';

/** Keys are page ids from `config/pages.config.ts`. Doctor flags any orphans. */
export const ACTION_MAP: Record<string, PageActionHandler> = {
  // Prebuilt surfaces. `prebuilt-components-chat` is absent on purpose: a bare
  // <CopilotChat> has no layout claim to demonstrate beyond the conversation.
  'prebuilt-components-sidebar': runSidebarAction,
  'prebuilt-components-popup': runPopupAction,
  'prebuilt-components-chat-controls': runChatControlsAction,

  // Custom look and feel. `custom-look-and-feel-css` stays standard -- the
  // theming is on screen from the first frame and needs nothing driven.
  'custom-look-and-feel-slots': runSlotsAction,
  'custom-look-and-feel-headless-ui': runHeadlessUiAction,
  'custom-look-and-feel-reasoning-messages': runReasoningAction,

  // Input modalities.
  'multimodal-attachments': runMultimodalAction,
  voice: runVoiceAction,

  // Generative UI.
  'generative-ui-reasoning': runReasoningAction,
  'generative-ui-tool-based': runToolBasedAction,
  'generative-ui-tool-rendering': runToolRenderingAction,
  'generative-ui-a2ui-dynamic-schema': runA2uiDynamicAction,
  'generative-ui-a2ui-fixed-schema': runA2uiFixedAction,

  // App control.
  'frontend-tools': runFrontendToolsAction,
  'human-in-the-loop': runHumanInTheLoopAction,
  'human-in-the-loop-governed-actions': runGovernedActionsAction,
  'programmatic-control': runProgrammaticAction,

  // Shared state.
  'shared-state': runSharedStateAction,
  'shared-state-rendering-in-app': runSharedStateCanvasAction,
  'shared-state-agent-readonly': runAgentReadonlyAction,

  // Multi-agent, config, backend.
  'multi-agent-subagents': runSubagentsAction,
  'agent-config': runAgentConfigAction,
  'backend-copilot-runtime': runCopilotRuntimeAction,
};

/**
 * Pages whose readiness gate cannot use the global chat-input selector.
 *
 * `waitForPageReady` waits for the control the handler is about to type into to
 * exist, be enabled and have a box. Both routes below render their own composer
 * instead of CopilotKit's, so the default selector matches nothing on them and
 * the gate would report `input-usable=false` and hand over early -- exactly on
 * the two pages least able to absorb a half-mounted chat, because neither has
 * CopilotKit's own retry behaviour behind it.
 */
const READY_INPUT: Record<string, string> = {
  'custom-look-and-feel-headless-ui': 'input[placeholder="Your own composer…"]',
  'backend-copilot-runtime': 'input',
};

export async function executePageAction(
  page: Page,
  config: PageRecordConfig,
  rootPath: string,
): Promise<void> {
  // One gate for every page, including the ones that fall through to
  // runStandardAction. The engine waits for the route to respond and for
  // `chatReady` to be visible, but a dev server compiles client chunks lazily,
  // so markup can be on screen before anything is wired to it -- and a prompt
  // typed into an unhydrated input goes nowhere. Handlers that remount a chat
  // mid-run call waitForDomSettled again themselves.
  await waitForPageReady(page, {
    label: config.id,
    inputSelector: READY_INPUT[config.id],
  });

  const handler = ACTION_MAP[config.id] ?? runStandardAction;
  await handler(page, config, rootPath);
}
