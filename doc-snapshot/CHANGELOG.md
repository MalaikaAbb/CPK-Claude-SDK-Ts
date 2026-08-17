# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-08-17

### 13:22 UTC — 1 page, highest severity high

**High — Components as Tools** · _local snapshot edit, not an upstream change_

`/claude-sdk-typescript/generative-ui/tool-based` · route `/generative-ui/tool-based` · under “Forward browser tools to Claude”

3 code lines, 4 prose lines changed.

````diff
- 
+ Frontend tools registered with `useFrontendTool` arrive in the AG-UI run
+ input. Convert each AG-UI tool definition into an Anthropic Messages API
+ tool schema before calling the model. Runs that carry frontend tools use
- 
+ description: tool.description ?? "",
+ input_schema: inputSchema,
````
