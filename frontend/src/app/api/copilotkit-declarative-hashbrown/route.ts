import { HttpAgent } from "@ag-ui/client";
import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";

import { AGENT_URL, HASHBROWN_AGENT_ID } from "@/lib/agents";

/**
 * Dedicated runtime for the Hashbrown route, at the basePath the doc's
 * `page.tsx` publishes (`runtimeUrl="/api/copilotkit-declarative-hashbrown"`).
 *
 * As with the JSON Render route: the showcase's `createClaudeHttpAgent` is
 * unpublished (README §9.7), so `HttpAgent` stands in.
 */
const runtime = new CopilotRuntime({
  agents: {
    [HASHBROWN_AGENT_ID]: new HttpAgent({
      url: `${AGENT_URL}/${HASHBROWN_AGENT_ID}`,
    }),
  },
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit-declarative-hashbrown",
  mode: "single-route",
});

export const POST = handler;
