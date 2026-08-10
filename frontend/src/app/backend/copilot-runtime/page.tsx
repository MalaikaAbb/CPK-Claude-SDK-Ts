import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, KeyValue, Panel, TryIt } from "@/components/ui";
import { AGENT_IDS, AGENT_URL } from "@/lib/agents";

/**
 * Cross-checks the frontend's agent list against what the server actually
 * mounts, so drift between `lib/agents.ts` and `backend/src/agents/registry.ts`
 * shows up here rather than as a 404 mid-demo.
 */
async function fetchServerAgents(): Promise<{
  agents: string[];
  model: string;
} | null> {
  try {
    const res = await fetch(`${AGENT_URL}/agents`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as { agents: string[]; model: string };
  } catch {
    return null;
  }
}

export default async function Page() {
  const server = await fetchServerAgents();
  const serverIds = new Set(server?.agents ?? []);
  const missingOnServer = server
    ? AGENT_IDS.filter((id) => !serverIds.has(id))
    : [];
  const extraOnServer = server
    ? server.agents.filter((id) => !(AGENT_IDS as readonly string[]).includes(id))
    : [];

  return (
    <>
      <RouteHeader path="/backend/copilot-runtime" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The runtime is the hop between the browser and the agent server. It
          takes the browser&apos;s AG-UI run request, forwards it to the right{" "}
          <code>HttpAgent</code>, and streams protocol events back. This route
          shows the live configuration and gives you a raw capture of those
          events, which is the fastest way to tell a frontend bug from a
          backend one.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Open the demo and send “Hello”."]}
            expect="RUN_STARTED → TEXT_MESSAGE_START → a counted burst of TEXT_MESSAGE_CONTENT deltas → TEXT_MESSAGE_END → RUN_FINISHED."
            fail="RUN_STARTED followed straight by RUN_FAILED means the runtime reached the server and the run errored — check the agent server's console. No events at all means the runtime route itself is not reachable."
          />
        </div>
      </Panel>

      <Panel title="Live wiring">
        <KeyValue
          rows={[
            ["Agent server", <code key="u">{AGENT_URL}</code>],
            [
              "Reachable",
              server ? (
                <span className="text-emerald-700 dark:text-emerald-400">
                  yes — {server.agents.length} agents mounted
                </span>
              ) : (
                <span className="text-rose-700 dark:text-rose-400">
                  no — is the backend running?
                </span>
              ),
            ],
            ["Model", server ? <code key="m">{server.model}</code> : "—"],
            ["Agents known to the frontend", String(AGENT_IDS.length)],
            [
              "Drift",
              missingOnServer.length === 0 && extraOnServer.length === 0 ? (
                server ? (
                  <span className="text-emerald-700 dark:text-emerald-400">
                    none — the two lists agree
                  </span>
                ) : (
                  "unknown — server unreachable"
                )
              ) : (
                <span className="text-amber-700 dark:text-amber-400">
                  {missingOnServer.length > 0 &&
                    `frontend-only: ${missingOnServer.join(", ")}. `}
                  {extraOnServer.length > 0 &&
                    `server-only: ${extraOnServer.join(", ")}.`}
                </span>
              ),
            ],
          ]}
        />
      </Panel>

      <Panel
        title="The three runtimes this app mounts"
        description="Most routes share the first. Two doc pages specifically require their own."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/api/copilotkit/route.ts" },
            { file: "frontend/src/app/api/copilotkit-declarative-gen-ui/route.ts" },
            { file: "frontend/src/app/api/copilotkit-voice/[[...slug]]/route.ts" },
          ]}
        />
      </Panel>

      <Panel title="The agent server">
        <SourceCode file="backend/src/agent-server.ts" />
      </Panel>

      <Panel title="Note">
        <Callout tone="info" title="Not a doc page of its own for this framework">
          Several CopilotKit integrations have a dedicated{" "}
          <code>/backend/copilot-runtime</code> page. This one does not — the
          runtime route is published inside the Quickstart instead. The route is
          kept as a debug surface and flagged &ldquo;not in doc sidebar&rdquo;
          in the nav rather than being presented as a tracked page.
        </Callout>
      </Panel>
    </>
  );
}
