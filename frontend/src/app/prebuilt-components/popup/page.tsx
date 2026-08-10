import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/prebuilt-components/popup" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Same component family as the sidebar, different relationship to the
          page: the popup overlays your content instead of sitting next to it.
          The <code>labels</code> prop is shown here too — it is the escape
          hatch for every user-facing string, separate from the slot system.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Hi there"]}
            expect="An overlay chat above the page, with the composer placeholder reading “Ask the popup anything...” — proof the labels prop took effect."
            fail="A default placeholder means labels was not applied; the page content shifting means it rendered as a sidebar."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/prebuilt-components/popup/demo-chat/page.tsx" />
      </Panel>
    </>
  );
}
