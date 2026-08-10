import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state/streaming" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          By default agent state only updates between checkpoints, so a
          long-running tool call lands as one burst at the end. State streaming
          forwards a specific tool argument into a state key{" "}
          <em>while it is still being generated</em>, so the UI can watch the
          answer assemble. The mapping is always one tool argument to one state
          key — here <code>write_document.document</code> to{" "}
          <code>state.document</code>.
        </p>
      </Panel>

      <Panel title="This route has no runnable demo">
        <Callout tone="warn" title="The page publishes five lines of frontend code">
          <p>
            The entire frontend half of this page is one{" "}
            <code>useAgent</code> call. Its only other frontend content is a
            sentence of prose: <em>&ldquo;From there,</em>{" "}
            <code>agent.state.document</code>{" "}
            <em>is just a string that grows on every token, and</em>{" "}
            <code>agent.isRunning</code>{" "}
            <em>tells you whether to show a streaming indicator.&rdquo;</em>
          </p>
          <p className="mt-2">
            No imports, no typing of <code>agent.state</code>, no document view,
            no indicator markup, no component, no export. The demo file holds
            the five published lines and nothing else, so it does not compile.
          </p>
        </Callout>

        <div className="mt-4">
          <TryIt
            prompts={["Nothing — the route has no rendering surface."]}
            expect="`npx tsc --noEmit` reports errors in the demo file, and requesting the demo route returns 500 in dev."
            fail="A document panel with a LIVE badge would mean the markup had been invented — the page describes an indicator but never shows one."
          />
        </div>
      </Panel>

      <Panel title="The backend half is blocked twice over">
        <Callout tone="warn" title="A backend tool, and an event stream the adapter does not emit">
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <code>write_document</code> is a backend tool. Registering one
              requires <code>buildBackendToolServer</code>, which the Quickstart
              calls and which no page in this framework&apos;s docs defines.
            </li>
            <li>
              <code>emitStreamingDocumentState</code> consumes raw Anthropic
              stream events — <code>content_block_start</code> and{" "}
              <code>content_block_delta</code> with{" "}
              <code>input_json_delta</code> — and hand-parses the partial JSON
              buffer to pull the in-flight argument value out mid-token.{" "}
              <code>ClaudeAgentAdapter</code> never surfaces those; it consumes
              the SDK stream internally and emits AG-UI events. The page refers
              to &ldquo;the direct Messages API path&rdquo; that would produce
              raw deltas, and never publishes that run loop.
            </li>
          </ol>
          <p className="mt-3">
            Two independent blockers, neither worked around.
          </p>
        </Callout>
      </Panel>

      <Panel title="What the page publishes, as published">
        <SourceCode file="frontend/src/app/shared-state/streaming/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The backend half, as published and unused">
        <SourceCode file="backend/src/agents/state-streaming-backend.snippet.ts" />
      </Panel>
    </>
  );
}
