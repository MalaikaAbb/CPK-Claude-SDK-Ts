import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/frontend-tools" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A tool whose handler executes in the browser, so it can reach
          component state, browser APIs, the DOM, or any UI library the page
          already uses. That is how an agent &ldquo;reaches into&rdquo; the app
          rather than just describing what it would do.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Make the background a warm sunset gradient.",
              "Now something cold and minimal.",
            ]}
            expect={
              "The page behind the sidebar re-tints within a second, the printed " +
              "`current:` value changes, and the agent confirms in prose — it saw " +
              '{ status: "success" } come back.'
            }
            fail="A described-but-unapplied change means the tool never got called; the agent describing CSS it cannot apply is the tell."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/frontend-tools/demo-chat/page.tsx" },
            { file: "frontend/src/app/frontend-tools/background.tsx" },
          ]}
          note={
            <>
              The <code>useFrontendTool</code> call is the doc&apos;s, verbatim.{" "}
              <code>Background</code> and <code>DEFAULT_BACKGROUND</code> are
              imported by the page and published by it nowhere, so those are
              this repo&apos;s.
            </>
          }
        />
      </Panel>
    </>
  );
}
