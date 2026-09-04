/**
 * Repo-authored bridge — NOT from any doc page.
 *
 * The Tool Call Rendering page publishes `GET_WEATHER_TOOL` and `getWeather`
 * (see `weather-tool-backend.snippet.ts`) and the Quickstart's
 * `runWithClaudeAgentSdk` hands them to a `buildBackendToolServer` that no
 * page defines. This file is the smallest thing that does that job with the
 * Claude Agent SDK's own primitives:
 *
 *   - `createSdkMcpServer` + `tool()` build an in-process MCP server.
 *     `tool()` takes a zod shape, so the snippet's JSON `input_schema` is
 *     translated by hand here.
 *   - `ClaudeAgentAdapter` accepts every SDK `Options` key, so the server
 *     goes in via `mcpServers` and is merged alongside the adapter's own
 *     `ag_ui` server rather than replacing it.
 *   - Permission is by prefixed name (`mcp__<server>__<tool>`), and the
 *     server runs with `permissionMode: "dontAsk"`, so the tool must also be
 *     listed in `allowedTools` or the call is denied silently.
 *
 * The adapter strips the `mcp__weather__` prefix before emitting tool-call
 * events, so the frontend's `useRenderTool({ name: "get_weather" })` matches
 * unchanged. README §9.1 records that this is a repo bridge, not doc code.
 */

import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

import { GET_WEATHER_TOOL, getWeather } from "./weather-tool-backend.snippet";

export const WEATHER_MCP_SERVER_NAME = "weather";

export const weatherMcpServer = createSdkMcpServer({
  name: WEATHER_MCP_SERVER_NAME,
  version: "1.0.0",
  tools: [
    tool(
      GET_WEATHER_TOOL.name,
      GET_WEATHER_TOOL.description ?? "",
      // zod translation of GET_WEATHER_TOOL.input_schema
      {
        location: z
          .string()
          .describe("The city or region to get weather for."),
      },
      async ({ location }) => ({
        content: [{ type: "text", text: JSON.stringify(getWeather(location)) }],
      }),
    ),
  ],
});

export const WEATHER_ALLOWED_TOOLS = [
  `mcp__${WEATHER_MCP_SERVER_NAME}__${GET_WEATHER_TOOL.name}`,
];
