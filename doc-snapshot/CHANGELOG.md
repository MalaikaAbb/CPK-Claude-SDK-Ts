# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-09-15

### 10:40 UTC — 9 pages, highest severity high

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

**High — Components as Tools**

`/claude-sdk-typescript/generative-ui/tool-based` · route `/generative-ui/tool-based` · under “Forward browser tools to Claude”

4 code lines, 4 prose lines changed. The number of fenced code blocks changed.

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

**Low — A2UI · Fixed Schema**

`/claude-sdk-typescript/generative-ui/a2ui/fixed-schema` · route `/generative-ui/a2ui/fixed-schema` · under “Action handlers (reference)”

2 prose lines changed.

````diff
- [Advanced — Action Handlers](./advanced#action-handlers) for the
+ [Advanced — Action Handlers](/integrations/langgraph/generative-ui/a2ui/advanced#action-handlers) for the
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

## 2026-09-01

### 07:47 UTC — 3 pages, highest severity low

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

**Low — A2UI · Fixed Schema**

`/claude-sdk-typescript/generative-ui/a2ui/fixed-schema` · route `/generative-ui/a2ui/fixed-schema` · under “Fixed Schema A2UI”

12 prose lines changed.

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

---

---

## 2026-08-27

### 08:21 UTC — 2 pages, highest severity high

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

---

---
