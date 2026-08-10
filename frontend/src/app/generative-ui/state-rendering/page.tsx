import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/state-rendering" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Building UI that reflects agent state in real time — progress
          counters, drafts that fill in, dashboards, structured output rendered
          outside the chat. The frontend contract is one hook:{" "}
          <code>useAgent</code> with <code>OnStateChanged</code>, and{" "}
          <code>agent.state</code> as ordinary React data.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Write a 200-word product announcement."]}
            expect="The document panel updates as the agent writes state, with a LIVE badge during the run."
            fail="Nothing rendering means no STATE_SNAPSHOT reached the client — check the Inspector's state tab."
          />
        </div>
      </Panel>

       <Panel title="Issue - Backend tool missing">
        <Callout tone="warn" title="No backend tool integration">
          <p>
            The backend code has a write_document tool, however its integration with claudeAgentAdapter
            using mcp_server is not implemented. The demo will not work as expected because the tool is not available to the agent.
            
          </p>
        </Callout>
      </Panel>

      <Panel title="This page shares a cell with State Streaming">
        <Callout tone="info" title="Same demo, same agent, deliberately">
          <p>
            The page&apos;s interactive cell is{" "}
            <code>shared-state-streaming</code> and both of its code blocks are
            the ones{" "}
            <a
              href="/shared-state/streaming"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              State Streaming
            </a>{" "}
            publishes — the same <code>useAgent</code> subscription and the same{" "}
            <code>state-streaming-backend.snippet.ts</code>. This route&apos;s
            demo link therefore redirects there rather than shipping a copy
            that would drift.
          </p>
          <p className="mt-2">
            The difference is emphasis, not code: this page is about{" "}
            <em>rendering</em> state reactively, the other about the backend{" "}
            <em>streaming</em> that makes the updates fine-grained. Both are
            Partial for the same reason — see the sibling route for the detail.
          </p>
        </Callout>
      </Panel>

      <Panel title="The frontend subscription">
        <SourceCode file="frontend/src/app/shared-state/streaming/demo-chat/page.tsx" />
      </Panel>
    </>
  );
}
