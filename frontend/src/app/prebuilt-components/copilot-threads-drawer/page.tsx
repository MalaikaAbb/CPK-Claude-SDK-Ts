import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const SLOTS = `<CopilotThreadsDrawer>
  <span slot="header">My conversations</span>
</CopilotThreadsDrawer>`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/prebuilt-components/copilot-threads-drawer" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A conversation sidebar with <strong>no active-thread state of your
          own</strong>. Wrap the drawer and the chat in one{" "}
          <code>CopilotChatConfigurationProvider</code> and that shared
          configuration holds the active thread: selecting a row connects the
          chat and replays its history, and &ldquo;New Conversation&rdquo;
          resets it to a fresh welcome screen. No <code>threadId</code> state,
          no selection handler, no props between the two.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Send a message, then press New Conversation and send another.",
              "Click back to the first row.",
            ]}
            expect="Two rows in the drawer, auto-named by the LLM after the first message. Clicking a row replays that conversation in the chat."
            fail="A locked “Threads are a CopilotKit Intelligence feature” panel means the license gate — see below. An empty list with the chat working means the runtime is in SSE mode."
          />
        </div>
      </Panel>

      <Panel title="Two independent gates, and they fail differently">
        <Callout tone="warn" title="Intelligence mode and the feature license are separate">
          <p>
            <code>INTELLIGENCE_API_KEY</code> is what makes{" "}
            <code>/info</code> report <code>mode: &quot;intelligence&quot;</code>{" "}
            and what makes the thread endpoints return real rows. It does{" "}
            <em>not</em> advertise a license.
          </p>
          <p className="mt-2">
            <code>COPILOTKIT_LICENSE_TOKEN</code> is what does. The runtime
            builds a license checker from it and <code>/info</code> reports{" "}
            <code>licenseStatus</code> off that checker.{" "}
            <code>&lt;CopilotThreadsDrawer&gt;</code> gates its UI on{" "}
            <em>that field</em>, not on the Intelligence key — so a runtime can
            serve threads perfectly while every drawer shows an Upgrade button.
          </p>
          <p className="mt-2">
            The{" "}
            <a
              href="/quickstart"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              Quickstart
            </a>{" "}
            connection panel reports both axes separately for exactly this
            reason.
          </p>
        </Callout>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/prebuilt-components/copilot-threads-drawer/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Customization">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The drawer renders in a shadow root with self-contained,
          theme-inheriting styles. Three bounded escape hatches pierce that
          boundary: named <code>slot</code> children (
          <code>header</code>, <code>empty</code>, <code>footer</code>,{" "}
          <code>memories</code>, <code>launcher-icon</code>), the{" "}
          <code>renderRow</code> prop for per-row content, and CSS{" "}
          <code>::part()</code>s plus <code>--cpk-drawer-*</code> tokens.
        </p>
        <div className="mt-4">
          <CodeBlock code={SLOTS} language="tsx" filename="from the doc page" />
        </div>
      </Panel>

      <Panel title="What the drawer cannot do">
        <Callout tone="info" title="Rename is headless-only">
          The row menu covers archive, unarchive and delete. Rename is a{" "}
          <code>useThreads</code> action the drawer never surfaces, which the
          doc names as the main reason to reach for{" "}
          <a
            href="/headless-threads"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Headless Threads
          </a>
          .
        </Callout>
      </Panel>

      <Panel title="The runtime this depends on">
        <SourceCode file="frontend/src/app/api/copilotkit/[[...slug]]/route.ts" />
      </Panel>
    </>
  );
}
