/**
 * Verbatim from the Tool Call Rendering doc page.
 * https://docs.copilotkit.ai/claude-sdk-typescript/generative-ui/tool-rendering
 *
 * Live, via a repo-authored bridge. This is the complete backend half of the
 * page — a tool schema and its executor. The quickstart's
 * `runWithClaudeAgentSdk` would hand them to `buildBackendToolServer({...})`
 * to get the `mcpServers` / `allowedTools` pair `ClaudeAgentAdapter` needs,
 * and that function is never published on any page.
 *
 * `weather-mcp-server.ts` (not doc code) does that job with the Claude Agent
 * SDK's `createSdkMcpServer` + `tool()`, wrapping the two exports below
 * unchanged, so `useRenderTool({ name: "get_weather" })` on the frontend does
 * fire. See README §9.1.
 *
 * The page also names `search_flights`, `get_stock_price` and `roll_dice` in
 * its frontend renderers, but publishes a backend definition for `get_weather`
 * only — so those three have no backend code to carry here at all.
 */

import type Anthropic from "@anthropic-ai/sdk";

export const GET_WEATHER_TOOL: Anthropic.Tool = {
  name: "get_weather",
  description:
    "Get the current weather for a given location. Useful on its own for " +
    "weather questions, and a great companion to `search_flights`.",
  input_schema: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "The city or region to get weather for.",
      },
    },
    required: ["location"],
  },
};

export function getWeather(location: string): Record<string, unknown> {
  return {
    city: location,
    temperature: 68,
    humidity: 55,
    wind_speed: 10,
    conditions: "Sunny",
  };
}
