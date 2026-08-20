"use client";

import {
  CopilotSidebar,
  useAgent,
  useFrontendTool,
  UseAgentUpdate,
} from "@copilotkit/react-core/v2";
import { useEffect, useRef } from "react";
import { z } from "zod";

import { DemoFrame } from "@/components/demo-frame";

import { NotesCard } from "../notes-card";

/**
 * The two-way channel, running.
 * https://docs.copilotkit.ai/claude-sdk-typescript/shared-state
 *
 * The page publishes two frontend snippets for `page.tsx` — the `useAgent`
 * subscription (READ) and `handlePreferencesChange` (WRITE). Both are below
 * verbatim, in `#region doc-snippet-*` blocks. Everything outside those blocks
 * is this repo's, because the page publishes no shell: no imports, no
 * `Preferences` type on the frontend (it lives only in the page's *backend*
 * snippet), no `RWAgentState`, no `latestNotesRef`, no JSX, no export.
 *
 * The supplied half is deliberately thin — a preferences form, a ref that
 * tracks the agent's notes so the WRITE snippet has something to preserve, and
 * the doc's own `NotesCard` for the read side.
 *
 * ── One substitution, and it is visible ──────────────────────────────────
 * The doc has the agent write notes with a *backend* `set_notes` tool, and
 * publishes `SET_NOTES_TOOL_SCHEMA` for it. Registering a backend tool needs
 * `buildBackendToolServer`, which the Quickstart calls and no page in these
 * docs defines (README §9.1), so that route to the tool is still closed.
 *
 * Here `set_notes` is registered as a *frontend* tool instead, with the doc's
 * name, description and parameter shape. The agent calls the same tool by the
 * same name; the difference is where the handler runs — in the browser, where
 * it writes the notes back through `agent.setState` — rather than on the agent
 * server. `ClaudeAgentAdapter` bridges frontend tools itself (it turns
 * `input.tools` into an in-process `ag_ui` MCP server), so this needs no
 * backend change at all. See `/shared-state` for the trade-off.
 */

/** The page's backend snippet publishes this type; the frontend needs it too. */
interface Preferences {
  name?: string;
  tone?: "formal" | "casual" | "playful";
  language?: string;
  interests?: string[];
}

/** The shape both sides agree on. Named by the doc's handler, never defined. */
interface RWAgentState {
  preferences: Preferences;
  notes: string[];
}

const DEFAULT_PREFERENCES: Preferences = {
  name: "Atai",
  tone: "casual",
  language: "English",
  interests: ["TypeScript"],
};

const TONES: NonNullable<Preferences["tone"]>[] = [
  "formal",
  "casual",
  "playful",
];

const INTERESTS = [
  "TypeScript",
  "Distributed systems",
  "Espresso",
  "Trail running",
];

