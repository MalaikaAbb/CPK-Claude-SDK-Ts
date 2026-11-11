// The "On resume" snippet on
// https://docs.copilotkit.ai/claude-sdk-typescript/human-in-the-loop/governed-actions
// verbatim below the marker. Type-checked, never run: `_doc` is a private
// folder and nothing imports it. The page puts this on the agent side and
// never defines `executeSideEffect` (suppressed, not filled in). Harness glue:
// the type import.
import type { GovernedAction } from "../governed-action";

// --- snippet ---
type ApprovalResponse = {
  approved: boolean;
  actionId: string;
  reference: string;
};

async function handleApproval(action: GovernedAction, response: ApprovalResponse) {
  if (
    response.approved &&
    response.actionId === action.id &&
    response.reference === action.reference
  ) {
    // @ts-expect-error verbatim doc code: `executeSideEffect` is never defined on the page (TS2304)
    return executeSideEffect(action.tool, action.arguments);
  }

  return {
    skipped: true,
    reason: "The user did not approve this action.",
  };
}
