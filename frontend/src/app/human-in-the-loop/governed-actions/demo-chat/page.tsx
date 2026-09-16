"use client";

import {
  CopilotChat,
  ToolCallStatus,
  useHumanInTheLoop,
  useInterrupt,
} from "@copilotkit/react-core/v2";
import { useState } from "react";
import { z } from "zod";

import { DemoFrame } from "@/components/demo-frame";

import { AuditLedger } from "../audit-ledger";
import {
  GovernedActionCard,
  type GovernedAction,
} from "../governed-action-card";

/**
 * Governed action approval — both patterns the page publishes, side by side.
 *
 * `GovernedActionApproval` and `GovernedActionTool` are the doc's components,
 * verbatim except for one line each: `agentId`. The doc's hooks bind to "the
 * current chat agent", and this app runs one provider for ~26 agents, so each
 * hook names the agent its tab talks to.
 *
 * What the doc leaves to you lives on the agent server
 * (`backend/src/agents/governed-actions.ts`): the policy engine that produces
 * each verdict, `handleApproval` + the side effect, and the audit ledger.
 *
 *   useInterrupt       `propose_governed_action` raises a standard AG-UI
 *                      interrupt; the run finishes with `outcome: interrupt`;
 *                      `resolve()` / `cancel()` start the resume run, and the
 *                      server executes before the model speaks again.
 *
 *   useHumanInTheLoop  the model hands the server's envelope to
 *                      `approve_governed_action`; `respond()` is the tool
 *                      result; `execute_governed_action` re-reads that result
 *                      from the thread before running anything.
 */

const INTERRUPT_AGENT = "governed-actions-interrupt";
const HITL_AGENT = "governed-actions-hitl";

// #region doc-use-interrupt
function GovernedActionApproval() {
  useInterrupt({
    agentId: INTERRUPT_AGENT,
    render: ({ interrupt, resolve, cancel }) => {
      const action = interrupt?.metadata?.action as GovernedAction | undefined;

      if (!action) {
        // The doc returns `null`; this hook's `render` is typed to return an
        // element, so an empty fragment says the same thing.
        return <></>;
      }

      return (
        <GovernedActionCard
          action={action}
          onApprove={() =>
            resolve({
              approved: true,
              actionId: action.id,
              reference: action.reference,
            })
          }
          onReject={() =>
            resolve({
              approved: false,
              actionId: action.id,
              reference: action.reference,
            })
          }
          onBlock={() => cancel()}
        />
      );
    },
  });

  return null;
}
// #endregion doc-use-interrupt

// #region doc-use-human-in-the-loop
const governedActionSchema = z.object({
  id: z.string(),
  summary: z.string(),
  tool: z.string(),
  reference: z.string(),
  verdict: z.enum(["allow", "deny", "require_approval"]),
  arguments: z.record(z.unknown()),
});

function GovernedActionTool() {
  useHumanInTheLoop(
    {
      agentId: HITL_AGENT,
      name: "approve_governed_action",
      description:
        "Ask the user to approve a governed side-effect action before it runs.",
      parameters: governedActionSchema,
      render: ({ args, status, respond }) => {
        if (status !== ToolCallStatus.Executing || !respond) {
          return null;
        }

        return (
          <GovernedActionCard
            action={args}
            onApprove={() =>
              respond({
                approved: true,
                actionId: args.id,
                reference: args.reference,
              })
            }
            onReject={() =>
              respond({
                approved: false,
                actionId: args.id,
                reference: args.reference,
              })
            }
            onBlock={() =>
              respond({
                approved: false,
                actionId: args.id,
                reference: args.reference,
              })
            }
          />
        );
      },
    },
    [],
  );

  return null;
}
// #endregion doc-use-human-in-the-loop

type Pattern = "interrupt" | "hitl";

const PATTERNS: { id: Pattern; label: string; agentId: string }[] = [
  { id: "interrupt", label: "useInterrupt", agentId: INTERRUPT_AGENT },
  { id: "hitl", label: "useHumanInTheLoop", agentId: HITL_AGENT },
];

function InterruptPane() {
  return (
    <>
      <GovernedActionApproval />
      <CopilotChat agentId={INTERRUPT_AGENT} />
    </>
  );
}

function HitlPane() {
  return (
    <>
      <GovernedActionTool />
      <CopilotChat agentId={HITL_AGENT} />
    </>
  );
}

export default function Page() {
  const [pattern, setPattern] = useState<Pattern>("interrupt");
  const active = PATTERNS.find((p) => p.id === pattern)!;

  return (
    <DemoFrame
      parentPath="/human-in-the-loop/governed-actions"
      subtitle={`agent: ${active.agentId}`}
    >
      <div className="flex h-full flex-col">
        <div
          role="tablist"
          className="flex shrink-0 gap-1 border-b border-slate-200 px-4 pt-2 dark:border-slate-800"
        >
          {PATTERNS.map((p) => (
            <button
              key={p.id}
              role="tab"
              type="button"
              aria-selected={p.id === pattern}
              data-testid={`governed-pattern-${p.id}`}
              onClick={() => setPattern(p.id)}
              className={`rounded-t-md border-b-2 px-3 py-1.5 font-mono text-xs ${
                p.id === pattern
                  ? "border-[var(--accent)] text-slate-900 dark:text-slate-100"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="min-w-0 flex-1">
            {/* Keyed, so switching tabs unmounts the other pattern's hook. */}
            {pattern === "interrupt" ? (
              <InterruptPane key="interrupt" />
            ) : (
              <HitlPane key="hitl" />
            )}
          </div>
          <aside className="hidden w-96 shrink-0 border-l border-slate-200 md:block dark:border-slate-800">
            <AuditLedger key={active.agentId} agentId={active.agentId} />
          </aside>
        </div>
      </div>
    </DemoFrame>
  );
}
