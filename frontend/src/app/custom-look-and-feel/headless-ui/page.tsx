import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/custom-look-and-feel/headless-ui" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The whole chat rebuilt from three hooks and nothing else.{" "}
          <code>useAgent</code> owns the conversation,{" "}
          <code>useCopilotKit</code> gives you the runtime handle you call{" "}
          <code>runAgent</code> on, and <code>useRenderToolCall</code> paints
          any registered tool call inline. No <code>&lt;CopilotChat&gt;</code>,
          no slots, no CopilotKit CSS.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Hello", "Tell me about yourself"]}
            expect="Your own bubbles and composer, streaming the same way the prebuilt chat does. Nothing on screen comes from the package's UI."
            fail="A message that never leaves the composer means runAgent rejected — check the browser console, which this page logs to deliberately."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/custom-look-and-feel/headless-ui/demo-chat/page.tsx" />
      </Panel>

      <Panel title="What you give up, and where the rest lives">
        <Callout tone="warn" title="Text and tool calls only">
          <p>
            The page is explicit about the trade-off: going headless gets you
            message text and tool calls. Reasoning cards, activity messages
            (A2UI and MCP Apps) and the before/after custom-message slots do
            not appear unless you rebuild them yourself.
          </p>
          <p className="mt-2">
            Its <code>headless-complete</code> cell is the version that does
            rebuild them, via <code>useRenderActivityMessage</code> and{" "}
            <code>useRenderCustomMessages</code>. That cell is the same one{" "}
            <a
              href="/programmatic-control"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              Programmatic Control
            </a>{" "}
            is built from, so this repo implements it there.
          </p>
        </Callout>

        <div className="mt-4">
          <Callout tone="info" title="Three helpers the page references but never publishes">
            <code>createMessageId</code>, <code>UserBubble</code> and{" "}
            <code>AssistantBubble</code> appear in every snippet and are
            defined in none of them. The versions here are this repo&apos;s,
            kept to the smallest thing that renders — <code>createMessageId</code>{" "}
            is <code>crypto.randomUUID()</code>. The hook calls, the{" "}
            <code>send()</code> body and the message <code>.map()</code> are the
            doc&apos;s, unchanged.
          </Callout>
        </div>
      </Panel>
    </>
  );
}
