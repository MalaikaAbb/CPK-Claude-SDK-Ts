"use client";

import {
  CopilotSidebar,
  useAgent,
  UseAgentUpdate,
} from "@copilotkit/react-core/v2";
import { useEffect, useRef } from "react";

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
 * ── Where `set_notes` lives ──────────────────────────────────────────────
 * On the agent server, as the doc describes: an in-process MCP tool built
 * from `SET_NOTES_TOOL_SCHEMA` and registered through `buildBackendToolServer`
 * — a function the Quickstart calls and no doc page defines, so this repo
 * writes it (`backend/src/agents/backend-tool-server.ts`).
 *
 * Nothing about the tool appears in this file, which is the point: the write
 * arrives as an AG-UI `STATE_SNAPSHOT` and the `useAgent` subscription above
 * re-renders the card. The frontend never learns that a tool ran.
 *
 * It is switched off at the moment. The `backendTools` entry for this agent in
 * `backend/src/agents/registry.ts` is commented out, so no `set_notes` is
 * registered anywhere and the scratch pad stays empty however the agent is
 * asked. The preferences half of the channel — this page writing through
 * `agent.setState`, the agent reading it back — works either way.
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

  // READ: the whole surface renders off agent state. `set_notes` runs on the
  // agent server, so a note reaches here as a state snapshot mid-run and the
  // subscription above turns that into a re-render.
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
