import { HttpAgent } from "@ag-ui/client";
import {
  CopilotRuntime,
  InMemoryAgentRunner,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";

import { AGENT_URL, COMPONENTS_AGENT_IDS } from "@/lib/agents";

/**
 * The runtime behind every "Components and surfaces" route
 * (docs: /generative-ui/components and its seven sub-pages).
 *
 * The doc's route.ts builds a `BuiltInAgent` on TanStack AI + OpenAI. This
 * harness tests the Claude Agent SDK, so the agents here are the same
 * `ClaudeAgentAdapter` instances every other route uses, reached over HTTP.
 * The parts that matter for generative UI are framework-neutral and kept as
 * published:
 *
 *  - `generativeUI: true` — the Transports page's runtime option. It makes the
 *    runtime add the `render_ui` tool and the catalog guide to every run's
 *    tools and context. A run with a markdown-transport envelope never gets
 *    `render_ui`; the model writes ```a2ui fences instead.
 *  - The adapter forwards `input.tools` and `input.context` to Claude, which
 *    is the "keep both tools and systemPrompts" requirement of the main page.
 *
 * Separate from /api/copilotkit so this option is scoped to these routes only.
 */
const agents = Object.fromEntries(
  COMPONENTS_AGENT_IDS.map((id) => [
    id,
    new HttpAgent({ url: `${AGENT_URL}/${id}` }),
  ]),
);

const runtime = new CopilotRuntime({
  agents,
  generativeUI: true,
  runner: new InMemoryAgentRunner(),
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit-components",
});

export { handler as GET, handler as POST };
