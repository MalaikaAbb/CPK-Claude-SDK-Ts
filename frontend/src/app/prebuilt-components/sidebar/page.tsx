import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/prebuilt-components/sidebar" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The sidebar renders as a <em>sibling</em> of your main content rather
          than wrapping it, which is what lets it slide out without reflowing
          the page. <code>defaultOpen</code> decides the first-render state;
          after that the toggle owns it.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Hello", "Collapse yourself (then use the toggle)"]}
            expect="Collapsing and expanding the sidebar leaves the main column's width unchanged."
            fail="If the main column jumps width on toggle, the sidebar has been nested inside it instead of beside it."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/prebuilt-components/sidebar/demo-chat/page.tsx" />
      </Panel>
    </>
  );
}
