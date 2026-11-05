import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, KeyValue, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/components/transports" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          There are two ways for UI to reach the browser. With the{" "}
          <strong>tool</strong> transport (the default), the agent calls{" "}
          <code>render_ui</code>, operations are checked on the runtime and
          in the browser, and the UI arrives as its own message. With the{" "}
          <strong>markdown</strong> transport, the agent writes{" "}
          <code>```a2ui</code> fences in its reply, the browser checks them,
          and the UI sits inside the text. <code>agentIds</code> on the
          provider restricts which agents get any of this.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Show me a small table of three fruits and their colors."]}
            expect="tool + omitted: the table arrives as a separate tool-call card. markdown + omitted: it renders inside the text reply, with prose before or after it. agentIds [&quot;shop&quot;]: no UI at all, because this agent gets no envelope, so it answers in plain text or a markdown table."
            fail="In markdown mode, raw JSON in a code block means the fence wasn't parsed: it must start at the beginning of a line and use the a2ui language tag. In tool mode, a reply with no render_ui call means the runtime's generativeUI option isn't on."
          />
        </div>
      </Panel>

      <Panel title="Runtime generativeUI option">
        <KeyValue
          rows={[
            ["omitted", "Every run whose envelope uses the tool transport."],
            ["true", "Every run (this repo's setting)."],
            ['{ agents: ["shop"] }', "Only those agents."],
            ["false", "Never."],
          ]}
        />
        <Callout tone="info" title="Agents must use the run's tools and context">
          <p>
            The built-in agent does, and so does <code>ClaudeAgentAdapter</code>,
            which forwards both. Per the page, LangGraph Python needs{" "}
            <code>CopilotKitMiddleware</code>. The full standard catalog is the
            biggest token cost; trim it with <code>omit</code>.
          </p>
        </Callout>
      </Panel>

      <Panel title="Source">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/components/transports/demo-chat/page.tsx" },
            { file: "frontend/src/app/api/copilotkit-components/[[...slug]]/route.ts" },
          ]}
        />
      </Panel>
    </>
  );
}
