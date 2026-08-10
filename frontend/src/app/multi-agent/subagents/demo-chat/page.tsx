"use client";

import {
  CopilotChat,
  UseAgentUpdate,
  useAgent,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { DelegationLog, type Delegation } from "../delegation-log";

/**
 * The supervisor, and the log its delegations would populate.
 *
 * The subscription is the shape the page prescribes: `useAgent` with both
 * `OnStateChanged` and `OnRunStatusChanged`, reading `agent.state.delegations`
 * and rendering one card per entry.
 *
 * ── Why the log stays empty ──────────────────────────────────────────────
 * Two published pieces, one unpublished. The page gives the supervisor prompt
 * and the three delegation tool schemas — both are in
 * `backend/src/agents/subagents-prompts.ts`. What it does not give is the run
 * loop: "the run loop in `agent_server.ts` runs the matching sub-agent
 * synchronously, records the delegation into shared agent state, and returns
 * the sub-agent's output as a tool_result". That sentence is the entire
 * specification — no code anywhere on the page or the site.
 *
 * On top of that, the delegation tools are backend tools, so they would need
 * the equally unpublished `buildBackendToolServer` even if the loop existed.
 *
 * The supervisor therefore runs with a prompt telling it to delegate to three
 * sub-agents it has no tools for. Expect it to answer directly, or to describe
 * a delegation plan it cannot execute. See README §9.
 */

interface SubagentsState {
  delegations?: Delegation[];
}

function Demo() {
  const { agent } = useAgent({
    agentId: "subagents",
    updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
  });

  const state = (agent.state ?? {}) as SubagentsState;

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_28rem]">
      <div className="min-h-0 border-r border-slate-200 p-4 dark:border-slate-800">
        <DelegationLog
          delegations={state.delegations ?? []}
          isRunning={agent.isRunning}
        />
      </div>
      <div className="min-h-0">
        <CopilotChat agentId="subagents" className="h-full" />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <DemoFrame
      parentPath="/multi-agent/subagents"
      subtitle="agent: subagents · no delegation tools registered"
    >
      <Demo />
    </DemoFrame>
  );
}
