import { HttpAgent } from "@ag-ui/client";
import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";

import { AGENT_IDS, AGENT_URL, A2UI_FIXED_AGENT_ID } from "@/lib/agents";

// The Quickstart's runtime route, widened from one agent to the whole registry.
//
// The doc registers `claude_agent: new HttpAgent({ url: "http://localhost:8000" })`
// because it has exactly one agent and mounts it at the server root. This
// harness has one agent per doc route, so the Express server mounts each at
// `/{agent_id}` and each gets its own HttpAgent pointed there. The ids are the
// same strings routes pass as `agentId`.
const serviceAdapter = new ExperimentalEmptyAdapter();

const agents = Object.fromEntries(
  AGENT_IDS.map((id) => [id, new HttpAgent({ url: `${AGENT_URL}/${id}` })]),
);

const runtime = new CopilotRuntime({
  agents,
  // A2UI, scoped to the fixed-schema agent with tool injection off — exactly
  // what that doc page prescribes, because the agent is supposed to own its
  // own `display_flight` tool and return the operations container itself.
  //
  // In this repo that tool cannot be registered (no published
  // `buildBackendToolServer`), so the practical effect is that the fixed-schema
  // agent has no drawing tool at all. Kept as published rather than quietly
  // flipping injection back on, which would demonstrate the dynamic-schema
  // path under the fixed-schema page's name.
  //
  // The dynamic-schema route deliberately does not go through this runtime —
  // it has its own at /api/copilotkit-declarative-gen-ui, where the catalog on
  // the provider is what turns A2UI on.
  a2ui: { injectA2UITool: false, agents: [A2UI_FIXED_AGENT_ID] },
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    endpoint: "/api/copilotkit",
    runtime,
    serviceAdapter,
  });

  return handleRequest(req);
};
