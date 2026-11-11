"use client";

/**
 * NOT from the doc page. The page's `page.tsx` imports `Chat` from "./chat",
 * which it never publishes. Borrowed from the aws-strands-ts harness
 * (`frontend/src/app/generative-ui/mcp-apps/_demo/chat.tsx`): a plain
 * `<CopilotChat>` on the page's agent id, since the page says a plain chat is
 * all MCP Apps needs.
 */
import { CopilotChat } from "@copilotkit/react-core/v2";

export function Chat() {
  return <CopilotChat agentId="mcp-apps" className="h-full" />;
}
