"use client";

import {
  CopilotKit,
  CopilotChat,
  CopilotChatConfigurationProvider,
  CopilotThreadsDrawer,
} from "@copilotkit/react-core/v2";

import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";
import { nestedInspectorSetting } from "@/lib/inspector";

import { ControlledChat, NewConversationButton } from "./new-conversation";
import "./hide-new-thread.css";

/** The runtime id this demo binds to. Also shown in the demo header. */
/**
 * Wrapped in its own provider pointed at `/api/copilotkit-threads`.
 *
 * The app-wide provider talks to `/api/copilotkit`, which registers 24 agents
 * and runs in SSE mode. Intelligence must sit on a runtime advertising as few
 * agents as possible, because the client opens a realtime thread channel per
 * advertised agent — see the threads endpoint for the full story.
 */
const AGENT_ID = "agentic_chat";

/**
 * The doc's whole integration: a drawer and a chat inside one shared
 * `CopilotChatConfigurationProvider`.
 *
 * The shared configuration is the point. It holds the active thread, so
 * selecting a row connects the chat to that thread and replays its history, and
 * the "New Conversation" row resets the chat to a fresh welcome screen — with
 * no `threadId` state, no selection handler, and no props passed between the
 * two components.
 *
 * `CopilotKitProvider` is not repeated here; the app already mounts one at the
 * root. The doc nests them because its sample is a whole standalone page.
 *
 * One departure, and it is presentational only. The doc's wrapper is
 * `<div style={{ display: "flex", height: "100dvh" }}>` with the two components
 * as bare children. In a flex row `CopilotChat` has no flex basis of its own,
 * so it collapses to min-content — the chat renders one word per line beside a
 * full-width drawer. `flex: 1` plus `minWidth: 0` gives it the remaining space;
 * `minWidth` matters because a flex item's default `min-width: auto` refuses to
 * shrink below its content and would push the layout wider than the viewport.
 */
/**
 * Variants for the page's "Add your own New conversation button" section.
 * "Your button" is the page's `Page` body under this demo's provider, with
 * `agentId` passed as in the main demo; "Your button only" adds the page's
 * CSS that hides the drawer's own controls; "Controlled thread id" mounts the
 * page's `ControlledChat` as printed (no `agentId`).
 */
const VARIANTS = [
  { id: "drawer", label: "Drawer only" },
  { id: "button", label: "Your button" },
  { id: "button-only", label: "Your button only (CSS parts hidden)" },
  { id: "controlled", label: "Controlled thread id" },
] as const;

type VariantId = (typeof VARIANTS)[number]["id"];

export default function Page() {
  const [variant, setVariant] = useState<VariantId>("drawer");

  return (
    <DemoFrame
      parentPath="/prebuilt-components/copilot-threads-drawer"
      subtitle={`agent: ${AGENT_ID} · CopilotThreadsDrawer + CopilotChat`}
    >
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 flex-wrap gap-2 border-b border-slate-200 p-2 dark:border-slate-800">
          {VARIANTS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVariant(v.id)}
              className={`rounded-md border px-3 py-1 text-xs font-medium ${
                variant === v.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div
          key={variant}
          className={`min-h-0 flex-1 ${variant === "button-only" ? "hide-drawer-new-thread" : ""}`}
        >
          <CopilotKit
            runtimeUrl="/api/copilotkit-threads"
            agent={AGENT_ID}
            enableInspector={nestedInspectorSetting}
          >
            {variant === "drawer" && (
              <CopilotChatConfigurationProvider agentId={AGENT_ID}>
                <div style={{ display: "flex", height: "100%" }}>
                  <CopilotThreadsDrawer />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <CopilotChat />
                  </div>
                </div>
              </CopilotChatConfigurationProvider>
            )}
            {(variant === "button" || variant === "button-only") && (
              <CopilotChatConfigurationProvider agentId={AGENT_ID}>
                <div style={{ display: "flex", height: "100%" }}>
                  <CopilotThreadsDrawer />
                  <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                    <header>
                      <NewConversationButton />
                    </header>
                    <CopilotChat />
                  </main>
                </div>
              </CopilotChatConfigurationProvider>
            )}
            {variant === "controlled" && <ControlledChat />}
          </CopilotKit>
        </div>
      </div>
    </DemoFrame>
  );
}
