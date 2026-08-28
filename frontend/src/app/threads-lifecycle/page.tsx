import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const SCOPING = `const runtime = new CopilotRuntime({
  agents: { default: agent },
  intelligence,
  identifyUser: async (request) => {
    const session = await verifyAppSession(request); // Your server-side auth.
    if (!session?.user) throw new Error("Unauthorized");

    return {
      id: session.user.id,
      name: session.user.name,
    };
  },
});`;

const SWITCHING = `// Restore a known conversation (explicit → replays history)
config?.setActiveThreadId(existingId, { explicit: true });

// Start a fresh, empty conversation (mints a new non-explicit id)
config?.startNewThread();`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/threads-lifecycle" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Where a <code>threadId</code> comes from, what makes history replay,
          and how switching to a known conversation differs from starting a
          fresh one. The left panel prints the live <code>threadId</code> and
          its <code>explicit</code> flag so you can watch both move.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Send a message, press New chat, and watch threadId change.",
              "Pick the first conversation and press Open conversation, then Set id, no replay.",
            ]}
            expect="Open conversation flips explicit to true and replays the history. Set id, no replay sets the same id but shows the welcome screen — same thread, no hydration."
            fail="Buttons that log “threadId is prop-controlled” mean a threadId prop crept back onto the chat; this route must not pass one."
          />
        </div>
      </Panel>

      <Panel title="explicit is the whole distinction">
        <CodeBlock
          code={SWITCHING}
          language="tsx"
          filename="from the doc page"
        />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          <code>explicit: true</code> (the default) treats the id as a known
          thread and replays its history. <code>explicit: false</code> sets the
          same id but shows the welcome screen.{" "}
          <code>startNewThread()</code> mints a fresh non-explicit id.
        </p>
      </Panel>

      <Panel title="Pick one source of truth">
        <Callout tone="warn" title="The setters no-op when a threadId prop is passed">
          <p>
            Both setters silently do nothing and log a warning when the{" "}
            <code>threadId</code> is prop-controlled. This route therefore
            passes no <code>threadId</code> prop at all, so the setters are
            authoritative;{" "}
            <a
              href="/headless-threads"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              Headless Threads
            </a>{" "}
            makes the opposite choice and drives the prop instead.
          </p>
          <p className="mt-2">
            Related footgun the doc calls out: a changed React{" "}
            <code>key</code> on the chat re-mints the fallback id and silently
            starts a new conversation. Headless Threads relies on that
            deliberately for its New-conversation button.
          </p>
        </Callout>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/threads-lifecycle/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Scoping threads to the signed-in user">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Threads are per-user, and <code>identifyUser</code> is what assigns
          them. The doc resolves a verified session; a local harness has none,
          so this repo reads two headers the provider sends and falls back to{" "}
          <code>anonymous</code>. Override{" "}
          <code>NEXT_PUBLIC_DEMO_USER_ID</code> in a second browser profile to
          watch two thread lists diverge.
        </p>
        <div className="mt-4">
          <CodeBlock
            code={SCOPING}
            language="ts"
            filename="the doc's version — a real session, not a header"
          />
        </div>
        <div className="mt-4">
          <Callout tone="warn" title="A static identity is a demo-only shortcut">
            The doc is explicit: a static <code>identifyUser</code> suits a
            single-user demo only. In a multi-user app every request must
            resolve the authenticated user, or they all share one thread scope.
            The header-reading version here is that shortcut, and it is why this
            route is a harness rather than a template.
          </Callout>
        </div>
      </Panel>

      <Panel title="The runtime half, as this repo builds it">
        <SourceCode file="frontend/src/app/api/copilotkit/[[...slug]]/route.ts" />
      </Panel>
    </>
  );
}
