"use client";

import { useEffect } from "react";

/**
 * The doc's `GovernedAction` envelope and `GovernedActionCard`.
 * https://docs.copilotkit.ai/claude-sdk-typescript/human-in-the-loop/governed-actions
 *
 * Structure, props, status copy and the verdict-handling effect are the
 * page's. Three changes, all presentational:
 *
 *   - `text-muted-foreground` / `bg-muted` are shadcn tokens this app does not
 *     define, so they are swapped for the slate equivalents.
 *   - The doc's buttons are unstyled; here they look like buttons.
 *   - `data-testid`s, so the autorecorder can find the card without reading
 *     model-written text.
 */

// #region envelope
export type GovernedAction = {
  id: string;
  summary: string;
  tool: string;
  reference: string;
  verdict: "allow" | "deny" | "require_approval";
  arguments: Record<string, unknown>;
};
// #endregion envelope

// #region card
export function GovernedActionCard({
  action,
  onApprove,
  onReject,
  onBlock,
}: {
  action: GovernedAction;
  onApprove: () => void;
  onReject: () => void;
  onBlock: () => void;
}) {
  useEffect(() => {
    if (action.verdict === "allow") onApprove();
    if (action.verdict === "deny") onBlock();
    // The doc keys this on the action alone, so a re-render with fresh
    // callback identities cannot settle the same action twice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action.id, action.verdict]);

  const status =
    action.verdict === "allow"
      ? "Allowed by policy"
      : action.verdict === "deny"
        ? "Blocked by policy"
        : "User approval required";

  return (
    <section
      className="max-w-lg rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      data-testid="governed-action-card"
      data-verdict={action.verdict}
    >
      <div className="space-y-1">
        <p
          className={`text-sm font-medium ${
            action.verdict === "allow"
              ? "text-emerald-700 dark:text-emerald-400"
              : action.verdict === "deny"
                ? "text-rose-700 dark:text-rose-400"
                : "text-amber-700 dark:text-amber-400"
          }`}
        >
          {status}
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {action.summary}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Tool: {action.tool}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Reference: {action.reference}
        </p>
      </div>

      <pre className="mt-3 overflow-auto rounded bg-slate-100 p-3 text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
        {JSON.stringify(action.arguments, null, 2)}
      </pre>

      {action.verdict === "require_approval" && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onApprove}
            data-testid="governed-action-approve"
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Approve and run
          </button>
          <button
            type="button"
            onClick={onReject}
            data-testid="governed-action-reject"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Reject
          </button>
        </div>
      )}
    </section>
  );
}
// #endregion card
