import { HttpAgent } from "@ag-ui/client";
import {
  CopilotRuntime,
  InMemoryAgentRunner,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";

import { AGENT_IDS, AGENT_URL, A2UI_FIXED_AGENT_ID } from "@/lib/agents";

/**
 * The Copilot Runtime, on the v2 surface the Quickstart now builds it on.
 *
 * Three things moved when the doc switched off the v1 runtime, and all three
 * are load-bearing:
 *
 *   - The import is `@copilotkit/runtime/v2`. There is no `serviceAdapter` on
 *     this surface at all — `ExperimentalEmptyAdapter` belonged to the v1
 *     GraphQL runtime and has no counterpart here.
 *   - `createCopilotRuntimeHandler` returns a plain fetch handler rather than a
 *     `{ handleRequest }` wrapper, so the route is just the verb exports below.
 *   - The file lives at `[[...slug]]/route.ts`. The handler serves a subtree —
 *     `/info`, agent runs, thread list/rename/delete — so a single-segment
 *     route would 404 everything except the bare URL.
 */

// One HttpAgent per registered agent. The Quickstart registers exactly one at
// the server root; this harness needs a conversation per doc route, so the
// agent server mounts each at `/{agent_id}`.
const agents = Object.fromEntries(
  AGENT_IDS.map((id) => [id, new HttpAgent({ url: `${AGENT_URL}/${id}` })]),
);

/**
 * A SECOND, SEPARATE credential — and the one that unlocks the Threads Drawer.
 *
 * `INTELLIGENCE_API_KEY` authorizes the runtime against the platform: it is
 * what makes `/info` report `mode: "intelligence"` and what makes the thread
 * REST endpoints return real rows. It does NOT advertise a license.
 *
 * `licenseToken` is what does. The runtime builds a license checker from it,
 * and `/info` reports `licenseStatus` off that checker. Client-side feature
 * UIs read that field: `<CopilotThreadsDrawer>` renders its locked
 * "Threads are a CopilotKit Intelligence feature" view unless the status is
 * `valid` or `expiring`, regardless of whether threads actually work.
 *
 * So a runtime can serve threads perfectly while every drawer in the app shows
 * an Upgrade button. Set both to avoid that.
 */
const LICENSE_TOKEN = process.env.COPILOTKIT_LICENSE_TOKEN;

/**
 * A2UI, scoped to the fixed-schema agent with tool injection off — what that
 * doc page prescribes. Carried across from the v1 route unchanged; `a2ui` is
 * part of the v2 options too.
 */
// Not `as const`: the middleware option types `agents` as a mutable `string[]`,
// so a readonly tuple fails to assign.
const a2ui = { injectA2UITool: false, agents: [A2UI_FIXED_AGENT_ID] };

/**
 * SSE mode, deliberately — Intelligence is NOT attached to this runtime.
 *
 * When a provider connects to an Intelligence runtime, the client starts a
 * thread adapter for every agent that runtime advertises on `/info`: a
 * `GET /threads?agentId=…`, a `POST /threads/subscribe`, and a WebSocket that
 * retries on failure (`MAX_SOCKET_RETRIES = 5`, 15s timeout). This runtime
 * advertises 24, so attaching Intelligence here meant every page load —
 * including pages with no chat at all — fired 24 list fetches and 24
 * retrying sockets. That is enough to lock up a machine in dev, where Next
 * also mirrors every browser warning back to the server.
 *
 * The Rich Threads routes use `/api/copilotkit-threads`, which registers
 * exactly one agent. See that file.
 */
const runtime = new CopilotRuntime({
  agents,
  a2ui,
  runner: new InMemoryAgentRunner(),
  ...(LICENSE_TOKEN ? { licenseToken: LICENSE_TOKEN } : {}),
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit",
});

// Four verbs, not one. GET serves `/info` and the thread list, POST runs
// agents, and PATCH/DELETE are how threads are renamed, archived and deleted.
export { handler as GET, handler as POST, handler as PATCH, handler as DELETE };
