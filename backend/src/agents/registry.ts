/**
 * Every agent this server serves, and the system prompt it runs on.
 *
 * One entry per doc route. The key is both the agent id the frontend passes
 * as `agentId` and the path the server mounts it at, so `tool-rendering` is
 * served at `http://localhost:8000/tool-rendering`.
 *
 * The Quickstart has exactly one agent and mounts it at `/`. That shape is
 * kept — see `agent-server.ts`, which is the doc's server with the single
 * `new ClaudeAgentAdapter(...)` widened to one adapter per entry below.
 *
 * Prompts come from the doc pages wherever a page publishes one. Where none
 * is published the Quickstart's own default is used, which is deliberate: a
 * route testing a UI surface should not have a prompt inventing behaviour the
 * doc never described.
 */

import type { ResumeEntry } from "@ag-ui/core";
import type Anthropic from "@anthropic-ai/sdk";

import { AGENT_CONFIG_DEFAULT_SYSTEM_PROMPT } from "./agent-config-prompt";
import { A2UI_FIXED_SYSTEM_PROMPT } from "./a2ui-fixed-prompt";
import type { BackendToolContext, ExecuteTool } from "./backend-tool-server";
import {
  executeHitlTool,
  executeInterruptTool,
  GOVERNED_HITL_SYSTEM_PROMPT,
  GOVERNED_INTERRUPT_SYSTEM_PROMPT,
  HITL_TOOL_SCHEMAS,
  INTERRUPT_TOOL_SCHEMAS,
  resumeInterrupt,
} from "./governed-actions";
// Commented out with the `backendTools` entry below — see there.
// import {
//   executeSharedStateTool,
//   SHARED_STATE_TOOL_SCHEMAS,
// } from "./shared-state-backend-tools";
import { SHARED_STATE_READ_WRITE_BASE_SYSTEM } from "./shared-state-read-write-prompt";
import { SUPERVISOR_SYSTEM_PROMPT } from "./subagents-prompts";

/** The Quickstart's prompt, verbatim. */
export const DEFAULT_SYSTEM_PROMPT =
  "You are a helpful assistant embedded in a CopilotKit app.";

export interface AgentDefinition {
  systemPrompt: string;
  /** Why this agent exists — surfaced on /backend/copilot-runtime. */
  note?: string;
  /**
   * Server-side tools for this agent. An entry here switches the agent onto
   * the per-request path in `agent-server.ts`, which is the Quickstart's
   * `runWithClaudeAgentSdk` shape — a tool server, a state box and snapshots
   * emitted alongside tool results.
   */
  backendTools?: {
    schemas: Anthropic.Tool[];
    execute: ExecuteTool;
  };
  /**
   * Handles a run that arrives carrying AG-UI `resume[]` — the answer to an
   * interrupt one of this agent's tools raised. Runs before the model does,
   * may write state, and returns the text the model is prompted with next.
   */
  onResume?: (
    entries: ResumeEntry[],
    context: BackendToolContext,
  ) => Promise<string> | string;
}

