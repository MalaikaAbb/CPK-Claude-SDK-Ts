import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const DIR = "frontend/src/app/human-in-the-loop/governed-actions";

/**
 * https://docs.copilotkit.ai/claude-sdk-typescript/human-in-the-loop/governed-actions
 */
export default function Page() {
  const link = "text-[var(--accent)] underline underline-offset-4";
  return (
    <>
      <RouteHeader path="/human-in-the-loop/governed-actions" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A checkpoint in front of a side effect. The agent proposes a{" "}
          <code>GovernedAction</code> (id, summary, tool, reference, verdict,
          arguments); <code>allow</code> runs without asking,{" "}
          <code>deny</code> blocks, and <code>require_approval</code> shows a
          card that runs the action only on approval. The page gives two
          transports for the same card: an interrupt read by{" "}
          <code>useInterrupt</code>, or a human-in-the-loop tool,{" "}
          <code>approve_governed_action</code>, whose result tells the agent
          whether to go on.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Before you email the customer a 15% discount, ask me to approve it with approve_governed_action (verdict require_approval).",
            ]}
            expect="useHumanInTheLoop tab: a card with the summary, tool, reference and arguments, plus Approve and run / Reject; your choice comes back to the agent as { approved, actionId, reference }. useInterrupt tab: no card ever appears (see below). Not yet checked in a browser."
            fail="No card on the first tab means the model never called approve_governed_action; the page gives it no prompt or policy that would make it do so, so name the tool explicitly."
          />
        </div>
      </Panel>

      <Panel title="The page's components, verbatim">
        <SourceCodeGroup
          files={[{ file: `${DIR}/governed-action.tsx` }, { file: `${DIR}/demo-chat/page.tsx` }]}
          note="The first file is the page's three snippets in order. The second is harness glue: two tabs and a chat on the governed-actions agent."
        />
      </Panel>

      <Panel title="The resume handler — type-checked only">
        <SourceCode file={`${DIR}/_doc/handle-approval.ts`} />
      </Panel>

      <Callout tone="warn" title="What the page leaves out">
        <ul className="space-y-1.5">
          <li>
            · No agent, policy engine or backend tool that produces a{" "}
            <code>GovernedAction</code> is published.{" "}
            <code>governed-actions</code> is the Quickstart agent (Quickstart
            prompt, no tools), so verdicts and references are whatever the
            model writes into the tool call.
          </li>
          <li>
            · The <code>useInterrupt</code> half needs an agent that raises an
            interrupt with <code>metadata.action</code>. This page shows none
            for the Claude SDK, so its card never appears. Its{" "}
            <code>render</code> also returns <code>null</code>, which the
            installed types reject (suppressed with{" "}
            <code>@ts-expect-error</code>).
          </li>
          <li>
            · <code>handleApproval</code> calls <code>executeSideEffect</code>,
            defined nowhere; it is type-checked with the call suppressed and
            never run.
          </li>
          <li>
            · An older copy of the <code>useInterrupt</code> card on the{" "}
            <code>hitl-in-chat</code> agent is still linked from{" "}
            <Link href="/human-in-the-loop" className={link}>
              /human-in-the-loop
            </Link>
            .
          </li>
        </ul>
      </Callout>
    </>
  );
}
