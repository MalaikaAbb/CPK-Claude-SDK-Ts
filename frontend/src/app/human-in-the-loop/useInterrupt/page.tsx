import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel } from "@/components/ui";

/**
 * https://docs.copilotkit.ai/claude-sdk-typescript/human-in-the-loop/useInterrupt
 * Reference-only: the page's Claude SDK code is missing upstream.
 */
export default function Page() {
  const link = "text-[var(--accent)] underline underline-offset-4";
  return (
    <>
      <RouteHeader path="/human-in-the-loop/useInterrupt" />

      <Panel title="What the page covers">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          For runtimes that can&apos;t suspend mid-tool, the page says the
          demo swaps <code>useInterrupt</code> for a{" "}
          <code>useFrontendTool</code> whose handler returns a Promise that the
          picker resolves (a <code>schedule_meeting</code> tool, with a backend
          prompted to call it). It then documents <code>useInterrupt</code>{" "}
          itself: the standard AG-UI flow (<code>RUN_FINISHED</code> with an{" "}
          <code>interrupt</code> outcome) versus the legacy{" "}
          <code>on_interrupt</code> custom event, <code>resolve</code> /{" "}
          <code>cancel</code> per interrupt id, and{" "}
          <code>responseSchema</code> being surfaced but never validated.
        </p>
      </Panel>

      <Callout tone="warn" title="Broken as published: the Claude SDK code is missing">
        <ul className="space-y-1.5">
          <li>
            · Both framework snippets render as missing on the live page: the
            frontend Promise handler (region{" "}
            <code>frontend-promise-handler</code>) and the backend instruction
            (region <code>backend-tool-call</code>) are absent for{" "}
            <code>claude-sdk-typescript::gen-ui-interrupt</code>, and the
            embedded demo has no Code tab. Nothing about{" "}
            <code>schedule_meeting</code> (schema, handler, picker, prompt) is
            published, so there is no demo to build.
          </li>
          <li>
            · The two snippets that are printed are framework-neutral{" "}
            <code>useInterrupt</code> render props. They need an agent that
            emits a standard interrupt, which the page does not show for this
            adapter. They are type-checked below, not mounted.
          </li>
          <li>
            · The page also links back to{" "}
            <Link href="/human-in-the-loop" className={link}>
              useHumanInTheLoop
            </Link>{" "}
            for LLM-initiated pauses, which works here.
          </li>
        </ul>
      </Callout>

      <Panel title="The printed snippets — type-checked only">
        <SourceCode file="frontend/src/app/human-in-the-loop/useInterrupt/_doc/snippets.tsx" />
      </Panel>
    </>
  );
}
