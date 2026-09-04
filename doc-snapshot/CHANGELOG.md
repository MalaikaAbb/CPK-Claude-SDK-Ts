# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-09-04

### 08:44 UTC — 11 pages, highest severity high

**High — Agent Config**

`/claude-sdk-typescript/agent-config` · route `/agent-config` · under “Make runtime configuration explicit”

36 code lines, 5 prose lines changed. The number of fenced code blocks changed.

````diff
- The backend half is also a single node. Read the latest config context at the top of every run and use it to build the system prompt for that turn:
- 
- ```python title="backend/agent.py — agent reads config and rebuilds the system prompt"
- import json
- 
- CONFIG_KEYS = ("tone", "expertise", "responseLength")
- 
- def read_config_value(entry):
````

**High — State Rendering**

`/claude-sdk-typescript/generative-ui/state-rendering` · route `/generative-ui/state-rendering` · under “How it works in code”

16 code lines, 1 heading, 12 prose lines changed. The number of fenced code blocks changed.

````diff
+ <Steps>
+ <Step>
+ ### Stream partial state updates while Claude responds
+ 
+ For streaming state, parse the agent's structured deltas as they arrive and
+ emit CopilotKit state updates before the final message is complete. This
+ branch runs inside the streamed tool-argument handler.
+ 
````

**High — Programmatic Control**

`/claude-sdk-typescript/programmatic-control` · route `/programmatic-control` · under “Run Claude through an AG-UI endpoint” · in a `tsx` block

2 code lines changed.

````diff
+ "use client";
+ 
````

**High — Shared State**

`/claude-sdk-typescript/shared-state` · route `/shared-state` · under “Put shared state in the system prompt and tools”

38 code lines, 2 headings, 17 prose lines changed. The number of fenced code blocks changed.

````diff
+ 
+ <Step>
+ ### Pass the schema to the shared agent loop
+ 
+ The route reads the current preferences and notes, then registers
+ `SET_NOTES_TOOL_SCHEMA` with `runAgenticLoop`.
+ 
+ 
````

**Low — Introduction**

`/claude-sdk-typescript` · routes `/`, `/doc-sync` · under “Quickstart”

5 prose lines changed.

````diff
+ <IntelligenceOnboardingPrompt
+ feature="learning"
+ surface="docs_claude_sdk_typescript_quickstart"
+ />
+ 
````

**Low — Frontend Tools**

`/claude-sdk-typescript/frontend-tools` · route `/frontend-tools` · under “Frontend Tools”

12 prose lines changed.

````diff
- <Callout type="info" title="See this in Inspector">
- Open Inspector on localhost. Go to **Inspect**, then **Event Snippets**.
- You can compile a tool call, reasoning, text, or activity, run it on the live
- agent, and save it. Saved snippets are grouped by recipe. On localhost chat,
- **Save as snippet** uses the recipe for the thing you click and fills the form.
- On a tool call, generative UI, or A2UI, the bookmark sits to the right of the
- block (or to the left if there is no room on the right).
- Run of a `generateSandboxedUi` tool call paints the sandbox UI in chat.
````

**Low — A2UI · Fixed Schema**

`/claude-sdk-typescript/generative-ui/a2ui/fixed-schema` · route `/generative-ui/a2ui/fixed-schema` · under “Fixed Schema A2UI”

14 prose lines changed.

````diff
+ <Callout type="info" title="The flight card is an illustrative domain">
+ Everything below uses flight booking so the wiring has something concrete to
+ render — `display_flight`, `flight-fixed-catalog`, and the airport/airline
+ components are this page's example, not part of the API.
+ 
+ What transfers is the **shape**: a fixed catalog, a tool that returns data
+ against it, and `a2ui.render(...)` with `createSurface` + `updateComponents` +
+ `updateDataModel`. Keep your own application's domain and substitute your own
````

**Low — Quickstart**

`/claude-sdk-typescript/quickstart` · routes `/quickstart`, `/backend/copilot-runtime` · under “Quickstart”

5 prose lines changed.

````diff
+ <IntelligenceOnboardingPrompt
+ feature="learning"
+ surface="docs_claude_sdk_typescript_quickstart"
+ />
+ 
````

**Info — Headless Threads**

`/claude-sdk-typescript/headless-threads` · route `/headless-threads`

Now tracked for the first time.

**Info — Threads Drawer**

`/claude-sdk-typescript/prebuilt-components/copilot-threads-drawer` · route `/prebuilt-components/copilot-threads-drawer`

Now tracked for the first time.

**Info — Thread & History Lifecycle**

`/claude-sdk-typescript/threads-lifecycle` · route `/threads-lifecycle`

Now tracked for the first time.

---

## 2026-08-26

### 10:06 UTC — 4 pages, highest severity high

**High — Introduction**

`/claude-sdk-typescript` · routes `/`, `/doc-sync` · under “Configure your environment” · in a `plaintext` block

27 code lines, 8 prose lines changed.

````diff
- CLAUDE_MODEL=claude-sonnet-4-6
+ CLAUDE_MODEL=claude-opus-4-8
- CLAUDE_MODEL=claude-sonnet-4-6
+ CLAUDE_MODEL=claude-opus-4-8
- model: process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6",
+ model: process.env.CLAUDE_MODEL ?? "claude-opus-4-8",
- ExperimentalEmptyAdapter,
- copilotRuntimeNextJSAppRouterEndpoint,
````

**High — Quickstart**

`/claude-sdk-typescript/quickstart` · routes `/quickstart`, `/backend/copilot-runtime` · under “Configure your environment” · in a `plaintext` block

27 code lines, 8 prose lines changed.

````diff
- CLAUDE_MODEL=claude-sonnet-4-6
+ CLAUDE_MODEL=claude-opus-4-8
- CLAUDE_MODEL=claude-sonnet-4-6
+ CLAUDE_MODEL=claude-opus-4-8
- model: process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6",
+ model: process.env.CLAUDE_MODEL ?? "claude-opus-4-8",
- ExperimentalEmptyAdapter,
- copilotRuntimeNextJSAppRouterEndpoint,
````

**Low — Frontend Tools**

`/claude-sdk-typescript/frontend-tools` · route `/frontend-tools` · under “Frontend Tools”

12 prose lines changed.

````diff
+ <Callout type="info" title="See this in Inspector">
+ Open Inspector on localhost. Go to **Inspect**, then **Event Snippets**.
+ You can compile a tool call, reasoning, text, or activity, run it on the live
+ agent, and save it. Saved snippets are grouped by recipe. On localhost chat,
+ **Save as snippet** uses the recipe for the thing you click and fills the form.
+ On a tool call, generative UI, or A2UI, the bookmark sits to the right of the
+ block (or to the left if there is no room on the right).
+ Run of a `generateSandboxedUi` tool call paints the sandbox UI in chat.
````

**Low — Shared State**

`/claude-sdk-typescript/shared-state` · route `/shared-state` · under “When should I use this?”

2 prose lines changed.

````diff
- body="Persistent threads ship with the Enterprise Intelligence Platform on the free Developer tier."
+ body="Persistent threads ship with CopilotKit Intelligence on the free Developer tier."
````

---

---

## 2026-08-21

### 15:54 UTC — 13 pages, highest severity high

**High — Introduction**

`/claude-sdk-typescript` · routes `/`, `/doc-sync` · under “Verify the integration”

51 code lines, 1 heading, 16 prose lines changed. The number of fenced code blocks changed.

````diff
+ 
+ <Step>
+ ### Open Inspector and confirm setup
+ 
+ On localhost, click the Inspector button in the corner of the app.
+ 
+ 1. Open **Agents**, then **Agent**. Your agent is listed.
+ 2. Send a chat message. Open **Agents**, then **AG-UI Events**. Events are moving.
````

**High — Agent Config**

`/claude-sdk-typescript/agent-config` · route `/agent-config` · under “When to use this”

16 code lines, 1 heading, 20 prose lines changed. The number of fenced code blocks changed.

````diff
- <WhenFrameworkHas flag="agent_config_pattern" equals="shared-state">
+ 
- </WhenFrameworkHas>
- <WhenFrameworkHas flag="agent_config_pattern" equals="runtime-properties">
- ## How it works
- The runtime owns the agent in-process, so config travels through frontend
- runtime properties rather than agent state. There's no separate backend service
- to push state into: the typed object becomes the input to the agent factory
````

**High — A2UI · Fixed Schema**

`/claude-sdk-typescript/generative-ui/a2ui/fixed-schema` · route `/generative-ui/a2ui/fixed-schema` · under “Compositional schemas”

75 code lines, 5 headings, 101 prose lines changed. The number of fenced code blocks changed.

````diff
- renderer props are typed as their resolved values (plain `z.string()`,
- not a path-or-literal union).
+ your renderer receives the resolved value and never sees the path — but
+ the *definition* still has to declare that prop as a literal-or-binding
+ union, because that union is the only signal the binder has that the
+ prop is bindable. See [Declare the component
+ definitions](#declare-the-component-definitions).
+ ### Install the renderer package
````

**High — Tool Call Rendering**

`/claude-sdk-typescript/generative-ui/tool-rendering` · route `/generative-ui/tool-rendering` · under “What is this?”

143 code lines, 2 headings, 31 prose lines changed. The number of fenced code blocks changed.

````diff
- **Free course:** See this pattern built end-to-end in [Build Interactive Agents with Generative UI](https://www.deeplearning.ai/short-courses/build-interactive-agents-with-generative-ui/) — a free DeepLearning.AI short course taught by CopilotKit's CEO covering the full Generative UI spectrum (Controlled, Declarative, and Open-Ended).
+ **Free course:** See this pattern built end-to-end in [Build Interactive
+ Agents with Generative
+ UI](https://www.deeplearning.ai/short-courses/build-interactive-agents-with-generative-ui/)
+ — a free DeepLearning.AI short course taught by CopilotKit's CEO covering the
+ full Generative UI spectrum (Controlled, Declarative, and Open-Ended).
- ```typescript
- // src/app/demos/tool-rendering/page.tsx
````

