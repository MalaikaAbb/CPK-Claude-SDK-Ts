/**
 * Verbatim from the Frontend Tools and Components-as-Tools doc pages.
 * https://docs.copilotkit.ai/claude-sdk-typescript/frontend-tools
 * https://docs.copilotkit.ai/claude-sdk-typescript/generative-ui/tool-based
 *
 * Unused — and this one is a happy case rather than a gap. Both pages say
 * "Runs that carry frontend tools use the direct Messages API path rather
 * than the Claude Agent SDK", and hand you `buildTools` to convert AG-UI tool
 * definitions into Anthropic tool schemas for that path.
 *
 * `ClaudeAgentAdapter` already does this. Its `buildOptions()` reads
 * `input.tools`, converts each definition, packs them into an in-process MCP
 * server named `ag_ui`, and auto-grants `mcp__ag_ui__<toolName>` permission.
 * So frontend tools, `useHumanInTheLoop`, `useComponent` and the runtime's
 * injected `generate_a2ui` tool all work on the plain quickstart server with
 * `tools: []` — no second code path needed.
 *
 * Kept so the route can show the doc's version beside that note.
 */

import type { RunAgentInput } from "@ag-ui/core";
import type Anthropic from "@anthropic-ai/sdk";

export function buildTools(tools: RunAgentInput["tools"]): Anthropic.Tool[] {
  if (!tools || tools.length === 0) return [];

  return tools.map((tool) => {
    let inputSchema: Anthropic.Tool.InputSchema = {
      type: "object",
      properties: {},
    };
    if (tool.parameters) {
      try {
        const parsed =
          typeof tool.parameters === "string"
            ? JSON.parse(tool.parameters)
            : tool.parameters;
        inputSchema = parsed as Anthropic.Tool.InputSchema;
      } catch (parseErr) {
        // Don't silently swap in an empty schema — Claude will then accept
        // any input shape, which compounds whatever caller bug produced
        // the malformed JSON. Warn loudly so the tool definition gets
        // fixed instead of being papered over.
        const message =
          parseErr instanceof Error ? parseErr.message : String(parseErr);
        console.warn(
          `[agent_server] failed to parse tool.parameters for ${tool.name}; using empty schema. error=${message}`,
        );
      }
    }
    return {
      name: tool.name,
      description: tool.description ?? "",
      input_schema: inputSchema,
    };
  });
}
