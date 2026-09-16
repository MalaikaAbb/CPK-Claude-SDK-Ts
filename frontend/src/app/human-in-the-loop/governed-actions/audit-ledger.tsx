"use client";

import { useAgent, UseAgentUpdate } from "@copilotkit/react-core/v2";

import type { GovernedAction } from "./governed-action-card";

/**
 * The audit trail the page's last guardrail asks for: proposal, verdict,
 * decision, execution result.
 *
 * The page publishes no UI for it. The agent server writes one entry per
 * proposal into shared state (`governedActions`) and rewrites it when the
 * action settles, so this panel is just a `useAgent` subscription — and,
 * because nothing in the browser can execute a side effect, the only place
 * an "executed" row can come from is the server.
 */

type AuditEntry = GovernedAction & {
  reason: string;
  decision: "pending" | "approved" | "rejected" | "blocked" | "auto-approved";
  outcome: "awaiting-decision" | "executed" | "skipped";
  result?: { receipt?: string; reason?: string };
  at: string;
};

const DECISION_STYLE: Record<AuditEntry["decision"], string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  "auto-approved":
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  rejected: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  blocked: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
};

export function AuditLedger({ agentId }: { agentId: string }) {
  const { agent } = useAgent({
    agentId,
    updates: [UseAgentUpdate.OnStateChanged],
  });
  const entries =
    ((agent.state ?? {}) as { governedActions?: AuditEntry[] })
      .governedActions ?? [];

  return (
    <div className="flex h-full flex-col" data-testid="governed-audit-ledger">
      <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Audit ledger
        </h2>
        <p className="text-xs text-slate-500">
          Written by the agent server — shared state key{" "}
          <code>governedActions</code>
        </p>
      </div>

      <ol className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {entries.length === 0 && (
          <li className="text-sm text-slate-500">
            No actions proposed yet. Ask the agent to send an email, apply a
            discount, open a ticket, or change a record.
          </li>
        )}
        {[...entries].reverse().map((entry) => (
          <li
            key={entry.id}
            data-testid="governed-audit-entry"
            data-decision={entry.decision}
            data-outcome={entry.outcome}
            className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {entry.summary}
              </p>
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase ${DECISION_STYLE[entry.decision]}`}
              >
                {entry.decision}
              </span>
            </div>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs text-slate-600 dark:text-slate-400">
              <dt>Tool</dt>
              <dd className="font-mono">{entry.tool}</dd>
              <dt>Verdict</dt>
              <dd className="font-mono">
                {entry.verdict} · {entry.reference}
              </dd>
              <dt>Policy</dt>
              <dd>{entry.reason}</dd>
              <dt>Outcome</dt>
              <dd
                className={
                  entry.outcome === "executed"
                    ? "font-semibold text-emerald-700 dark:text-emerald-400"
                    : ""
                }
              >
                {entry.outcome}
                {entry.result?.receipt && (
                  <>
                    {" "}
                    · receipt{" "}
                    <code data-testid="governed-audit-receipt">
                      {entry.result.receipt}
                    </code>
                  </>
                )}
                {entry.outcome === "skipped" && entry.result?.reason && (
                  <> — {entry.result.reason}</>
                )}
              </dd>
              <dt>Action id</dt>
              <dd className="font-mono">{entry.id}</dd>
            </dl>
          </li>
        ))}
      </ol>
    </div>
  );
}
