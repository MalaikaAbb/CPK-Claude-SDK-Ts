// NOT from the doc page. The "Grouping tool calls" snippets name `MyToolRow`
// and `ToolTimeline` and define neither, so these two are this repo's, kept
// to the smallest thing matching the props each call site fixes:
// `useDefaultRenderTool({ render })` hands `MyToolRow` the default render
// props, and the `toolCallsView.group` slot hands `ToolTimeline` the group's
// `calls` plus `renderCall` (the page's own comment says so).
import type { ComponentProps } from "react";
import {
  CopilotChatToolCallGroup,
  type useDefaultRenderTool,
} from "@copilotkit/react-core/v2";

type DefaultRenderProps = Parameters<
  NonNullable<NonNullable<Parameters<typeof useDefaultRenderTool>[0]>["render"]>
>[0];

export function MyToolRow({ name, status }: DefaultRenderProps) {
  return (
    <div className="flex items-center gap-2 py-1 font-mono text-xs">
      <span>{status === "complete" ? "✓" : "…"}</span>
      <span>{name}</span>
    </div>
  );
}

export function ToolTimeline({
  calls,
  renderCall,
}: ComponentProps<typeof CopilotChatToolCallGroup>) {
  return (
    <ol className="border-l-2 border-indigo-400 pl-3">
      {calls.map((call) => (
        <li key={call.toolCall.id}>{renderCall(call)}</li>
      ))}
    </ol>
  );
}
