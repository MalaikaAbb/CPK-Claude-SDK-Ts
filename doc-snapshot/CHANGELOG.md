# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-09-22

### 07:53 UTC — 13 pages, highest severity high

**High — Introduction**

`/claude-sdk-typescript` · routes `/`, `/doc-sync` · under “Quickstart”

19 code lines, 1 heading, 14 prose lines changed. The number of fenced code blocks changed.

````diff
- <IntelligenceOnboardingPrompt
- feature="learning"
- surface="docs_claude_sdk_typescript_quickstart"
- />
+ ## Start with your coding agent
+ Use this prompt to connect your Claude Agent SDK for TypeScript agent to CopilotKit and verify a working conversation. Your coding agent will follow this guide in your project, or you can work through the manual steps below.
+ 
+ Ask your coding agent to follow the setup steps on this page for your selected framework and frontend.
````

**High — Frontend Tools**

`/claude-sdk-typescript/frontend-tools` · route `/frontend-tools` · under “Registering a list of tools”

10 code lines, 1 heading, 14 prose lines changed. The number of fenced code blocks changed.

````diff
+ ## Registering a list of tools
+ 
+ `useFrontendTool` registers one tool per call, so it cannot be called in a loop
+ over a list whose length changes between renders. When the set of tools comes
+ from state, from props, or from a backend response, use
+ [`useFrontendTools`](/reference/hooks/useFrontendTools) instead. It takes an
+ array and runs a single effect over it, so the array can be empty on one render
+ and hold twenty entries on the next.
````

**High — Components as Tools**

`/claude-sdk-typescript/generative-ui/tool-based` · route `/generative-ui/tool-based` · under “Forward browser tools to Claude”

9 code lines, 1 heading, 31 prose lines changed. The number of fenced code blocks changed.

````diff
+ Import the React hook and Zod in the component that registers the tool. This also
+ applies to the built-in agent, which needs no backend tool-registration step.
+ 
+ ```tsx
+ import { useComponent } from "@copilotkit/react-core/v2";
+ import { z } from "zod";
+ ```
+ 
````

**High — Headless Threads**

`/claude-sdk-typescript/headless-threads` · route `/headless-threads` · under “Driving one agent per thread”

7 code lines, 1 heading, 19 prose lines changed. The number of fenced code blocks changed.

````diff
+ ## Driving one agent per thread
+ 
+ `useThreads` lists and switches threads. To read or run an agent **scoped to a
+ specific thread** — one open tab per thread, for instance — pass all three of
+ `agentId`, `runtimeAgentId` and `threadId` to `useAgent`:
+ 
+ ```tsx
+ const { agent } = useAgent({
````

**High — CopilotChat**

`/claude-sdk-typescript/prebuilt-components/chat` · route `/prebuilt-components/chat` · under “Basic setup” · in a `tsx` block

4 code lines, 7 prose lines changed. The number of fenced code blocks changed.

````diff
+ ```tsx
+ import { CopilotKit, CopilotChat } from "@copilotkit/react-core/v2";
+ import "@copilotkit/react-core/v2/styles.css";
+ ```
+ 
+ <Callout type="warn">
+ `@copilotkit/react-ui` also exports a component named `CopilotChat`. That one
+ is the [deprecated v1 chat](/claude-sdk-typescript/migrate/v2). This page documents the v2 chat,
````

**High — Threads Drawer**

`/claude-sdk-typescript/prebuilt-components/copilot-threads-drawer` · route `/prebuilt-components/copilot-threads-drawer` · under “When should I use this?”

27 code lines, 3 headings, 50 prose lines changed. The number of fenced code blocks changed.

````diff
- server-side). <SignupLink surface="docs_drawer">Get a free developer account</SignupLink> to set that up.
+ server-side). <SignupLink surface="docs_drawer">Start managed onboarding</SignupLink> to create or select a project.
- body="Get persistent threads and realtime sync on the free Developer tier."
+ body="Connect a managed project to get persistent threads and realtime sync."
+ <Callout type="warn">
+ **The Drawer ships only in `@copilotkit/react-core/v2`.** There is no v1
+ Drawer, so take the Drawer, the chat and the provider from that one package.
+ Watch the import path: `@copilotkit/react-ui` is the [deprecated v1
````

**High — CopilotPopup**

`/claude-sdk-typescript/prebuilt-components/popup` · route `/prebuilt-components/popup` · under “Basic setup” · in a `tsx` block

4 code lines, 7 prose lines changed. The number of fenced code blocks changed.

````diff
+ ```tsx
+ import { CopilotKit, CopilotPopup } from "@copilotkit/react-core/v2";
+ import "@copilotkit/react-core/v2/styles.css";
+ ```
+ 
+ <Callout type="warn">
+ `@copilotkit/react-ui` also exports a component named `CopilotPopup`. That one
+ is the [deprecated v1 popup](/claude-sdk-typescript/migrate/v2). This page documents the v2 popup,
````

**High — CopilotSidebar**

`/claude-sdk-typescript/prebuilt-components/sidebar` · route `/prebuilt-components/sidebar` · under “When should I use this?”

4 code lines, 11 prose lines changed. The number of fenced code blocks changed.

````diff
- use [`<CopilotChat>`](/claude-sdk-typescript/prebuilt-components/chat) directly.
+ use [`<CopilotChat>`](/claude-sdk-typescript/prebuilt-components/chat) directly. For saved
+ conversations and switching between them, the sidebar hosts the
+ [Threads Drawer](/claude-sdk-typescript/prebuilt-components/copilot-threads-drawer).
+ 
+ ```tsx
+ import { CopilotKit, CopilotSidebar } from "@copilotkit/react-core/v2";
+ import "@copilotkit/react-core/v2/styles.css";
````