**High — Programmatic Control**

`/claude-sdk-typescript/programmatic-control` · route `/programmatic-control` · under “What is this?”

77 code lines, 2 headings, 47 prose lines changed. The number of fenced code blocks changed.

````diff
- Every example on this page is pulled from two live cells:
- `headless-complete` (full chat surface, shown here for the message-send
- path) and `interrupt-headless` (button-driven interrupt resolver, shown
- here for the subscribe + resume path).
+ The send-and-stop example below is intentionally self-contained. The
+ later subscription and interrupt examples are pulled from the live
+ `interrupt-headless` cell.
- Wrap Claude Agent SDK once, then trigger runs from a custom UI with
````

**High — Quickstart**

`/claude-sdk-typescript/quickstart` · routes `/quickstart`, `/backend/copilot-runtime` · under “Verify the integration”

51 code lines, 1 heading, 16 prose lines changed. The number of fenced code blocks changed.

````diff
+ 
+ <Step>
+ ### Open Inspector and confirm setup
+ 
+ On localhost, click the Inspector button in the corner of the app.
+ 
+ 1. Open **Agents**, then **Agent**. Your agent is listed.
+ 2. Send a chat message. Open **Agents**, then **AG-UI Events**. Events are moving.
````

**High — Render state in your app**

`/claude-sdk-typescript/shared-state/rendering-in-app` · route `/shared-state/rendering-in-app` · under “The pattern” · in a `tsx` block

