"use client";

// The three "Grouping tool calls" snippets from
// https://docs.copilotkit.ai/claude-sdk-typescript/generative-ui/tool-rendering
// (each titled page.tsx), verbatim between the `--- snippet ---` markers.
//
// Harness glue, not on the page:
// - a component wrapper around each snippet, and the imports;
// - snippets 2 and 3 call the page's zero-config `useDefaultRenderTool()`,
//   because only calls drawn by a renderer that opts into grouping are grouped
//   and those two snippets register no renderer of their own;
// - each chat sits under `CopilotChatConfigurationProvider agentId="tool-rendering"`
//   (the snippets' `<CopilotChat>` names no agent) — the parent demo does that.
// `MyToolRow` and `ToolTimeline` are never defined on the page; see ./tool-row.tsx.
import { CopilotChat, useDefaultRenderTool } from "@copilotkit/react-core/v2";

import { MyToolRow, ToolTimeline } from "./tool-row";

export function GroupedCustomRow() {
  // --- snippet 1 ---
  useDefaultRenderTool({ render: MyToolRow, group: true });
  // --- end ---
  return <CopilotChat />;
}

export function LineDisplay() {
  useDefaultRenderTool();
  return (
    // --- snippet 2 ---
    // "grouped" (default) | "line" | "stacked" | "turn" | "separate"
    <CopilotChat messageView={{ toolCallDisplay: "line" }} />
    // --- end ---
  );
}

export function GroupSlot() {
  useDefaultRenderTool();
  return (
    // --- snippet 3 ---
    // ToolTimeline: your component, given the group's `calls` and a `renderCall` function
    <CopilotChat
      messageView={{
        assistantMessage: { toolCallsView: { group: ToolTimeline } },
      }}
    />
    // --- end ---
  );
}
