"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

import { GovernedActionApproval, GovernedActionTool } from "../governed-action";

const AGENT_ID = "governed-actions";

/**
 * The page's two approval patterns, one tab each (harness glue: the tabs, the
 * chat, and the agent id; the page mounts its components nowhere). Each tab
 * remounts, so only one pattern is registered at a time — `useInterrupt`
 * publishes into a single global slot, so the two never share a page.
 *
 * The page publishes no agent, tool or policy engine that produces a
 * `GovernedAction`; `governed-actions` is the Quickstart agent. In the
 * useHumanInTheLoop tab the model fills the envelope itself. In the
 * useInterrupt tab nothing ever raises an interrupt, so the card never shows.
 */
const TABS = [
  { id: "hitl", label: "useHumanInTheLoop (approve_governed_action)" },
  { id: "interrupt", label: "useInterrupt (inline approval)" },
] as const;

export default function Page() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("hitl");

  return (
    <DemoFrame
      parentPath="/human-in-the-loop/governed-actions"
      subtitle={`agent: ${AGENT_ID}`}
    >
      <div className="mx-auto flex h-full w-full max-w-4xl flex-col">
        <div className="flex shrink-0 flex-wrap gap-2 border-b border-slate-200 p-2 dark:border-slate-800">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-md border px-3 py-1 text-xs font-medium ${
                tab === t.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div key={tab} className="min-h-0 flex-1">
          {tab === "hitl" ? <GovernedActionTool /> : <GovernedActionApproval />}
          <CopilotChat agentId={AGENT_ID} className="h-full" />
        </div>
      </div>
    </DemoFrame>
  );
}
