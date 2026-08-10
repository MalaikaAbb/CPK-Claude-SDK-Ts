# CopilotKit + Claude Agent SDK (TypeScript) Test Suite

A navigable, working test harness for the CopilotKit ↔ Claude Agent SDK (TypeScript) integration — one route per doc page, each running the thing its page teaches.

| | |
|---|---|
| **Doc sync date** | 2026-08-07 — the date the live docs were last read end to end |
| **Docs tracked** | <https://docs.copilotkit.ai/claude-sdk-typescript> |
| **Frontend** | `@copilotkit/react-core` 1.66.4 (v2 surface), `@copilotkit/runtime` 1.66.4, Next.js 16.3.0, React 19.2.8 |
| **Backend** | `@ag-ui/claude-agent-sdk` 0.0.3, `@anthropic-ai/claude-agent-sdk` ^0.2.58, `@ag-ui/core` / `@ag-ui/encoder` 0.0.57, Express 5 |
| **Status** | 28 routes — 18 working · 3 partial · 6 broken · 1 reference. See §8; the live count is computed from `nav-config.ts` on `/status`. |
| **Build** | ⚠️ `next build` fails type checking on purpose — one route holds a doc snippet that does not compile. See §9.14. |
| **CI** | none configured |

---

## 2. Overview

The Claude Agent SDK integration runs a Claude agent in your own Node process and exposes it to CopilotKit over the AG-UI protocol, via `ClaudeAgentAdapter` from `@ag-ui/claude-agent-sdk`. Your Next app never talks to Anthropic directly — it talks to a Copilot Runtime route, which forwards runs to your agent server as an `HttpAgent`.

This repo turns every page under `docs.copilotkit.ai/claude-sdk-typescript` that the brief covers into a route. Each route has two halves: a **notes page** (what the doc prescribes, what this repo does, and where they differ, with source read live off disk) and a **demo** (the chrome-free running surface).

It is a QA instrument, not a showcase. Where the docs are incomplete, the route is marked Broken or Partial and says exactly why, rather than being quietly patched. §9 is the list.

---

## 3. Architecture

```
Browser
  │  AG-UI over HTTP
  ▼
Next.js frontend (port 3000)
  ├─ /api/copilotkit                     ← CopilotRuntime, all 24 agents
  ├─ /api/copilotkit-declarative-gen-ui  ← second runtime, A2UI tool injection ON
  └─ /api/copilotkit-voice/[[...slug]]   ← v2 runtime handler + TranscriptionService
       │  HttpAgent → http://localhost:8000/<agent-id>
       ▼
Node agent server (port 8000, Express 5)
  └─ one ClaudeAgentAdapter per registry entry
       │
       ▼
Claude Agent SDK  →  Anthropic API (claude-sonnet-4-6)
```

**Backend language: TypeScript on Node.** Unlike the Python integrations, both processes here are Node — but they are still two separate processes on two ports. The agent server is not a Next route.

Worth knowing, because it explains most of §9: `ClaudeAgentAdapter` does more than the docs describe. Its `buildOptions()` reads `input.tools` and builds an in-process `ag_ui` MCP server from the frontend's tools, appends `useAgentContext` entries and shared state to the system prompt, and adds a built-in `ag_ui_update_state` tool that emits `STATE_SNAPSHOT`. Frontend tools, HITL, `useComponent`, agent config and A2UI dynamic schema all work with `tools: []` on the server because of this.

---

## 4. Prerequisites

| Requirement | Version | Why |
|---|---|---|
| Node.js | 20+ | Both processes. The Quickstart specifies 20+. |
| npm | 10+ | Lockfiles here are npm's. |
| Anthropic API key | — | Required. The Claude Agent SDK spawns a CLI child process that reads `ANTHROPIC_API_KEY` from its environment. |
| OpenAI API key | — | Optional, and only for the mic on `/voice`. Every other route ignores it. |

No CopilotKit Cloud key is needed — nothing here uses the Intelligence Platform.

No framework CLI is required. The Quickstart offers `npx copilotkit@latest init --framework claude-sdk-typescript` as a from-scratch path; this repo follows the *bring-your-own-agent* path instead, which is hand-wired and is what the brief asked for.

---

## 5. Setup

```bash
# 1. Clone
git clone <this-repo> claude-sdk-typescript
cd claude-sdk-typescript

# 2. Frontend dependencies
cd frontend && npm install && cd ..

# 3. Backend dependencies
cd backend && npm install && cd ..

# 4. Environment
cp .env.example backend/.env         # then fill in ANTHROPIC_API_KEY
cp .env.example frontend/.env.local  # optional; every value has a default
```

`.env.example` is a single file covering both processes, split into clearly marked blocks. Copy it to both places and delete the block that does not apply, or just leave it — each process ignores keys it does not read.

| Variable | Where | Required | What it does |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | `backend/.env` | **yes** | Authenticates the Claude Agent SDK. Nothing runs without it. |
| `CLAUDE_MODEL` | `backend/.env` | no | Model for every agent. Defaults to `claude-sonnet-4-6`, the value the Quickstart publishes. |
| `AGENT_PORT` | `backend/.env` | no | Agent server port. Defaults to `8000`. |
| `AGENT_URL` | `frontend/.env.local` | no | Where the runtime forwards runs. Defaults to `http://localhost:8000`. Change together with `AGENT_PORT`. |
| `NEXT_PUBLIC_COPILOTKIT_INSPECTOR` | `frontend/.env.local` | no | Set to `off` to disable the Inspector overlay app-wide. Otherwise on for localhost only. |
| `OPENAI_API_KEY` | `frontend/.env.local` | no | Whisper transcription for the `/voice` mic only. |

