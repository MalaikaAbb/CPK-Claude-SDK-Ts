# Shared State

> Create a two-way connection between your UI and agent state.
## What is shared state?

Agentic Copilots maintain a shared state that seamlessly connects your UI with the agent's execution. This shared state system allows you to:

- Display the agent's current progress and intermediate results
- Update the agent's state through UI interactions
- React to state changes in real-time across your application

<ImageZoom
  src="https://cdn.copilotkit.ai/docs/copilotkit/images/coagents/SharedStateCoAgents.gif"
  alt="Shared State Demo"
  width={1000}
  height={1000}
  className="rounded-lg shadow-lg border mt-0"
/>

## When should I use this?

Use shared state when you want the agent and the user to collaborate through the
same application state. The agent's outputs are reflected in the UI, and user
updates in the UI are reflected in the agent's execution.

<OpsPlatformCTA
  variant="inline"
  title="Building stateful agents?"
  body="Persistent threads ship with the Enterprise Intelligence Platform on the free Developer tier."
  surface="docs_shared_state"
/>

## Reading agent state

<Steps>
  <Step>
    ### Put shared state in the system prompt and tools

    The demo exposes frontend preferences to Claude and gives the agent a tool
    for writing notes back into CopilotKit state. Keep the state contract small,
    typed, and mirrored by the UI components that read the same values.

    
~~~~typescript title="shared-state-read-write-prompt.ts"
export interface Preferences {
  name?: string;
  tone?: "formal" | "casual" | "playful";
  language?: string;
  interests?: string[];
}

export const SHARED_STATE_READ_WRITE_BASE_SYSTEM =
  "You are a helpful, concise assistant. " +
  "The user's preferences are supplied via shared state and will be " +
  "added to the system prompt at the start of every turn. Always " +
  "respect them. " +
  "When the user asks you to remember something, or when you observe " +
  "something worth surfacing in the UI, call `set_notes` with the " +
  "FULL updated list of short note strings (existing notes + new). " +
  "Each note should be under 120 characters.";

