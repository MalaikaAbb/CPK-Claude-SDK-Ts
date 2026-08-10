"use client";

import {
  useAgent,
  useCopilotKit,
  useRenderToolCall,
} from "@copilotkit/react-core/v2";
import { useMemo, useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The page's `headless-simple` cell: two hooks, your own design system, no
 * CopilotKit chrome at all.
 *
 * `send()` and the message `.map()` are the doc's snippets verbatim. What the
 * page does not publish is `createMessageId`, `UserBubble` or
 * `AssistantBubble` — they are referenced and never shown — so those are this
 * repo's, kept minimal. `createMessageId` is `crypto.randomUUID()`.
 *
 * The page is explicit about the trade-off: you get text and tool calls, and
 * nothing else. Reasoning cards, activity messages and before/after slots do
 * not appear unless you wire them yourself, which is what its `headless-complete`
 * cell covers — see /programmatic-control for that side.
 */

const createMessageId = () => crypto.randomUUID();

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-[var(--accent)] px-4 py-2.5 text-sm text-white">
        {content}
      </p>
    </div>
  );
}

function AssistantBubble({
  content,
  children,
}: {
  content?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-2">
      {content && (
        <p className="max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2.5 text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100">
          {content}
        </p>
      )}
      {children}
    </div>
  );
}

function Chat() {
  const { agent } = useAgent({ agentId: "headless-simple" });
  const { copilotkit } = useCopilotKit();
  const [input, setInput] = useState("");
  const renderToolCall = useRenderToolCall();

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || agent.isRunning) return;
    agent.addMessage({
      id: createMessageId(),
      role: "user",
      content: trimmed,
    });
    setInput("");
    void copilotkit.runAgent({ agent }).catch((err) => {
      // The Headless Simple demo is the canonical "two hooks, your
      // design system" example users copy-paste as a starting point.
      // Silently swallowing errors here would model broken practice;
      // log so a network failure / runtime error / transport disconnect
      // surfaces in the console for the developer.
      console.error(
        "[claude-sdk-typescript:headless-simple] runAgent failed",
        err,
      );
    });
  };

  const messages = agent.messages;

  // Tool results arrive as their own `tool`-role messages, keyed back to the
  // call by `toolCallId`. Index them so each card can see its result.
  type ToolMessage = Extract<(typeof messages)[number], { role: "tool" }>;
  const toolMessagesByCallId = useMemo(() => {
    const map = new Map<string, ToolMessage>();
    for (const m of messages) {
      if (m.role === "tool" && m.toolCallId) {
        map.set(m.toolCallId, m);
      }
    }
    return map;
  }, [messages]);

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
        {messages.length === 0 && (
          <p className="text-sm italic text-slate-500">
            No CopilotChat here — this list and the composer below are plain
            React over <code>useAgent</code> and <code>useCopilotKit</code>.
          </p>
        )}
        {messages.map((m) =>
          m.role === "user" ? (
            <UserBubble key={m.id} content={String(m.content ?? "")} />
          ) : m.role === "assistant" ? (
            <AssistantBubble
              key={m.id}
              content={typeof m.content === "string" ? m.content : undefined}
            >
              {("toolCalls" in m && Array.isArray(m.toolCalls)
                ? m.toolCalls
                : []
              ).map((tc) => {
                const node = renderToolCall({
                  toolCall: tc,
                  toolMessage: toolMessagesByCallId.get(tc.id),
                });
                return node ? <div key={tc.id}>{node}</div> : null;
              })}
            </AssistantBubble>
          ) : null,
        )}
        {agent.isRunning && (
          <p className="animate-pulse text-xs text-slate-500">Running…</p>
        )}
      </div>

      <form
        className="flex shrink-0 gap-2 border-t border-slate-200 p-4 dark:border-slate-800"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Your own composer…"
          className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        <button
          type="submit"
          disabled={agent.isRunning}
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default function Page() {
  return (
    <DemoFrame
      parentPath="/custom-look-and-feel/headless-ui"
      subtitle="agent: headless-simple"
    >
      <Chat />
    </DemoFrame>
  );
}
