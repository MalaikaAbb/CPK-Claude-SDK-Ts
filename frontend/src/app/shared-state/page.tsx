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

      <Panel title="What the page publishes, and what it leaves out">
        <Callout tone="warn" title="Two snippets and a card — not a page">
          <p>
            All this page publishes for <code>page.tsx</code> is the{" "}
            <code>useAgent</code> subscription and the{" "}
            <code>handlePreferencesChange</code> handler. Both are kept verbatim
            in the demo, in <code>#region</code> blocks. Everything around them
            had to be supplied for the route to run:
          </p>
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
              <code>latestNotesRef</code>, which the handler reads and never
              sets
            </li>
            <li>
              the component shell, the preferences form the handler is named
              for, the layout and the default export
            </li>
          </ul>
          <p className="mt-2">
            <code>NotesCard</code> <em>is</em> published in full and is
            reproduced with its markup intact. Its <code>NotesCardProps</code>{" "}
            type is added, and its <code>Card</code> / <code>Button</code>{" "}
            imports — shadcn/ui components from the showcase&apos;s own library,
            not a dependency here — are inlined as the plain elements they wrap.
          </p>
        </Callout>

        <div className="mt-4">
          <TryIt
            prompts={[
              "Explain recursion.",
              "Remember that I drink my espresso as a cortado.",
              "What do you know about me so far?",
            ]}
            expect="The first reply follows the name and tone in the form, and the third repeats them back — that is the UI writing shared state and the agent reading it. The second only produces prose today: with the backend tool commented out there is no `set_notes` to call, so the Agent Scratch pad stays empty."
            fail="The reply ignores the name and tone in the form, or the third turn cannot repeat them back — the preferences never reached the agent."
          />
        </div>
      </Panel>

      <Panel title="set_notes: written, verified, currently switched off">
        <Callout tone="warn" title="The bridge the docs never define is in this repo now">
          <p>
            The page has the agent write notes with a backend{" "}
            <code>set_notes</code> tool and publishes{" "}
            <code>SET_NOTES_TOOL_SCHEMA</code> for it. Registering one requires{" "}
            <code>buildBackendToolServer</code>, which the Quickstart calls and
            no doc page defines. It is written here, against the call site the
            Quickstart does publish — an in-process Claude SDK MCP server whose
            tools run <code>executeTool</code> over the run&apos;s state box,
            with a snapshot emitted just before each{" "}
            <code>TOOL_CALL_RESULT</code>.
          </p>
          <p className="mt-2">
            It works: the agent calls <code>set_notes</code>, the note reaches
            the card mid-run, and the model finishes the same run rather than
            halting the way a frontend tool would.
          </p>
          <p className="mt-2">
            The <code>backendTools</code> entry for this agent is commented out
            in <code>backend/src/agents/registry.ts</code> for now, so nothing
            registers the tool today and the scratch pad stays empty. The
            preferences direction — this page writing through{" "}
            <code>agent.setState</code>, the agent reading it back on its next
            turn — is unaffected.
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
