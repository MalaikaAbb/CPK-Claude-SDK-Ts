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
            expect="The supervisor delegates research → writing → critique. A COMPLETED card with the sub-agent's output appears as each one finishes, and its role chip lights up."
            fail="An empty log with dimmed chips means the tools are not registered or their results never became a snapshot; FAILED shows the error class — the full error is in the backend log."
          />
        </div>
      </Panel>

      <Panel title="Why this route is Partial">
        <Callout tone="warn" title="The published run loop can't be used; the tools go through a repo bridge">
          <p>
            The page now publishes its whole <code>agent_server.ts</code>,
            including the <code>/subagents</code> route,{" "}
            <code>runAgenticLoop</code>, the delegation branch of{" "}
            <code>executeBackendTool</code> and <code>invokeSubAgent</code>.
            But <code>runAgenticLoop</code> starts by calling{" "}
            <code>shouldUseClaudeAgentSdk</code> /{" "}
            <code>runWithClaudeAgentSdk</code> from a{" "}
            <code>./claude-agent-sdk-adapter</code> module that no page
            shows. The file also imports eight more modules this page never
            shows.
          </p>
          <p className="mt-2">
            So the delegation tools are registered the way this repo registers
            every backend tool: an in-process MCP server passed to{" "}
            <code>ClaudeAgentAdapter</code> as <code>mcpServers</code>. Each
            handler runs the doc&apos;s <code>invokeSubAgent</code>, and the
            server writes the finished entry into <code>delegations</code>. The
            doc&apos;s in-flight <code>running</code> row isn&apos;t shown,
            because the write-back fires only on tool results.
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

      <Panel title="The delegation tools (repo MCP bridge around the doc's invokeSubAgent)">
        <SourceCode file="backend/src/agents/subagents-mcp-server.ts" />
      </Panel>
    </>
  );
}
