"use client";

import { CopilotPopup, useAgentContext } from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

/**
 * `useAgentContext` — props for the agent. One-way, UI to agent, no setter.
 *
 * The three hook calls are the doc's, verbatim. Each registers a dynamic
 * context entry that refreshes when its value changes and unregisters on
 * unmount. The `description` is not a comment — the agent reads it alongside
 * the value, so treat it like a parameter docstring.
 *
 * The backend needs nothing. `ClaudeAgentAdapter.buildOptions()` calls
 * `buildStateContextAddendum(input)`, which walks `input.context` and appends
 * a "## Context from the application" block to the system prompt every run.
 * The doc's own `agent_server.ts` snippet does the same thing by hand; doing
 * both would print every value twice.
 */

const ACTIVITIES = [
  "Opened invoice INV-2041",
  "Commented on ticket #318",
  "Exported the Q2 revenue report",
  "Archived the 'Legacy' workspace",
];

function DemoContent() {
  const [userName, setUserName] = useState("Atai");
  const [userTimezone, setUserTimezone] = useState("America/Los_Angeles");
  const [recentActivity, setRecentActivity] = useState<string[]>([
    ACTIVITIES[0],
    ACTIVITIES[2],
  ]);

  useAgentContext({
    description: "The currently logged-in user's display name",
    value: userName,
  });
  useAgentContext({
    description: "The user's IANA timezone (used when mentioning times)",
    value: userTimezone,
  });
  useAgentContext({
    description: "The user's recent activity in the app, newest first",
    value: recentActivity,
  });

  const toggle = (a: string) =>
    setRecentActivity((cur) =>
      cur.includes(a) ? cur.filter((x) => x !== a) : [a, ...cur],
    );

  return (
    <main className="h-full overflow-y-auto p-10">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Props for the agent
      </h1>
      <p className="mt-3 max-w-prose text-sm text-slate-600 dark:text-slate-400">
        The agent can read everything below on every turn. It has no tool to
        change any of it — that is the whole point of{" "}
        <code>useAgentContext</code> over full shared state.
      </p>

      <div className="mt-6 grid max-w-md gap-4">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Display name
          </span>
          <input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Timezone
          </span>
          <input
            value={userTimezone}
            onChange={(e) => setUserTimezone(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      </div>

      <h2 className="mt-8 text-xs font-medium uppercase tracking-wider text-slate-500">
        Recent activity
      </h2>
      <ul className="mt-2 max-w-md space-y-1">
        {ACTIVITIES.map((a) => (
          <li key={a}>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={recentActivity.includes(a)}
                onChange={() => toggle(a)}
                className="h-4 w-4"
              />
              <span className="text-slate-700 dark:text-slate-300">{a}</span>
            </label>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default function Page() {
  return (
    <DemoFrame
      parentPath="/shared-state/agent-readonly"
      subtitle="agent: readonly-state-agent-context"
    >
      <DemoContent />
      <CopilotPopup
        agentId="readonly-state-agent-context"
        defaultOpen={true}
        labels={{ chatInputPlaceholder: "Ask about your context..." }}
      />
    </DemoFrame>
  );
}
