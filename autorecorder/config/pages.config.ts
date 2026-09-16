/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ADAPT THIS FILE — 3 of 3
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * One entry per doc page, in the order the doc nav lists them.
 *
 * Entries are deliberately short. `docUrl`, `demoUrl` and the output filename
 * are derived from `project.config.ts` plus the fields below, so no entry can
 * point at the wrong framework's docs and filenames stay in nav order without
 * anyone numbering them by hand.
 *
 * ── Where this list came from ──────────────────────────────────────────────
 * Generated from `frontend/src/lib/nav-config.ts`, which is this app's single
 * source of truth for route -> doc-page mapping. Every route carrying
 * `hasDemo: true` is registered here, in nav order; routes without a
 * `demo-chat` page are reference material and are deliberately absent, because
 * `demoUrl` is always `route + demoSuffix` and the doctor errors on any that
 * is not 200.
 *
 * Re-derive rather than hand-edit when the nav changes, then re-check the line
 * ranges below.
 *
 * ── The line ranges ────────────────────────────────────────────────────────
 * `startLine`/`endLine` are what the simulated IDE highlights, and they drift
 * the moment someone edits a demo page. `npm run doctor` checks each range
 * points at real code; where a file carries `[!code highlight]` or `#region`
 * markers it also checks the range still covers one.
 */

import { definePages } from '../core/types';

