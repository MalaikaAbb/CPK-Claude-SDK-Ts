"use client";

import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2";
import { useEffect, useRef, useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

const AGENT_ID = "agentic_chat";

type Captured = { seq: number; type: string; detail?: string };

/**
 * A raw capture of the AG-UI event stream flowing through the runtime, beside
 * the response those events actually assemble into.
 *
 * `agent.subscribe` takes every protocol callback, so the left pane is the
 * honest answer to "what is going over the wire" — the same events
 * <CopilotChat> consumes, printed instead of rendered. Text and reasoning
 * deltas are collapsed into counted rows, since one reply produces hundreds
 * and the interesting structure is the lifecycle around them.
 *
 * The right pane reads `agent.messages` — the state those events build up — so
 * you can see a protocol row and its visible effect at the same time. That is
 * the point of pairing them: if reasoning streams but never appears, or text
 * arrives but the transcript stays empty, the two panes disagree and tell you
 * which side is at fault.
 *
 * Reasoning events are included deliberately. Claude emits thinking blocks
 * without any extra configuration and the adapter translates them into the
 * full REASONING_* lifecycle, so a debug surface that omitted them would make
 * the reasoning routes look broken when they are not.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/backend/copilot-runtime"
      subtitle={`agent: ${AGENT_ID}`}
    >
      <Capture />
    </DemoFrame>
  );
}

function Capture() {
  const { agent } = useAgent({ agentId: AGENT_ID });
  const { copilotkit } = useCopilotKit();
  const [events, setEvents] = useState<Captured[]>([]);
  const [input, setInput] = useState("Think step by step: what is 17 * 24?");
  const seq = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const push = (type: string, detail?: string) =>
      setEvents((e) => [...e, { seq: seq.current++, type, detail }]);

    /** Collapse a burst of deltas into a single counted row. */
    const pushDelta = (type: string, chars: number) =>
      setEvents((e) => {
        const last = e[e.length - 1];
        if (last?.type === type) {
          const n = Number(last.detail?.match(/^\d+/)?.[0] ?? 0) + 1;
          return [...e.slice(0, -1), { ...last, detail: `${n} deltas` }];
        }
        return [
          ...e,
          { seq: seq.current++, type, detail: `1 delta (${chars} chars)` },
        ];
      });

    const sub = agent.subscribe({
      onRunStartedEvent: () => push("RUN_STARTED"),

      // Reasoning lifecycle — Claude emits thinking blocks by default.
      onReasoningStartEvent: () => push("REASONING_START"),
      onReasoningMessageStartEvent: () => push("REASONING_MESSAGE_START"),
      onReasoningMessageContentEvent: ({ event }) =>
        pushDelta("REASONING_MESSAGE_CONTENT", event.delta?.length ?? 0),
      onReasoningMessageEndEvent: () => push("REASONING_MESSAGE_END"),
      onReasoningEncryptedValueEvent: () => push("REASONING_ENCRYPTED_VALUE"),
      onReasoningEndEvent: () => push("REASONING_END"),

      onTextMessageStartEvent: () => push("TEXT_MESSAGE_START"),
      onTextMessageContentEvent: ({ event }) =>
        pushDelta("TEXT_MESSAGE_CONTENT", event.delta?.length ?? 0),
      onTextMessageEndEvent: () => push("TEXT_MESSAGE_END"),

      onToolCallStartEvent: ({ event }) =>
        push("TOOL_CALL_START", event.toolCallName),
      onToolCallEndEvent: () => push("TOOL_CALL_END"),
      onStateSnapshotEvent: () => push("STATE_SNAPSHOT"),
      onStateDeltaEvent: () => push("STATE_DELTA"),
      onCustomEvent: ({ event }) => push("CUSTOM", event.name),
      onRunFinishedEvent: () => push("RUN_FINISHED"),
      onRunFailed: () => push("RUN_FAILED"),
    });
    return () => sub.unsubscribe();
  }, [agent]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events.length]);

  const messages = agent.messages;
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim() || agent.isRunning) return;
    agent.addMessage({
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    });
    void copilotkit
      .runAgent({ agent })
      .catch((err) => console.error("[copilot-runtime] runAgent", err));
  };

  const clear = () => {
    setEvents([]);
    agent.setMessages([]);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 p-4 dark:border-slate-800">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        <button
          onClick={send}
          disabled={agent.isRunning}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Run
        </button>
        <button
          onClick={clear}
          className="text-xs text-slate-500 underline underline-offset-4"
        >
          Clear
        </button>
        {agent.isRunning && (
          <span className="animate-pulse text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
            running
          </span>
        )}
      </div>

      <div className="grid min-h-0 flex-1 grid-rows-2 lg:grid-cols-2 lg:grid-rows-1">
        {/* Left: the protocol */}
        <section className="flex min-h-0 flex-col border-b border-slate-200 lg:border-b-0 lg:border-r dark:border-slate-800">
          <h2 className="shrink-0 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
            AG-UI events · {events.length}
          </h2>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {events.length === 0 ? (
              <p className="py-16 text-center text-sm text-slate-400">
                Press Run and watch the protocol.
              </p>
            ) : (
              <ol className="space-y-0.5">
                {events.map((e) => (
                  <li
                    key={e.seq}
                    className="flex items-baseline gap-3 rounded px-2 py-1 font-mono text-xs odd:bg-slate-50 dark:odd:bg-slate-800/40"
                  >
                    <span className="w-8 shrink-0 text-right text-slate-400">
                      {e.seq}
                    </span>
                    <span
                      className={`font-semibold ${
                        e.type.startsWith("REASONING")
                          ? "text-violet-700 dark:text-violet-300"
                          : e.type.startsWith("RUN_FAIL")
                            ? "text-rose-700 dark:text-rose-300"
                            : "text-slate-900 dark:text-slate-100"
                      }`}
                    >
                      {e.type}
                    </span>
                    {e.detail && (
                      <span className="text-slate-500">{e.detail}</span>
                    )}
                  </li>
                ))}
              </ol>
            )}
            <div ref={bottomRef} />
          </div>
        </section>

        {/* Right: what those events assemble into */}
        <section className="flex min-h-0 flex-col">
          <h2 className="shrink-0 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
            Agent response · {messages.length} messages
          </h2>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <p className="py-16 text-center text-sm text-slate-400">
                The reply, and any reasoning, appears here.
              </p>
            ) : (
              messages.map((m) => {
                const text = typeof m.content === "string" ? m.content : "";

                if (m.role === "user") {
                  return (
                    <div key={m.id} className="flex justify-end">
                      <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-[var(--accent)] px-3.5 py-2 text-sm text-white">
                        {text}
                      </p>
                    </div>
                  );
                }

                if (m.role === "reasoning") {
                  if (!text) return null;
                  return (
                    <details
                      key={m.id}
                      open
                      className="rounded-xl border-2 border-violet-500 bg-violet-50 px-3 py-2 dark:border-violet-600 dark:bg-violet-950/50"
                    >
                      <summary className="cursor-pointer list-none text-[10px] font-bold uppercase tracking-wider text-violet-800 dark:text-violet-200">
                        reasoning
                      </summary>
                      <div className="mt-1.5 whitespace-pre-wrap text-xs italic text-violet-900 dark:text-violet-100">
                        {text}
                      </div>
                    </details>
                  );
                }

                if (m.role === "assistant") {
                  const toolCalls =
                    "toolCalls" in m && Array.isArray(m.toolCalls)
                      ? m.toolCalls
                      : [];
                  if (!text && toolCalls.length === 0) return null;
                  return (
                    <div key={m.id} className="space-y-2">
                      {text && (
                        <p className="max-w-[95%] whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-slate-100 px-3.5 py-2 text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100">
                          {text}
                        </p>
                      )}
                      {toolCalls.map((tc) => (
                        <p
                          key={tc.id}
                          className="w-fit rounded-lg border border-slate-300 px-2 py-1 font-mono text-[11px] text-slate-600 dark:border-slate-700 dark:text-slate-400"
                        >
                          → {tc.function?.name ?? "tool"}
                        </p>
                      ))}
                    </div>
                  );
                }

                if (m.role === "tool") {
                  return (
                    <p
                      key={m.id}
                      className="w-fit rounded-lg bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-500 dark:bg-slate-800/50"
                    >
                      ← tool result{text ? `: ${text.slice(0, 80)}` : " (empty)"}
                    </p>
                  );
                }

                return null;
              })
            )}
            <div ref={transcriptEndRef} />
          </div>
        </section>
      </div>
    </div>
  );
}
