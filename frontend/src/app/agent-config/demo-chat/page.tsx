"use client";

import { CopilotSidebar, useAgentContext } from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

/**
 * A typed config object the UI owns, republished to the agent on every change.
 *
 * `ConfigContextRelay` is the doc's snippet, verbatim. It renders nothing —
 * its only job is to hold the `useAgentContext` registration so the values
 * re-publish whenever `config` changes and unregister on unmount.
 *
 * The backend half needs no code here. `ClaudeAgentAdapter.buildOptions()`
 * calls its own `buildStateContextAddendum(input)`, which walks
 * `input.context` and appends a "## Context from the application" block to the
 * system prompt before every run. So the agent reads the latest config each
 * turn without the server doing anything.
 */

type Tone = "professional" | "casual" | "enthusiastic";
type Expertise = "beginner" | "intermediate" | "expert";
type ResponseLength = "concise" | "detailed";

interface AgentConfig {
  tone: Tone;
  expertise: Expertise;
  responseLength: ResponseLength;
}

// The doc's snippet, unchanged.
function ConfigContextRelay({ config }: { config: AgentConfig }) {
  useAgentContext({
    description: "Agent response preferences",
    value: {
      tone: config.tone,
      expertise: config.expertise,
      responseLength: config.responseLength,
    },
  });
  return null;
}

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function Page() {
  const [config, setConfig] = useState<AgentConfig>({
    tone: "professional",
    expertise: "intermediate",
    responseLength: "concise",
  });

  return (
    <DemoFrame parentPath="/agent-config" subtitle="agent: agent-config">
      <ConfigContextRelay config={config} />

      <main className="h-full overflow-y-auto p-10">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Agent config
        </h1>
        <p className="mt-3 max-w-prose text-sm text-slate-600 dark:text-slate-400">
          Change any of these, then ask the same question again. The agent
          rereads the config at the start of every turn, so the next answer
          shifts without restarting the conversation.
        </p>

        <div className="mt-6 grid max-w-md gap-4">
          <Select
            label="Tone"
            value={config.tone}
            options={["professional", "casual", "enthusiastic"] as const}
            onChange={(tone) => setConfig((c) => ({ ...c, tone }))}
          />
          <Select
            label="Expertise"
            value={config.expertise}
            options={["beginner", "intermediate", "expert"] as const}
            onChange={(expertise) => setConfig((c) => ({ ...c, expertise }))}
          />
          <Select
            label="Response length"
            value={config.responseLength}
            options={["concise", "detailed"] as const}
            onChange={(responseLength) =>
              setConfig((c) => ({ ...c, responseLength }))
            }
          />
        </div>

        <pre className="mt-6 w-fit rounded-lg bg-slate-100 p-3 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {JSON.stringify(config, null, 2)}
        </pre>
      </main>

      <CopilotSidebar agentId="agent-config" defaultOpen />
    </DemoFrame>
  );
}
