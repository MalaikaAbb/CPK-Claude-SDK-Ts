import { HttpAgent } from "@ag-ui/client";
import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";

import { AGENT_URL, JSON_RENDER_AGENT_ID } from "@/lib/agents";

/**
 * Dedicated runtime for the JSON Render route, at the basePath the doc demo's
 * `page.tsx` points at.
 *
 * Taken from the CopilotKit showcase's claude-sdk-typescript route, with one
 * substitution: the showcase builds its agent with `createClaudeHttpAgent`,
 * which no doc page publishes (README §9.7), so this uses `HttpAgent` like
 * every other runtime in the repo. Kept separate from /api/copilotkit so the
 * JSON-only system prompt cannot leak into other demos — the showcase's
 * stated reason too.
 */
const runtime = new CopilotRuntime({
  agents: {
    [JSON_RENDER_AGENT_ID]: new HttpAgent({
      url: `${AGENT_URL}/${JSON_RENDER_AGENT_ID}`,
    }),
  },
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit-declarative-json-render",
  mode: "single-route",
});

export const POST = handler;