**Default ports:** frontend `3000`, backend `8000`.

---

## 6. Running the project

Two terminals — there is no combined dev script, because the two processes are independent.

```bash
# Terminal 1 — agent server
cd backend
npm run dev
```

Successful startup looks like:

```
Claude Agent SDK listening on http://localhost:8000
  model:  claude-sonnet-4-6
  agents: 24 mounted at /<agent-id>
```

```bash
# Terminal 2 — frontend
cd frontend
npm run dev
```

```
▲ Next.js 16.3.0 (Turbopack)
- Local:  http://localhost:3000
```

Open **<http://localhost:3000>**.

Quick health check without the browser:

```bash
curl http://localhost:8000/health    # {"status":"ok"}
curl http://localhost:8000/agents    # the full agent roster + model
```

`/backend/copilot-runtime` in the app does the same check and reports any drift between the frontend's agent list and the server's.

---

## 7. What to expect — walkthrough per section

Every route below has a notes page at the path shown and a live demo at `<path>/demo-chat`.

### Getting Started

**`/quickstart`** — the bring-your-own-agent path end to end: a `ClaudeAgentAdapter` behind Express, reached by an `HttpAgent`.
*Try:* "Tell me in one sentence what this app can do."
*Pass:* tokens stream in a word at a time, markdown renders. *Fail:* an error banner — the agent server is down or `ANTHROPIC_API_KEY` is unset.

### Prebuilt Components

**`/prebuilt-components/chat`** — the base inline surface, which fills whatever container it is given.
*Try:* "Write me a haiku about SSE."
*Pass:* a streamed reply filling the centred column. *Fail:* zero-height chat means the parent has no height.

**`/prebuilt-components/sidebar`** — docked chat rendered as a *sibling* of your content, so it slides without reflowing it.
*Try:* send a message, then collapse and expand with the toggle.
*Pass:* the main column's width never changes. *Fail:* the column jumps — the sidebar got nested inside it.

**`/prebuilt-components/popup`** — the same family, overlaying the page instead of sitting beside it, plus the `labels` prop.
*Try:* "Hi there."
*Pass:* an overlay chat whose placeholder reads "Ask the popup anything..." — proof `labels` applied. *Fail:* a default placeholder, or the page content shifting.

**`/prebuilt-components/chat-controls`** — driving modal state from your own button, and capturing thumbs up/down.
*Try:* "Say something worth rating," then use the thumbs controls.
*Pass:* the button label flips in step with the sidebar; each rating appends a line with the message id. *Fail:* no button at all means `setModalOpen` was undefined — see §9.

### Custom Look and Feel

**`/custom-look-and-feel/css`** — re-skinning through shadcn v2 tokens, `.copilotKit*` class overrides, and `labels`, all scoped to a wrapper class.
*Try:* "Hello there."
*Pass:* parchment background, serif message text, your message in a mono card with a copper "→" marker. *Fail:* default chrome means `theme.css` was not bundled.

**`/custom-look-and-feel/slots`** — the three override levels (class string, props object, whole component) across three slots.
*Try:* look before sending, then send "Hello."
*Pass:* a badged welcome card first; then a badged assistant card, with the disclaimer overridden throughout. *Fail:* default chrome with no badges.

**`/custom-look-and-feel/headless-ui`** — the whole chat rebuilt from `useAgent`, `useCopilotKit` and `useRenderToolCall`, with no CopilotKit UI.
*Try:* "Tell me about yourself."
*Pass:* your own bubbles and composer, streaming normally. *Fail:* a message that never leaves the composer — check the console, which this page logs to deliberately.

**`/custom-look-and-feel/reasoning-messages`** — the `header` and `contentView` sub-slots of the reasoning card.
*Try:* "Think step by step: what is 17 × 24?"
*Pass:* a card badged "HEADER SLOT" over a body badged "contentView slot", appearing before the answer. *Fail:* no card means no reasoning reached the client — check the `REASONING_*` rows on `/backend/copilot-runtime`.

### Input Modalities

**`/multimodal-attachments`** — drag-and-drop files sent as AG-UI content parts, using the doc's base64 `onUpload`.
*Try:* drop a PNG, then ask "What is in this image?"
*Pass:* a chip above the composer, then a reply about the actual contents. *Fail:* a reply that only mentions the filename.

**`/voice`** — a second runtime carrying a `TranscriptionService`, which is the only reason the composer grows a mic.
*Try:* click "Try a sample audio", then send. With `OPENAI_API_KEY`, click the mic and speak.
*Pass:* the sample phrase lands in the composer; the mic transcribes and auto-sends. *Fail:* no mic button means the runtime never advertised transcription. A clear "OPENAI_API_KEY not configured" message is the guard working, not a break.

### Generative UI

**`/generative-ui/reasoning`** — the same slot given a whole component, replacing the card outright. Same reasoning stream as its sibling.

**`/generative-ui/tool-based`** — `useComponent` registering a React component as a tool. **Partial.**
*Try:* "Chart last quarter's revenue: Jan 40, Feb 65, Mar 52."
*Pass (today):* a rendered bar chart inline with those values, **followed by a 400 error banner** — the chart is the part that works. *Fail:* a markdown table instead of a chart means the model answered in prose. See §9.13.

