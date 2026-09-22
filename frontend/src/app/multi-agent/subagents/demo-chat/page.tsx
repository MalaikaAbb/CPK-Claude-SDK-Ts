"use client";

import {
  CopilotChat,
  UseAgentUpdate,
  useAgent,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { DelegationLog, type Delegation } from "../delegation-log";

/**
 * The supervisor, and the log its delegations populate.
 *
 * The subscription is the shape the page prescribes: `useAgent` with both
 * `OnStateChanged` and `OnRunStatusChanged`, reading `agent.state.delegations`
 * and rendering one card per entry.
 *
 * The backend registers the three delegation tools the same way as the other
 * backend tools: an MCP server (`backend/src/agents/subagents-mcp-server.ts`)
 * passed to `ClaudeAgentAdapter` through `mcpServers`. Each call runs the
 * doc's `invokeSubAgent`, and the server appends the finished entry to
 * `state.delegations`. See README §9.3.
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
      subtitle="agent: subagents · delegation tools via repo MCP bridge"
    >
      <Demo />
    </DemoFrame>
  );
}
