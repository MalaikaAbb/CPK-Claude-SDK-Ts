import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/human-in-the-loop/governed-actions" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A checkpoint in front of every side effect. The agent never performs
          an action directly: it submits it to a policy engine on the agent
          server, which returns an envelope (id, reference, verdict). The UI
          renders that envelope and settles it — <code>allow</code> runs
          without asking, <code>deny</code> is blocked on sight, and{" "}
          <code>require_approval</code> waits for a click. The server executes
          only if the decision it receives matches the id and reference it
          issued, and it logs every step to a ledger shown beside the chat.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The demo has one tab per pattern on the page. They share the policy,
          the card and the ledger; they differ in how the run pauses.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <TryIt
            prompts={[
              "Apply a 20% discount for customer Globex.",
              "Email the Q3 pricing sheet to jane@globex.com.",
            ]}
            expect="A card reading “User approval required” with the policy reference (POL-DISC-030 / POL-EMAIL-002) and the exact arguments. Approve and run: the ledger row flips to approved · executed with a receipt, and the agent quotes that receipt. Reject: the row reads rejected · skipped and the agent says it did not run."
            fail="If the agent says it applied the discount without a card appearing, or the ledger shows executed without a click, the gate is not enforced."
          />
          <TryIt
            prompts={[
              "Open a low-priority ticket titled 'Printer jam on floor 3'.",
              "Delete customer record CUST-42.",
              "Give Initech a 50% discount.",
            ]}
            expect="The ticket (POL-TICKET-001) is auto-approved: the card flashes “Allowed by policy” and the ledger shows auto-approved · executed with no click. The delete (POL-CRM-009) and the 50% discount (POL-DISC-099) are “Blocked by policy”: the ledger shows blocked · skipped and the agent offers a safer path."
            fail="Any executed row for a deny verdict is a failure — deny must be terminal."
          />
        </div>
      </Panel>

      <Panel title="The two patterns in this framework">
        <div className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <p>
            <strong>
              <code>useInterrupt</code>
            </strong>{" "}
            — the policy tool raises a standard AG-UI interrupt, and the agent
            server rewrites the adapter&apos;s <code>RUN_FINISHED</code> into{" "}
            <code>outcome: {"{ type: \"interrupt\" }"}</code>.{" "}
            <code>resolve()</code> / <code>cancel()</code> start a new run
            carrying <code>resume[]</code>; the server runs the doc&apos;s{" "}
            <code>handleApproval</code> <em>before</em> the model sees
            anything, then prompts the model with the result.
          </p>
          <p>
            <strong>
              <code>useHumanInTheLoop</code>
            </strong>{" "}
            — the model copies the server&apos;s envelope into the frontend
            tool <code>approve_governed_action</code>; <code>respond()</code>{" "}
            becomes the tool result. The model then calls{" "}
            <code>execute_governed_action</code> with only the id, and the
            server reads the user&apos;s answer out of the thread&apos;s tool
            messages — so the model can talk about an approval but cannot
            forge one.
          </p>
        </div>
        <div className="mt-4">
          <Callout tone="info" title="Not part of the doc: the interrupt plumbing">
            <code>ClaudeAgentAdapter</code> has no interrupt support of its
            own — it always finishes with a plain <code>RUN_FINISHED</code>{" "}
            and ignores <code>resume</code>. The rewrite and the resume hook
            live in this repo&apos;s <code>agent-server.ts</code>. The
            frontend half is the doc&apos;s code unchanged. README §9.17.
          </Callout>
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCodeGroup
          files={[
            {
              file: "frontend/src/app/human-in-the-loop/governed-actions/demo-chat/page.tsx",
            },
            {
              file: "frontend/src/app/human-in-the-loop/governed-actions/governed-action-card.tsx",
            },
            {
              file: "frontend/src/app/human-in-the-loop/governed-actions/audit-ledger.tsx",
            },
          ]}
          note={
            <>
              Both hook components and <code>GovernedActionCard</code> are the
              doc&apos;s, plus an <code>agentId</code> on each hook. The ledger
              is this repo&apos;s — the page asks for an audit log and
              publishes no UI for one.
            </>
          }
        />
      </Panel>

      <Panel title="The server side">
        <div className="space-y-4">
          <SourceCode file="backend/src/agents/governed-actions.ts" />
          <SourceCode file="backend/src/agent-server.ts" region="backend-tools" />
        </div>
      </Panel>
    </>
  );
}
