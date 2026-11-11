// The MCP Apps page's demo Code tab, `src/app/api/copilotkit-mcp-apps/route.ts`,
// copied verbatim from
// https://docs.copilotkit.ai/claude-sdk-typescript/generative-ui/mcp-apps
// except for the lines marked HARNESS below:
//  - `createClaudeHttpAgent` (from `@/app/api/_shared/claude-http-agent`) is on
//    no doc page (README §9.7), so `new HttpAgent({ url })`, the Quickstart's
//    published agent, stands in, as on every other runtime here.
//  - `internalRuntimeErrorResponse` (from `@/app/api/_shared/route-error`) is
//    also unpublished. Its import and call are commented out, and the catch
//    rethrows instead, so Next returns its own 500.
// ---------------------------------------------------------------------------
// CopilotKit runtime for the MCP Apps cell.
//
// The runtime's `mcpApps` config auto-applies the MCP Apps middleware to the
// agent: when the agent calls a tool backed by an MCP UI resource, the
// middleware fetches the resource and emits the activity event that the
// built-in `MCPAppsActivityRenderer` (registered by CopilotKit internally)
// renders in the chat as a sandboxed iframe.
//
// Reference:
// https://docs.copilotkit.ai/generative-ui/mcp-apps

import type { NextRequest } from "next/server";
import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import type { AbstractAgent } from "@ag-ui/client";
// import { createClaudeHttpAgent } from "@/app/api/_shared/claude-http-agent"; // HARNESS: unpublished (§9.7)
// import { internalRuntimeErrorResponse } from "@/app/api/_shared/route-error"; // HARNESS: unpublished
import { HttpAgent } from "@ag-ui/client"; // HARNESS: stands in for createClaudeHttpAgent

const AGENT_URL = process.env.AGENT_URL || "http://localhost:8000";

// HARNESS: the Quickstart's HttpAgent in place of the unpublished factory.
const createClaudeHttpAgent = (url: string) => new HttpAgent({ url });

const agents: Record<string, AbstractAgent> = {
  "mcp-apps": createClaudeHttpAgent(`${AGENT_URL}/mcp-apps`),
  "headless-complete": createClaudeHttpAgent(`${AGENT_URL}/headless-complete`),
};

// The `mcpApps.servers` config is all you need server-side. The runtime
// auto-applies the MCP Apps middleware to every registered agent: on each
// MCP tool call it fetches the associated UI resource and emits an
// `activity` event that the built-in `MCPAppsActivityRenderer` renders
// inline in the chat.
const runtime = new CopilotRuntime({
  // @ts-ignore -- see main route.ts
  agents,
  mcpApps: {
    servers: [
      {
        type: "http",
        url: process.env.MCP_SERVER_URL || "https://mcp.excalidraw.com",
        // Always pin a stable `serverId`. Without it CopilotKit hashes the
        // URL, and a URL change silently breaks restoration of persisted
        // MCP Apps in prior conversation threads.
        serverId: "excalidraw",
      },
    ],
  },
});

export const POST = async (req: NextRequest) => {
  try {
    const copilotHandler = createCopilotRuntimeHandler({
      runtime,
      basePath: "/api/copilotkit-mcp-apps",
      mode: "single-route",
    });
    return await copilotHandler(req);
  } catch (error: unknown) {
    // return internalRuntimeErrorResponse("/api/copilotkit-mcp-apps", error); // HARNESS: unpublished helper
    throw error; // HARNESS
  }
};
