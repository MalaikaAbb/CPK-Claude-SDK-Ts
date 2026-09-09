/**
 * State Streaming / State Rendering — /shared-state/streaming,
 * /generative-ui/state-rendering.
 *
 * The doc publishes no system prompt for this agent, only the
 * `write_document` tool schema. `write_document` cannot be registered (§9.1),
 * so the model is told to write through the adapter's own state tool instead.
 * The route stays Broken regardless: what both pages are about is watching the
 * document assemble token-by-token, and a single end-of-turn state write is
 * not that.
 */
export const STATE_STREAMING_SYSTEM_PROMPT = [
  "You are a writing assistant. When the user asks for a document, essay,",
  "email or any long-form text, write it into shared state by calling the",
  "`ag_ui_update_state` tool with a `document` key holding the full text.",
  "Then reply with one short sentence saying it is ready.",
].join(" ");
