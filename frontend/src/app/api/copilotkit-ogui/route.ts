// The Open Generative UI page's demo Code tab, `src/app/api/copilotkit-ogui/route.ts`,
// copied verbatim from
// https://docs.copilotkit.ai/claude-sdk-typescript/generative-ui/open-generative-ui
// except for the lines marked HARNESS below:
//  - `createClaudeHttpAgent` (from `@/app/api/_shared/claude-http-agent`) is on
//    no doc page (README §9.7), so `new HttpAgent({ url })`, the Quickstart's
//    published agent, stands in, as on every other runtime here.
//  - `internalRuntimeErrorResponse` (from `@/app/api/_shared/route-error`) is
//    unpublished; its import and call are commented out and the error rethrown.
//  - Both agents point at `${AGENT_URL}/` in the Code tab, where the showcase
//    serves its own raw-Anthropic `agent_server.ts`. This harness serves one
//    ClaudeAgentAdapter per agent id at `/<id>`, like every other route, so
//    the URLs name the id (README §9.26).
// ---------------------------------------------------------------------------
// Dedicated runtime for the Open Generative UI demos.
// Isolated here because the `openGenerativeUI` runtime flag sets
// `openGenerativeUIEnabled: true` globally on the probe response, which
// causes the CopilotKit provider's setTools effect to wipe per-demo
// `useFrontendTool`/`useComponent` registrations in the default runtime.
//
// The runtime injects a `generateSandboxedUi` tool; the Claude pass-through
// agent calls it and the runtime middleware converts each call into an
// `open-generative-ui` activity event that the built-in
// `OpenGenerativeUIActivityRenderer` mounts as a sandboxed iframe.

import type { NextRequest } from "next/server";
import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
// import { createClaudeHttpAgent } from "@/app/api/_shared/claude-http-agent"; // HARNESS: unpublished (§9.7)
// import { internalRuntimeErrorResponse } from "@/app/api/_shared/route-error"; // HARNESS: unpublished
import { HttpAgent } from "@ag-ui/client"; // HARNESS: stands in for createClaudeHttpAgent

const AGENT_URL = process.env.AGENT_URL || "http://localhost:8000";

// HARNESS: the Quickstart's HttpAgent in place of the unpublished factory.
const createClaudeHttpAgent = (url: string) => new HttpAgent({ url });

const agents = {
  "open-gen-ui": createClaudeHttpAgent(`${AGENT_URL}/open-gen-ui`), // HARNESS: Code tab has `${AGENT_URL}/`
  "open-gen-ui-advanced": createClaudeHttpAgent(`${AGENT_URL}/open-gen-ui-advanced`), // HARNESS: Code tab has `${AGENT_URL}/`
};

export const POST = async (req: NextRequest) => {
  try {
    const copilotHandler = createCopilotRuntimeHandler({
      runtime: new CopilotRuntime({
        // @ts-ignore -- see main route.ts
        agents,
        openGenerativeUI: {
          agents: ["open-gen-ui", "open-gen-ui-advanced"],
        },
      }),
      basePath: "/api/copilotkit-ogui",
      mode: "single-route",
    });
    return await copilotHandler(req);
  } catch (error: unknown) {
    // return internalRuntimeErrorResponse("/api/copilotkit-ogui", error); // HARNESS: unpublished helper
    throw error; // HARNESS
  }
};
