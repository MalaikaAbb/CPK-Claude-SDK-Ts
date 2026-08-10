import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state/rendering-in-app" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The same shared state as{" "}
          <a
            href="/shared-state"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Shared State
          </a>
          , rendered as the primary UI rather than a chat panel.{" "}
          <code>useAgent</code> works in any component under the provider, so
          agent output can drive a canvas, a dashboard, or a document view — and
          user edits go back the same way.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Make me a 4-item packing list for a weekend trip.",
              "Which items have I already ticked off?",
            ]}
            expect="A checklist rendered in the page body, not in the chat. Ticking a box and then asking the second question gets an answer that reflects your ticks."
            fail="A list that only appears as chat text means the agent wrote prose instead of state; ticks the agent cannot see means setState is not round-tripping."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/shared-state/rendering-in-app/demo-chat/page.tsx" />
      </Panel>

    </>
  );
}
