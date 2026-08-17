# State Streaming

> Stream partial agent state updates to the UI while a tool call is still running.


<!-- interactive demo: shared-state-streaming -->


## What is this?

By default, agent state only updates *between* backend checkpoints, so
a long-running tool call (writing a full document, drafting an email)
appears to the UI as one big burst at the end. For agent-native apps,
that feels broken: users expect to watch the output materialise.

**State streaming** forwards the value of a specific tool argument
straight into an agent state key *as the argument is being generated*.
The UI, subscribed via `useAgent`, re-renders every token.

## When should I use this?

Use state streaming whenever a tool's output is long-form text or a
growing structured value and you want the user to see it assemble in
real time. Common shapes:

- A collaborative writing agent that emits a document
- A research agent that accumulates a list of findings
- A planning agent that builds up a step-by-step plan

Without streaming, the user stares at a spinner. With streaming, they
see the answer grow token-by-token.

## The backend: one streaming state mapping

<Steps>
  <Step>
    ### Stream partial state updates while Claude responds

    For streaming state, parse the agent's structured deltas as they arrive and
    emit CopilotKit state updates before the final message is complete. This
    branch runs inside the streamed tool-argument handler.

    
~~~~typescript title="agent_server.ts"
                if (activeToolCallName === "write_document") {
                  const streamedDocument = partialJsonStringProperty(
                    activeToolArgs,
                    "document",
                  );
                  if (
                    streamedDocument !== null &&
                    streamedDocument !== lastStreamedDocument
                  ) {
                    state = { ...state, document: streamedDocument };
                    lastStreamedDocument = streamedDocument;
                    emit({ type: EventType.STATE_SNAPSHOT, snapshot: state });
                  }
                }
~~~~

  </Step>
</Steps>

The backend pattern is always the same: map one streaming tool argument
to one shared-state key. Middleware-backed frameworks usually expose
this as a declarative mapping — for example, LangGraph Python's
`StateStreamingMiddleware` with `StateItem(...)` entries, or
`copilotkitCustomizeConfig` with an `emitIntermediateState` mapping for
LangGraph TypeScript graphs. Direct SDK adapters do the same work in
their streaming loop by parsing partial tool arguments and emitting
`STATE_SNAPSHOT` whenever the mapped value changes. When the LLM streams
that argument, CopilotKit writes every partial value into shared state
before the tool even finishes executing.

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

A few things to note:

- The state key must exist in your agent state (`document` in this demo).
- The tool and argument names must match the exact LLM-facing tool call
  you want to forward (`write_document.document` here).
- When the tool call completes, its final return value is written to
  the same key, so the streamed partial eventually becomes the
  authoritative final value.

## The frontend: useAgent + OnStateChanged

The UI side is identical to any other shared-state subscription:
`useAgent` with `OnStateChanged` gives you a reactive `agent.state`.
Add `OnRunStatusChanged` if you want a "LIVE" / "done" indicator.

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

From there, `agent.state.document` is just a string that grows on every
token, and `agent.isRunning` tells you whether to show a streaming
indicator.

## Related

- **[Shared State (overview)](/claude-sdk-typescript/shared-state)** — the bidirectional
  read + write pattern this extends.
- **[Agent read-only context](/claude-sdk-typescript/shared-state/agent-readonly)** —
  for the inverse, UI → agent one-way channel.

<IntegrationGrid path="shared-state/streaming" exclude={["agno", "agent-spec", "spring-ai", "langroid"]} />
