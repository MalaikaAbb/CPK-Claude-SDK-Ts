/**
 * Repo-authored bridge for the Shared State page's `set_notes` tool.
 *
 * The page now publishes `buildBackendToolServer` (its "Expose set_notes
 * through MCP" step) and the Quickstart publishes the `runWithClaudeAgentSdk`
 * wrapper that turns the tool's returned state into a `STATE_SNAPSHOT`. Both
 * still lean on helpers no page defines (`sdkTool`, `zodShapeFromJsonSchema`,
 * the `Emit` / `ExecuteTool` types). This file follows the same two-part
 * design with the repo's existing MCP-server pattern instead:
 *
 *   1. `setNotesMcpServer` wraps the published `SET_NOTES_TOOL_SCHEMA` with
 *      `createSdkMcpServer` + `tool()`. The handler validates exactly as the
 *      page's `set_notes` handler does and returns the doc's
 *      `{ status: "ok", count }` result, plus the validated `notes` so the
 *      server can read them back without a shared queue.
 *   2. `applySetNotesResult` is the state write-back. `agent-server.ts` calls
 *      it on every `TOOL_CALL_RESULT` for this agent; when the result belongs
 *      to `set_notes` it returns the next state, and the server emits it as a
 *      `STATE_SNAPSHOT` right after the result — the same ordering the
 *      Quickstart's wrapper produces, but tracked per request rather than
 *      through a module-level queue.
 *
 * README §9.1 records that this is a repo bridge, not doc code.
 */

import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

import { SET_NOTES_TOOL_SCHEMA } from "./shared-state-read-write-prompt";

export const NOTES_MCP_SERVER_NAME = "notes";

export const setNotesMcpServer = createSdkMcpServer({
  name: NOTES_MCP_SERVER_NAME,
  version: "1.0.0",
  tools: [
    tool(
      SET_NOTES_TOOL_SCHEMA.name,
      SET_NOTES_TOOL_SCHEMA.description,
      // zod translation of SET_NOTES_TOOL_SCHEMA.input_schema
      {
        notes: z
          .array(z.string())
          .describe("The complete updated notes array. Replaces the current notes."),
      },
      async ({ notes }) => {
        // Same validation as the page's `set_notes` handler.
        const clean = notes.filter((note): note is string => typeof note === "string");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ status: "ok", count: clean.length, notes: clean }),
            },
          ],
        };
      },
    ),
  ],
});

export const SET_NOTES_ALLOWED_TOOLS = [
  `mcp__${NOTES_MCP_SERVER_NAME}__${SET_NOTES_TOOL_SCHEMA.name}`,
];

/**
 * State write-back for `set_notes`. Returns the next state when `toolName` is
 * `set_notes` and the result parses, `null` otherwise.
 */
export function applySetNotesResult(
  toolName: string,
  resultContent: string,
  state: Record<string, unknown>,
): Record<string, unknown> | null {
  if (toolName !== SET_NOTES_TOOL_SCHEMA.name) return null;
  try {
    const parsed = JSON.parse(resultContent) as { notes?: unknown };
    if (!Array.isArray(parsed.notes)) return null;
    const notes = parsed.notes.filter((n): n is string => typeof n === "string");
    return { ...state, notes };
  } catch {
    return null;
  }
}
