import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/reasoning" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The same <code>messageView.reasoningMessage</code> slot as{" "}
          <a
            href="/custom-look-and-feel/reasoning-messages"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Reasoning Messages
          </a>
          , given a component instead of a sub-slot object. That swaps the whole
          card: no <code>CopilotChatReasoningMessage</code> underneath, so the
          built-in open/close behaviour goes with it and you rebuild whatever
          you want in its place.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Think step by step: what is 17 * 24?"]}
            expect="A dashed-border details element labelled “Reasoning”, auto-open while streaming and collapsible once the answer lands."
            fail="No card at all means no reasoning reached the client — check the REASONING_* rows on /backend/copilot-runtime."
          />
        </div>
      </Panel>

      <Panel title="Reasoning streams with no configuration">
        <Callout tone="success" title="Verified against the live agent">
          A run against this route&apos;s agent emits the full{" "}
          <code>REASONING_*</code> lifecycle with <code>tools: []</code> and no
          thinking configuration on the server, so the replaced card paints. See{" "}
          <a
            href="/backend/copilot-runtime"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Copilot Runtime
          </a>{" "}
          for the raw events beside the response.
        </Callout>
      </Panel>

      <Panel title="The demo">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/reasoning/demo-chat/page.tsx" },
            { file: "frontend/src/app/generative-ui/reasoning/reasoning-block.tsx" },
          ]}
          note={
            <>
              The three derived booleans in <code>ReasoningBlock</code> are the
              doc&apos;s, verbatim — they are the part of that component the
              page publishes. The markup around them is this repo&apos;s.
            </>
          }
        />
      </Panel>
    </>
  );
}
