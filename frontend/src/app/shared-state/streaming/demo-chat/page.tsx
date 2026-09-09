"use client";

import {
  CopilotChat,
  UseAgentUpdate,
  useAgent,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { DocumentCanvas } from "../document-canvas";

const AGENT_ID = "shared-state-streaming";

/**
 * The frontend half, exactly as published — and it is correct.
 *
 * https://docs.copilotkit.ai/claude-sdk-typescript/shared-state/streaming
 *
 * The page publishes one snippet for this file: the five-line `useAgent`
 * subscription below, kept verbatim. Everything around it — the imports, the
 * typing of `agent.state`, `DocumentCanvas`, the suggestions and the layout —
 * is this repo's, filling in what the page only describes in prose. README §9.15.
 *
 * What is missing is the backend half, twice over:
 *   1. `write_document` is a backend tool, and registering one needs
 *      `buildBackendToolServer`, which no page defines runnably (§9.1).
 *   2. `emitStreamingDocumentState` walks raw Anthropic `content_block_delta`
 *      / `input_json_delta` events. `ClaudeAgentAdapter` consumes the SDK
 *      stream internally and emits AG-UI events only, so there is no raw
 *      stream to hand it.
 *
 * So the document arrives in one write at the end of the turn rather than
 * growing token-by-token. The LIVE badge and the subscription are real; the
 * streaming is not.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/shared-state/streaming" subtitle={`agent: ${AGENT_ID}`}>
      <Demo />
    </DemoFrame>
  );
}

function Demo() {
  // #region doc-snippet — the only frontend code this page publishes
  // src/app/demos/shared-state-streaming/page.tsx
  // Subscribe to BOTH state changes and run-status changes. The former
  // drives the per-token document rerender; the latter toggles the
  // "LIVE" badge when the agent starts / stops.
  const { agent } = useAgent({
    agentId: "shared-state-streaming",
    updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
  });
  // #endregion doc-snippet

  useConfigureSuggestions({
    suggestions: [
      {
        title: "Write a short essay",
        message: "Write a short essay about why small teams ship faster.",
      },
      {
        title: "Draft an email",
        message: "Draft a friendly email postponing a meeting to next Tuesday.",
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
