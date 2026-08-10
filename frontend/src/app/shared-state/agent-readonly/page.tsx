import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state/agent-readonly" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A one-way UI-to-agent channel for values the UI owns: who is logged
          in, what record is selected, what the user just did. The agent sees
          them every turn and has no tool to write them back — so a confused
          model cannot &ldquo;update&rdquo; your auth state.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Reach for this when the value is an <em>input</em>. Reach for{" "}
          <a
            href="/shared-state"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            shared state
          </a>{" "}
          when it is a <em>field</em> both sides edit.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "What's my name and what have I been doing?",
              "What time is it for me right now?",
            ]}
            expect="The agent answers with the current form values. Change the name, ask again in the same thread, and the new one comes back — the entries re-publish on every render."
            fail="A generic “I don't have access to that” means no context entries reached the run; the Inspector's context tab will show them empty."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/shared-state/agent-readonly/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The backend half is already done for you">
        <Callout tone="success" title="The adapter injects context itself">
          <p>
            The page&apos;s backend step appends{" "}
            <code>input.context</code> entries to the system prompt by hand.{" "}
            <code>ClaudeAgentAdapter.buildOptions()</code> already does this via
            its own <code>buildStateContextAddendum(input)</code>, which emits a{" "}
            <code>## Context from the application</code> block before every run.
          </p>
          <p className="mt-2">
            Doing it in both places would print every value twice, so the
            doc&apos;s snippet is carried in the backend unused, with a note
            saying why.
          </p>
        </Callout>
      </Panel>

      <Panel title="The doc's version, kept for comparison">
        <SourceCode file="backend/src/agents/context-addendum.snippet.ts" />
      </Panel>
    </>
  );
}
