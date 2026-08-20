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
 * What is deliberately NOT here: the "Backend tools and state" section of the
 * same page shows `runWithClaudeAgentSdk`, which calls
 * `buildBackendToolServer({ toolSchemas, emit, getState, setState, executeTool })`
 * to produce the `mcpServers` / `allowedTools` pair that would give an agent
 * server-side tools. `buildBackendToolServer` is never defined on any page in
 * the framework's docs, so it is not implemented here. Routes that depend on
 * backend tools are marked Broken or Partial in the status table. README §9
 * has the full list.
 *
 * `tools: []` is not as limiting as it looks. `ClaudeAgentAdapter` reads
 * `input.tools` and builds its own in-process `ag_ui` MCP server from the
 * frontend's tools, so `useFrontendTool`, `useHumanInTheLoop`, `useComponent`
 * and the runtime's injected `generate_a2ui` all work through this server.
 */

// #region server
import { ClaudeAgentAdapter } from "@malaika.abbasi.fiqros/claude-agent-sdk";
import { EventType, type RunAgentInput } from "@ag-ui/core";
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
  });

  app.post(`/${agentId}`, (req, res) => {
    const input = req.body as RunAgentInput;
    const runId = input.runId ?? randomUUID();
    const threadId = input.threadId ?? randomUUID();
    const encoder = new EventEncoder();

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

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