export const SET_NOTES_TOOL_SCHEMA = {
  name: "set_notes" as const,
  description:
    "Replace the notes array in shared state with the full updated list. " +
    "Use whenever the user asks you to 'remember' something, or when you " +
    "have an observation worth surfacing in the UI's notes panel. " +
    "Always pass the FULL notes list (existing + new), not a diff. " +
    "Keep each note short (< 120 chars).",
  input_schema: {
    type: "object" as const,
    properties: {
      notes: {
        type: "array",
        items: { type: "string" },
        description:
          "The complete updated notes array. Replaces the current notes.",
      },
    },
    required: ["notes"],
  },
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

/**
 * Coerce an arbitrary `unknown` (e.g. `input.state.preferences`) into a
 * sanitized `Preferences` object. We accept partial shapes — any field
 * may be missing — and silently drop fields that don't match the
 * expected types so a misbehaving frontend can't poison the prompt.
 */
export function coercePreferences(value: unknown): Preferences {
  if (!value || typeof value !== "object") return {};
  const v = value as Record<string, unknown>;
  const out: Preferences = {};
  if (typeof v.name === "string") out.name = v.name;
  if (v.tone === "formal" || v.tone === "casual" || v.tone === "playful") {
    out.tone = v.tone;
  }
  if (typeof v.language === "string") out.language = v.language;
  if (isStringArray(v.interests)) out.interests = v.interests;
  return out;
}

export function buildPreferencesPreamble(prefs: Preferences): string | null {
  const lines: string[] = [];
  if (prefs.name) lines.push(`- Name: ${prefs.name}`);
  if (prefs.tone) lines.push(`- Preferred tone: ${prefs.tone}`);
  if (prefs.language) lines.push(`- Preferred language: ${prefs.language}`);
  if (prefs.interests && prefs.interests.length > 0) {
    lines.push(`- Interests: ${prefs.interests.join(", ")}`);
  }
  if (lines.length === 0) return null;
  return [
    "The user has shared these preferences with you:",
    ...lines,
    "Tailor every response to these preferences. Address the user by name " +
      "when appropriate.",
  ].join("\n");
}

export function buildSharedStateReadWriteSystemPrompt(
  prefs: Preferences,
): string {
  const preamble = buildPreferencesPreamble(prefs);
  if (!preamble) return SHARED_STATE_READ_WRITE_BASE_SYSTEM;
  return `${SHARED_STATE_READ_WRITE_BASE_SYSTEM}\n\n${preamble}`;
}
~~~~

  </Step>
</Steps>

Subscribe a component to the agent's state with `useAgent`. Any time the agent
mutates its state, for example via a tool call, the hook fires and your UI
re-renders with the new values.

```typescript
// src/app/demos/shared-state-read-write/page.tsx
  // Subscribe the component to agent state changes. Any time the agent
  // mutates its state (e.g. via its `set_notes` tool) this hook fires,
  // we re-render, and the sidebar panels reflect the new values.
  const { agent } = useAgent({
    agentId: "shared-state-read-write",
    updates: [UseAgentUpdate.OnStateChanged],
  });
```

The returned `agent.state` is just a plain object. Read it like any other
piece of React state and render the parts you care about: agent-written
notes, structured outputs, progress indicators, anything the agent has put
there.

## Writing agent state

The same `agent` object exposes a `setState` setter. Calling it from a UI
event handler pushes the new value into shared state, and the agent reads it
back on its next turn. The UI's writes visibly steer the model.

```typescript
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
```

This is what makes the channel two-way: the UI doesn't just observe the
agent, it can hand the agent fresh inputs (preferences, selections, partial
work) without going through the chat thread.

## Rendering shared state in the UI

Because `agent.state` is plain React data, the UI layer is whatever you'd
normally build. The demo on this page wires the agent's outputs into a
small card component and feeds user edits back through `setState`.

```typescript
// src/app/demos/shared-state-read-write/notes-card.tsx
// Read-side render: this card reflects the agent-authored `notes` slice
// of shared state. The parent page passes `state.notes` in; we never
// touch agent state ourselves — we just render it. The Clear button is
// a small write-back, exposed as an `onClear` prop.
export function NotesCard({ notes, onClear }: NotesCardProps) {
  return (
    <Card data-testid="notes-card" className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <CardTitle>Agent Scratch pad</CardTitle>
            <CardDescription>
              The agent writes here via its{" "}
              <code className="font-mono text-[11px] text-[#010507]">
                set_notes
              </code>{" "}
              tool. The UI re-renders from shared state.
            </CardDescription>
          </div>
          {notes.length > 0 && (
            <Button
              type="button"
              onClick={onClear}
              data-testid="notes-clear-button"
              variant="destructive"
              size="sm"
              className="uppercase tracking-[0.14em] text-[10px]"
            >
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {notes.length === 0 ? (
          <div
            data-testid="notes-empty"
            className="text-sm text-[#838389] italic min-h-[160px] flex items-center justify-center text-center px-4 border border-dashed border-[#E9E9EF] rounded-xl bg-[#FAFAFC]"
          >
            the agent will make observations about you and note them here!
          </div>
        ) : (
          <ul
            data-testid="notes-list"
            className="space-y-2 text-sm text-[#010507]"
          >
            {notes.map((note, i) => (
              <li
                key={i}
                data-testid="note-item"
                className="flex gap-2 rounded-lg border border-[#E9E9EF] bg-[#FAFAFC] px-3 py-2"
              >
                <span className="text-[#838389] font-mono text-xs leading-5 select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">{note}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
```

Nothing about this is chat-specific: `useAgent` works in any component under
`<CopilotKit>`, so you can render `agent.state` in your main view or canvas,
not just inside the chat panel. See
**[Render agent state in your app](/claude-sdk-typescript/shared-state/rendering-in-app)** for the
full main-view pattern.

## Streaming partial state updates

By default, agent state only updates *between* backend checkpoints, so a
long-running tool call appears as one big burst at the end. State streaming
forwards a specific tool argument straight into a state key *as it's being
generated*, so the UI can watch the answer assemble token-by-token.

```typescript
// src/app/demos/shared-state-streaming/state-streaming-backend.snippet.ts
import { EventType } from "@ag-ui/core";
import type Anthropic from "@anthropic-ai/sdk";

type StreamingState = {
  document?: string;
};

type ToolDeltaEvent = {
  type: string;
  content_block?: { type: string; name?: string };
  delta?: { type: string; partial_json?: string };
};

export const WRITE_DOCUMENT_TOOL_SCHEMA: Anthropic.Tool = {
  name: "write_document",
  description: "Write a document into shared agent state.",
  input_schema: {
    type: "object",
    properties: {
      document: {
        type: "string",
        description: "The full document text to render in shared state.",
      },
    },
    required: ["document"],
  },
};

function partialJsonStringProperty(source: string, key: string): string | null {
  // Hand-rolled partial-JSON string extraction with no external dependency
  // (mirrors the Python sibling snippet). Reads the current value of a string
  // property from a partial buffer, tolerating truncation mid-value.
  const marker = JSON.stringify(key);
  const keyPos = source.indexOf(marker);
  if (keyPos < 0) return null;
  const colonPos = source.indexOf(":", keyPos + marker.length);
  if (colonPos < 0) return null;
  const valueStart = source.indexOf('"', colonPos + 1);
  if (valueStart < 0) return null;

  const rawChars: string[] = [];
  let escaped = false;
  for (const char of source.slice(valueStart + 1)) {
    if (escaped) {
      rawChars.push("\\" + char);
      escaped = false;
    } else if (char === "\\") {
      escaped = true;
    } else if (char === '"') {
      break;
    } else {
      rawChars.push(char);
    }
  }
  // A buffer truncated mid-escape drops the dangling backslash (matching the
  // Python sibling) so the partial value still parses instead of forcing null.

  try {
    return JSON.parse(`"${rawChars.join("")}"`) as string;
  } catch {
    return null;
  }
}

export function emitStreamingDocumentState(
  event: ToolDeltaEvent,
  tracker: { toolName: string | null; argsJson: string; lastDocument: string },
  state: StreamingState,
  emit: (event: object) => void,
) {
  if (
    event.type === "content_block_start" &&
    event.content_block?.type === "tool_use"
  ) {
    tracker.toolName = event.content_block.name ?? null;
    tracker.argsJson = "";
    return;
  }

  if (
    event.type !== "content_block_delta" ||
    event.delta?.type !== "input_json_delta"
  ) {
    return;
  }

  tracker.argsJson += event.delta.partial_json ?? "";
  if (tracker.toolName !== "write_document") {
    return;
  }

  const streamedDocument = partialJsonStringProperty(
    tracker.argsJson,
    "document",
  );
  if (streamedDocument === null || streamedDocument === tracker.lastDocument) {
    return;
  }

  // Mutate `state` in place but emit a fresh copy each delta, so a consumer
  // that retains a snapshot doesn't see earlier snapshots mutate to the final
  // text as streaming continues. (Mirrors the Python sibling snippet.)
  const snapshot: StreamingState = { ...state, document: streamedDocument };
  state.document = streamedDocument;
  tracker.lastDocument = streamedDocument;
  emit({ type: EventType.STATE_SNAPSHOT, snapshot });
}
```

See **[State streaming](/claude-sdk-typescript/shared-state/streaming)** for the full walkthrough,
including the corresponding `useAgent` subscription on the frontend.

## Read-only context

When the value is **UI-owned** and the agent should read it but never write
it back, such as current user, selected record, or scroll position, reach for
`useAgentContext` instead of full shared state. It publishes values as a
one-way UI-to-agent channel that auto-unregisters on unmount.

See **[Agent read-only context](/claude-sdk-typescript/shared-state/agent-readonly)** for the
full pattern.

<IntegrationGrid path="shared-state" exclude={["agno", "agent-spec", "spring-ai", "langroid"]} />
