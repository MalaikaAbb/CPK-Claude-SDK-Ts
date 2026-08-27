import { BackendHealth } from "@/components/backend-health";
import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const DOC_ROUTE = `import { HttpAgent } from "@ag-ui/client";
import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import type { NextRequest } from "next/server";

const runtime = new CopilotRuntime({
  agents: {
    claude_agent: new HttpAgent({
      url: process.env.AGENT_URL ?? "http://localhost:8000",
    }),
  },
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit",
  mode: "single-route",
});

export const POST = (req: NextRequest) => handler(req);`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/quickstart" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The bring-your-own-agent path, end to end. A{" "}
          <code>ClaudeAgentAdapter</code> from{" "}
          <code>@ag-ui/claude-agent-sdk</code> is served over AG-UI by a small
          Express app; the Next runtime reaches it with an{" "}
          <code>HttpAgent</code>. Two processes, two ports — the agent server is
          Node, but it is a separate process from Next.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Tell me in one sentence what this app can do.",
              "Can you tell me a joke?",
            ]}
            expect="Tokens stream in a word at a time and the reply renders as markdown."
            fail="An error banner. Check the connection panel below — it names which of the three pieces is down."
          />
        </div>
      </Panel>

      <Panel
        title="Connection check"
        description="Probed server-side on every render. The three axes below fail independently and are easy to conflate."
      >
        <BackendHealth />
      </Panel>

      <Panel title="The runtime route moved to the v2 surface">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The doc used to publish a v1 route built from{" "}
          <code>copilotRuntimeNextJSAppRouterEndpoint</code> and{" "}
          <code>ExperimentalEmptyAdapter</code>. Neither exists on the v2
          surface, and there is no <code>serviceAdapter</code> at all.{" "}
          <code>createCopilotRuntimeHandler</code> returns a plain fetch handler
          instead of a <code>&#123; handleRequest &#125;</code> wrapper, so the
          route is just its verb exports.
        </p>
        <div className="mt-4">
          <CodeBlock
            code={DOC_ROUTE}
            language="ts"
            filename="the doc's version — chat only, single-route"
          />
        </div>

        <div className="mt-4">
          <Callout tone="info" title="Why this repo does not use mode: single-route">
            <p>
              The doc keeps the file at <code>route.ts</code> and passes{" "}
              <code>mode: &quot;single-route&quot;</code>, which is right when
              chat is all you need. Threads are not: they add{" "}
              <code>/info</code>, thread list, rename, archive and delete — a
              whole subtree. So this harness leaves the handler in its default{" "}
              <code>multi-route</code> mode and moves the file to{" "}
              <code>[[...slug]]/route.ts</code>, exporting GET, POST, PATCH and
              DELETE. A single-segment route would 404 everything except the
              bare URL.
            </p>
            <p className="mt-2">
              The Threads Lifecycle page publishes the{" "}
              <code>[[...slug]]</code> path itself, so the two doc pages agree —
              the Quickstart is simply showing the smaller of the two shapes.
            </p>
          </Callout>
        </div>
      </Panel>

      <Panel title="Intelligence, and the two credentials that gate it">
        <Callout tone="warn" title="INTELLIGENCE_API_KEY and COPILOTKIT_LICENSE_TOKEN do different jobs">
          <p>
            <code>INTELLIGENCE_API_KEY</code> is what puts the runtime in
            Intelligence mode: it is what makes <code>/info</code> report{" "}
            <code>mode: &quot;intelligence&quot;</code> and what makes the
            thread endpoints return real rows. Without it the runtime falls back
            to SSE with an <code>InMemoryAgentRunner</code> — chat works on every
            route here, but nothing persists across a restart.
          </p>
          <p className="mt-2">
            <code>COPILOTKIT_LICENSE_TOKEN</code> is a separate credential that
            advertises a license. <code>/info</code> reports{" "}
            <code>licenseStatus</code> off it, and client-side feature UIs gate
            on <em>that</em> field — so a runtime can serve threads perfectly
            while every{" "}
            <a
              href="/prebuilt-components/copilot-threads-drawer"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              Threads Drawer
            </a>{" "}
            in the app still shows an Upgrade button. The connection panel above
            reports both separately for exactly this reason.
          </p>
          <p className="mt-2">
            Intelligence mode also requires <code>identifyUser</code>:{" "}
            <code>CopilotRuntimeOptions</code> is a union, not one object with
            optional fields, so the two shapes are built separately rather than
            spread conditionally into one literal.
          </p>
        </Callout>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/quickstart/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The three files that make it work"
        description="Read from this repo, so they can be diffed against the doc's samples directly."
      >
        <SourceCodeGroup
          files={[
            { file: "backend/src/agent-server.ts", region: "server" },
            { file: "frontend/src/app/api/copilotkit/[[...slug]]/route.ts" },
            { file: "frontend/src/components/providers.tsx" },
          ]}
          note={
            <>
              Two changes from the doc&apos;s samples: the single agent becomes
              a loop over the registry, because this harness needs one agent per
              doc route; and the provider sends{" "}
              <code>x-user-id</code> / <code>x-user-name</code> headers, which
              is the identity <code>identifyUser</code> reads to scope threads
              per user.
            </>
          }
        />
      </Panel>
    </>
  );
}
