import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { Callout, Panel } from "@/components/ui";

/**
 * https://docs.copilotkit.ai/claude-sdk-typescript/human-in-the-loop/headless
 * Reference-only: the page publishes no code for this framework.
 */
export default function Page() {
  const link = "text-[var(--accent)] underline underline-offset-4";
  return (
    <>
      <RouteHeader path="/human-in-the-loop/headless" />

      <Panel title="What the page covers">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A resolver with no render slot: the interrupt is answered from any
          part of the app (button grid, form, modal) instead of the chat. For
          promise-based integrations like this one, the page says the pattern
          is a <code>useFrontendTool</code> whose handler parks its{" "}
          <code>resolve</code> in a ref keyed by tool-call id, publishes the
          pending payload through React state for an &ldquo;app
          surface&rdquo; to render, and returns <code>null</code> from{" "}
          <code>render</code> so the chat stays clean.
        </p>
      </Panel>

      <Callout tone="warn" title="Broken as published: no code on the page">
        <ul className="space-y-1.5">
          <li>
            · The page&apos;s only snippet is missing for this framework: the{" "}
            <code>.md</code> export reads{" "}
            <code>
              snippet skipped: region &apos;headless-promise-primitives&apos;
              missing in claude-sdk-typescript::interrupt-headless
            </code>
            , the rendered page shows no code, and the embedded{" "}
            <code>interrupt-headless</code> demo has no Code tab.
          </li>
          <li>
            · With no tool name, schema, handler, app surface or agent
            published, there is nothing to reproduce, so this route has no
            demo. It is not filled in from another framework.
          </li>
          <li>
            · Related routes that do run here:{" "}
            <Link href="/human-in-the-loop" className={link}>
              useHumanInTheLoop
            </Link>{" "}
            and{" "}
            <Link href="/frontend-tools" className={link}>
              Frontend Tools
            </Link>
            .
          </li>
        </ul>
      </Callout>
    </>
  );
}
