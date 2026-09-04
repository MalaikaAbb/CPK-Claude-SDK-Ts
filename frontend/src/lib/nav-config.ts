/**
 * The nav, the route headers, and the README status table all read from here,
 * so a doc page and its implementation status are described exactly once.
 *
 * Route paths mirror the doc URLs under docs.copilotkit.ai/claude-sdk-typescript.
 * `agentId` is the id the agent is registered under in
 * `backend/src/agents/registry.ts`, which is also the Express path it is
 * mounted at — so a route, its doc page, and its agent line up in one place.
 */

/**
 * There is exactly one doc-sync date in this repo, and it is not here: it is
 * `syncedAt` in `doc-snapshot/manifest.json`, written every time the sync
 * button runs. A hand-maintained date alongside it only ever drifted out of
 * agreement with the machine one, so it was removed — `/doc-sync` is the
 * single place that answers "how current are these docs".
 */
export const DOCS_ROOT = "https://docs.copilotkit.ai/claude-sdk-typescript";

export type RouteStatus =
  | "working"
  | "partial"
  | "reference"
  | "broken"
  | "not-started";

export interface RouteMeta {
  path: string;
  title: string;
  docPath: string;
  summary: string;
  status: RouteStatus;
  statusNote?: string;
  offNav?: boolean;
  /** Owns a live surface at `<path>/demo-chat`. */
  hasDemo?: boolean;
  /** Agent id from `backend/src/agents/registry.ts`. */
  agentId?: string;
}

export function demoPath(route: RouteMeta): string | undefined {
  if (!route.hasDemo) return undefined;
  return route.path === "/" ? "/demo-chat" : `${route.path}/demo-chat`;
}

export interface NavGroup {
  title: string;
  routes: RouteMeta[];
}

/**
 * The one sentence that explains most of the Broken/Partial rows below.
 *
 * The Quickstart's "Backend tools and state" section calls
 * `buildBackendToolServer({ toolSchemas, emit, getState, setState, executeTool })`
 * to build the `mcpServers` / `allowedTools` pair `ClaudeAgentAdapter` needs
 * for server-side tools — and never defines it. Nothing else in the framework's
 * docs defines it either. This repo does not write one, so any route whose
 * demonstration depends on a backend tool cannot fully work.
 */
export const MISSING_BRIDGE_NOTE =
  "The docs call `buildBackendToolServer` but never publish it, so no backend tool can be registered.";

