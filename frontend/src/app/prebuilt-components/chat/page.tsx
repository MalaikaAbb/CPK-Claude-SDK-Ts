import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/prebuilt-components/chat" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <code>&lt;CopilotChat&gt;</code> is the root primitive; Sidebar and
          Popup are wrappers around it and take the same slots and labels. It
          has no size of its own — it fills whatever container you give it, so
          the container is what you style.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["What can you do?", "Write me a haiku about SSE."]}
            expect="A streamed reply filling the centred column, with the composer pinned to the bottom of that column."
            fail="A collapsed or zero-height chat means the parent has no height — see .chat-host in globals.css."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/prebuilt-components/chat/demo-chat/page.tsx" />
      </Panel>
    </>
  );
}
