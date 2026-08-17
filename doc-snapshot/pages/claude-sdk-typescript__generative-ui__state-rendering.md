# State Rendering

> Render your agent's state with custom UI components in real-time.


<!-- interactive demo: shared-state-streaming -->


## What is this?

State rendering lets you build UI that reflects your agent's state in real-time. As your agent progresses through nodes and emits state updates, your frontend renders those changes, showing progress, drafts, or intermediate results.

<Callout type="info">
  **Free course:** See this pattern built end-to-end in [Build Interactive Agents with Generative UI](https://www.deeplearning.ai/short-courses/build-interactive-agents-with-generative-ui/) — a free DeepLearning.AI short course taught by CopilotKit's CEO covering the full Generative UI spectrum (Controlled, Declarative, and Open-Ended).
</Callout>

## When should I use this?

Use state rendering when you want to:

- Show real-time progress (e.g. "Researching... 2/5 complete")
- Display drafts that update as the agent works
- Build dashboards that reflect agent state
- Render structured output outside of the chat

## How it works in code

On the frontend, subscribe to the agent's state. Each time the backend
forwards a fresh value, your component re-renders with the latest partial
output.

```typescript
// src/app/demos/shared-state-streaming/page.tsx
  // Subscribe to BOTH state changes and run-status changes. The former
  // drives the per-token document rerender; the latter toggles the
  // "LIVE" badge when the agent starts / stops.
  const { agent } = useAgent({
    agentId: "shared-state-streaming",
    updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
  });
```

On the backend, a state-streaming mapping forwards a specific tool argument
straight into a state key *as it's being generated*. Some frameworks provide
that as middleware; direct SDK adapters can emit `STATE_SNAPSHOT` events from
their streaming loop. Either way, the UI can watch the answer assemble
token-by-token rather than appearing in one burst between checkpoints.

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

<IntegrationGrid
  path="generative-ui/state-rendering"
  exclude={["agno", "agent-spec"]}
/>
