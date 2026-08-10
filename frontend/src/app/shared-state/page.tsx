import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          One object both sides own. The agent writes into it and the UI
          re-renders; the UI writes into it and the agent picks the change up on
          its next turn — without either going through the chat thread.
          <code className="ml-1">agent.state</code> is plain React data, so
          rendering it is whatever you would normally build.
        </p>
      </Panel>

      <Panel title="This route has no runnable demo">
        <Callout tone="warn" title="The page publishes two snippets and a card — not a page">
          <p>
            The demo file holds only what this page actually publishes for{" "}
            <code>page.tsx</code>: the <code>useAgent</code> subscription and
            the <code>handlePreferencesChange</code> handler. Nothing else on
            the page is frontend page code.
          </p>
          <p className="mt-2">What is missing, and left missing:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              imports for <code>useAgent</code> and{" "}
              <code>UseAgentUpdate</code>
            </li>
            <li>
              the <code>Preferences</code> type the handler takes — it exists
              only in the page&apos;s <em>backend</em> snippet
            </li>
            <li>
              the <code>RWAgentState</code> type the handler casts to
            </li>
            <li>
              <code>latestNotesRef</code>, which the handler reads
            </li>
            <li>
              any component shell, JSX, layout or default export — so there is
              no surface to render, and no preferences form anywhere on the page
              despite the handler being named for one
            </li>
          </ul>
          <p className="mt-2">
            <code>NotesCard</code> <em>is</em> published in full, and is
            reproduced verbatim — including its <code>NotesCardProps</code> type
            and its <code>Card</code> / <code>Button</code> imports, none of
            which the page shows. Those come from the showcase&apos;s own
            shadcn/ui library, which is not a dependency here.
          </p>
          <p className="mt-2">
            The result does not compile. That is the honest state of what this
            page hands you.
          </p>
        </Callout>

        <div className="mt-4">
          <TryIt
            prompts={["Nothing — the route has no rendering surface."]}
            expect="`npx tsc --noEmit` reports errors in the demo files, and requesting the demo route returns 500 in dev."
            fail="A working two-panel demo would mean the missing half had been invented — which is what this route is here to avoid."
          />
        </div>
      </Panel>

      <Panel title="The backend tool cannot be registered either">
        <Callout tone="warn" title="set_notes needs buildBackendToolServer">
          <p>
            The page has the agent write notes by calling a backend{" "}
            <code>set_notes</code> tool, and publishes{" "}
            <code>SET_NOTES_TOOL_SCHEMA</code> for it. Registering a backend
            tool requires <code>buildBackendToolServer</code>, which the
            Quickstart calls and which no page in this framework&apos;s docs
            defines.
          </p>
          <p className="mt-2">
            So the tool does not exist at runtime. The adapter does ship a
            built-in <code>ag_ui_update_state</code> tool that would produce the
            same observable effect, but that is not what this page documents, so
            it is not substituted in.
          </p>
        </Callout>
      </Panel>

      <Panel title="What the page publishes, as published">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/shared-state/demo-chat/page.tsx" },
            { file: "frontend/src/app/shared-state/notes-card.tsx" },
          ]}
        />
      </Panel>

      <Panel title="The backend half, as published">
        <SourceCode file="backend/src/agents/shared-state-read-write-prompt.ts" />
      </Panel>
    </>
  );
}