export const REGISTRY: Record<string, AgentDefinition> = {
  // ── Getting Started ──────────────────────────────────────────────────────
  // The Quickstart names its agent `claude_agent`; kept as published.
  claude_agent: { systemPrompt: DEFAULT_SYSTEM_PROMPT },

  // ── Prebuilt Components ──────────────────────────────────────────────────
  agentic_chat: { systemPrompt: DEFAULT_SYSTEM_PROMPT },
  "prebuilt-sidebar": { systemPrompt: DEFAULT_SYSTEM_PROMPT },
  "prebuilt-popup": { systemPrompt: DEFAULT_SYSTEM_PROMPT },
  "chat-controls": { systemPrompt: DEFAULT_SYSTEM_PROMPT },

  // ── Custom Look and Feel ─────────────────────────────────────────────────
  "chat-customization-css": { systemPrompt: DEFAULT_SYSTEM_PROMPT },
  "chat-slots": { systemPrompt: DEFAULT_SYSTEM_PROMPT },
  "headless-simple": { systemPrompt: DEFAULT_SYSTEM_PROMPT },
  "headless-complete": { systemPrompt: DEFAULT_SYSTEM_PROMPT },
  "reasoning-default": {
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    note: "Reasoning cards only appear when the model emits thinking blocks.",
  },
  "reasoning-custom": {
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    note: "Same thinking dependency as reasoning-default.",
  },

  // ── Input Modalities ─────────────────────────────────────────────────────
  multimodal: { systemPrompt: DEFAULT_SYSTEM_PROMPT },
  // The Voice page names its agent `voice-demo`; kept as published.
  "voice-demo": { systemPrompt: DEFAULT_SYSTEM_PROMPT },

  // ── Generative UI ────────────────────────────────────────────────────────
  "gen-ui-tool-based": {
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    note: "Its tool is a frontend `useComponent`, which the adapter bridges itself.",
  },
  "tool-rendering": {
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    note: "Needs backend tools. No bridge is published, so it has none — README §9.",
  },
  "declarative-gen-ui": {
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    note: "Draws via the runtime-injected `generate_a2ui` frontend tool.",
  },
  "a2ui-fixed-schema": {
    systemPrompt: A2UI_FIXED_SYSTEM_PROMPT,
    note: "Prompt tells it to call `display_flight`, which cannot be registered — README §9.",
  },

  // ── App Control ──────────────────────────────────────────────────────────
  "frontend-tools": { systemPrompt: DEFAULT_SYSTEM_PROMPT },
  "hitl-in-chat": { systemPrompt: DEFAULT_SYSTEM_PROMPT },
  // Governed actions — one agent per pattern the page publishes. Both check
  // policy on this server; see `governed-actions.ts`.
  "governed-actions-interrupt": {
    systemPrompt: GOVERNED_INTERRUPT_SYSTEM_PROMPT,
    note: "useInterrupt: the policy tool raises an AG-UI interrupt and the decision returns as resume[].",
    backendTools: {
      schemas: INTERRUPT_TOOL_SCHEMAS,
      execute: executeInterruptTool,
    },
    onResume: resumeInterrupt,
  },
  "governed-actions-hitl": {
    systemPrompt: GOVERNED_HITL_SYSTEM_PROMPT,
    note: "useHumanInTheLoop: approve_governed_action is a frontend tool; execution re-checks the answer server-side.",
    backendTools: {
      schemas: HITL_TOOL_SCHEMAS,
      execute: executeHitlTool,
    },
  },

  // ── Shared State ─────────────────────────────────────────────────────────
  "shared-state-read-write": {
    systemPrompt: SHARED_STATE_READ_WRITE_BASE_SYSTEM,
    note: "Prompt names `set_notes`; the backend tool that answers it is commented out for now, so nothing registers it.",
    // Declaring backend tools here is what puts an agent on the per-request
    // path in `agent-server.ts` — the Quickstart's `runWithClaudeAgentSdk`,
    // with a tool server, a state box and a snapshot emitted per tool result.
    // Verified working (the agent calls `set_notes`, the notes reach the UI
    // mid-run), and parked for now. Uncomment this and the import above to
    // turn it back on; nothing else has to change.
    //
    // backendTools: {
    //   schemas: SHARED_STATE_TOOL_SCHEMAS,
    //   execute: executeSharedStateTool,
    // },
  },
  "shared-state-streaming": {
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    note: "Token-by-token streaming needs the unpublished Messages API loop — README §9.",
  },
  "readonly-state-agent-context": { systemPrompt: DEFAULT_SYSTEM_PROMPT },

  // ── Multi-Agent ──────────────────────────────────────────────────────────
  subagents: {
    systemPrompt: SUPERVISOR_SYSTEM_PROMPT,
    note: "Prompt names three sub-agents; the delegation run loop is never published — README §9.",
  },

  // ── Agent Config ─────────────────────────────────────────────────────────
  "agent-config": {
    systemPrompt: AGENT_CONFIG_DEFAULT_SYSTEM_PROMPT,
    note: "The UI's typed config arrives as `useAgentContext` entries the adapter appends.",
  },
};

export const AGENT_IDS = Object.keys(REGISTRY);
