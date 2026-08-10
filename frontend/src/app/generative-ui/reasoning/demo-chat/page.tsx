"use client";

import {
  CopilotChat,
  CopilotChatReasoningMessage,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { ReasoningBlock } from "../reasoning-block";

/**
 * The wholesale form: `messageView.reasoningMessage` given a component rather
 * than a sub-slot object, so `ReasoningBlock` *is* the card.
 *
 * The page notes the slot accepts either shape — a full component, or
 * `{ header, contentView, toggle }`. The sub-slot shape is what
 * /custom-look-and-feel/reasoning-messages demonstrates.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/generative-ui/reasoning"
      subtitle="agent: reasoning-custom"
    >
      <div className="mx-auto h-full w-full max-w-4xl">
        <CopilotChat
          agentId="reasoning-custom"
          messageView={{
            // The slot is typed as `typeof CopilotChatReasoningMessage`, which
            // carries static Header/Content/Toggle members a plain function
            // component does not have. The doc's own slots page uses exactly
            // this `as unknown as` cast for the same reason.
            reasoningMessage:
              ReasoningBlock as unknown as typeof CopilotChatReasoningMessage,
          }}
        />
      </div>
    </DemoFrame>
  );
}
