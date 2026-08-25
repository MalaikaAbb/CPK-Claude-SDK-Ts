/**
 * `set_notes`, wired up.
 * https://docs.copilotkit.ai/claude-sdk-typescript/shared-state
 *
 * The Shared State page publishes `SET_NOTES_TOOL_SCHEMA` and a system prompt
 * that tells the agent to call it, but never the executor — the page describes
 * what the tool does in prose ("replace the notes array in shared state") and
 * leaves the body to you. That sentence is the whole implementation, so it is
 * short: coerce the argument, write it into the run's state, report back.
 *
 * The schema is imported rather than restated, so the tool the model sees is
 * the doc's own, description included.
 *
 * Registering it needs `buildBackendToolServer`, which the Quickstart calls
 * and never defines; `backend-tool-server.ts` in this directory supplies it.
 */

import type Anthropic from "@anthropic-ai/sdk";

import type { ExecuteTool } from "./backend-tool-server";
import { SET_NOTES_TOOL_SCHEMA } from "./shared-state-read-write-prompt";

export const SHARED_STATE_TOOL_SCHEMAS: Anthropic.Tool[] = [
  SET_NOTES_TOOL_SCHEMA as Anthropic.Tool,
];

export const executeSharedStateTool: ExecuteTool = (
  name,
  input,
  { getState, setState },
) => {
  if (name !== "set_notes") {
    throw new Error(`Unknown backend tool: ${name}`);
  }

  // The model is asked for the full list every time, so a bad argument means
  // dropping notes rather than adding one. Keep the current list in that case.
  const raw = input.notes;
  if (!Array.isArray(raw) || raw.some((note) => typeof note !== "string")) {
    const current = (getState().notes as string[] | undefined) ?? [];
    return {
      status: "error",
      message:
        "`notes` must be an array of strings holding the FULL updated list. " +
        `The notes are unchanged (${current.length} kept).`,
    };
  }

  const notes = raw as string[];
  setState({ ...getState(), notes });
  return { status: "success", count: notes.length };
};
