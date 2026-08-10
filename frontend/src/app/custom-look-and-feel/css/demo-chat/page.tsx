"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

// The page's scoping pattern: import the stylesheet from the page module and
// let Next bundle it with the route.
import "./theme.css";

/**
 * All three of the page's styling layers on one surface:
 *
 *  1. the `--halcyon-*` palette and the v2 shadcn tokens, set on the wrapper
 *     so they cascade into every nested chat component;
 *  2. `.copilotKit*` class overrides for structure and fonts;
 *  3. the `labels` prop for user-facing copy.
 *
 * Everything is scoped under `.chat-css-demo-scope` so it cannot leak into the
 * rest of the harness — which is the point the page makes about scoping.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/custom-look-and-feel/css"
      subtitle="agent: chat-customization-css"
    >
      <div className="chat-css-demo-scope h-full">
        <div className="mx-auto h-full w-full max-w-4xl">
          <CopilotChat
            agentId="chat-customization-css"
            labels={{
              welcomeMessageText: "Hello! How can I help you today?",
              modalHeaderTitle: "My Copilot",
              chatInputPlaceholder: "Ask me anything!",
            }}
          />
        </div>
      </div>
    </DemoFrame>
  );
}
