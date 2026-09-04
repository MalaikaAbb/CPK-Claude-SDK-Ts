"use client";

import {
  CopilotChat,
  UseAgentUpdate,
  useAgent,
} from "@copilotkit/react-core/v2";
import { useEffect, useRef } from "react";

import { DemoFrame } from "@/components/demo-frame";

import { NotesCard } from "../notes-card";
import { PreferencesPanel, type Preferences } from "../preferences-panel";

/**
 * The two-way channel: the agent writes `notes` through its `set_notes` tool
 * and the UI writes `preferences` through `agent.setState`.
 *
 * https://docs.copilotkit.ai/claude-sdk-typescript/shared-state
 *
 * The page publishes the `useAgent` subscription and the
 * `handlePreferencesChange` handler (both reproduced unchanged below) and the
 * `NotesCard` body. Everything around them is this repo's: the imports, the
 * `RWAgentState` type, `latestNotesRef` and the effect that keeps it current,
 * `handleClearNotes`, the `PreferencesPanel` form, and the layout.
 *
 * Backend: `set_notes` is registered through a repo-authored MCP bridge and
 * its result is written back to state by the server. See README §9.1.
 */

interface RWAgentState {
  preferences?: Preferences;
  notes?: string[];
}

function Demo() {
  // Subscribe the component to agent state changes. Any time the agent
  // mutates its state (e.g. via its `set_notes` tool) this hook fires,
  // we re-render, and the sidebar panels reflect the new values.
  const { agent } = useAgent({
    agentId: "shared-state-read-write",
    updates: [UseAgentUpdate.OnStateChanged],
  });

  const state = (agent.state ?? {}) as RWAgentState;
  const notes = state.notes ?? [];
  const preferences = state.preferences ?? {};

  // The handler below preserves whatever the agent has written, so it needs
  // the latest notes without closing over a stale render.
  const latestNotesRef = useRef<string[]>(notes);
  useEffect(() => {
    latestNotesRef.current = notes;
  }, [notes]);

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

  const handleClearNotes = () => {
    agent.setState({ preferences, notes: [] } as RWAgentState);
  };

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[22rem_1fr]">
      <div className="flex min-h-0 flex-col gap-4 overflow-y-auto border-r border-slate-200 p-4 dark:border-slate-800">
        <PreferencesPanel value={preferences} onChange={handlePreferencesChange} />
        <NotesCard notes={notes} onClear={handleClearNotes} />
      </div>
      <div className="min-h-0">
        <CopilotChat agentId="shared-state-read-write" className="h-full" />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <DemoFrame parentPath="/shared-state">
      <Demo />
    </DemoFrame>
  );
}