**`/generative-ui/tool-rendering`** — named renderers plus a wildcard catch-all. **Broken.**
*Try:* "What's the weather in Lisbon?"
*Pass (today):* a prose answer and **no card** — that is the documented-gap behaviour this route records. A rendered card would mean a backend tool got registered, which would make this entry wrong. See §9.

**`/generative-ui/state-rendering`** — rendering agent state reactively. **Partial.** Shares its cell with State Streaming; the demo link redirects there.

**`/generative-ui/a2ui/dynamic-schema`** — bring-your-own-catalog UI where the agent composes the surface per request.
*Try:* "Show me a dashboard for our API health: uptime 99.95%, p95 latency 240 ms, 3 open incidents."
*Pass:* a composed surface of cards, metrics and badges, streaming in progressively. *Fail:* a plain markdown answer means `generate_a2ui` was never injected.

**`/generative-ui/a2ui/fixed-schema`** — a flight card whose tree is authored as JSON up front. **Broken.**
*Try:* "Find me a flight from SFO to JFK."
*Pass (today):* a one-sentence prose reply and **no card**. Both paths to a drawing tool are closed here — see §9.

### App Control

**`/frontend-tools`** — a tool whose handler runs in the browser and mutates page state.
*Try:* "Make the background a warm sunset gradient," then "Now something cold and minimal."
*Pass:* the page re-tints, the printed `current:` value changes, and the agent confirms. *Fail:* a described-but-unapplied change.

**`/human-in-the-loop`** — `useHumanInTheLoop` suspending the run behind a picker.
*Try:* "Please book an intro call with the sales team to discuss pricing."
*Pass:* a slot picker appears and the chat stops; clicking a slot flips it to "Answered" and the agent's next message names your time. *Fail:* an invented time with no picker, or a click that does nothing.

**`/programmatic-control`** — `addMessage`, `runAgent`, `stopAgent` and `subscribe` driven from code rather than a composer. **Broken — does not compile.**
*Try:* nothing yet. The demo file holds the page's `headless-complete` snippet verbatim, and that snippet references three helpers it never defines. See §9.14.
*Pass (today):* `npx tsc --noEmit` reports 6 errors in this one file, and `next build` fails type checking. Every other route still runs under `npm run dev`.

### Shared State

**`/shared-state`** — the two-way channel. **Partial.**
*Try:* set tone to playful and name to Ada, then "Explain recursion." Then "Remember that I prefer TypeScript."
*Pass:* the reply uses your name and tone; a note appears in the right-hand card mid-stream. *Caveat:* writes land through `ag_ui_update_state`, not the doc's `set_notes` — see §9.

**`/shared-state/rendering-in-app`** — the same state as a main-view canvas. **Partial**, inherits the above.
*Try:* "Make me a 4-item packing list for a weekend trip," then tick boxes and ask "Which have I ticked off?"
*Pass:* a checklist in the page body, and an answer reflecting your ticks.

**`/shared-state/streaming`** — one tool argument forwarded into a state key as it generates. **Partial.**
*Try:* "Write a 200-word product announcement for a new coffee grinder."
*Pass (today):* the panel fills in **one jump** with the LIVE badge on during the run — the subscription is right, the granularity is not what the page promises. *Fail:* no text at all is a different problem.

**`/shared-state/agent-readonly`** — `useAgentContext` as a one-way UI→agent channel.
*Try:* "What's my name and what have I been doing?" Change the name, ask again in the same thread.
*Pass:* the current form values come back both times. *Fail:* "I don't have access to that."

### Multi-Agent

**`/multi-agent/subagents`** — a supervisor delegating to three specialists, with a live delegation log. **Partial.**
*Try:* "Research and draft a paragraph about tidal energy, then critique it."
*Pass (today):* the supervisor answers directly and the log stays **empty** with all three chips dimmed. Populated cards would mean the tools got registered, which would make this entry wrong. See §9.

### Agent Config

**`/agent-config`** — a typed config object the UI owns, published with `useAgentContext`.
*Try:* "Explain what an API is." Switch tone to enthusiastic and ask again. Set expertise to beginner and ask about race conditions.
*Pass:* same question, visibly different register and length; beginner answers define jargon. *Fail:* identical phrasing across settings — check the Inspector's context tab.

### Backend

**`/backend/copilot-runtime`** — live runtime config, an agent-roster drift check, and a raw AG-UI event capture. Not a doc page of its own for this framework; kept as a debug surface and flagged as such.
*Try:* open the demo and send "Hello."
*Pass:* `RUN_STARTED → TEXT_MESSAGE_START → counted deltas → TEXT_MESSAGE_END → RUN_FINISHED`. *Fail:* `RUN_STARTED` then `RUN_FAILED` means the run errored server-side; no events at all means the runtime route is unreachable.

---

## 8. Testing checklist / current status

