import Link from "next/link";

import { StatusBadge } from "@/components/route-header";
import { Callout, KeyValue, Panel } from "@/components/ui";
import { ALL_ROUTES, DOCS_ROOT, type RouteStatus } from "@/lib/nav-config";
import { DocDriftPanel } from "@/components/doc-drift-panel";

/** Dynamic: the doc-sync readouts below read the snapshot off disk. */
export const dynamic = "force-dynamic";

const COUNT_ORDER: RouteStatus[] = ["working", "partial", "broken", "reference"];

export default function Page() {
  const counts = ALL_ROUTES.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  const notWorking = ALL_ROUTES.filter(
    (r) => r.status === "broken" || r.status === "partial",
  );

  return (
    <>
      <header className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          CopilotKit + Claude Agent SDK (TypeScript)
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
          A test harness for the Claude Agent SDK TypeScript integration. Every
          doc page under{" "}
          <a
            href={DOCS_ROOT}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            docs.copilotkit.ai/claude-sdk-typescript
          </a>{" "}
          that this repo tracks is a route here, and each route runs the thing
          its page teaches rather than describing it.
        </p>
      </header>


      <DocDriftPanel />

      <Panel title="How to read this harness">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Every route has two halves. The page you land on is notes and source —
          what the doc prescribes, what this repo actually does, and where those
          differ. The <strong>Open demo</strong> button opens the live,
          chrome-free surface.
        </p>
        
        <div className="mt-4">
          <KeyValue
            rows={[
              [
                "Docs tracked",
                <a
                  key="d"
                  href={DOCS_ROOT}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--accent)] underline underline-offset-4"
                >
                  {DOCS_ROOT}
                </a>,
              ],
              ["Backend", "Node + Express, ClaudeAgentAdapter over AG-UI"],
              ["Frontend surface", "@copilotkit/react-core/v2"],
              [
                "Routes",
                COUNT_ORDER.filter((s) => counts[s])
                  .map((s) => `${counts[s]} ${s}`)
                  .join(" · "),
              ],
            ]}
          />
        </div>
      </Panel>

      <Panel title="The one gap that explains most of the failures">
        <Callout tone="warn" title="buildBackendToolServer is called by the docs and defined by none of them">
          <p>
            The Quickstart&apos;s &ldquo;Backend tools and state&rdquo; section
            shows <code>runWithClaudeAgentSdk</code>, which calls{" "}
            <code>
              buildBackendToolServer(&#123; toolSchemas, emit, getState,
              setState, executeTool &#125;)
            </code>{" "}
            to build the <code>mcpServers</code> / <code>allowedTools</code>{" "}
            pair an agent needs for server-side tools. That function appears on
            no page in this framework&apos;s docs, and neither do{" "}
            <code>normalizeClaudeAgentSdkModel</code>, <code>Emit</code>, or{" "}
            <code>ExecuteTool</code>.
          </p>
          <p className="mt-2">
            This repo does not write one. Routes whose demonstration needs a
            backend tool are marked Broken or Partial and say so on their own
            page, rather than being quietly patched — the point of a harness is
            to record what the docs actually deliver.
          </p>
        </Callout>

        <div className="mt-4">
          <Callout tone="success" title="What works regardless">
            <code>ClaudeAgentAdapter</code> does more than the docs let on. It
            converts <code>input.tools</code> into its own in-process{" "}
            <code>ag_ui</code> MCP server, appends{" "}
            <code>useAgentContext</code> entries and shared state to the system
            prompt, and ships a built-in <code>ag_ui_update_state</code> tool
            that emits <code>STATE_SNAPSHOT</code>. So frontend tools,
            human-in-the-loop, <code>useComponent</code>, agent config,
            read-only context and A2UI dynamic schema all run on the plain
            Quickstart server.
            <span className="mt-2 block">
              One caveat on that list: <code>useComponent</code> reaches the
              model fine, but because it is render-only its tool result is
              empty, and the adapter mishandles an empty result on the
              follow-up run — see{" "}
              <Link
                href="/generative-ui/tool-based"
                className="underline underline-offset-4"
              >
                Components as Tools
              </Link>
              .
            </span>
          </Callout>
        </div>
      </Panel>

      <Panel
        title="Routes that are not fully working"
        description="Each links to its own page, where the specific gap is written out."
      >
        <ul className="space-y-3">
          {notWorking.map((r) => (
            <li key={r.path} className="flex flex-wrap items-start gap-3">
              <StatusBadge status={r.status} />
              <div className="min-w-0 flex-1">
                <Link
                  href={r.path}
                  className="text-sm font-medium text-[var(--accent)] underline underline-offset-4"
                >
                  {r.title}
                </Link>
                {r.statusNote && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {r.statusNote}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm">
          <Link
            href="/status"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Full status table →
          </Link>
        </p>
      </Panel>

      <Panel title="Start here">
        <ul className="space-y-2 text-sm">
          {[
            ["/quickstart", "The bring-your-own-agent path, end to end"],
            ["/prebuilt-components/chat", "The base chat surface"],
            ["/frontend-tools", "An agent that changes the page"],
            ["/human-in-the-loop", "An agent that stops and asks"],
            ["/backend/copilot-runtime", "Raw AG-UI events, for debugging"],
          ].map(([path, label]) => (
            <li key={path}>
              <Link
                href={path}
                className="text-[var(--accent)] underline underline-offset-4"
              >
                {path}
              </Link>
              <span className="text-slate-600 dark:text-slate-400"> — {label}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
