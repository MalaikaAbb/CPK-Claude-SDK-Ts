import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel } from "@/components/ui";

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
      </Panel>

      <Panel title="The page's components, verbatim">
        <SourceCodeGroup
          files={[{ file: `${DIR}/governed-action.tsx` }]}
          note="The page's three snippets in order. Type-checked, not mounted: there is no published agent to run them against."
        />
      </Panel>

      <Panel title="The resume handler — type-checked only">
        <SourceCode file={`${DIR}/_doc/handle-approval.ts`} />
      </Panel>

      <Callout tone="warn" title="What the page leaves out">
        <ul className="space-y-1.5">
          <li>
            · No agent, policy engine or backend tool that produces a{" "}
            <code>GovernedAction</code> is published, and none was added, so
            this route is reference-only and the components are not mounted.
          </li>
          <li>
            · The <code>useInterrupt</code> half needs an agent that raises an
            interrupt with <code>metadata.action</code>. This page shows none
            for the Claude SDK. Its{" "}
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
