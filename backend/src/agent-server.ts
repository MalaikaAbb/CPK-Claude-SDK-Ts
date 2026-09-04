/**
 * The Quickstart's bring-your-own-agent server, widened to the whole registry.
 *
 * https://docs.copilotkit.ai/claude-sdk-typescript/quickstart?agent=bring-your-own
 *
 * The doc's version builds one `ClaudeAgentAdapter` and handles `POST /`. It
 * is reproduced below unchanged in every respect except that the single
 * adapter and the single route become a loop over `REGISTRY`, so one server
 * can back the ~24 doc routes this harness covers. Agent `tool-rendering` is
 * served at `POST /tool-rendering`, and so on.
 *
 * Backend tools: the "Backend tools and state" section of the same page shows
 * `runWithClaudeAgentSdk`, which calls
 * `buildBackendToolServer({ toolSchemas, emit, getState, setState, executeTool })`
 * to produce the `mcpServers` / `allowedTools` pair that gives an agent
 * server-side tools. `buildBackendToolServer` is never defined on any page in
 * the framework's docs (the Shared State page has since published it — README
 * §9.1). The backend tools this repo registers (`get_weather` for
 * `tool-rendering`, `display_flight` for `a2ui-fixed-schema`, `set_notes` for
 * `shared-state-read-write`) go through repo-authored bridges in
 * `agents/*-mcp-server.ts` instead, and the registry passes their
 * `mcpServers` / `allowedTools` through below.
 *
 * State write-back: `ClaudeAgentAdapter` only emits `STATE_SNAPSHOT` for its
 * own `ag_ui_update_state` tool, so a registry entry may supply
 * `stateFromToolResult`. The route below tracks tool-call names per request
 * and, when that hook returns a new state for a `TOOL_CALL_RESULT`, emits it
 * as a `STATE_SNAPSHOT` right after the result — the ordering the Quickstart's
 * published `runWithClaudeAgentSdk` wrapper produces. Every other route that depends
 * on a backend tool is still marked Broken or Partial. README §9.1 has the
 * full list.
 *
 * `tools: []` is not as limiting as it looks. `ClaudeAgentAdapter` reads
 * `input.tools` and builds its own in-process `ag_ui` MCP server from the
 * frontend's tools, so `useFrontendTool`, `useHumanInTheLoop`, `useComponent`
 * and the runtime's injected `generate_a2ui` all work through this server.
 */

// #region server
import { ClaudeAgentAdapter } from "@ag-ui/claude-agent-sdk";
import {
  EventType,
  type RunAgentInput,
  type StateSnapshotEvent,
  type ToolCallResultEvent,
  type ToolCallStartEvent,
} from "@ag-ui/core";
import { EventEncoder } from "@ag-ui/encoder";
import dotenv from "dotenv";
import express from "express";
import { randomUUID } from "node:crypto";

import { AGENT_IDS, REGISTRY } from "./agents/registry";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

const MODEL = process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6";

for (const agentId of AGENT_IDS) {
  const agent = new ClaudeAgentAdapter({
    agentId,
    model: MODEL,
    systemPrompt: REGISTRY[agentId].systemPrompt,
    tools: [],
    permissionMode: "dontAsk",
    maxTurns: 10,
    mcpServers: REGISTRY[agentId].mcpServers,
    allowedTools: REGISTRY[agentId].allowedTools,
  });

  app.post(`/${agentId}`, (req, res) => {
    const input = req.body as RunAgentInput;
    const runId = input.runId ?? randomUUID();
    const threadId = input.threadId ?? randomUUID();
    const encoder = new EventEncoder();

    // Per-request state write-back (see header).
    const stateFromToolResult = REGISTRY[agentId].stateFromToolResult;
    const toolNamesById = new Map<string, string>();
    let currentState: Record<string, unknown> =
      input.state && typeof input.state === "object" && !Array.isArray(input.state)
        ? { ...(input.state as Record<string, unknown>) }
        : {};

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    agent.run({ ...input, runId, threadId }).subscribe({
      next: (event) => {
        res.write(encoder.encodeSSE(event));
        if (!stateFromToolResult) return;
        if (event.type === EventType.STATE_SNAPSHOT) {
          const snap = (event as StateSnapshotEvent).snapshot as unknown;
          if (snap && typeof snap === "object" && !Array.isArray(snap)) {
            currentState = { ...(snap as Record<string, unknown>) };
          }
        } else if (event.type === EventType.TOOL_CALL_START) {
          const e = event as ToolCallStartEvent;
          toolNamesById.set(e.toolCallId, e.toolCallName);
        } else if (event.type === EventType.TOOL_CALL_RESULT) {
          const e = event as ToolCallResultEvent;
          const toolName = toolNamesById.get(e.toolCallId);
          if (!toolName) return;
          const next = stateFromToolResult(toolName, e.content, currentState);
          if (next) {
            currentState = next;
            res.write(
              encoder.encodeSSE({
                type: EventType.STATE_SNAPSHOT,
                snapshot: currentState,
              }),
            );
          }
        }
      },
      error: (error) => {
        const message = error instanceof Error ? error.message : String(error);
        res.write(
          encoder.encodeSSE({
            type: EventType.RUN_ERROR,
            runId,
            threadId,
            message,
          }),
        );
        res.end();
      },
      complete: () => res.end(),
    });
  });
}
// #endregion server

/** Lets the frontend's /backend/copilot-runtime route cross-check the roster. */
app.get("/agents", (_req, res) => {
  res.json({ agents: AGENT_IDS, model: MODEL });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const port = Number(process.env.AGENT_PORT ?? 8000);
app.listen(port, () => {
  console.log(`Claude Agent SDK listening on http://localhost:${port}`);
  console.log(`  model:  ${MODEL}`);
  console.log(`  agents: ${AGENT_IDS.length} mounted at /<agent-id>`);
});
