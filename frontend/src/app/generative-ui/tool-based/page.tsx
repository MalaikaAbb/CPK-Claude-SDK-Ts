import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/tool-based" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The simplest form of generative UI: the component <em>is</em> the
          tool. No handler, no user interaction, no server-side execution — the
          agent decides when to show it and fills in the props, and Zod
          validates them on the way in.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Chart last quarter's revenue: Jan 40, Feb 65, Mar 52.",
              "Show me a bar chart comparing three programming languages by popularity.",
            ]}
            expect="A rendered bar chart inline in the chat, titled by the agent, with bars matching the numbers you gave — followed by an error banner. See the panel below: the chart is the part that works."
            fail="A markdown table or an ASCII chart means the model answered in prose instead of calling the tool — try naming “bar chart” explicitly."
          />
        </div>
      </Panel>

      <Panel title="Why an error banner follows the chart">
        <Callout tone="warn" title="An adapter bug turns the render-only tool result into an empty prompt">
          <p>
            The chart renders correctly. What fails is the{" "}
            <em>follow-up run</em> CopilotKit issues afterwards so the agent can
            react to its own tool call. You get:
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs text-rose-200">
            API Error: 400 messages.4.content.0.text: cache_control cannot be
            set for empty text blocks
          </pre>
          <p className="mt-3">The chain, confirmed by reproducing it directly against the agent server:</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>
              <code>useComponent</code> is render-only — it has no{" "}
              <code>handler</code>, so the tool result sent back is{" "}
              <strong>empty</strong>.
            </li>
            <li>
              The adapter&apos;s <code>processMessages()</code> derives the
              prompt from the <strong>last message only</strong>. That is the
              empty tool result, so <code>userMessage</code> becomes{" "}
              <code>&quot;&quot;</code>. It logs{" "}
              <em>&ldquo;No user message found in 3 messages&rdquo;</em> and
              proceeds anyway.
            </li>
            <li>
              It calls <code>query(&#123; prompt: &quot;&quot; &#125;)</code>,
              adding <code>resume: &lt;sessionId&gt;</code> because it caches a
              Claude Code session per <code>threadId</code>.
            </li>
            <li>
              On resume the CLI replays the earlier turns and appends the empty
              prompt as message 4, stamping <code>cache_control</code> on it for
              prompt caching. Anthropic rejects an empty cached block.
            </li>
          </ol>
          <p className="mt-3">
            Two independent defects have to line up: deriving the prompt from
            one message, and passing the empty result through instead of
            skipping the turn. Both are in{" "}
            <code>@ag-ui/claude-agent-sdk</code> (0.0.3 is the latest published
            version), not in this repo or the doc&apos;s snippet.
          </p>
        </Callout>

        <div className="mt-4">
          <Callout tone="info" title="Why no other route hits this">
            Every other frontend tool here returns something.{" "}
            <code>useFrontendTool</code> returns{" "}
            <code>&#123; status: &quot;success&quot; &#125;</code>,{" "}
            <code>useHumanInTheLoop</code> returns the chosen slot, and{" "}
            <code>generate_a2ui</code> returns its operations container. A
            control run with a non-empty tool result on a resumed session
            finishes normally — so the empty result is the trigger, and{" "}
            <code>useComponent</code> is the only hook that produces one.
          </Callout>
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/tool-based/demo-chat/page.tsx" },
            { file: "frontend/src/app/generative-ui/tool-based/bar-chart.tsx" },
          ]}
          note={
            <>
              The <code>useComponent</code> call is the doc&apos;s, verbatim.
              The chart and its Zod schema are this repo&apos;s — the page
              references <code>barChartPropsSchema</code> and{" "}
              <code>BarChart</code> without publishing either.
            </>
          }
        />
      </Panel>

      <Panel title="Why this one works and tool-rendering does not">
        <Callout tone="success" title="Frontend tools need no bridge">
          <p>
            <code>useComponent</code> registers a <strong>frontend</strong>{" "}
            tool. It travels to the agent inside the AG-UI run input, and{" "}
            <code>ClaudeAgentAdapter.buildOptions()</code> reads{" "}
            <code>input.tools</code>, converts each definition, and packs them
            into an in-process MCP server called <code>ag_ui</code> — granting{" "}
            <code>mcp__ag_ui__render_bar_chart</code> permission automatically.
          </p>
          <p className="mt-2">
            <a
              href="/generative-ui/tool-rendering"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              Tool Call Rendering
            </a>{" "}
            wraps a <strong>backend</strong> tool instead, which has to be
            registered server-side — and that is the path the docs never
            publish.
          </p>
        </Callout>
      </Panel>
    </>
  );
}
