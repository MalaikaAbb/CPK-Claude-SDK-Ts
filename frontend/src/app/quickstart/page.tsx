import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/quickstart" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The bring-your-own-agent path, end to end. A{" "}
          <code>ClaudeAgentAdapter</code> from{" "}
          <code>@ag-ui/claude-agent-sdk</code> is served over AG-UI by a small
          Express app; the Next runtime reaches it with an{" "}
          <code>HttpAgent</code>. Two processes, two ports — the agent server is
          Node, but it is a separate process from Next.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Tell me in one sentence what this app can do.",
              "Can you tell me a joke?",
            ]}
            expect="Tokens stream in a word at a time and the reply renders as markdown."
            fail="An error banner. Check that the agent server is up on :8000 and that ANTHROPIC_API_KEY is set in its environment."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/quickstart/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The two files that make it work"
        description="Read from this repo, so they can be diffed against the doc's samples directly."
      >
        <SourceCodeGroup
          files={[
            { file: "backend/src/agent-server.ts", region: "server" },
            { file: "frontend/src/app/api/copilotkit/route.ts" },
          ]}
          note={
            <>
              Both are the doc&apos;s samples with one change: the single agent
              becomes a loop over the registry, because this harness needs one
              agent per doc route rather than one in total.
            </>
          }
        />
      </Panel>

      
    </>
  );
}
