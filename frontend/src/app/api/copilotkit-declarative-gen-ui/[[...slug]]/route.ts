import { HttpAgent } from "@ag-ui/client";
import {
  CopilotRuntime,
  InMemoryAgentRunner,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";

import { AGENT_URL } from "@/lib/agents";

/**
 * A second runtime for the A2UI dynamic-schema route, matching the doc's
 * `runtimeUrl="/api/copilotkit-declarative-gen-ui"`.
 *
 * Note the absence of an `a2ui` block. That is the whole point of the page:
 * passing a catalog to the provider auto-enables A2UI and injects the
 * `generate_a2ui` tool, so the runtime needs no configuration at all. It has to
 * be a separate endpoint from /api/copilotkit because that one turns injection
 * off for the fixed-schema agent.
 *
 * Migrated to the v2 surface alongside the main route — the v1
 * `copilotRuntimeNextJSAppRouterEndpoint` / `ExperimentalEmptyAdapter` pair the
 * Quickstart used to publish no longer exists there.
 *
 * No Intelligence here on purpose: this endpoint exists to demonstrate one
 * catalog, and threads are exercised on the main runtime.
 */
const runtime = new CopilotRuntime({
  agents: {
    "declarative-gen-ui": new HttpAgent({
      url: `${AGENT_URL}/declarative-gen-ui`,
    }),
  },
  runner: new InMemoryAgentRunner(),
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit-declarative-gen-ui",
});

export { handler as GET, handler as POST, handler as PATCH, handler as DELETE };