| Doc page | Route | Status | Notes |
|---|---|---|---|
| [quickstart](https://docs.copilotkit.ai/claude-sdk-typescript/quickstart?agent=bring-your-own) | `/quickstart` | ✅ Working | Chat streams end to end. |
| [prebuilt-components/chat](https://docs.copilotkit.ai/claude-sdk-typescript/prebuilt-components/chat) | `/prebuilt-components/chat` | ✅ Working | |
| [prebuilt-components/sidebar](https://docs.copilotkit.ai/claude-sdk-typescript/prebuilt-components/sidebar) | `/prebuilt-components/sidebar` | ✅ Working | |
| [prebuilt-components/popup](https://docs.copilotkit.ai/claude-sdk-typescript/prebuilt-components/popup) | `/prebuilt-components/popup` | ✅ Working | |
| [prebuilt-components/chat-controls](https://docs.copilotkit.ai/claude-sdk-typescript/prebuilt-components/chat-controls) | `/prebuilt-components/chat-controls` | ✅ Working | Needed the doc's own `CopilotChatConfigurationProvider` workaround — §9. |
| [custom-look-and-feel/css](https://docs.copilotkit.ai/claude-sdk-typescript/custom-look-and-feel/css) | `/custom-look-and-feel/css` | ✅ Working | `theme.css` is the published subset only — the page shows it in excerpt. |
| [custom-look-and-feel/slots](https://docs.copilotkit.ai/claude-sdk-typescript/custom-look-and-feel/slots) | `/custom-look-and-feel/slots` | ✅ Working | Override components are this repo's; the doc only `declare`s them. |
| [custom-look-and-feel/headless-ui](https://docs.copilotkit.ai/claude-sdk-typescript/custom-look-and-feel/headless-ui) | `/custom-look-and-feel/headless-ui` | ✅ Working | `headless-complete` half lives on `/programmatic-control`. |
| [custom-look-and-feel/reasoning-messages](https://docs.copilotkit.ai/claude-sdk-typescript/custom-look-and-feel/reasoning-messages) | `/custom-look-and-feel/reasoning-messages` | ✅ Working | Claude emits thinking blocks with no config; the adapter maps them to the full `REASONING_*` lifecycle. Verified live. |
| [multimodal-attachments](https://docs.copilotkit.ai/claude-sdk-typescript/multimodal-attachments) | `/multimodal-attachments` | ✅ Working | Base64 variant; the URL variant needs storage this repo has none of. |
| [voice](https://docs.copilotkit.ai/claude-sdk-typescript/voice) | `/voice` | ✅ Working | Mic needs `OPENAI_API_KEY`; sample-audio button works without. |
| [generative-ui/reasoning](https://docs.copilotkit.ai/claude-sdk-typescript/generative-ui/reasoning) | `/generative-ui/reasoning` | ✅ Working | Same reasoning stream; replaces the whole card instead of its sub-slots. |
| [generative-ui/tool-based](https://docs.copilotkit.ai/claude-sdk-typescript/generative-ui/tool-based) | `/generative-ui/tool-based` | ⚠️ Partial | Chart renders, then the follow-up run 400s. Adapter bug — §9.13. |
| [generative-ui/tool-rendering](https://docs.copilotkit.ai/claude-sdk-typescript/generative-ui/tool-rendering) | `/generative-ui/tool-rendering` | ❌ Broken | `get_weather` is a backend tool; the MCP bridge is never published. |
| [generative-ui/state-rendering](https://docs.copilotkit.ai/claude-sdk-typescript/generative-ui/state-rendering) | `/generative-ui/state-rendering` | ❌ Broken | Shares a cell with State Streaming and redirects there; inherits its non-compiling demo. §9.15. |
| [generative-ui/a2ui/dynamic-schema](https://docs.copilotkit.ai/claude-sdk-typescript/generative-ui/a2ui/dynamic-schema) | `/generative-ui/a2ui/dynamic-schema` | ✅ Working | `generate_a2ui` is injected as a frontend tool. |
| [generative-ui/a2ui/fixed-schema](https://docs.copilotkit.ai/claude-sdk-typescript/generative-ui/a2ui/fixed-schema) | `/generative-ui/a2ui/fixed-schema` | ❌ Broken | Backend `display_flight` unregisterable **and** injection off per the page. |
| [frontend-tools](https://docs.copilotkit.ai/claude-sdk-typescript/frontend-tools) | `/frontend-tools` | ✅ Working | |
| [human-in-the-loop](https://docs.copilotkit.ai/claude-sdk-typescript/human-in-the-loop) | `/human-in-the-loop` | ✅ Working | `useInterrupt` is LangGraph-only and out of scope by the docs' own text. |
| [programmatic-control](https://docs.copilotkit.ai/claude-sdk-typescript/programmatic-control) | `/programmatic-control` | ❌ Broken | Holds the page's `headless-complete` snippet verbatim; it references 3 undefined helpers and omits 2 imports, so it does not compile — §9.14. |
| [shared-state](https://docs.copilotkit.ai/claude-sdk-typescript/shared-state) | `/shared-state` | ❌ Broken | Demo holds only the two published snippets — no imports, types, `latestNotesRef`, shell or export. Does not compile. §9.15. |
| [shared-state/rendering-in-app](https://docs.copilotkit.ai/claude-sdk-typescript/shared-state/rendering-in-app) | `/shared-state/rendering-in-app` | ⚠️ Partial | This page publishes a fuller example (imports + component + export) so it compiles; still no backend tool to write items with. |
| [shared-state/streaming](https://docs.copilotkit.ai/claude-sdk-typescript/shared-state/streaming) | `/shared-state/streaming` | ❌ Broken | The page publishes 5 lines of frontend code. Demo holds exactly that, so it does not compile. §9.15. |
| [shared-state/agent-readonly](https://docs.copilotkit.ai/claude-sdk-typescript/shared-state/agent-readonly) | `/shared-state/agent-readonly` | ✅ Working | Adapter injects context itself. |
| [multi-agent/subagents](https://docs.copilotkit.ai/claude-sdk-typescript/multi-agent/subagents) | `/multi-agent/subagents` | ⚠️ Partial | Delegation log stays empty; the run loop is prose-only. |
| [agent-config](https://docs.copilotkit.ai/claude-sdk-typescript/agent-config) | `/agent-config` | ✅ Working | Arrives as context, not `forwardedProps` — §9. |
| *(no dedicated page)* | `/backend/copilot-runtime` | ✅ Working | Debug surface; flagged "not in doc sidebar" in the nav. |
| *(landing)* | `/` | 📄 Reference | Orientation and status overview. |

---

## 9. Known issues / doc-vs-implementation discrepancies

### 9.1 `buildBackendToolServer` is called by the docs and defined by none of them — **the root cause of most rows above**

The [Quickstart](https://docs.copilotkit.ai/claude-sdk-typescript/quickstart)'s "Backend tools and state" section publishes `runWithClaudeAgentSdk`, which contains:

```ts
const backendToolServer = buildBackendToolServer({
  toolSchemas, emit, getState, setState, executeTool,
});

const adapter = new ClaudeAgentAdapter({
  /* … */
  mcpServers: backendToolServer.mcpServers,
  allowedTools: backendToolServer.allowedTools,
});
```

`buildBackendToolServer` is not defined on that page or on any other page in the framework's docs. Nor are `normalizeClaudeAgentSdkModel`, `Emit`, or `ExecuteTool`. Without it there is **no published way to register a server-side tool**.

This repo does not write one. Affected: `/generative-ui/tool-rendering` (❌), `/generative-ui/a2ui/fixed-schema` (❌), `/shared-state` (⚠️), `/shared-state/rendering-in-app` (⚠️), `/shared-state/streaming` (⚠️), `/multi-agent/subagents` (⚠️).

The published backend halves are kept in `backend/src/agents/*.snippet.ts` and `*-prompt.ts`, unmodified, each with a header saying why it is inert.

### 9.2 State streaming needs raw Anthropic events the adapter never emits

[shared-state/streaming](https://docs.copilotkit.ai/claude-sdk-typescript/shared-state/streaming) publishes `emitStreamingDocumentState`, which parses `content_block_start` and `content_block_delta` / `input_json_delta` — raw Anthropic stream events. `ClaudeAgentAdapter` consumes the SDK stream internally and emits AG-UI events only (`TOOL_CALL_ARGS`, `STATE_SNAPSHOT`). The page acknowledges that "direct SDK adapters do the same work in their streaming loop" but never publishes that loop. A second, independent blocker on the same route to §9.1.

### 9.3 The sub-agent run loop exists only as prose

[multi-agent/subagents](https://docs.copilotkit.ai/claude-sdk-typescript/multi-agent/subagents) gives the supervisor prompt and three delegation tool schemas. What happens when the supervisor calls one is described in a single sentence — "the run loop in `agent_server.ts` runs the matching sub-agent synchronously, records the delegation into shared agent state, and returns the sub-agent's output as a tool_result" — with no code anywhere. The supervisor therefore runs with a prompt naming three sub-agents it has no tools for.

### 9.4 The Agent Config backend example is Python, and it is LangGraph's

[agent-config](https://docs.copilotkit.ai/claude-sdk-typescript/agent-config) is a TypeScript-framework page, but its "agent reads config and rebuilds the system prompt" example is `backend/agent.py` — a LangGraph node reading `state["copilotkit"]["context"]`. None of it applies here.

Separately, the page's own TypeScript helper `buildAgentConfigSystemPrompt(forwardedProps)` is keyed on `forwardedProps`, while `useAgentContext` actually produces `input.context`. The adapter's `ALLOWED_FORWARDED_PROPS` whitelist would drop those keys anyway. The route works — the adapter's context addendum carries the values — but by a different channel than the page implies.

### 9.5 ~~Nothing enables reasoning tokens for this adapter~~ — retracted

**This entry was wrong and is corrected here.** Both reasoning pages state that cards appear automatically when the agent emits reasoning tokens, "no extra props or configuration needed", and name OpenAI's o-series as their examples. An earlier revision of this README concluded that Claude's equivalent — extended thinking — is off unless requested, that no page shows how to enable it on a `ClaudeAgentAdapter`, and that both routes were therefore only Partial.

That was not verified before being written down, and it is false. A live run against `reasoning-default` and `reasoning-custom`, with `tools: []` and no thinking configuration anywhere on the server, emits the complete lifecycle on both:

```
REASONING_START
REASONING_MESSAGE_START
REASONING_MESSAGE_CONTENT   × n
REASONING_MESSAGE_END
REASONING_ENCRYPTED_VALUE
REASONING_END
```

The adapter translates Claude's thinking blocks into AG-UI reasoning events out of the box. Both routes are ✅ Working. `/backend/copilot-runtime` now subscribes to all six reasoning callbacks and prints them beside the assembled response, so this is checkable without re-reading the adapter source.

### 9.6 `OpenChatButton` cannot work where the page implies

[prebuilt-components/chat-controls](https://docs.copilotkit.ai/claude-sdk-typescript/prebuilt-components/chat-controls) shows `OpenChatButton` reading `setModalOpen` from `useCopilotChatConfiguration()`. `<CopilotSidebar>` creates that provider *internally*, wrapping only itself — so a sibling button gets `undefined` and the doc's early return hides it entirely. The fix is in the page's own callout: wrap the subtree in `<CopilotChatConfigurationProvider>`. Worth flagging because the callout is easy to miss and the failure is silent.

### 9.7 `createClaudeHttpAgent` is imported and never published

The [voice](https://docs.copilotkit.ai/claude-sdk-typescript/voice) route file imports `createClaudeHttpAgent` from `@/app/api/_shared/claude-http-agent`; that file appears on no page. This repo substitutes `new HttpAgent({ url })` — what the Quickstart publishes, and evidently what the wrapper is a thin factory for.

### 9.8 The CSS page leads with v1 tokens

[custom-look-and-feel/css](https://docs.copilotkit.ai/claude-sdk-typescript/custom-look-and-feel/css) opens with the `--copilot-kit-*` variables and a `CopilotKitCSSProperties` helper from `@copilotkit/react-ui` — the **v1** token system. The v2 components this harness uses read shadcn tokens instead. The page does say so, in a callout below the v1 reference table. `@copilotkit/react-ui` is not a dependency here.

### 9.9 The Quickstart's install line leaves `zod` unpinned, and the versions conflict

`npm install … zod` produces an unresolvable tree: `@anthropic-ai/claude-agent-sdk@0.2.x` peer-requires `zod@^4`, while the frontend's CopilotKit packages are on zod 3. The backend here pins `zod@^4` and the frontend `zod@^3`; because they are separate packages with separate `node_modules`, that works. A single-package-json setup following the Quickstart literally will hit `ERESOLVE`.

### 9.10 `flight_schema.json` is imported but never shown

The A2UI fixed-schema page's snippet does `import flightSchema from "./a2ui_schemas/flight_schema.json"` and the file's contents appear nowhere. The copy in `backend/src/agents/a2ui_schemas/` is taken from the sibling Google ADK harness, whose schema matches the component tree this page diagrams exactly.

### 9.11 Leaf components are referenced throughout and published almost nowhere

Nearly every page imports UI it never shows: `WeatherCard`, `FlightListCard`, `CustomCatchallRenderer`, `parseJsonResult`, `TimePickerCard`, `BarChart`, `barChartPropsSchema`, `Background`, `UserBubble`, `AssistantBubble`, `createMessageId`, `SUB_AGENT_STYLE`, the `useXSuggestions` hooks, and the three slot overrides in the slots page (which are `declare`d as opaque `ComponentType`s). Where a prop signature is fixed by a published call site, this repo implements the smallest component matching it and says so in the file header. The `useXSuggestions` hooks are omitted entirely rather than invented.

### 9.12 A doc snippet region is missing upstream

[programmatic-control](https://docs.copilotkit.ai/claude-sdk-typescript/programmatic-control) renders `snippet skipped: region 'headless-promise-primitives' missing in claude-sdk-typescript::interrupt-headless` where its promise-based interrupt example should be. Nothing published there to implement.

### 9.13 `useComponent` breaks the follow-up run: `cache_control cannot be set for empty text blocks`

Reproduced directly against the agent server. On `/generative-ui/tool-based` the chart renders, then the follow-up run fails:

```
API Error: 400 messages.4.content.0.text: cache_control cannot be set for empty text blocks
```

The chain:

1. `useComponent` is render-only — it takes no `handler`, so the tool result CopilotKit sends back is **empty**.
2. The adapter's `processMessages()` derives the prompt from the **last message only**. That is the empty tool result, so `userMessage` becomes `""`. It logs `[ClaudeAdapter] No user message found in 3 messages` and proceeds regardless.
3. It calls `query({ prompt: "" })`, adding `resume: <sessionId>` because it caches a Claude Code session per `threadId`.
4. On resume the CLI replays the earlier turns and appends the empty prompt as message 4, stamping `cache_control` on it for prompt caching. Anthropic rejects an empty cached block.

Two independent defects in `@ag-ui/claude-agent-sdk@0.0.3` (the latest published version) have to line up: deriving the prompt from one message, and passing an empty result through instead of skipping the turn. Neither is in this repo or in the doc's snippet — the `useComponent` call here is the doc's, verbatim.

Confirmed by a controlled A/B on a resumed session: an empty tool result 400s, a non-empty one reaches `RUN_FINISHED`. That is also why no other route is affected — `useFrontendTool` returns `{ status: "success" }`, `useHumanInTheLoop` returns the chosen slot, and `generate_a2ui` returns its operations container. `useComponent` is the only hook that produces an empty result.

Not worked around here, because any fix means writing code the docs do not publish. The two candidates, if you want one: substitute a placeholder prompt when `processMessages` yields empty, or skip the follow-up run entirely when the last message is an empty tool result.

---

### 9.14 The `headless-complete` snippet does not compile

`/programmatic-control/demo-chat` holds the [programmatic-control](https://docs.copilotkit.ai/claude-sdk-typescript/programmatic-control) page's `headless-complete` snippet verbatim. That snippet opens by destructuring three helpers it never defines:

```ts
const {
  attachments, fileInputRef, containerRef, handleFileUpload,
  handleDragOver, handleDragLeave, handleDrop, dragOver,
  removeAttachment, consumeAttachments,
} = useAttachmentsConfig();          // never defined
const { listRef, bottomRef, stickRef } = useAutoScroll(messages, agent.isRunning);  // never defined
const content = buildContent(trimmed, ready);                                       // never defined
```

It also omits the imports for `useAgent` and `useCopilotKit`, which it calls on its first two lines. Six TypeScript errors result:

```
Cannot find name 'useAgent'.
Cannot find name 'useCopilotKit'.
Cannot find name 'useAttachmentsConfig'.
Cannot find name 'useAutoScroll'.
Cannot find name 'buildContent'.
Parameter 'err' implicitly has an 'any' type.
```

**`next build` therefore fails at the type-check step.** Note that Next prints `✓ Compiled successfully` *before* type checking, then `Failed to type check.` afterwards — so a passing "Compiled" line is not a passing build.

This is deliberate. Completing the snippet would mean inventing three helpers the docs never publish, which would hide the fact that the page ships a flagship example nobody can copy and run.

Under `npm run dev`, `/programmatic-control/demo-chat` returns **500** when requested — the undefined names are genuine runtime errors, not just type errors. Every other route (including the `/programmatic-control` notes page itself) serves normally.

To get a green build locally without editing the snippet, either delete `frontend/src/app/programmatic-control/demo-chat/page.tsx` or set `typescript: { ignoreBuildErrors: true }` in `next.config.ts` — both are workarounds, not fixes.

---

### 9.15 Shared State and State Streaming publish snippets, not pages

Both routes were rebuilt to hold **only** the code their doc pages actually publish. Neither compiles, and that is the finding.

**[shared-state](https://docs.copilotkit.ai/claude-sdk-typescript/shared-state)** publishes exactly two frontend snippets for `page.tsx` — the `useAgent` subscription and the `handlePreferencesChange` handler — plus the full body of `notes-card.tsx`. Absent: imports for `useAgent`/`UseAgentUpdate`; the `Preferences` type (it lives only in the page's *backend* snippet); the `RWAgentState` type; `latestNotesRef`, which the handler reads; `NotesCardProps`; and the `Card`/`CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`Button` imports `NotesCard` depends on. There is no component shell, JSX, layout or default export — and no preferences form anywhere on the page, despite the published handler being named for one.

**[shared-state/streaming](https://docs.copilotkit.ai/claude-sdk-typescript/shared-state/streaming)** publishes **five lines** of frontend code: one `useAgent` call. Its only other frontend content is a sentence of prose describing a `LIVE` indicator whose markup is never shown. No imports, no typing of `agent.state`, no document view, no component, no export.

**[generative-ui/state-rendering](https://docs.copilotkit.ai/claude-sdk-typescript/generative-ui/state-rendering)** shares the streaming cell and republishes the same five lines, so its demo redirects there and inherits the same state.

Backend halves are unavailable too, and for `streaming` twice over:

- `set_notes` and `write_document` are **backend tools**, blocked by the missing `buildBackendToolServer` (§9.1).
- `emitStreamingDocumentState` consumes raw Anthropic `content_block_delta` / `input_json_delta` events. `ClaudeAgentAdapter` emits AG-UI events only; the "direct Messages API path" that would produce raw deltas is named and never published (§9.2).

Earlier revisions of this repo carried working demos around these snippets — a `Demo()` component, a `PreferencesPanel` form, a `handleClearNotes` write-back, a document panel with a LIVE badge and char counter, and writes routed through the adapter's built-in `ag_ui_update_state`. All of that was invented here, not published, so it has been removed. `preferences-panel.tsx` is deleted outright; the docs never mention such a component.

---

---

## 10. Troubleshooting

This framework has no Troubleshooting section in its doc nav; the Quickstart carries a short accordion instead. These are that accordion's items translated into this repo's symptoms, plus what actually came up building it.

| Symptom | Cause | Fix |
|---|---|---|
| Error banner on every route; nothing streams | Runtime cannot reach the agent server | Confirm `curl http://localhost:8000/health` returns `{"status":"ok"}`. If the backend is elsewhere, set `AGENT_URL` in `frontend/.env.local`. |
| `RUN_STARTED` then immediately `RUN_FAILED` | Agent-side error, usually auth | Check the backend terminal. Most often `ANTHROPIC_API_KEY` is unset in `backend/.env`. |
| `400 … cache_control cannot be set for empty text blocks` | `useComponent`'s empty tool result on a resumed session | Adapter bug, see §9.13. The rendered component is unaffected; only the follow-up run fails. |
| `next build` → `Failed to type check.`, or `/programmatic-control/demo-chat` returns 500 in dev | That route holds a non-compiling doc snippet | Expected — see §9.14. Every other route is unaffected. |
| A tool call "stalls" or never happens | It is a backend tool | Not fixable from the docs — see §9.1. The Quickstart's own troubleshooting says "add the backend tool bridge shown below instead of leaving `tools: []`", but that bridge is the unpublished function. |
| `ERESOLVE` on `npm install` in `backend/` | zod major-version conflict | Already pinned to `^4` here. If you re-add packages, keep backend on zod 4 and frontend on zod 3. See §9.9. |
| 404 for one agent only | Frontend/backend registry drift | Open `/backend/copilot-runtime` — it diffs `frontend/src/lib/agents.ts` against the server's `GET /agents` and names the offender. |
| Blank page, dev server pegged at 100% CPU | Two Inspector instances on one page | A nested `<CopilotKit>` was added without registering its path in `NESTED_PROVIDER_ROUTES` in `frontend/src/lib/inspector.ts`. Two lit custom elements spin an unbounded assert loop. |
| Mic button missing on `/voice` | Runtime did not advertise transcription | `/api/copilotkit-voice` must be built with `createCopilotRuntimeHandler` from `@copilotkit/runtime/v2` and given a `transcriptionService`. The v1 wrapper drops that option. |
| "OPENAI_API_KEY not configured" on mic click | Expected without that key | Set `OPENAI_API_KEY` in `frontend/.env.local`, or use the sample-audio button. |
| Chat collapses to zero height | Container has no height | `<CopilotChat>` fills its parent. Give the parent a height — `.chat-host` in `globals.css` is there for this. |

---

## 11. Project structure

```
claude-sdk-typescript/
├── CLAUDE.md                   build instructions this repo was made from
├── README.md
├── .env.example                both processes, in marked blocks
│
├── backend/                    Node + Express agent server (port 8000)
│   ├── package.json
│   └── src/
│       ├── agent-server.ts     the Quickstart's server, widened to the registry
│       └── agents/
│           ├── registry.ts     every agent id → system prompt
│           ├── a2ui-fixed-prompt.ts              ┐
│           ├── agent-config-prompt.ts            │ published doc code,
│           ├── shared-state-read-write-prompt.ts │ verbatim — some live,
│           ├── subagents-prompts.ts              │ some inert, each with a
│           ├── state-streaming-backend.snippet.ts│ header saying which
│           ├── weather-tool-backend.snippet.ts   │ and why
│           ├── build-tools.snippet.ts            │
│           ├── context-addendum.snippet.ts       ┘
│           └── a2ui_schemas/*.json
│
└── frontend/                   Next.js App Router (port 3000)
    └── src/
        ├── app/
        │   ├── layout.tsx · page.tsx · status/page.tsx
        │   ├── api/
        │   │   ├── copilotkit/route.ts                    main runtime
        │   │   ├── copilotkit-declarative-gen-ui/route.ts  A2UI injection on
        │   │   └── copilotkit-voice/[[...slug]]/route.ts   v2 + transcription
        │   └── <one dir per doc route>/
        │       ├── page.tsx        notes, source, pass/fail criteria
        │       └── demo-chat/      the live surface
        ├── components/
        │   ├── providers.tsx       the single app-wide CopilotKitProvider
        │   ├── app-chrome.tsx      sidebar layout vs. full-bleed demo
        │   ├── nav-sidebar.tsx · route-header.tsx · demo-frame.tsx
        │   └── source-code.tsx · code-figure.tsx · ui.tsx
        └── lib/
            ├── nav-config.ts   routes, doc links, statuses — the single source
            ├── agents.ts       agent ids, mirrors the backend registry
            ├── inspector.ts    which provider owns the Inspector
            └── source.ts · highlight.ts   reads repo files for the source panels
```

Two files are worth knowing: **`lib/nav-config.ts`** is where the nav, every route header, the in-app status table and §8 above all come from — change a status once, there. **`lib/source.ts`** reads files off disk at render time, so every source panel shows code that actually runs.

---

## 12. References

Grouped as the doc nav groups them.

**Getting Started**
- [Quickstart](https://docs.copilotkit.ai/claude-sdk-typescript/quickstart) · [bring-your-own-agent variant](https://docs.copilotkit.ai/claude-sdk-typescript/quickstart?agent=bring-your-own)

**Prebuilt Components**
- [Chat](https://docs.copilotkit.ai/claude-sdk-typescript/prebuilt-components/chat)
- [Sidebar](https://docs.copilotkit.ai/claude-sdk-typescript/prebuilt-components/sidebar)
- [Popup](https://docs.copilotkit.ai/claude-sdk-typescript/prebuilt-components/popup)
- [Chat controls](https://docs.copilotkit.ai/claude-sdk-typescript/prebuilt-components/chat-controls)

**Custom Look and Feel**
- [CSS](https://docs.copilotkit.ai/claude-sdk-typescript/custom-look-and-feel/css)
- [Slots](https://docs.copilotkit.ai/claude-sdk-typescript/custom-look-and-feel/slots)
- [Headless UI](https://docs.copilotkit.ai/claude-sdk-typescript/custom-look-and-feel/headless-ui)
- [Reasoning messages](https://docs.copilotkit.ai/claude-sdk-typescript/custom-look-and-feel/reasoning-messages)

**Input Modalities**
- [Multimodal attachments](https://docs.copilotkit.ai/claude-sdk-typescript/multimodal-attachments)
- [Voice](https://docs.copilotkit.ai/claude-sdk-typescript/voice)

**Generative UI**
- [Reasoning](https://docs.copilotkit.ai/claude-sdk-typescript/generative-ui/reasoning)
- [Components as tools](https://docs.copilotkit.ai/claude-sdk-typescript/generative-ui/tool-based)
- [Tool call rendering](https://docs.copilotkit.ai/claude-sdk-typescript/generative-ui/tool-rendering)
- [State rendering](https://docs.copilotkit.ai/claude-sdk-typescript/generative-ui/state-rendering)
- [A2UI · dynamic schema](https://docs.copilotkit.ai/claude-sdk-typescript/generative-ui/a2ui/dynamic-schema)
- [A2UI · fixed schema](https://docs.copilotkit.ai/claude-sdk-typescript/generative-ui/a2ui/fixed-schema)

**App Control**
- [Frontend tools](https://docs.copilotkit.ai/claude-sdk-typescript/frontend-tools)
- [Human in the loop](https://docs.copilotkit.ai/claude-sdk-typescript/human-in-the-loop)
- [Programmatic control](https://docs.copilotkit.ai/claude-sdk-typescript/programmatic-control)

**Shared State**
- [Overview](https://docs.copilotkit.ai/claude-sdk-typescript/shared-state)
- [Rendering in app](https://docs.copilotkit.ai/claude-sdk-typescript/shared-state/rendering-in-app)
- [Streaming](https://docs.copilotkit.ai/claude-sdk-typescript/shared-state/streaming)
- [Agent read-only context](https://docs.copilotkit.ai/claude-sdk-typescript/shared-state/agent-readonly)

**Multi-Agent**
- [Sub-agents](https://docs.copilotkit.ai/claude-sdk-typescript/multi-agent/subagents)

**Agent Config**
- [Agent config](https://docs.copilotkit.ai/claude-sdk-typescript/agent-config)
