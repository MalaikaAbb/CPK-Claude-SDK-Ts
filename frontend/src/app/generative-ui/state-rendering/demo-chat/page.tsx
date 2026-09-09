"use client";

import {
  CopilotChat,
  UseAgentUpdate,
  useAgent,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { DocumentCanvas } from "../../../shared-state/streaming/document-canvas";

const AGENT_ID = "shared-state-streaming";

/**
 * State Rendering and State Streaming are the same demo cell.
 *
 * https://docs.copilotkit.ai/claude-sdk-typescript/generative-ui/state-rendering
 *
 * Both pages embed the `shared-state-streaming` cell, publish the same
 * `useAgent` subscription, and carry the same
 * `state-streaming-backend.snippet.ts`. The framing differs — one calls it
 * generative UI, the other shared state — so this route runs its own cell and
 * shares the agent and the canvas rather than redirecting.
 *
 * Same gap, too: `write_document` has no registration path and
 * `emitStreamingDocumentState` needs raw Anthropic deltas the adapter never
 * emits, so the document lands in one write at the end of the turn. See the
 * State Streaming route for the full write-up.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/generative-ui/state-rendering"
      subtitle={`agent: ${AGENT_ID}`}
    >
      <Demo />
    </DemoFrame>
  );
}

function Demo() {
  const { agent } = useAgent({
    agentId: AGENT_ID,
    updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
  });

  useConfigureSuggestions({
    suggestions: [
      {
        title: "Draft a product brief",
        message: "Draft a one-paragraph product brief for a habit tracker.",
      },
    ],
    available: "always",
  });

  const state = (agent.state ?? {}) as { document?: string };

  return (
    <div className="grid h-full grid-cols-1 gap-4 p-4 lg:grid-cols-[1fr_420px]">
      <DocumentCanvas document={state.document ?? ""} isRunning={agent.isRunning} />
      <div className="min-h-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <CopilotChat agentId={AGENT_ID} className="h-full" />
      </div>
    </div>
  );
}
