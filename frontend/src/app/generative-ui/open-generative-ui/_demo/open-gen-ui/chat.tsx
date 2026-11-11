"use client";

/**
 * NOT from the doc page. The minimal demo's `page.tsx` imports `Chat` from
 * "./chat", which is not published. Borrowed from the aws-strands-ts harness
 * (`frontend/src/app/generative-ui/open-generative-ui/_demo/open-gen-ui/chat.tsx`):
 * a plain `<CopilotChat>` on the page's agent id, since the page says no extra
 * props are needed. (The advanced demo defines its own `Chat` inline.)
 */
import { CopilotChat } from "@copilotkit/react-core/v2";

export function Chat() {
  return <CopilotChat agentId="open-gen-ui" className="flex-1 rounded-2xl" />;
}
