# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

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

## 2026-08-26

### 09:41 UTC — 4 pages, highest severity low

**Low — Introduction**

`/claude-sdk-typescript` · routes `/`, `/doc-sync` · under “Mount CopilotKit in React”

8 prose lines changed.

````diff
+ <Callout type="info" title="This relative runtimeUrl assumes Next.js serves the runtime">
+ `/api/copilotkit` resolves only because Next.js serves your app and the runtime from the
+ same origin. A client-only frontend has no shared origin, so it needs a standalone runtime
+ server of its own and an absolute `runtimeUrl` such as
+ `http://localhost:8200/api/copilotkit`. The per-frontend guides at `/react-spa`, `/vue`,
+ `/angular` and `/react-native` each show that setup.
+ </Callout>
+ 
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

**Low — Quickstart**

`/claude-sdk-typescript/quickstart` · routes `/quickstart`, `/backend/copilot-runtime` · under “Mount CopilotKit in React”

8 prose lines changed.

````diff
+ <Callout type="info" title="This relative runtimeUrl assumes Next.js serves the runtime">
+ `/api/copilotkit` resolves only because Next.js serves your app and the runtime from the
+ same origin. A client-only frontend has no shared origin, so it needs a standalone runtime
+ server of its own and an absolute `runtimeUrl` such as
+ `http://localhost:8200/api/copilotkit`. The per-frontend guides at `/react-spa`, `/vue`,
+ `/angular` and `/react-native` each show that setup.
+ </Callout>
+ 
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
