import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/voice" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The mic button is not a prop. It appears because the runtime this
          surface talks to advertises{" "}
          <code>audioFileTranscriptionEnabled: true</code> on its{" "}
          <code>/info</code> endpoint, which it does because it was constructed
          with a <code>TranscriptionService</code>. All the wiring is on the
          server; <code>&lt;CopilotChat&gt;</code> is untouched.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Click “Try a sample audio”, then send.",
              "Click the mic, speak, and stop (needs OPENAI_API_KEY).",
            ]}
            expect="The sample button drops its phrase into the composer. The mic records, POSTs to /transcribe, and the transcript auto-sends."
            fail="No mic button means the runtime never advertised transcription — check that /api/copilotkit-voice was built with createCopilotRuntimeHandler and a service. A clear “OPENAI_API_KEY not configured” error is the guard working, not a break."
          />
        </div>
      </Panel>

      <Panel title="The demo and its runtime">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/voice/demo-chat/page.tsx" },
            { file: "frontend/src/app/voice/sample-audio-button.tsx" },
            { file: "frontend/src/app/api/copilotkit-voice/[[...slug]]/route.ts" },
          ]}
        />
      </Panel>

      <Panel title="Why this route has its own provider and runtime">
        <Callout tone="info" title="The v1 wrapper drops transcriptionService">
          <p>
            Every other route here goes through{" "}
            <code>copilotRuntimeNextJSAppRouterEndpoint</code> at{" "}
            <code>/api/copilotkit</code>. That wrapper has no{" "}
            <code>transcriptionService</code> option, so voice needs{" "}
            <code>createCopilotRuntimeHandler</code> from{" "}
            <code>@copilotkit/runtime/v2</code> directly, at its own{" "}
            <code>[[...slug]]</code> catch-all so the v2 runtime can route{" "}
            <code>/info</code>, <code>/agent/:id/run</code> and{" "}
            <code>/transcribe</code> underneath one base path.
          </p>
          <p className="mt-2">
            A different runtime means a different provider, which is why this
            is one of three routes that mount their own{" "}
            <code>&lt;CopilotKit&gt;</code>.
          </p>
        </Callout>

        <div className="mt-4">
          <Callout tone="warn" title="One import the page never publishes">
            Its route file imports <code>createClaudeHttpAgent</code> from{" "}
            <code>@/app/api/_shared/claude-http-agent</code>, and that file
            appears on no page. This repo substitutes{" "}
            <code>new HttpAgent(&#123; url &#125;)</code> — what the Quickstart
            publishes, and evidently what the wrapper is a thin factory for —
            rather than inventing one.
          </Callout>
        </div>
      </Panel>
    </>
  );
}
