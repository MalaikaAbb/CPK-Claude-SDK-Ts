/**
 * The agent ids this app can address.
 *
 * Mirrors the keys of `REGISTRY` in `backend/src/agents/registry.ts`, which is
 * also where each agent is mounted: id `tool-rendering` is served at
 * `${AGENT_URL}/tool-rendering`. Keeping the list here rather than fetching it
 * means the runtime route can be built synchronously at module load.
 *
 * If you add an agent to the backend registry, add its id here too — the
 * `/backend/copilot-runtime` route cross-checks the two lists at runtime
 * against `GET /agents` and reports any drift.
 */

export const AGENT_IDS = [
  "claude_agent",
  "agentic_chat",
  "prebuilt-sidebar",
  "prebuilt-popup",
  "chat-controls",
  "chat-customization-css",
  "chat-slots",
  "headless-simple",
  "headless-complete",
  "reasoning-default",
  "reasoning-custom",
  "multimodal",
  "voice-demo",
  "gen-ui-tool-based",
  "tool-rendering",
  "declarative-gen-ui",
  "a2ui-fixed-schema",
  "frontend-tools",
  "hitl-in-chat",
  "shared-state-read-write",
  "shared-state-streaming",
  "readonly-state-agent-context",
  "subagents",
  "agent-config",
] as const;

export type AgentId = (typeof AGENT_IDS)[number];

/** Where the TypeScript agent server is listening. */
export const AGENT_URL = process.env.AGENT_URL ?? "http://localhost:8000";

/** The one agent the A2UI fixed-schema route scopes its runtime middleware to. */
export const A2UI_FIXED_AGENT_ID = "a2ui-fixed-schema";
