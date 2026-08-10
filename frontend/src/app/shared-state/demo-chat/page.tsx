"use client";

/**
 * PARTIAL CODE — THIS FILE IS THE DOC'S PUBLISHED SNIPPETS AND NOTHING ELSE.
 * IT DOES NOT COMPILE OR RUN.
 *
 * https://docs.copilotkit.ai/claude-sdk-typescript/shared-state
 *
 * The Shared State page publishes exactly two frontend snippets for
 * `src/app/demos/shared-state-read-write/page.tsx` — the `useAgent`
 * subscription and the `handlePreferencesChange` handler — reproduced below
 * verbatim, in order.
 *
 * What the page never publishes, and what is therefore absent here:
 *
 *   - imports for `useAgent` and `UseAgentUpdate`
 *   - the `Preferences` type used by the handler's parameter (it exists only
 *     in the page's BACKEND snippet, `shared-state-read-write-prompt.ts`)
 *   - the `RWAgentState` type the handler casts to
 *   - `latestNotesRef`, which the handler reads
 *   - any component shell, JSX, layout, or default export — so there is no
 *     renderable surface for this route at all
 *
 * Previously this file carried a working demo built around those snippets: a
 * `Demo()` component, a `PreferencesPanel` form, a `handleClearNotes`
 * write-back, and a `latestNotesRef` synced in an effect. All of that was
 * this repo's invention, not the doc's, and it has been removed.
 *
 * ── The backend half is also unavailable ─────────────────────────────────
 * The page has the agent write notes by calling a backend `set_notes` tool and
 * publishes `SET_NOTES_TOOL_SCHEMA` for it. Registering a backend tool
 * requires `buildBackendToolServer`, which the Quickstart calls and which no
 * page in this framework's docs defines. So the tool cannot be registered.
 * No substitute is used here.
 */

// #region doc-snippet-1 — the READ side
// src/app/demos/shared-state-read-write/page.tsx
  // Subscribe the component to agent state changes. Any time the agent
  // mutates its state (e.g. via its `set_notes` tool) this hook fires,
  // we re-render, and the sidebar panels reflect the new values.
  const { agent } = useAgent({
    agentId: "shared-state-read-write",
    updates: [UseAgentUpdate.OnStateChanged],
  });
// #endregion doc-snippet-1

// #region doc-snippet-2 — the WRITE side
// src/app/demos/shared-state-read-write/page.tsx
  // WRITE: every edit in the sidebar goes straight into agent state.
  // On the agent's next turn, `PreferencesInjectorMiddleware` reads this
  // back out of state and adds it to the system prompt — so the UI's
  // writes visibly steer the model.
  const handlePreferencesChange = (next: Preferences) => {
    agent.setState({
      preferences: next,
      notes: latestNotesRef.current, // preserve what the agent has written
    } as RWAgentState);
  };
// #endregion doc-snippet-2