export const PAGES = definePages([
  {
    id: "quickstart",
    name: "Getting Started - Quickstart",
    videoName: "Quickstart",
    docPath: "quickstart?agent=bring-your-own",
    route: "quickstart",
    ideFile: "frontend/package.json",
    startLine: 12,
    endLine: 27,
    extraTabs: [
      { filePath: "frontend/src/app/quickstart/demo-chat/page.tsx", startLine: 16, endLine: 33 },
      { filePath: "frontend/src/app/api/copilotkit/route.ts", startLine: 1, endLine: 35 },
      { filePath: "backend/src/agent-server.ts", startLine: 23, endLine: 62 },
    ],
    // From the route's own <TryIt> block in frontend/src/app/quickstart/page.tsx.
    prompt: "Tell me in one sentence what this app can do.",
    waitAfterPromptMs: 4000,
  },
  {
    id: "prebuilt-components-chat",
    name: "Prebuilt Components - CopilotChat",
    videoName: "CopilotChat",
    docPath: "prebuilt-components/chat",
    route: "prebuilt-components/chat",
    ideFile: "frontend/src/app/prebuilt-components/chat/demo-chat/page.tsx",
    startLine: 16,
    endLine: 25,
    prompt: "What can you do?",
    waitAfterPromptMs: 4000,
  },
  {
    id: "prebuilt-components-sidebar",
    name: "Prebuilt Components - CopilotSidebar",
    videoName: "CopilotSidebar",
    docPath: "prebuilt-components/sidebar",
    route: "prebuilt-components/sidebar",
    ideFile: "frontend/src/app/prebuilt-components/sidebar/demo-chat/page.tsx",
    startLine: 14,
    endLine: 34,
    // <TryIt> lists "Hello" then "Collapse yourself (then use the toggle)" --
    // the second is the collapse/expand the handler drives, not a typed turn.
    prompt: "Hello",
    waitAfterPromptMs: 4000,
  },
  {
    id: "prebuilt-components-popup",
    name: "Prebuilt Components - CopilotPopup",
    videoName: "CopilotPopup",
    docPath: "prebuilt-components/popup",
    route: "prebuilt-components/popup",
    ideFile: "frontend/src/app/prebuilt-components/popup/demo-chat/page.tsx",
    startLine: 13,
    endLine: 38,
    prompt: "Hi there",
    waitAfterPromptMs: 4000,
  },
  {
    id: "prebuilt-components-chat-controls",
    name: "Prebuilt Components - Open, close, and feedback",
    videoName: "OpenCloseAndFeedback",
    docPath: "prebuilt-components/chat-controls",
    route: "prebuilt-components/chat-controls",
    ideFile: "frontend/src/app/prebuilt-components/chat-controls/demo-chat/page.tsx",
    startLine: 54,
    endLine: 88,
    prompt: "Say something worth rating.",
    waitAfterPromptMs: 4000,
  },
  {
    id: "custom-look-and-feel-css",
    name: "Custom Look and Feel - CSS Customization",
    videoName: "CSSCustomization",
    docPath: "custom-look-and-feel/css",
    route: "custom-look-and-feel/css",
    ideFile: "frontend/src/app/custom-look-and-feel/css/demo-chat/page.tsx",
    startLine: 22,
    endLine: 43,
    prompt: "Hello there",
    waitAfterPromptMs: 4000,
  },
  {
    id: "custom-look-and-feel-slots",
    name: "Custom Look and Feel - Slots",
    videoName: "Slots",
    docPath: "custom-look-and-feel/slots",
    route: "custom-look-and-feel/slots",
    ideFile: "frontend/src/app/custom-look-and-feel/slots/demo-chat/page.tsx",
    startLine: 124,
    endLine: 156,
    prompt: "Hello",
    waitAfterPromptMs: 4000,
  },
  {
    id: "custom-look-and-feel-headless-ui",
    name: "Custom Look and Feel - Headless UI",
    videoName: "HeadlessUI",
    docPath: "custom-look-and-feel/headless-ui",
    route: "custom-look-and-feel/headless-ui",
    ideFile: "frontend/src/app/custom-look-and-feel/headless-ui/demo-chat/page.tsx",
    startLine: 59,
    endLine: 63,
    prompt: "Hello",
    waitAfterPromptMs: 4000,
  },
  {
    id: "custom-look-and-feel-reasoning-messages",
    name: "Custom Look and Feel - Reasoning Messages",
    videoName: "ReasoningMessages",
    docPath: "custom-look-and-feel/reasoning-messages",
    route: "custom-look-and-feel/reasoning-messages",
    ideFile: "frontend/src/app/custom-look-and-feel/reasoning-messages/demo-chat/page.tsx",
    startLine: 51,
    endLine: 71,
    // <TryIt> here is already what the recorder sends. Multi-step arithmetic is
    // the likeliest prompt to produce a thinking block; see
    // actions/reasoning.action.ts for why none currently arrives.
    prompt: "Think step by step: what is 17 * 24?",
    waitAfterPromptMs: 4000,
  },
  {
    id: "multimodal-attachments",
    name: "Input Modalities - Multimodal Attachments",
    videoName: "MultimodalAttachments",
    docPath: "multimodal-attachments",
    route: "multimodal-attachments",
    ideFile: "frontend/src/app/multimodal-attachments/demo-chat/page.tsx",
    startLine: 19,
    endLine: 53,
    // <TryIt> reads "Drag a PNG onto the composer, then ask: what is in this
    // image?" -- the drag is what the handler does, this is the typed half.
    prompt: "What is in this image?",
    waitAfterPromptMs: 4000,
  },
  {
    id: "voice",
    name: "Input Modalities - Voice",
    videoName: "Voice",
    docPath: "voice",
    route: "voice",
    ideFile: "frontend/src/app/voice/demo-chat/page.tsx",
    startLine: 47,
    endLine: 71,
    // Never typed. <TryIt> here is "Click \u201cTry a sample audio\u201d, then
    // send", so the handler sends whatever that clip transcribed into the
    // composer; this mirrors its text so the registry still records what goes.
    prompt: "What can you help me with today?",
    waitAfterPromptMs: 4000,
  },
  {
    id: "generative-ui-reasoning",
    name: "Generative UI - Reasoning",
    videoName: "Reasoning",
    docPath: "generative-ui/reasoning",
    route: "generative-ui/reasoning",
    ideFile: "frontend/src/app/generative-ui/reasoning/demo-chat/page.tsx",
    startLine: 20,
    endLine: 42,
    prompt: "Think step by step: what is 17 * 24?",
    waitAfterPromptMs: 4000,
  },
  {
    id: "generative-ui-tool-based",
    name: "Generative UI - Components as Tools",
    videoName: "ComponentsAsTools",
    docPath: "generative-ui/tool-based",
    route: "generative-ui/tool-based",
    ideFile: "frontend/src/app/generative-ui/tool-based/demo-chat/page.tsx",
    startLine: 23,
    endLine: 28,
    prompt: "Chart last quarter's revenue: Jan 40, Feb 65, Mar 52.",
    waitAfterPromptMs: 4000,
  },
  {
    id: "generative-ui-tool-rendering",
    name: "Generative UI - Tool Call Rendering",
    videoName: "ToolCallRendering",
    docPath: "generative-ui/tool-rendering",
    route: "generative-ui/tool-rendering",
    ideFile: "frontend/src/app/generative-ui/tool-rendering/demo-chat/page.tsx",
    startLine: 50,
    endLine: 88,
    prompt: "What's the weather in Lisbon?",
    waitAfterPromptMs: 4000,
  },
  {
    id: "generative-ui-state-rendering",
    name: "Generative UI - State Rendering",
    videoName: "StateRendering",
    docPath: "generative-ui/state-rendering",
    route: "generative-ui/state-rendering",
    ideFile: "frontend/src/app/generative-ui/state-rendering/demo-chat/page.tsx",
    startLine: 11,
    endLine: 14,
    // The route 500s -- its own <TryIt> says so, and says that is the expected
    // state. Prompt kept from the block so it is right the day the page renders.
    prompt: "Write a 200-word product announcement.",
    waitAfterPromptMs: 4000,
  },
  {
    id: "generative-ui-a2ui-dynamic-schema",
    name: "Generative UI - A2UI · Dynamic Schema",
    videoName: "A2UIDynamicSchema",
    docPath: "generative-ui/a2ui/dynamic-schema",
    route: "generative-ui/a2ui/dynamic-schema",
    ideFile: "frontend/src/app/generative-ui/a2ui/dynamic-schema/demo-chat/page.tsx",
    startLine: 20,
    endLine: 39,
    prompt:
      "Show me a dashboard for our API health: uptime 99.95%, p95 latency 240ms, 3 open incidents.",
    waitAfterPromptMs: 4000,
  },
  {
    id: "generative-ui-a2ui-fixed-schema",
    name: "Generative UI - A2UI · Fixed Schema",
    videoName: "A2UIFixedSchema",
    docPath: "generative-ui/a2ui/fixed-schema",
    route: "generative-ui/a2ui/fixed-schema",
    ideFile: "frontend/src/app/generative-ui/a2ui/fixed-schema/demo-chat/page.tsx",
    startLine: 30,
    endLine: 55,
    prompt: "Find me a flight from SFO to JFK.",
    waitAfterPromptMs: 4000,
  },
  {
    id: "frontend-tools",
    name: "App Control - Frontend Tools",
    videoName: "FrontendTools",
    docPath: "frontend-tools",
    route: "frontend-tools",
    ideFile: "frontend/src/app/frontend-tools/demo-chat/page.tsx",
    startLine: 29,
    endLine: 42,
    prompt: "Make the background a warm sunset gradient.",
    waitAfterPromptMs: 4000,
  },
  {
    id: "human-in-the-loop",
    name: "App Control - Human in the Loop",
    videoName: "HumanInTheLoop",
    docPath: "human-in-the-loop",
    route: "human-in-the-loop",
    ideFile: "frontend/src/app/human-in-the-loop/demo-chat/page.tsx",
    startLine: 36,
    endLine: 61,
    prompt: "Schedule a 1:1 with Alice next week to review Q2 goals.",
    waitAfterPromptMs: 4000,
  },
  {
    id: "human-in-the-loop-governed-actions",
    name: "Human in the Loop - Governed Actions",
    videoName: "GovernedActions",
    docPath: "human-in-the-loop/governed-actions",
    route: "human-in-the-loop/governed-actions",
    ideFile: "frontend/src/app/human-in-the-loop/governed-actions/demo-chat/page.tsx",
    startLine: 46,
    endLine: 84,
    extraTabs: [
      {
        filePath: "frontend/src/app/human-in-the-loop/governed-actions/demo-chat/page.tsx",
        startLine: 86,
        endLine: 142,
      },
      {
        filePath: "frontend/src/app/human-in-the-loop/governed-actions/governed-action-card.tsx",
        startLine: 30,
        endLine: 113,
      },
      { filePath: "backend/src/agents/governed-actions.ts", startLine: 153, endLine: 178 },
    ],
    // From the route's <TryIt> blocks. Prompt 1 runs on the useInterrupt tab
    // and is approved; prompt 2 runs on the useHumanInTheLoop tab and is
    // rejected. Both are require_approval under the server's policy.
    prompt: "Apply a 20% discount for customer Globex.",
    prompts: [
      "Apply a 20% discount for customer Globex.",
      "Email the Q3 pricing sheet to jane@globex.com.",
    ],
    waitAfterPromptMs: 4000,
  },
  {
    id: "programmatic-control",
    name: "App Control - Programmatic Control",
    videoName: "ProgrammaticControl",
    docPath: "programmatic-control",
    route: "programmatic-control",
    ideFile: "frontend/src/app/programmatic-control/demo-chat/page.tsx",
    startLine: 16,
    endLine: 20,
    // Never typed. The handler clicks Run agent, waits 10s, clicks Stop, then
    // clicks Run agent again. Each click appends this fixed message (hard-coded
    // in the page) and calls copilotkit.runAgent.
    prompt: "Summarize the latest sales data",
    waitAfterPromptMs: 4000,
  },
  {
    id: "shared-state",
    name: "Shared State - Shared State",
    videoName: "SharedState",
    docPath: "shared-state",
    route: "shared-state",
    ideFile: "frontend/src/app/shared-state/demo-chat/page.tsx",
    startLine: 22,
    endLine: 132,
    // Sent one by one, in this order. The pass condition lives in the third:
    // it has to repeat back what the preferences form holds.
    prompt: "Explain recursion.",
    prompts: [
      "Explain recursion.",
      "Remember that I drink my espresso as a cortado.",
      "What do you know about me so far?",
    ],
    waitAfterPromptMs: 4000,
  },
  {
    id: "shared-state-rendering-in-app",
    name: "Shared State - Render state in your app",
    videoName: "RenderStateInYourApp",
    docPath: "shared-state/rendering-in-app",
    route: "shared-state/rendering-in-app",
    ideFile: "frontend/src/app/shared-state/rendering-in-app/demo-chat/page.tsx",
    startLine: 29,
    endLine: 33,
    // The canvas is seeded with a "Project launch" list; the agent has to add
    // to it through shared state, so the new item lands on the page body.
    prompt: "add designing to the project list",
    waitAfterPromptMs: 4000,
  },
  {
    id: "shared-state-streaming",
    name: "Shared State - State Streaming",
    videoName: "StateStreaming",
    docPath: "shared-state/streaming",
    route: "shared-state/streaming",
    ideFile: "frontend/src/app/shared-state/streaming/demo-chat/page.tsx",
    startLine: 42,
    endLine: 46,
    // Never sent. This route has no rendering surface and returns 500 in dev --
    // which its own <TryIt> block states as the expected result, not a defect.
    prompt: "Nothing -- the route has no rendering surface.",
    waitAfterPromptMs: 4000,
  },
  {
    id: "shared-state-agent-readonly",
    name: "Shared State - Agent Read-Only Context",
    videoName: "AgentReadOnlyContext",
    docPath: "shared-state/agent-readonly",
    route: "shared-state/agent-readonly",
    ideFile: "frontend/src/app/shared-state/agent-readonly/demo-chat/page.tsx",
    startLine: 38,
    endLine: 49,
    // Sent one by one. The first is answered from the name and activity
    // entries, the second from the timezone entry.
    prompt: "What's my name and what have I been doing?",
    prompts: [
      "What's my name and what have I been doing?",
      "What time is it for me right now?",
    ],
    waitAfterPromptMs: 4000,
  },
  {
    id: "multi-agent-subagents",
    name: "Multi-Agent - Sub-Agents",
    videoName: "SubAgents",
    docPath: "multi-agent/subagents",
    route: "multi-agent/subagents",
    ideFile: "frontend/src/app/multi-agent/subagents/demo-chat/page.tsx",
    startLine: 42,
    endLine: 46,
    prompt: "Write me a short brief on why sourdough needs a starter.",
    waitAfterPromptMs: 4000,
  },
  {
    id: "agent-config",
    name: "Agent Config - Agent Config",
    videoName: "AgentConfig",
    docPath: "agent-config",
    route: "agent-config",
    ideFile: "frontend/src/app/agent-config/demo-chat/page.tsx",
    startLine: 34,
    endLine: 41,
    // "Explain what an API is. (then switch tone to enthusiastic and ask
    // again)" -- the same question twice, with only the Tone select changed in
    // between.
    prompt: "Explain what an API is.",
    prompts: ["Explain what an API is.", "Explain what an API is."],
    waitAfterPromptMs: 4000,
  },
  {
    id: "backend-copilot-runtime",
    name: "Backend - Copilot Runtime",
    videoName: "CopilotRuntime",
    docPath: "quickstart",
    route: "backend/copilot-runtime",
    ideFile: "frontend/src/app/backend/copilot-runtime/demo-chat/page.tsx",
    startLine: 45,
    endLine: 49,
    // Never typed. The handler just clicks Run, which sends the prompt the page
    // pre-fills into its own input -- this mirrors that value.
    prompt: "Think step by step: what is 17 * 24?",
    waitAfterPromptMs: 4000,
  },
]);