function Demo() {
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

  const state = (agent.state ?? {}) as Partial<RWAgentState>;
  const preferences = state.preferences ?? DEFAULT_PREFERENCES;
  const notes = state.notes ?? [];

  // The WRITE snippet reads `latestNotesRef.current` and never sets it. A ref
  // rather than the render-time `notes`, because `set_notes` can land between
  // a keystroke and its handler running — the ref always holds what the agent
  // last wrote, so a preferences edit cannot roll the notes back.
  const latestNotesRef = useRef<string[]>(notes);
  useEffect(() => {
    latestNotesRef.current = state.notes ?? [];
  }, [state.notes]);

  useEffect(() => {
    const sub = agent.subscribe({
      onStateChanged: ({ state }) => {
        console.log(
          "[dbg onStateChanged] notified=",
          JSON.stringify(state),
          "live=",
          JSON.stringify(agent.state),
        );
      },
      onRunInitialized: () => console.log("[dbg run] initialized"),
      onRunFinalized: () =>
        console.log("[dbg run] finalized live=", JSON.stringify(agent.state)),
    });
    return () => sub.unsubscribe();
  }, [agent]);

  // Seed the channel so the agent has preferences to respect on turn one.
  // `ClaudeAgentAdapter` only offers its state tooling — and only prints the
  // "Current Shared State" block — when the run carries state at all.
  useEffect(() => {
    const current = (agent.state ?? {}) as Partial<RWAgentState>;
    if (!current.preferences) {
      agent.setState({
        preferences: DEFAULT_PREFERENCES,
        notes: current.notes ?? [],
      } as RWAgentState);
    }
  }, [agent]);

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

  // #region set-notes — the doc's tool, registered on the client
  // Name, description and parameter shape are `SET_NOTES_TOOL_SCHEMA` from the
  // page's backend snippet, translated from JSON Schema to Zod. The handler is
  // ours: it is the write-back the backend tool would have done server-side.
  useFrontendTool({
    name: "set_notes",
    description:
      "Replace the notes array in shared state with the full updated list. " +
      "Use whenever the user asks you to 'remember' something, or when you " +
      "have an observation worth surfacing in the UI's notes panel. " +
      "Always pass the FULL notes list (existing + new), not a diff. " +
      "Keep each note short (< 120 chars).",
    parameters: z.object({
      notes: z
        .array(z.string())
        .describe(
          "The complete updated notes array. Replaces the current notes.",
        ),
    }),
    handler: async ({ notes: next }) => {
      console.log("[dbg set_notes] called", next);
      const current = (agent.state ?? {}) as Partial<RWAgentState>;
      agent.setState({
        preferences: current.preferences ?? DEFAULT_PREFERENCES,
        notes: next,
      } as RWAgentState);
      latestNotesRef.current = next;
      console.log("[dbg set_notes] after setState", JSON.stringify(agent.state));
      setTimeout(
        () => console.log("[dbg set_notes] +2s", JSON.stringify(agent.state)),
        2000,
      );
      return { status: "success", count: next.length };
    },
  });
  // #endregion set-notes

  // A second write-back, from the doc's `NotesCard` Clear button. Same channel
  // as the preferences form, opposite direction to `set_notes`: the UI wiping
  // a slice the agent owns.
  const handleClearNotes = () => {
    latestNotesRef.current = [];
    agent.setState({ preferences, notes: [] } as RWAgentState);
  };

  const toggleInterest = (interest: string) => {
    const current = preferences.interests ?? [];
    handlePreferencesChange({
      ...preferences,
      interests: current.includes(interest)
        ? current.filter((i) => i !== interest)
        : [...current, interest],
    });
  };

  return (
    <main className="h-full overflow-y-auto p-10">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        One object, both sides
      </h1>
      <p className="mt-3 max-w-prose text-sm text-slate-600 dark:text-slate-400">
        Edit anything on the left and the agent respects it on its next turn.
        Ask it to remember something and it calls <code>set_notes</code>, which
        fills the card on the right — no page code polls, the{" "}
        <code>useAgent</code> subscription re-renders it.
      </p>

      <div className="mt-8 grid max-w-4xl gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Preferences
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            UI-owned. Every edit goes through <code>agent.setState</code>.
          </p>

          <div className="mt-4 grid gap-4">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Name
              </span>
              <input
                data-testid="preferences-name"
                value={preferences.name ?? ""}
                onChange={(e) =>
                  handlePreferencesChange({
                    ...preferences,
                    name: e.target.value,
                  })
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Tone
              </span>
              <select
                data-testid="preferences-tone"
                value={preferences.tone ?? "casual"}
                onChange={(e) =>
                  handlePreferencesChange({
                    ...preferences,
                    tone: e.target.value as Preferences["tone"],
                  })
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                {TONES.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Language
              </span>
              <input
                data-testid="preferences-language"
                value={preferences.language ?? ""}
                onChange={(e) =>
                  handlePreferencesChange({
                    ...preferences,
                    language: e.target.value,
                  })
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
            </label>

            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Interests
              </span>
              <ul className="mt-2 space-y-1">
                {INTERESTS.map((interest) => (
                  <li key={interest}>
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={(preferences.interests ?? []).includes(
                          interest,
                        )}
                        onChange={() => toggleInterest(interest)}
                        className="h-4 w-4"
                      />
                      <span className="text-slate-700 dark:text-slate-300">
                        {interest}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <NotesCard notes={notes} onClear={handleClearNotes} />
      </div>

      <details className="mt-8 max-w-4xl text-xs text-slate-500">
        <summary className="cursor-pointer">Raw agent state</summary>
        <pre className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] dark:border-slate-800 dark:bg-slate-950">
          {JSON.stringify(agent.state ?? {}, null, 2)}
        </pre>
      </details>
    </main>
  );
}

export default function Page() {
  return (
    <DemoFrame
      parentPath="/shared-state"
      subtitle="agent: shared-state-read-write"
    >
      <Demo />
      <CopilotSidebar
        agentId="shared-state-read-write"
        defaultOpen
        labels={{
          chatInputPlaceholder: "Ask it to remember something...",
        }}
      />
    </DemoFrame>
  );
}
