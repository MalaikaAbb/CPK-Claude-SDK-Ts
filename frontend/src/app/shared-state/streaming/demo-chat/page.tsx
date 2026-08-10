"use client";

/**
 * PARTIAL CODE — THIS FILE IS THE DOC'S PUBLISHED SNIPPET AND NOTHING ELSE.
 * IT DOES NOT COMPILE OR RUN.
 *
 * https://docs.copilotkit.ai/claude-sdk-typescript/shared-state/streaming
 *
 * The State Streaming page publishes exactly one frontend snippet for
 * `src/app/demos/shared-state-streaming/page.tsx` — the `useAgent`
 * subscription below, five lines — and nothing more. Its only other frontend
 * content is prose: "From there, `agent.state.document` is just a string that
 * grows on every token, and `agent.isRunning` tells you whether to show a
 * streaming indicator."
 *
 * What the page never publishes, and what is therefore absent here:
 *
 *   - imports for `useAgent` and `UseAgentUpdate`
 *   - a `StreamingState` type, or any typing of `agent.state`
 *   - the document view, the LIVE badge, the character counter — the page
 *     describes an indicator in prose and shows no markup for it
 *   - any component shell, JSX, layout, or default export
 *
 * Previously this file carried a working demo built around that hook: a
 * `Demo()` component, a `StreamingState` interface, a document `<article>`, a
 * LIVE badge and a char count. All of that was this repo's invention, not the
 * doc's, and it has been removed.
 *
 * ── The backend half is unavailable, for two separate reasons ─────────────
 * 1. `write_document` is a backend tool. Registering one requires
 *    `buildBackendToolServer`, which the Quickstart calls and which no page in
 *    this framework's docs defines.
 * 2. The page's `emitStreamingDocumentState` consumes raw Anthropic stream
 *    events (`content_block_start`, `content_block_delta` /
 *    `input_json_delta`). `ClaudeAgentAdapter` never emits those — it emits
 *    AG-UI events. The page refers to "the direct Messages API path" that
 *    would produce raw deltas and never publishes that run loop.
 *
 * Neither is worked around here.
 */

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
