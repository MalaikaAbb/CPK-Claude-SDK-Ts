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
 * `tools: []` is not as limiting as it looks. `ClaudeAgentAdapter` reads
 * `input.tools` and builds its own in-process `ag_ui` MCP server from the
 * frontend's tools, so `useFrontendTool`, `useHumanInTheLoop`, `useComponent`
 * and the runtime's injected `generate_a2ui` all work through this server.
 *
 * Agents that declare `backendTools` in the registry take a second path, in
 * `runWithBackendTools` below — the "Backend tools and state" section of the
 * same doc page. Only `shared-state-read-write` uses it today. See README §9.1
 * for the other routes that could be wired the same way and are not yet.
 */

// #region server
import { ClaudeAgentAdapter } from "@ag-ui/claude-agent-sdk";
import {
  EventType,
  type CustomEvent as AguiCustomEvent,
  type RunAgentInput,
} from "@ag-ui/core";
import { EventEncoder } from "@ag-ui/encoder";
import dotenv from "dotenv";
import express from "express";
import { randomUUID } from "node:crypto";

import {
  buildBackendToolServer,
  type Emit,
} from "./agents/backend-tool-server";
import { AGENT_IDS, REGISTRY, type AgentDefinition } from "./agents/registry";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

const MODEL = process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6";

for (const agentId of AGENT_IDS) {
  const definition = REGISTRY[agentId];

  // Agents with server-side tools get a fresh adapter per request instead,
  // because their tool server closes over that run's state. See below.
  const agent = definition.backendTools
    ? null
    : new ClaudeAgentAdapter({
        agentId,
        model: MODEL,
        systemPrompt: definition.systemPrompt,
        tools: [],
        permissionMode: "dontAsk",
        maxTurns: 10,
      });

  app.post(`/${agentId}`, (req, res) => {
    const input = req.body as RunAgentInput;
    const runId = input.runId ?? randomUUID();
    const threadId = input.threadId ?? randomUUID();
    const encoder = new EventEncoder();

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const emit: Emit = (event) => {
      res.write(encoder.encodeSSE(event));
    };

    if (!agent) {
      runWithBackendTools({
        agentId,
        definition,
        input,
        runId,
        threadId,
        emit,
        done: () => res.end(),
      });
      return;
    }

    agent.run({ ...input, runId, threadId }).subscribe({
      next: (event) => res.write(encoder.encodeSSE(event)),
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

// #region backend-tools
/**
 * The Quickstart's `runWithClaudeAgentSdk`, for agents that declare tools.
 * https://docs.copilotkit.ai/claude-sdk-typescript/quickstart
 *
 * The doc publishes this function in full and it is followed closely: a state
 * box, a tool server built over it, a per-request adapter carrying that
 * server's `mcpServers` / `allowedTools`, and — the part that makes shared
 * state work — a queue of snapshots that is drained one entry per
 * `TOOL_CALL_RESULT`, so the state a tool wrote reaches the UI immediately
 * before the result the model sees.
 *
 * Two additions the doc's version has no need for:
 *
 *   - `buildBackendToolServer` itself, which no page defines. It lives in
 *     `agents/backend-tool-server.ts`.
 *   - session resume. The doc builds one adapter per request and stops there,
 *     which is fine for a single-turn example but loses the conversation:
 *     the adapter sends only the newest message and relies on a resumed CLI
 *     session for everything before it. It caches sessions per thread on the
 *     instance, so a per-request instance never has one. The session id is
 *     captured off the run's own `system:init` event here instead, and handed
 *     back through `forwardedProps.resume` on the next turn of that thread —
 *     which is exactly what the adapter does internally when it can.
 */
const sessionIdByThread = new Map<string, string>();

function runWithBackendTools({
  agentId,
  definition,
  input,
  runId,
  threadId,
  emit,
  done,
}: {
  agentId: string;
  definition: AgentDefinition;
  input: RunAgentInput;
  runId: string;
  threadId: string;
  emit: Emit;
  done: () => void;
}): void {
  const backendTools = definition.backendTools!;
  const initialState = (input.state ?? {}) as Record<string, unknown>;

  let state = { ...initialState };
  const pendingStateSnapshots: Record<string, unknown>[] = [];

  const backendToolServer = buildBackendToolServer({
    toolSchemas: backendTools.schemas,
    emit,
    getState: () => state,
    setState: (nextState) => {
      state = nextState;
      pendingStateSnapshots.push(state);
    },
    executeTool: backendTools.execute,
  });

  const adapter = new ClaudeAgentAdapter({
    agentId,
    model: MODEL,
    systemPrompt: definition.systemPrompt,
    tools: [],
    mcpServers: backendToolServer.mcpServers,
    allowedTools: backendToolServer.allowedTools,
    permissionMode: "dontAsk",
    maxTurns: 10,
  });

  const sessionKey = `${agentId}:${threadId}`;
  const resume = sessionIdByThread.get(sessionKey);

  const runInput: RunAgentInput = {
    ...input,
    runId,
    threadId,
    state: input.state ?? state,
    forwardedProps: {
      ...((input.forwardedProps ?? {}) as Record<string, unknown>),
      ...(resume ? { resume } : {}),
    },
  };

  adapter.run(runInput).subscribe({
    next: (event) => {
      if (event.type === EventType.CUSTOM) {
        const custom = event as AguiCustomEvent;
        if (custom.name === "system:init") {
          const sessionId = (custom.value as { session_id?: unknown } | undefined)
            ?.session_id;
          if (typeof sessionId === "string") {
            sessionIdByThread.set(sessionKey, sessionId);
          }
        }
      }

      if (event.type === EventType.TOOL_CALL_RESULT) {
        const snapshot = pendingStateSnapshots.shift();
        if (snapshot) {
          emit({ type: EventType.STATE_SNAPSHOT, snapshot });
        }
      }

      emit(event);
    },
    error: (error) => {
      const message =
        error instanceof Error ? error.stack || error.message : String(error);
      emit({ type: EventType.RUN_ERROR, runId, threadId, message });
      done();
    },
    complete: () => done(),
  });
}
// #endregion backend-tools

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
