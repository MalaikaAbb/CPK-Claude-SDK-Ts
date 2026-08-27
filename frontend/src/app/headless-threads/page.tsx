import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const PAGINATION = `const {
  threads,
  hasMoreThreads,
  isFetchingMoreThreads,
  fetchMoreThreads,
} = useThreads({
  agentId: "my-agent",
  limit: 20,
});`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/headless-threads" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The same thread data as the drawer, through{" "}
          <code>useThreads</code>, with a list you build yourself. The hook
          returns the threads plus <code>renameThread</code>,{" "}
          <code>archiveThread</code>, <code>deleteThread</code>,{" "}
          <code>startNewThread</code> and cursor pagination. The list stays
          synchronized over a WebSocket, so a thread created in another tab
          appears here without polling.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Send a message, then press Rename on its row.",
              "Open this route in a second tab and send a message there.",
            ]}
            expect="Rename retitles the row to “Renamed”. A thread created in the other tab appears in this one on its own — that is the realtime sync."
            fail="Buttons that do nothing mean the runtime is in SSE mode: /info reports mutations: false, so rename/archive/delete have no endpoint to call."
          />
        </div>
      </Panel>

      <Panel title="Archive is not delete">
        <Callout tone="info" title="One is reversible, the other is not">
          <code>archiveThread</code> is a soft delete — the row stays in the
          database and is hidden from the default list; pass{" "}
          <code>includeArchived: true</code> to see it.{" "}
          <code>deleteThread</code> is permanent. Neither ships a confirmation
          dialog, so the Delete button on this demo fires immediately, exactly
          as the doc warns.
        </Callout>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/headless-threads/demo-chat/page.tsx" />
      </Panel>

      <Panel title="“New conversation” takes two steps, not one">
        <Callout tone="warn" title="useThreads.startNewThread does not touch the chat">
          <p>
            <code>useThreads().startNewThread()</code> clears the list
            selection and nothing else — it never changes the chat&apos;s{" "}
            <code>threadId</code>. The setter that does lives on the chat
            configuration, and it is unavailable here on two counts: this demo
            mounts no <code>CopilotChatConfigurationProvider</code>, and its
            chat is prop-controlled, which the Lifecycle page says makes those
            setters no-op and log a warning.
          </p>
          <p className="mt-2">
            Clearing the prop to <code>undefined</code> is not enough either:
            with no prop the chat falls through to a fallback id minted once at
            mount, so clearing returns to the <em>same</em> id and the button
            looks dead. Bumping a React <code>key</code> forces the remount that
            re-runs that computation — which is what this demo does.
          </p>
          <p className="mt-2">
            The provider-driven alternative is on{" "}
            <a
              href="/threads-lifecycle"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              Thread &amp; History Lifecycle
            </a>
            . The two routes are the two halves of the doc&apos;s &ldquo;pick
            one source of truth&rdquo; rule.
          </p>
        </Callout>
      </Panel>

      <Panel title="Pagination">
        <CodeBlock
          code={PAGINATION}
          language="tsx"
          filename="from the doc page — `limit` is what turns the cursor on"
        />
      </Panel>
    </>
  );
}
