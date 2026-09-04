/**
 * Repo-authored bridge — NOT from any doc page.
 *
 * The Fixed Schema A2UI page publishes `DISPLAY_FLIGHT_TOOL_SCHEMA` and
 * `buildDisplayFlightOperations` (see `a2ui-fixed-prompt.ts`) and turns the
 * runtime's tool injection off, so the agent must own `display_flight`. The
 * page never shows how to hand that tool to `ClaudeAgentAdapter`. This file
 * does it with the Claude Agent SDK's own primitives, the same way
 * `weather-mcp-server.ts` does for `get_weather`:
 *
 *   - `createSdkMcpServer` + `tool()` build an in-process MCP server; the
 *     JSON `input_schema` is translated to a zod shape by hand.
 *   - The handler returns the published `a2ui_operations` payload as one
 *     JSON text block. The adapter emits that text as the AG-UI
 *     `TOOL_CALL_RESULT` content, and `@ag-ui/a2ui-middleware` parses tool
 *     results for an `a2ui_operations` array, so the fixed-schema surface
 *     mounts with no further plumbing.
 *   - The tool must be granted as `mcp__flights__display_flight` because the
 *     server runs with `permissionMode: "dontAsk"`.
 *
 * README §9.1 records that this is a repo bridge, not doc code.
 */

import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

import {
  DISPLAY_FLIGHT_TOOL_SCHEMA,
  buildDisplayFlightOperations,
} from "./a2ui-fixed-prompt";

export const FLIGHTS_MCP_SERVER_NAME = "flights";

export const displayFlightMcpServer = createSdkMcpServer({
  name: FLIGHTS_MCP_SERVER_NAME,
  version: "1.0.0",
  tools: [
    tool(
      DISPLAY_FLIGHT_TOOL_SCHEMA.name,
      DISPLAY_FLIGHT_TOOL_SCHEMA.description ?? "",
      // zod translation of DISPLAY_FLIGHT_TOOL_SCHEMA.input_schema
      {
        origin: z.string().describe("Origin airport code, e.g. 'SFO'"),
        destination: z
          .string()
          .describe("Destination airport code, e.g. 'JFK'"),
        airline: z.string().describe("Airline name, e.g. 'United'"),
        price: z.string().describe("Price string, e.g. '$289'"),
      },
      async (input) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(buildDisplayFlightOperations(input)),
          },
        ],
      }),
    ),
  ],
});

export const DISPLAY_FLIGHT_ALLOWED_TOOLS = [
  `mcp__${FLIGHTS_MCP_SERVER_NAME}__${DISPLAY_FLIGHT_TOOL_SCHEMA.name}`,
];
