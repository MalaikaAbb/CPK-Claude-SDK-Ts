import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const SUB_SLOTS = `<CopilotChat
  messageView={{
    reasoningMessage: {
      header: CustomHeader,
      contentView: CustomContent,
    },
  }}
/>`;

const WHOLESALE = `function MyReasoningLayout(
  props: React.ComponentProps<typeof CopilotChatReasoningMessage>,
) {
  return (
    <CopilotChatReasoningMessage {...props}>
      {({ header, contentView, toggle, message, messages, isRunning }) => (
        /* your layout */
      )}
    </CopilotChatReasoningMessage>
  );
}`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/custom-look-and-feel/reasoning-messages" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The reasoning card is a slot like any other, and it takes both kinds
          of value. Pass an object of sub-slots and you replace parts of the
          built-in card while keeping its open/close behaviour; pass a
          component and you replace the whole thing. This route does the first;{" "}
          <a
            href="/generative-ui/reasoning"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Generative UI · Reasoning
          </a>{" "}
          does the second.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Think step by step: what is 17 * 24?",
              "Reason carefully about whether 91 is prime.",
            ]}
            expect="A card whose header reads “HEADER SLOT” over a body labelled “contentView slot”, appearing before the answer and collapsible after."
            fail="No card at all means no reasoning reached the client — check the REASONING_* rows on /backend/copilot-runtime to tell a slot problem from a stream problem."
          />
        </div>
      </Panel>

      <Panel title="The two override shapes">
        <CodeBlock
          code={SUB_SLOTS}
          language="tsx"
          filename="sub-slot object — what this route uses"
        />
        <div className="mt-4">
          <CodeBlock
            code={WHOLESALE}
            language="tsx"
            filename="whole-component replacement — the render-prop form"
          />
        </div>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          The render-prop children callback receives{" "}
          <code>header</code>, <code>contentView</code>, <code>toggle</code>,{" "}
          <code>message</code>, <code>messages</code> and{" "}
          <code>isRunning</code>, so a wholesale replacement can still reuse the
          pre-rendered pieces rather than rebuilding them.
        </p>
      </Panel>

      <Panel title="Reasoning streams with no configuration">
        <Callout tone="success" title="Claude emits thinking blocks by default">
          <p>
            The page says cards appear automatically when the agent emits
            reasoning tokens, with &ldquo;no extra props or configuration
            needed&rdquo;, and names OpenAI&apos;s o-series as its examples.
            That holds for Claude too: a live run against this route&apos;s
            agent produced the whole lifecycle —{" "}
            <code>REASONING_START</code>,{" "}
            <code>REASONING_MESSAGE_START</code>, several{" "}
            <code>REASONING_MESSAGE_CONTENT</code> deltas,{" "}
            <code>REASONING_MESSAGE_END</code>,{" "}
            <code>REASONING_ENCRYPTED_VALUE</code> and{" "}
            <code>REASONING_END</code> — with <code>tools: []</code> and no
            thinking configuration anywhere on the server.
          </p>
          <p className="mt-2">
            So the adapter translates Claude&apos;s thinking blocks into AG-UI
            reasoning events out of the box. Watch them yourself on{" "}
            <a
              href="/backend/copilot-runtime"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              Copilot Runtime
            </a>
            , which prints the reasoning lifecycle beside the response it
            assembles into.
          </p>
        </Callout>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/custom-look-and-feel/reasoning-messages/demo-chat/page.tsx" />
      </Panel>
    </>
  );
}
