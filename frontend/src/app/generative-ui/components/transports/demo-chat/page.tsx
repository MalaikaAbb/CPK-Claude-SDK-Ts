"use client";

import { useState } from "react";
import { CopilotChat, CopilotKitProvider } from "@copilotkit/react-core/v2";
import { standardUI } from "@copilotkit/react-core/v2/generative-ui";

import { DemoFrame } from "@/components/demo-frame";
import { nestedInspectorSetting } from "@/lib/inspector";

const AGENT_ID = "gen-ui-transports";

type Transport = "tool" | "markdown";
type Scope = "all" | "this-agent" | "other-agent";

/**
 * The page's three provider shapes behind two switches:
 *  - transport: `{ ui }` (tool, default) vs `{ ui, transport: "markdown" }`,
 *  - scope: `agentIds` omitted, `[thisAgent]`, or another id — the page's
 *    `agentIds: ["shop"]` example. With another id, this agent gets no
 *    envelope: no catalog, no guide, no render_ui.
 * The runtime half (`generativeUI: true`) is in
 * `api/copilotkit-components/[[...slug]]/route.ts`.
 * The provider is keyed on both, so each combination is a fresh conversation.
 */
export default function Page() {
  const [transport, setTransport] = useState<Transport>("tool");
  const [scope, setScope] = useState<Scope>("all");

  const agentIds =
    scope === "all" ? undefined : scope === "this-agent" ? [AGENT_ID] : ["shop"];

  const generativeUI =
    transport === "markdown"
      ? { ui: standardUI, transport: "markdown" as const, agentIds }
      : { ui: standardUI, agentIds };

  const btn = (active: boolean) =>
    `rounded-md border px-2.5 py-1 ${
      active
        ? "border-[var(--accent)] text-[var(--accent)]"
        : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
    }`;

  return (
    <DemoFrame
      parentPath="/generative-ui/components/transports"
      subtitle={`agent: ${AGENT_ID} · transport: ${transport} · agentIds: ${agentIds ? JSON.stringify(agentIds) : "(all)"}`}
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-2 text-xs dark:border-slate-800">
          <span className="text-slate-500">transport</span>
          {(["tool", "markdown"] as const).map((t) => (
            <button key={t} type="button" className={btn(transport === t)} onClick={() => setTransport(t)}>
              {t}
            </button>
          ))}
          <span className="ml-4 text-slate-500">agentIds</span>
          {(
            [
              ["all", "omitted"],
              ["this-agent", `["${AGENT_ID}"]`],
              ["other-agent", `["shop"]`],
            ] as const
          ).map(([key, label]) => (
            <button key={key} type="button" className={btn(scope === key)} onClick={() => setScope(key)}>
              {label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1">
          <CopilotKitProvider
            key={`${transport}-${scope}`}
            runtimeUrl="/api/copilotkit-components"
            agentId={AGENT_ID}
            generativeUI={generativeUI}
            enableInspector={nestedInspectorSetting}
          >
            <CopilotChat agentId={AGENT_ID} className="h-full" />
          </CopilotKitProvider>
        </div>
      </div>
    </DemoFrame>
  );
}
