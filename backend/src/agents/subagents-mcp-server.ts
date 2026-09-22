/**
 * Repo-authored bridge for the Sub-Agents page's delegation tools. Same
 * pattern as `weather-mcp-server.ts` and `set-notes-mcp-server.ts`.
 *
 * https://docs.copilotkit.ai/claude-sdk-typescript/multi-agent/subagents
 *
 * The page publishes the schemas and prompts (`subagents-prompts.ts`) and,
 * inside its full `agent_server.ts`, `invokeSubAgent` and the sub-agent branch
 * of `executeBackendTool`. Those run in the page's `runAgenticLoop`, which
 * this repo doesn't use. Here:
 *
 *   1. `subagentsMcpServer` wraps each `SUBAGENT_TOOL_SCHEMAS` entry with
 *      `createSdkMcpServer` + `tool()`. The handler calls the doc's
 *      `invokeSubAgent` and returns the doc's `{ status, result }` /
 *      `{ status, error }` result. It also includes `task`, so the server can
 *      rebuild the log entry, the same way `set_notes` includes `notes`.
 *   2. `applyDelegationResult` is the state write-back. `agent-server.ts`
 *      calls it on every `TOOL_CALL_RESULT`, and it appends the finished
 *      delegation to `state.delegations`.
 *
 * One difference from the doc: `executeBackendTool` also emits a `running`
 * snapshot before the sub-agent call. The existing write-back only fires on
 * results, so entries appear once they are `completed` / `failed`.
 * README §9.3.
 */

import Anthropic from "@anthropic-ai/sdk";
import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import {
  SUBAGENT_SYSTEM_BY_NAME,
  SUBAGENT_TOOL_SCHEMAS,
  type SubAgentName,
} from "./subagents-prompts";

export const SUBAGENTS_MCP_SERVER_NAME = "subagents";

// Sub-agent model is overridable so a faster/cheaper model can serve the
// secondary calls without changing the supervisor's.
const SUBAGENT_MODEL =
  process.env.CLAUDE_SUBAGENT_MODEL ||
  process.env.ANTHROPIC_SUBAGENT_MODEL ||
  process.env.CLAUDE_MODEL ||
  "claude-sonnet-4-6";

// Created on first use so it reads ANTHROPIC_API_KEY after dotenv has run.
let anthropic: Anthropic | null = null;

interface Delegation {
  id: string;
  sub_agent: SubAgentName;
  task: string;
  status: "running" | "completed" | "failed";
  result: string;
}

/**
 * Run a single Anthropic Messages API call for a sub-agent. No tools,
 * no streaming — we just want the final text back so the supervisor can
 * read it on its next step.
 */
async function invokeSubAgent(systemPrompt: string, task: string): Promise<string> {
  anthropic ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await anthropic.messages.create({
    model: SUBAGENT_MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: task }],
  });
  const parts = response.content
    .filter((c): c is Anthropic.TextBlock => c.type === "text")
    .map((c) => c.text);
  const text = parts.join("").trim();
  if (!text) {
    throw new Error("sub-agent returned empty text");
  }
  return text;
}

export const subagentsMcpServer = createSdkMcpServer({
  name: SUBAGENTS_MCP_SERVER_NAME,
  version: "1.0.0",
  tools: SUBAGENT_TOOL_SCHEMAS.map((schema) =>
    tool(
      schema.name,
      schema.description,
      // zod translation of schema.input_schema
      { task: z.string().describe(schema.input_schema.properties.task.description) },
      async ({ task }) => {
        const subAgentName = schema.name;
        try {
          const result = await invokeSubAgent(SUBAGENT_SYSTEM_BY_NAME[subAgentName], task);
          return {
            content: [
              { type: "text", text: JSON.stringify({ status: "completed", result, task }) },
            ],
          };
        } catch (err) {
          const errorClass = err instanceof Error ? err.constructor.name : typeof err;
          const fullMessage = err instanceof Error ? err.message : String(err);
          // Only the error class crosses the wire; the full message stays in
          // the server log.
          const scrubbed = `sub-agent call failed: ${errorClass} (see server logs)`;
          console.error(
            `[agent_server] sub-agent ${subAgentName} failed: ${errorClass}: ${fullMessage}`,
            err instanceof Error && err.stack ? err.stack : undefined,
          );
          return {
            content: [
              { type: "text", text: JSON.stringify({ status: "failed", error: scrubbed, task }) },
            ],
          };
        }
      },
    ),
  ),
});

export const SUBAGENTS_ALLOWED_TOOLS = SUBAGENT_TOOL_SCHEMAS.map(
  (schema) => `mcp__${SUBAGENTS_MCP_SERVER_NAME}__${schema.name}`,
);

/**
 * State write-back for the delegation tools. Returns the next state with the
 * finished delegation appended when `toolName` is a sub-agent and the result
 * parses, `null` otherwise.
 */
export function applyDelegationResult(
  toolName: string,
  resultContent: string,
  state: Record<string, unknown>,
): Record<string, unknown> | null {
  if (!(toolName in SUBAGENT_SYSTEM_BY_NAME)) return null;
  try {
    const parsed = JSON.parse(resultContent) as {
      status?: unknown;
      result?: unknown;
      error?: unknown;
      task?: unknown;
    };
    const completed = parsed.status === "completed";
    const entry: Delegation = {
      id: randomUUID(),
      sub_agent: toolName as SubAgentName,
      task: typeof parsed.task === "string" ? parsed.task : "",
      status: completed ? "completed" : "failed",
      result: String((completed ? parsed.result : parsed.error) ?? ""),
    };
    const existing = Array.isArray(state.delegations)
      ? (state.delegations as Delegation[])
      : [];
    return { ...state, delegations: [...existing, entry] };
  } catch {
    return null;
  }
}