export const NAV: NavGroup[] = [
  {
    title: "Getting Started",
    routes: [
      {
        path: "/",
        title: "Introduction",
        docPath: "/claude-sdk-typescript",
        summary: "What this harness covers and how the pieces fit together.",
        status: "reference",
        statusNote: "Landing page — orientation and a live agent roster.",
      },
      {
        path: "/quickstart",
        hasDemo: true,
        agentId: "claude_agent",
        title: "Quickstart",
        docPath: "/claude-sdk-typescript/quickstart?agent=bring-your-own",
        summary:
          "The bring-your-own-agent path: a ClaudeAgentAdapter behind Express, reached over HTTP by the v2 Copilot Runtime.",
        status: "working",
        statusNote:
          "The runtime moved to @copilotkit/runtime/v2 and createCopilotRuntimeHandler. This harness mounts it at [[...slug]] in multi-route mode rather than the doc's single-route form, because Threads need the /info + thread subtree. Live connection status is on the route page.",
      },
    ],
  },
  {
    title: "Prebuilt Components",
    routes: [
      {
        path: "/prebuilt-components/chat",
        hasDemo: true,
        agentId: "agentic_chat",
        title: "CopilotChat",
        docPath: "/claude-sdk-typescript/prebuilt-components/chat",
        summary:
          "The base inline chat surface, sized to fill whatever container you give it.",
        status: "working",
      },
      {
        path: "/prebuilt-components/sidebar",
        hasDemo: true,
        agentId: "prebuilt-sidebar",
        title: "CopilotSidebar",
        docPath: "/claude-sdk-typescript/prebuilt-components/sidebar",
        summary:
          "The collapsible docked chat that wraps your main content rather than covering it.",
        status: "working",
      },
      {
        path: "/prebuilt-components/popup",
        hasDemo: true,
        agentId: "prebuilt-popup",
        title: "CopilotPopup",
        docPath: "/claude-sdk-typescript/prebuilt-components/popup",
        summary:
          "The floating launcher that opens an overlay chat on top of the page.",
        status: "working",
      },
      {
        path: "/prebuilt-components/chat-controls",
        hasDemo: true,
        agentId: "chat-controls",
        title: "Open, close, and feedback",
        docPath: "/claude-sdk-typescript/prebuilt-components/chat-controls",
        summary:
          "Driving modal state from your own UI with useCopilotChatConfiguration, and capturing thumbs up/down.",
        status: "working",
      },
    ],
  },
  {
    title: "Rich Threads",
    routes: [
      {
        path: "/prebuilt-components/copilot-threads-drawer",
        hasDemo: true,
        agentId: "agentic_chat",
        title: "Threads Drawer",
        docPath: "/claude-sdk-typescript/prebuilt-components/copilot-threads-drawer",
        summary:
          "The drop-in conversation sidebar, wired with no active-thread state of its own.",
        status: "working",
        statusNote:
          "Needs the runtime in Intelligence mode, and a separate license token to unlock the UI. Without either the drawer renders a locked view instead of the list — the two gates fail differently, see the route page.",
      },
      {
        path: "/headless-threads",
        hasDemo: true,
        agentId: "agentic_chat",
        title: "Headless Threads",
        docPath: "/claude-sdk-typescript/headless-threads",
        summary:
          "The same thread data through useThreads, with a hand-built list — including rename, which the drawer omits.",
        status: "working",
        statusNote:
          "Needs Intelligence mode. In SSE mode /info reports mutations: false, so rename/archive/delete have no endpoint to call.",
      },
      {
        path: "/threads-lifecycle",
        hasDemo: true,
        agentId: "agentic_chat",
        title: "Thread & History Lifecycle",
        docPath: "/claude-sdk-typescript/threads-lifecycle",
        summary:
          "Where a threadId comes from, how history replays, and how switching differs from starting fresh.",
        status: "working",
        statusNote:
          "Switch/start are live regardless of mode; history replay needs a server-side store to replay from, so it is Intelligence-only.",
      },
    ],
  },
  {
    title: "Custom Look and Feel",
    routes: [
      {
        path: "/custom-look-and-feel/css",
        hasDemo: true,
        agentId: "chat-customization-css",
        title: "CSS Customization",
        docPath: "/claude-sdk-typescript/custom-look-and-feel/css",
        summary:
          "Re-skinning the chat with the v2 shadcn design tokens and the .copilotKit* class hooks.",
        status: "working",
      },
      {
        path: "/custom-look-and-feel/slots",
        hasDemo: true,
        agentId: "chat-slots",
        title: "Slots",
        docPath: "/claude-sdk-typescript/custom-look-and-feel/slots",
        summary:
          "Overriding chat sub-components at all three levels: class strings, prop objects, and whole components.",
        status: "working",
      },
      {
        path: "/custom-look-and-feel/headless-ui",
        hasDemo: true,
        agentId: "headless-simple",
        title: "Headless UI",
        docPath: "/claude-sdk-typescript/custom-look-and-feel/headless-ui",
        summary:
          "A chat built from useAgent, useCopilotKit and useRenderToolCall alone, with no CopilotKit chrome.",
        status: "working",
      },
      {
        path: "/custom-look-and-feel/reasoning-messages",
        hasDemo: true,
        agentId: "reasoning-default",
        title: "Reasoning Messages",
        docPath:
          "/claude-sdk-typescript/custom-look-and-feel/reasoning-messages",
        summary:
          "The built-in reasoning card, and the header/content sub-slots that replace parts of it.",
        status: "working",
        statusNote:
          "Claude emits thinking blocks with no extra configuration and the adapter translates them into the full REASONING_* lifecycle, so the card paints. Verified against the live agent.",
      },
    ],
  },
  {
    title: "Input Modalities",
    routes: [
      {
        path: "/multimodal-attachments",
        hasDemo: true,
        agentId: "multimodal",
        title: "Multimodal Attachments",
        docPath: "/claude-sdk-typescript/multimodal-attachments",
        summary:
          "Drag-and-drop file attachments sent to the agent as AG-UI content parts.",
        status: "working",
      },
      {
        path: "/voice",
        hasDemo: true,
        agentId: "voice-demo",
        title: "Voice",
        docPath: "/claude-sdk-typescript/voice",
        summary:
          "A second runtime carrying a TranscriptionService, which is what makes the composer grow a mic button.",
        status: "working",
        statusNote:
          "The mic transcribes through OpenAI Whisper, so it needs OPENAI_API_KEY. Without one the route still runs via the doc's sample-audio button.",
      },
    ],
  },
  {
    title: "Generative UI",
    routes: [
      {
        path: "/generative-ui/reasoning",
        hasDemo: true,
        agentId: "reasoning-custom",
        title: "Reasoning",
        docPath: "/claude-sdk-typescript/generative-ui/reasoning",
        summary:
          "Replacing the whole reasoning card through the messageView.reasoningMessage slot.",
        status: "working",
        statusNote:
          "Same reasoning stream as Reasoning Messages; this route replaces the whole card rather than its sub-slots.",
      },
      {
        path: "/generative-ui/tool-based",
        hasDemo: true,
        agentId: "gen-ui-tool-based",
        title: "Components as Tools",
        docPath: "/claude-sdk-typescript/generative-ui/tool-based",
        summary:
          "useComponent registering a React component as a tool the agent calls to render it.",
        status: "working",
        statusNote:
          "The chart renders, then the follow-up run fails with a 400 from Anthropic. useComponent has no handler, so its tool result is empty; the adapter turns an empty last message into an empty prompt, and on a resumed session the CLI stamps cache_control on that empty block. Adapter bug, not a wiring error — README §9.13.",
      },
      {
        path: "/generative-ui/tool-rendering",
        hasDemo: true,
        agentId: "tool-rendering",
        title: "Tool Call Rendering",
        docPath: "/claude-sdk-typescript/generative-ui/tool-rendering",
        summary:
          "Named renderers for get_weather and search_flights, plus the wildcard catch-all from useDefaultRenderTool.",
        status: "working",
        statusNote:
          "The renderers are wired as published. get_weather is a backend tool and the docs publish no bridge, so it is registered through a repo-authored MCP server (backend/src/agents/weather-mcp-server.ts). The card renders, but the bridge is this repo's code, not the doc's — README §9.1.",
      },
      {
        path: "/generative-ui/state-rendering",
        hasDemo: true,
        agentId: "shared-state-streaming",
        title: "State Rendering",
        docPath: "/claude-sdk-typescript/generative-ui/state-rendering",
        summary:
          "Rendering agent state as it changes, subscribed with useAgent + OnStateChanged.",
        status: "broken",
        statusNote:
          "Shares its cell with State Streaming, and its demo redirects there — so it inherits that route's non-compiling demo. The subscription snippet it publishes is the same five lines. README §9.15.",
      },
      {
        path: "/generative-ui/a2ui/dynamic-schema",
        hasDemo: true,
        agentId: "declarative-gen-ui",
        title: "A2UI · Dynamic Schema",
        docPath: "/claude-sdk-typescript/generative-ui/a2ui/dynamic-schema",
        summary:
          "A bring-your-own-catalog dashboard where the agent designs the surface per request.",
        status: "working",
        statusNote:
          "The catalog auto-injects generate_a2ui as a frontend tool, which the adapter bridges — so this needs no backend tool.",
      },
      {
        path: "/generative-ui/a2ui/fixed-schema",
        hasDemo: true,
        agentId: "a2ui-fixed-schema",
        title: "A2UI · Fixed Schema",
        docPath: "/claude-sdk-typescript/generative-ui/a2ui/fixed-schema",
        summary:
          "A flight card whose component tree is authored as JSON up front; the tool supplies only the data.",
        status: "working",
        statusNote:
          "Injection is off per the page, and display_flight is registered through a repo-authored MCP server (backend/src/agents/display-flight-mcp-server.ts) because the docs publish no bridge. The card renders, but the bridge is this repo's code, not the doc's — README §9.1.",
      },
    ],
  },
  {
    title: "App Control",
    routes: [
      {
        path: "/frontend-tools",
        hasDemo: true,
        agentId: "frontend-tools",
        title: "Frontend Tools",
        docPath: "/claude-sdk-typescript/frontend-tools",
        summary:
          "A tool the agent calls that executes in the browser and changes the page.",
        status: "working",
      },
      {
        path: "/human-in-the-loop",
        hasDemo: true,
        agentId: "hitl-in-chat",
        title: "Human in the Loop",
        docPath: "/claude-sdk-typescript/human-in-the-loop",
        summary:
          "useHumanInTheLoop suspending the run behind a picker until the user answers.",
        status: "working",
      },
      {
        path: "/programmatic-control",
        hasDemo: true,
        agentId: "headless-complete",
        title: "Programmatic Control",
        docPath: "/claude-sdk-typescript/programmatic-control",
        summary:
          "Driving runs from code with addMessage, runAgent, stopAgent and subscribe — no chat component.",
        status: "working",
        statusNote:
          "The demo holds the page's headless-complete snippet verbatim, and that snippet opens by destructuring useAttachmentsConfig, useAutoScroll and buildContent — three helpers it never defines — and omits its own hook imports. It does not compile, so `next build` fails type checking. Left as published rather than patched. README §9.14.",
      },
    ],
  },
  {
    title: "Shared State",
    routes: [
      {
        path: "/shared-state",
        hasDemo: true,
        agentId: "shared-state-read-write",
        title: "Shared State",
        docPath: "/claude-sdk-typescript/shared-state",
        summary:
          "The two-way channel: the agent writes notes into state, the UI writes preferences through setState.",
        status: "working",
        statusNote:
          "The published useAgent call, handler and card body are kept; the imports, types, latestNotesRef, preferences form and layout are this repo's. set_notes is registered through a repo-authored MCP server (backend/src/agents/set-notes-mcp-server.ts) and the server writes its result back as a STATE_SNAPSHOT. README §9.1 and §9.15.",
      },
      {
        path: "/shared-state/rendering-in-app",
        hasDemo: true,
        agentId: "shared-state-read-write",
        title: "Render state in your app",
        docPath: "/claude-sdk-typescript/shared-state/rendering-in-app",
        summary:
          "The same agent state rendered as a main-view canvas rather than inside the chat.",
        status: "working",
        statusNote:
          "This page publishes a fuller example than its siblings — imports, a Canvas component and a Page export — so it does compile. The agent it shares with /shared-state now has set_notes, but that writes `notes`, not `items`, so the canvas is still written through the adapter's built-in ag_ui_update_state.",
      },
      {
        path: "/shared-state/streaming",
        hasDemo: true,
        agentId: "shared-state-streaming",
        title: "State Streaming",
        docPath: "/claude-sdk-typescript/shared-state/streaming",
        summary:
          "Forwarding a tool argument into a state key while it is still being generated.",
        status: "broken",
        statusNote:
          "The page publishes five lines of frontend code — one useAgent call — and no imports, types, markup, component or export. The demo holds exactly that, so it does not compile. The backend half is blocked twice: write_document is a backend tool, and emitStreamingDocumentState needs raw Anthropic deltas the adapter never emits. README §9.15.",
      },
      {
        path: "/shared-state/agent-readonly",
        hasDemo: true,
        agentId: "readonly-state-agent-context",
        title: "Agent Read-Only Context",
        docPath: "/claude-sdk-typescript/shared-state/agent-readonly",
        summary:
          "useAgentContext as a one-way UI-to-agent channel — props for the agent, with no setter.",
        status: "working",
      },
    ],
  },
  {
    title: "Multi-Agent",
    routes: [
      {
        path: "/multi-agent/subagents",
        hasDemo: true,
        agentId: "subagents",
        title: "Sub-Agents",
        docPath: "/claude-sdk-typescript/multi-agent/subagents",
        summary:
          "A supervisor delegating to research, writing and critique sub-agents, with a live delegation log.",
        status: "partial",
        statusNote:
          "The supervisor prompt and the delegation log are as published, but the delegation tools are backend tools and the run loop that executes a sub-agent is described in prose and never shown. The log stays empty.",
      },
    ],
  },
  {
    title: "Agent Config",
    routes: [
      {
        path: "/agent-config",
        hasDemo: true,
        agentId: "agent-config",
        title: "Agent Config",
        docPath: "/claude-sdk-typescript/agent-config",
        summary:
          "A typed config object the UI owns, published with useAgentContext and folded into the system prompt each turn.",
        status: "working",
      },
    ],
  },
  {
    title: "Backend",
    routes: [
      {
        path: "/backend/copilot-runtime",
        hasDemo: true,
        agentId: "agentic_chat",
        title: "Copilot Runtime",
        docPath: "/claude-sdk-typescript/quickstart",
        summary:
          "This repo's live runtime config, the agents it routes to, and a raw AG-UI event capture.",
        status: "working",
        offNav: true,
        statusNote:
          "Not a doc page of its own for this framework — the runtime route is published inside the Quickstart. Kept as a debug surface.",
      },
    ],
  },
  {
    title: "Doc Sync",
    routes: [
      {
        path: "/doc-sync",
        title: "Doc drift",
        docPath: "/claude-sdk-typescript",
        summary:
          "Re-fetches the markdown behind every tracked doc page and diffs it against the stored snapshot, flagging changes inside code blocks.",
        status: "reference",
      },
    ],
  },
];

export const ALL_ROUTES: RouteMeta[] = NAV.flatMap((g) => g.routes);

export function findRoute(path: string): RouteMeta | undefined {
  return ALL_ROUTES.find((r) => r.path === path);
}

export function docUrl(route: RouteMeta): string {
  return `https://docs.copilotkit.ai${route.docPath}`;
}

export const STATUS_LABEL: Record<RouteStatus, string> = {
  working: "Working",
  partial: "Partial",
  reference: "Reference",
  broken: "Broken",
  "not-started": "Not started",
};