**High — Quickstart**

`/claude-sdk-typescript/quickstart` · routes `/quickstart`, `/backend/copilot-runtime` · under “Quickstart”

19 code lines, 1 heading, 14 prose lines changed. The number of fenced code blocks changed.

````diff
- <IntelligenceOnboardingPrompt
- feature="learning"
- surface="docs_claude_sdk_typescript_quickstart"
- />
+ ## Start with your coding agent
+ Use this prompt to connect your Claude Agent SDK for TypeScript agent to CopilotKit and verify a working conversation. Your coding agent will follow this guide in your project, or you can work through the manual steps below.
+ 
+ Ask your coding agent to follow the setup steps on this page for your selected framework and frontend.
````

**Medium — Tool Call Rendering**

`/claude-sdk-typescript/generative-ui/tool-rendering` · route `/generative-ui/tool-rendering` · under “Tool inputs and results are separate”

1 heading, 15 prose lines changed.

````diff
+ ### Tool inputs and results are separate
+ 
+ In `useRenderTool`, `parameters` contains the **inputs** the agent sent to the
+ tool. It does not change into the tool's return value when `status` becomes
+ `"complete"`. The completed output arrives separately as `result`, a string.
+ For a tool that returns JSON, parse that string before reading its fields.
+ 
+ For example, `get_weather` might receive `{ "location": "Paris" }` and return
````

**Low — Slots**

`/claude-sdk-typescript/custom-look-and-feel/slots` · route `/custom-look-and-feel/slots` · under “Three levels deep”

4 prose lines changed.

````diff
+ The `assistantMessage` slot also holds `markdownRenderer`, which controls how
+ assistant markdown is rendered. It has its own guide:
+ [Markdown Rendering](/claude-sdk-typescript/custom-look-and-feel/markdown).
+ 
````

**Low — Sub-Agents**

`/claude-sdk-typescript/multi-agent/subagents` · route `/multi-agent/subagents` · under “Exposing sub-agents as tools”

9 prose lines changed.

````diff
+ <Callout type="warn">
+ Give every delegation a stable `id` and merge new entries by that `id`. The
+ client sends its copy of shared state back as run input on every run, so a
+ slot that blindly appends whatever it receives — a LangGraph
+ `Annotated[list, operator.add]` reducer, for example — concatenates the
+ entries the client just echoed onto the ones the agent already has, and the
+ log doubles when a thread is continued.
+ </Callout>
````

**Low — Voice**

`/claude-sdk-typescript/voice` · route `/voice` · under “Next.js API route”

24 prose lines changed.

````diff
+ <Callout type="warn" title="Without a service, `/transcribe` answers 503">
+ A runtime with no `transcriptionService` still serves the route, and answers every request
+ `503` with `{ "error": "service_not_configured" }`. The mic button never appears, so the
+ symptom is a chat with no voice input rather than a visible server error — check `/info` for
+ `audioFileTranscriptionEnabled` when voice silently doesn't show up.
+ </Callout>
+ <Callout type="warn" title="Calling `/transcribe` yourself">
+ The chat handles this for you; these are the rules if you post to the route directly. As
````

---

## 2026-09-09

### 08:18 UTC — 2 pages, highest severity high

**High — Multimodal Attachments**

`/claude-sdk-typescript/multimodal-attachments` · route `/multimodal-attachments` · under “Configuration”

9 code lines, 1 heading, 11 prose lines changed. The number of fenced code blocks changed.

````diff
+ | `maxConcurrentUploads` | `number` | `1` | How many files upload at the same time. See [Upload concurrency](#upload-concurrency). |
+ 
+ ## Upload concurrency
+ 
+ When a user attaches several files at once, they upload one at a time by default. Every picked file shows in the attachment queue immediately, whether or not its upload has started.
+ 
+ Set `maxConcurrentUploads` to upload several together — worth raising when your upload endpoint handles parallel requests:
+ 
````

**High — Open, close, and feedback**

`/claude-sdk-typescript/prebuilt-components/chat-controls` · route `/prebuilt-components/chat-controls` · under “Control the open state from your own UI”

20 code lines, 1 heading, 36 prose lines changed. The number of fenced code blocks changed.

````diff
+ ## Control the open state from your own UI
+ 
+ Pass `open` and `onOpenChange` to `<CopilotSidebar>` or `<CopilotPopup>` to own
+ the open state yourself. This is the controlled pattern: the surface renders
+ whatever `open` says, and every request to open or close (the toggle button,
+ click-outside on the popup) arrives on `onOpenChange` instead of moving the
+ surface directly.
+ 
````

---

---

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

---
