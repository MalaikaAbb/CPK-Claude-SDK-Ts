"use client";

import {
  CopilotChatConfigurationProvider,
  CopilotSidebar,
  useCopilotChatConfiguration,
} from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

/**
 * Both halves of the Open, close, and feedback page on one surface.
 *
 * `OpenChatButton` is the doc's snippet verbatim, plus the toggle variant it
 * shows immediately after.
 *
 * On where it can live: `setModalOpen` only exists when a provider in the tree
 * owns modal state. `<CopilotSidebar>` creates one — but *internally*, wrapping
 * only itself, so a sibling button sees nothing. The page's own callout gives
 * the fix: "If you compose chat yourself, wrap the relevant subtree in
 * `<CopilotChatConfigurationProvider isModalDefaultOpen={false}>` so the modal
 * state exists." That is what the outer provider here is for. The sidebar's
 * inner provider syncs to it in both directions — its `setModalOpen` calls the
 * parent's, and an effect mirrors the parent's `isModalOpen` back down — so
 * the button and the sidebar's own toggle stay in agreement.
 *
 * The feedback half is the `messageView.assistantMessage` slot with
 * `onThumbsUp` / `onThumbsDown`. The buttons only render when a handler is
 * supplied, so passing them is the opt-in. The doc's handlers call
 * `analytics.track(...)`; there is no analytics package here, so they append
 * to a list on screen instead — the point is that each handler receives the
 * assistant `message` and can key on `message.id`.
 */

// The doc's snippet, unchanged apart from styling.
function OpenChatButton() {
  const config = useCopilotChatConfiguration();

  // setModalOpen is only present when a provider in the tree owns modal state
  // (the prebuilt CopilotPopup / CopilotSidebar create it for you).
  if (!config?.setModalOpen) return null;

  return (
    <button
      onClick={() => config.setModalOpen(!config.isModalOpen)}
      className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white"
    >
      {config.isModalOpen ? "Close chat" : "Open chat"}
    </button>
  );
}

export default function Page() {
  const [feedback, setFeedback] = useState<string[]>([]);

  return (
    <DemoFrame
      parentPath="/prebuilt-components/chat-controls"
      subtitle="agent: chat-controls"
    >
      <CopilotChatConfigurationProvider
        agentId="chat-controls"
        isModalDefaultOpen={true}
      >
        <main className="h-full overflow-y-auto p-10">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Chat controls
          </h1>
          <p className="mt-3 max-w-prose text-sm text-slate-600 dark:text-slate-400">
            The button below is the doc&apos;s <code>OpenChatButton</code>. It
            reads <code>isModalOpen</code> from the chat configuration context
            and flips it — no ref, no imperative handle.
          </p>

          <div className="mt-5">
            <OpenChatButton />
          </div>

          <h2 className="mt-10 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Feedback captured
          </h2>
          <p className="mt-1 max-w-prose text-sm text-slate-600 dark:text-slate-400">
            Send a message, then use the thumbs controls on the assistant&apos;s
            reply. They only exist because handlers were passed to the
            assistant-message slot.
          </p>
          {feedback.length === 0 ? (
            <p className="mt-3 text-sm italic text-slate-500">Nothing yet.</p>
          ) : (
            <ul className="mt-3 space-y-1">
              {feedback.map((f, i) => (
                <li
                  key={i}
                  className="font-mono text-xs text-slate-700 dark:text-slate-300"
                >
                  {f}
                </li>
              ))}
            </ul>
          )}
        </main>

        <CopilotSidebar
          agentId="chat-controls"
          messageView={{
            assistantMessage: {
              onThumbsUp: (message: { id: string }) =>
                setFeedback((f) => [...f, `up · ${message.id}`]),
              onThumbsDown: (message: { id: string }) =>
                setFeedback((f) => [...f, `down · ${message.id}`]),
            },
          }}
        />
      </CopilotChatConfigurationProvider>
    </DemoFrame>
  );
}