29 code lines, 6 prose lines changed.

````diff
+ import { useEffect } from "react";
+ const INITIAL_CANVAS_STATE: CanvasState = {
+ title: "Project launch",
+ items: [
+ { id: "research", label: "Research user needs", done: true },
+ { id: "prototype", label: "Build a prototype", done: false },
+ ],
+ };
````

**Low — Frontend Tools**

`/claude-sdk-typescript/frontend-tools` · route `/frontend-tools` · under “Frontend Tools”

9 prose lines changed.

````diff
+ 
+ 
+ 
+ <Callout type="info" title="See this in Inspector">
+ Open Inspector on localhost. Go to **Agents**, then **Frontend Tools**.
+ Your tool and its schema are listed.
+ 
+ More detail: [Inspector](/claude-sdk-typescript/inspector).
````

**Low — Human in the Loop**

`/claude-sdk-typescript/human-in-the-loop` · route `/human-in-the-loop` · under “HITL Overview”

9 prose lines changed.

````diff
+ 
+ 
+ 
+ <Callout type="info" title="See this in Inspector">
+ Open Inspector on localhost. Go to **Agents**, then **Frontend Tools**.
+ Your tool and its schema are listed.
+ 
+ More detail: [Inspector](/claude-sdk-typescript/inspector).
````

**Low — Open, close, and feedback**

`/claude-sdk-typescript/prebuilt-components/chat-controls` · route `/prebuilt-components/chat-controls` · under “Capture message feedback (thumbs up / down)”

11 prose lines changed.

````diff
- slot**. The buttons only render when a handler is provided:
+ When the slot is rendered through `CopilotChatMessageView`, a live assistant
+ message created by a direct AG-UI `TEXT_MESSAGE_START` can also include that
+ event's opaque `rawEvent` value. The join happens when the thumbs callback runs;
+ canonical messages and future run input stay unchanged. Chunk, snapshot,
+ persisted, legacy, and direct `CopilotChatAssistantMessage` paths don't provide
+ this callback metadata.
+ 
````

**Low — Shared State**

`/claude-sdk-typescript/shared-state` · route `/shared-state` · under “What is shared state?”

8 prose lines changed.

````diff
+ 
+ <Callout type="info" title="See this in Inspector">
+ Open Inspector on localhost. Open a thread, then click **State**.
+ Agent state updates here as the run proceeds.
+ 
+ More detail: [Inspector](/claude-sdk-typescript/inspector).
+ </Callout>
+ 
````

**Low — Agent Read-Only Context**

`/claude-sdk-typescript/shared-state/agent-readonly` · route `/shared-state/agent-readonly` · under “Agent Read-Only Context”

9 prose lines changed.

````diff
+ 
+ 
+ 
+ <Callout type="info" title="See this in Inspector">
+ Open Inspector on localhost. Go to **Agents**, then **Context**.
+ The values you publish with `useAgentContext` appear here.
+ 
+ More detail: [Inspector](/claude-sdk-typescript/inspector).
````

**Low — Voice**

`/claude-sdk-typescript/voice` · route `/voice` · under “Next.js API route”

4 prose lines changed.

````diff
- <WhenFrameworkHas flag="voice_backend_pattern" equals="adk-fastapi-agent-path">
- For the Google ADK showcase, agent runs take one more hop: this Next.js route registers the `voice-demo` agent with an `HttpAgent` pointed at `${AGENT_URL}/voice`. The Python `agent_server.py` mounts registered ADK agents with `add_adk_fastapi_endpoint(app, ..., path=f"/{agent_name}")`, so the browser talks to `/api/copilotkit-voice` while the Next.js runtime forwards voice-demo agent runs to the backend `/voice` endpoint.
- </WhenFrameworkHas>
+ 
````

---

---
