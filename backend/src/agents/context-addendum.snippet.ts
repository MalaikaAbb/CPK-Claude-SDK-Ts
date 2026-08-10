/**
 * Verbatim from the Agent Read-Only Context doc page.
 * https://docs.copilotkit.ai/claude-sdk-typescript/shared-state/agent-readonly
 *
 * Unused, and like `build-tools.snippet.ts` this is redundancy rather than a
 * gap. `ClaudeAgentAdapter.buildOptions()` calls its own
 * `buildStateContextAddendum(input)` which walks `input.context` and appends
 * a "## Context from the application" block to the system prompt on every
 * run — the same job, done for you.
 *
 * Doing it here as well would print every `useAgentContext` value twice.
 * Kept so the route can show the doc's snippet beside that note.
 */

import type { RunAgentInput } from "@ag-ui/core";

export function appendContextToSystemPrompt(
  input: RunAgentInput,
  systemPrompt: string,
): string {
  if (input.context && input.context.length > 0) {
    const contextStr = input.context
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((c: any) => `${c.description}: ${c.value}`)
      .join("\n");
    systemPrompt += `\n\nContext:\n${contextStr}`;
  }
  return systemPrompt;
}
