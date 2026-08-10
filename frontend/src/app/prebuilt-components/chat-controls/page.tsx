import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/prebuilt-components/chat-controls" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Two controls that both live outside the chat component itself. Modal
          open/closed state is held in the chat configuration context, so any
          component under the provider can read <code>isModalOpen</code> and
          call <code>setModalOpen</code>. Feedback is opt-in through the
          assistant-message slot: the thumbs buttons render only when you pass a
          handler.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Say something worth rating."]}
            expect="The button label flips between “Open chat” and “Close chat” in step with the sidebar, and thumbs up/down on the reply appends a line with that message's id."
            fail="No button at all means setModalOpen was undefined — the component was rendered outside the provider that owns modal state."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/prebuilt-components/chat-controls/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Notes">
        <Callout tone="info" title="Where the button has to live">
          <code>setModalOpen</code> is only defined when a provider in the tree
          owns modal state. <code>&lt;CopilotSidebar&gt;</code> and{" "}
          <code>&lt;CopilotPopup&gt;</code> create it; a bare{" "}
          <code>&lt;CopilotChat&gt;</code> does not. That is why the button is a
          child of the sidebar here rather than a sibling above it — outside
          that subtree the hook returns no setter and the doc&apos;s early
          return hides the button entirely.
        </Callout>
      </Panel>
    </>
  );
}
