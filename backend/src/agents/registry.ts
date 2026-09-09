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

import type { McpServerConfig } from "@anthropic-ai/claude-agent-sdk";

import { AGENT_CONFIG_DEFAULT_SYSTEM_PROMPT } from "./agent-config-prompt";
import { A2UI_FIXED_SYSTEM_PROMPT } from "./a2ui-fixed-prompt";
import {
  DISPLAY_FLIGHT_ALLOWED_TOOLS,
  FLIGHTS_MCP_SERVER_NAME,
  displayFlightMcpServer,
} from "./display-flight-mcp-server";
import {
  SET_NOTES_ALLOWED_TOOLS,
  NOTES_MCP_SERVER_NAME,
  applySetNotesResult,
  setNotesMcpServer,
} from "./set-notes-mcp-server";
import { SHARED_STATE_READ_WRITE_BASE_SYSTEM } from "./shared-state-read-write-prompt";
import { STATE_STREAMING_SYSTEM_PROMPT } from "./state-streaming-prompt";
import { SUPERVISOR_SYSTEM_PROMPT } from "./subagents-prompts";
import {
  WEATHER_ALLOWED_TOOLS,
  WEATHER_MCP_SERVER_NAME,
  weatherMcpServer,
} from "./weather-mcp-server";

/** The Quickstart's prompt, verbatim. */
export const DEFAULT_SYSTEM_PROMPT =
  "You are a helpful assistant embedded in a CopilotKit app.";

export interface AgentDefinition {
  systemPrompt: string;
  /** Why this agent exists — surfaced on /backend/copilot-runtime. */
  note?: string;
  /** Backend tools, as in-process MCP servers passed straight to the SDK. */
  mcpServers?: Record<string, McpServerConfig>;
  /** `mcp__<server>__<tool>` names the agent may call without asking. */
  allowedTools?: string[];
  /**
   * State write-back for backend tools. Called by the server on every
   * `TOOL_CALL_RESULT` with the bare tool name, the result text, and the
   * run's current state. Return the next state to emit a `STATE_SNAPSHOT`,
   * or `null` to leave state alone.
   */
  stateFromToolResult?: (
    toolName: string,
    resultContent: string,
    state: Record<string, unknown>,
  ) => Record<string, unknown> | null;
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
    note: "`get_weather` is registered through a repo-authored MCP bridge, not doc code — README §9.1.",
    mcpServers: { [WEATHER_MCP_SERVER_NAME]: weatherMcpServer },
    allowedTools: WEATHER_ALLOWED_TOOLS,
  },
  "declarative-gen-ui": {
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    note: "Draws via the runtime-injected `generate_a2ui` frontend tool.",
  },
  "a2ui-fixed-schema": {
    systemPrompt: A2UI_FIXED_SYSTEM_PROMPT,
    note: "`display_flight` is registered through a repo-authored MCP bridge, not doc code — README §9.1.",
    mcpServers: { [FLIGHTS_MCP_SERVER_NAME]: displayFlightMcpServer },
    allowedTools: DISPLAY_FLIGHT_ALLOWED_TOOLS,
  },

  // ── App Control ──────────────────────────────────────────────────────────
  "frontend-tools": { systemPrompt: DEFAULT_SYSTEM_PROMPT },
  "hitl-in-chat": { systemPrompt: DEFAULT_SYSTEM_PROMPT },

  // ── Shared State ─────────────────────────────────────────────────────────
  "shared-state-read-write": {
    systemPrompt: SHARED_STATE_READ_WRITE_BASE_SYSTEM,
    note: "`set_notes` is registered through a repo-authored MCP bridge; its result is written back to state by the server — README §9.1.",
    mcpServers: { [NOTES_MCP_SERVER_NAME]: setNotesMcpServer },
    allowedTools: SET_NOTES_ALLOWED_TOOLS,
    stateFromToolResult: applySetNotesResult,
  },
  "shared-state-streaming": {
    systemPrompt: STATE_STREAMING_SYSTEM_PROMPT,
    note: "`write_document` cannot be registered, so the prompt routes the document through the adapter's built-in `ag_ui_update_state` — one write at the end of the turn. Token-by-token streaming still needs the unpublished Messages API loop — README §9.15.",
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
