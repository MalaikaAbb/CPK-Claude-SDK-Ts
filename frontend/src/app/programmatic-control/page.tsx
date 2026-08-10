import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const TWO_RUNAGENTS = `// Recommended default — orchestrates the full lifecycle:
// executes frontend tools, chains follow-up runs, routes errors
// through the subscriber system.
copilotkit.runAgent({ agent })

// Low-level. Sends the request, but does NOT execute frontend
// tools or chain follow-ups. Direct control only.
agent.runAgent(options)`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/programmatic-control" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Driving an agent from code rather than from a composer — a button, a
          form, a cron job, a keyboard shortcut. Three primitives cover every
          triggering pattern: <code>agent.addMessage</code> appends without
          running, <code>copilotkit.runAgent</code> starts a turn, and{" "}
          <code>agent.subscribe</code> gives you the raw AG-UI lifecycle.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Click “addMessage only”, then “runAgent” separately.",
              "Click “addMessage + runAgent”, then “stopAgent” mid-stream.",
            ]}
            expect="addMessage alone appends a line and nothing runs. runAgent then picks it up. stopAgent cuts the stream, and the event log on the right shows onRunStartedEvent → onRunFinalized for every turn."
            fail="An empty event log while messages stream means the subscriber never attached — check that the effect's cleanup is not tearing it down on every render."
          />
        </div>
      </Panel>

      <Panel title="It is an issue - half the code is missing and imports are missing">
        <Callout tone="warn" title="Missing code">
          <p>
           Missing imports and code 
          </p>
        </Callout>
      </Panel>

      <Panel title="Two runAgent methods, and which to use">
        <CodeBlock
          code={TWO_RUNAGENTS}
          language="ts"
          filename="from the doc page"
        />
      </Panel>

      <Panel title="This route does not compile">
        <Callout tone="warn" title="The page's headless-complete snippet is missing its own helpers and imports">
          <p>
            The demo file holds the page&apos;s <code>headless-complete</code>{" "}
            snippet <strong>verbatim</strong>. That snippet opens by
            destructuring three helpers it never defines anywhere on the page —{" "}
            <code>useAttachmentsConfig</code>, <code>useAutoScroll</code> and{" "}
            <code>buildContent</code> — and it also omits the imports for{" "}
            <code>useAgent</code> and <code>useCopilotKit</code>, which it calls
            on its first two lines.
          </p>
          <p className="mt-2">
            Six TypeScript errors result, and{" "}
            <code>next build</code> fails at the type-check step. That is the
            deliberate state of this route: the snippet is reproduced as
            published rather than completed, because inventing the three
            helpers would hide the fact that the page ships an example nobody
            can copy and run.
          </p>
          <p className="mt-2">
            Under <code>npm run dev</code> this demo route itself returns{" "}
            <strong>500</strong> when requested — the undefined names are real
            runtime errors, not only type errors. Every other route in the app
            still serves normally, and this notes page is unaffected.
          </p>
        </Callout>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/programmatic-control/demo-chat/page.tsx" />
      </Panel>

      
    </>
  );
}
