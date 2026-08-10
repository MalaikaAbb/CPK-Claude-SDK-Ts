import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/multi-agent/subagents" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The canonical multi-agent shape: a supervisor exposes each specialist
          as a tool, decides what to delegate, and reads their results back on
          its next step. Structurally it is tool-calling — except each
          &ldquo;tool&rdquo; is a full agent with its own prompt and no shared
          memory.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The UI half is where shared state earns its keep: the supervisor
          records each delegation into a <code>delegations</code> slot, and the
          log renders every entry live rather than leaving the user with a long
          opaque spinner.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Write me a short brief on why sourdough needs a starter.",
              "Research and draft a paragraph about tidal energy, then critique it.",
            ]}
            expect="Currently: the supervisor answers directly and the delegation log stays empty with all three role chips dimmed. That is the documented-gap behaviour."
            fail="Populated delegation cards would mean the tools got registered somehow — which would make this status entry wrong."
          />
        </div>
      </Panel>

      <Panel title="Why this route is Partial">
        <Callout tone="warn" title="The run loop is specified in one sentence and published nowhere">
          <p>
            The page gives you two of the three pieces: the supervisor prompt
            and the three delegation tool schemas. The third — what actually
            happens when the supervisor calls{" "}
            <code>research_agent</code> — exists only as prose:{" "}
            <em>
              the run loop in <code>agent_server.ts</code> runs the matching
              sub-agent synchronously, records the delegation into shared agent
              state, and returns the sub-agent&apos;s output as a tool_result
            </em>
            . There is no code for it on this page or anywhere else in the
            framework&apos;s docs.
          </p>
          <p className="mt-2">
            Independently, the delegation tools are backend tools, they are currently not integrated
            with ClaudeAgentAdapter
          </p>
        </Callout>
      </Panel>

      <Panel title="The demo">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/multi-agent/subagents/demo-chat/page.tsx" },
            { file: "frontend/src/app/multi-agent/subagents/delegation-log.tsx" },
          ]}
          note={
            <>
              <code>DelegationLog</code> is the doc&apos;s structure — the
              indicator chips, the <code>data-testid</code> hooks, the empty
              state — with its shadcn imports swapped for plain elements and a{" "}
              <code>SUB_AGENT_STYLE</code> map added, which the page references
              but never publishes.
            </>
          }
        />
      </Panel>

      <Panel title="The backend half, as published">
        <SourceCode file="backend/src/agents/subagents-prompts.ts" />
      </Panel>
    </>
  );
}
