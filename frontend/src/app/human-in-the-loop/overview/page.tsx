import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const DIR = "frontend/src/app/human-in-the-loop/overview";

/**
 * https://docs.copilotkit.ai/claude-sdk-typescript/human-in-the-loop/index
 */
export default function Page() {
  const link = "text-[var(--accent)] underline underline-offset-4";
  return (
    <>
      <RouteHeader path="/human-in-the-loop/overview" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The overview contrasts two ways to stop a run for the user. For the
          Claude Agent SDK it recommends the first: an approval or picker
          modelled as an async frontend tool (<code>useHumanInTheLoop</code>),
          which the model calls, the UI answers through{" "}
          <code>respond</code>, and the same run continues. The second,{" "}
          <code>useInterrupt</code>, is described in LangGraph terms and
          deferred to its own page. The demo here is the page&apos;s Code tab,
          with suggestion pills.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Please book an intro call with the sales team to discuss pricing."]}
            expect="A time-slot picker appears in the chat and the run waits. Pick a slot: the agent's next message names that time. Not yet checked in a browser."
            fail="The agent invents a time with no picker (it answered in prose instead of calling book_call), or clicking a slot does nothing (respond never fired)."
          />
        </div>
      </Panel>

      <Panel title="The demo — from the Code tab">
        <SourceCodeGroup
          files={[
            { file: `${DIR}/_demo/page.tsx` },
            { file: `${DIR}/_demo/time-picker-card.tsx` },
            { file: `${DIR}/demo-chat/page.tsx` },
          ]}
          note="The first file is the Code tab's page.tsx, unchanged. time-picker-card.tsx re-exports this repo's own card, because the Code tab imports one it never shows."
        />
      </Panel>

      <Callout tone="warn" title="What the page leaves out">
        <ul className="space-y-1.5">
          <li>
            · <code>./time-picker-card</code> is imported and never published;
            the repo&apos;s existing card (from{" "}
            <Link href="/human-in-the-loop" className={link}>
              /human-in-the-loop
            </Link>
            ) stands in.
          </li>
          <li>
            · The Code tab&apos;s <code>src/app/api/copilotkit/route.ts</code>{" "}
            is the showcase&apos;s main runtime (unpublished{" "}
            <code>createClaudeHttpAgent</code>, <code>internalRuntimeErrorResponse</code>{" "}
            and <code>withCvdiagBackend</code>, every agent at{" "}
            <code>{"${AGENT_URL}/"}</code>). It is not copied: this repo&apos;s
            main runtime already registers <code>hitl-in-chat</code>, whose
            agent runs the Quickstart prompt (no backend is published for it).
          </li>
          <li>
            · Pattern 2 (<code>useInterrupt</code>) points at an embedded{" "}
            <code>gen-ui-interrupt</code> demo whose Claude SDK code is missing
            from the docs; see{" "}
            <Link href="/human-in-the-loop/useInterrupt" className={link}>
              Pausing the Agent for Input
            </Link>
            .
          </li>
        </ul>
      </Callout>
    </>
  );
}
