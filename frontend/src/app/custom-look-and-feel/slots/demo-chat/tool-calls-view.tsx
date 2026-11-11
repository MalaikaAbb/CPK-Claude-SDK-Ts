// "Tool calls" snippet from
// https://docs.copilotkit.ai/claude-sdk-typescript/custom-look-and-feel/slots
// (title page.tsx), verbatim below the line. The demo page mounts `Chat`
// inside a CopilotChatConfigurationProvider pointed at the `tool-rendering`
// agent. That provider is harness glue, not doc code: the snippet's chat names
// no agent, and only that agent has a backend tool whose calls this slot wraps.
// ---------------------------------------------------------------------------
import {
  CopilotChat,
  CopilotChatToolCallsView,
  type CopilotChatToolCallsViewProps,
} from "@copilotkit/react-core/v2";

const CustomToolCallsView = (props: CopilotChatToolCallsViewProps) => (
  <div className="rounded-lg border border-dashed p-2">
    <CopilotChatToolCallsView {...props} />
  </div>
);

export function Chat() {
  return (
    <CopilotChat
      messageView={{
        assistantMessage: { toolCallsView: CustomToolCallsView },
      }}
    />
  );
}
