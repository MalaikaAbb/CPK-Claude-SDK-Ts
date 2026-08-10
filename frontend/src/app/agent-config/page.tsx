import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const DOC_BACKEND = `import json

CONFIG_KEYS = ("tone", "expertise", "responseLength")

def read_config_value(entry):
    value = entry.get("value")
    ...

async def my_agent_node(state: AgentState, config: RunnableConfig):
    context_entries = state.get("copilotkit", {}).get("context", [])
    ...`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/agent-config" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Settings that steer the agent but do not belong in the chat thread —
          tone, expertise level, response length. The UI owns a typed object,
          publishes it with <code>useAgentContext</code>, and the agent rebuilds
          its system prompt from the latest value at the start of every turn.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The page draws a useful line: if the value is a{" "}
          <em>channel the user tunes</em>, this is the right shape. If it is{" "}
          <em>content the agent should write back to</em>, use{" "}
          <a
            href="/shared-state"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            shared state
          </a>{" "}
          instead.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Explain what an API is. (then switch tone to enthusiastic and ask again)",
              "Set expertise to beginner and ask: what is a race condition?",
            ]}
            expect="Same question, visibly different answer — length and register track the selects. Beginner answers define jargon; expert answers skip basics."
            fail="Identical phrasing across settings means the context never reached the prompt; check the Inspector's context tab."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/agent-config/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The backend half">
        <SourceCodeGroup
          files={[{ file: "backend/src/agents/agent-config-prompt.ts" }]}
          note={
            <>
              <code>AGENT_CONFIG_DEFAULT_SYSTEM_PROMPT</code> is the agent&apos;s
              base prompt. The adapter appends the live{" "}
              <code>useAgentContext</code> entries beneath it on every run, so
              nothing has to re-read state by hand.
            </>
          }
        />
      </Panel>

      <Panel title="Two discrepancies on this page">
        <Callout tone="warn" title="The backend example is Python, and it is LangGraph's">
          <p>
            This is the TypeScript Claude Agent SDK doc, but its
            &ldquo;agent reads config and rebuilds the system prompt&rdquo;
            example is <code>backend/agent.py</code> — a LangGraph node reading{" "}
            <code>state[&quot;copilotkit&quot;][&quot;context&quot;]</code>.
            None of that applies here.
          </p>
          <div className="mt-3">
            <CodeBlock
              code={DOC_BACKEND}
              language="python"
              filename="the doc's backend half, abridged — wrong language and wrong framework"
            />
          </div>
        </Callout>

        <div className="mt-4">
          <Callout tone="info" title="buildAgentConfigSystemPrompt takes forwardedProps, but the config arrives as context">
            The page&apos;s own TypeScript helper is keyed on{" "}
            <code>forwardedProps</code>. What{" "}
            <code>useAgentContext</code> actually produces is{" "}
            <code>input.context</code>, and the adapter&apos;s{" "}
            <code>ALLOWED_FORWARDED_PROPS</code> whitelist would drop these keys
            anyway. The helper is kept as published — its zero-argument default
            is what the agent starts from — and the live values arrive through
            the context addendum instead. Same behaviour, different channel than
            the page implies.
          </Callout>
        </div>
      </Panel>
    </>
  );
}
