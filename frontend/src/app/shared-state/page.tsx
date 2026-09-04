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

      <Panel title="What is doc code here, and what is not">
        <Callout tone="warn" title="The page publishes two snippets and a card body — the rest is this repo's">
          <p>
            For <code>page.tsx</code> the page publishes the{" "}
            <code>useAgent</code> subscription and the{" "}
            <code>handlePreferencesChange</code> handler. Both are in the demo
            unchanged. Everything around them is repo code: the imports, the{" "}
            <code>RWAgentState</code> type, <code>latestNotesRef</code> and the
            effect that keeps it current, <code>handleClearNotes</code>, and
            the whole <code>PreferencesPanel</code> form, which the page never
            shows despite naming its handler for one.
          </p>
          <p className="mt-2">
            <code>NotesCard</code> keeps the published structure and every{" "}
            <code>data-testid</code>, with the showcase&apos;s shadcn{" "}
            <code>Card</code> / <code>Button</code> pieces swapped for plain
            elements and a local <code>NotesCardProps</code> type.
          </p>
        </Callout>

        <div className="mt-4">
          <TryIt
            prompts={[
              "Set name to Ada and tone to playful, then ask: explain recursion.",
              "Remember that I prefer TypeScript.",
            ]}
            expect="The reply uses your name and tone. After the second prompt a note appears in the scratch pad while the run is still going, and Clear empties it."
            fail="No note means set_notes was never called or its result never became a STATE_SNAPSHOT — check the backend log for the notes MCP server. A reply ignoring the name means preferences did not reach input.state."
          />
        </div>
      </Panel>

      <Panel title="How set_notes reaches the agent, and why that is not doc code">
        <Callout tone="warn" title="The page now publishes buildBackendToolServer, but not the helpers it calls">
          <p>
            The page&apos;s &quot;Expose set_notes through MCP&quot; step
            publishes <code>buildBackendToolServer</code>, and the Quickstart
            publishes the <code>runWithClaudeAgentSdk</code> wrapper that turns
            the tool&apos;s returned state into a <code>STATE_SNAPSHOT</code>.
            Both call <code>sdkTool</code>, <code>zodShapeFromJsonSchema</code>{" "}
            and an <code>executeTool</code> typed as <code>ExecuteTool</code>,
            none of which any page defines.
          </p>
          <p className="mt-2">
            This repo does the same two things with its own code:{" "}
            <code>backend/src/agents/set-notes-mcp-server.ts</code> wraps the
            published <code>SET_NOTES_TOOL_SCHEMA</code> in an in-process MCP
            server and validates like the page&apos;s handler, and the server
            route emits a <code>STATE_SNAPSHOT</code> right after each{" "}
            <code>set_notes</code> result. The adapter also offers its own{" "}
            <code>ag_ui_update_state</code> tool whenever state is present, so
            the model has two write paths; the prompt steers it to{" "}
            <code>set_notes</code>.
          </p>
        </Callout>
      </Panel>

      <Panel title="What the page publishes, as published">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/shared-state/demo-chat/page.tsx" },
            { file: "frontend/src/app/shared-state/notes-card.tsx" },
            { file: "frontend/src/app/shared-state/preferences-panel.tsx" },
          ]}
        />
      </Panel>

      <Panel title="The backend half, as published">
        <SourceCodeGroup
          files={[
            { file: "backend/src/agents/shared-state-read-write-prompt.ts" },
            { file: "backend/src/agents/set-notes-mcp-server.ts" },
          ]}
        />
      </Panel>
    </>
  );
}
