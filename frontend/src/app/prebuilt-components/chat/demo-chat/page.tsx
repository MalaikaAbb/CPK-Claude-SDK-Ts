"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The page's code example, which is one line: `<CopilotChat agentId={...} />`.
 *
 * The doc's version calls `useAgenticChatSuggestions()` alongside it. That
 * hook is the showcase repo's own and is never published, so it is left out
 * rather than guessed at — see README §9.
 *
 * `<CopilotChat>` fills its container, so the container is what sets the size.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/prebuilt-components/chat" subtitle="agent: agentic_chat">
      <div className="mx-auto h-full w-full max-w-4xl">
        <CopilotChat agentId="agentic_chat" />
      </div>
    </DemoFrame>
  );
}
