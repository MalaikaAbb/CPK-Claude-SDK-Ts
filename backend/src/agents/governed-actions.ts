/**
 * Governed actions: a server-side policy check in front of every side effect.
 * https://docs.copilotkit.ai/claude-sdk-typescript/human-in-the-loop/governed-actions
 *
 * The page publishes the envelope (`GovernedAction`), the resume payload
 * (`ApprovalResponse`) and `handleApproval`, and leaves the rest to you: the
 * policy engine, `executeSideEffect`, and the wiring that gets an envelope to
 * the UI. Its guardrails say what that wiring has to guarantee — the verdict
 * comes from the server, approvals are pinned to an action id + reference,
 * `deny` is terminal, and every step is logged. That is what this file is.
 *
 * Two agents share it, one per pattern on the page:
 *
 *   governed-actions-interrupt  `useInterrupt`. `propose_governed_action`
 *                               raises an AG-UI interrupt; the run ends with
 *                               `outcome: interrupt`; the user's decision comes
 *                               back as `resume[]` and `handleApproval` runs
 *                               here, before the model sees anything.
 *
 *   governed-actions-hitl       `useHumanInTheLoop`. The model passes the
 *                               envelope to the frontend tool
 *                               `approve_governed_action`, then calls
 *                               `execute_governed_action`, which reads the
 *                               user's answer out of the thread — never out of
 *                               the model's own arguments — before running.
 *
 * Nothing here sends real email or writes a real record. `executeSideEffect`
 * returns a receipt and the audit ledger in shared state is the "outbox".
 */

import type { Message, ResumeEntry } from "@ag-ui/core";
import type Anthropic from "@anthropic-ai/sdk";
import { randomUUID } from "node:crypto";

import type { BackendToolContext, ExecuteTool } from "./backend-tool-server";

// #region envelope
/** The doc's envelope, verbatim. */
export type GovernedAction = {
  id: string;
  summary: string;
  tool: string;
  reference: string;
  verdict: "allow" | "deny" | "require_approval";
  arguments: Record<string, unknown>;
};

/** The doc's resume payload, verbatim. */
type ApprovalResponse = {
  approved: boolean;
  actionId: string;
  reference: string;
};
// #endregion envelope

// #region policy
/**
 * The policy engine. The doc is deliberately vendor-neutral here — any engine
 * works as long as it produces a verdict and a reference — so this one is a
 * table of rules small enough to read at a glance. Each rule's id becomes the
 * envelope's `reference`, which is what pins an approval to *this* decision.
 */
const INTERNAL_DOMAIN = "acme.test";

type PolicyDecision = Pick<GovernedAction, "verdict" | "reference"> & {
  reason: string;
};

function evaluatePolicy(
  tool: string,
  args: Record<string, unknown>,
): PolicyDecision {
  switch (tool) {
    case "send_email": {
      const to = String(args.to ?? "");
      return to.toLowerCase().endsWith(`@${INTERNAL_DOMAIN}`)
        ? {
            verdict: "allow",
            reference: "POL-EMAIL-001",
            reason: `Internal recipients (@${INTERNAL_DOMAIN}) need no sign-off.`,
          }
        : {
            verdict: "require_approval",
            reference: "POL-EMAIL-002",
            reason: "Email leaving the company needs a human to sign off.",
          };
    }
    case "apply_discount": {
      const percent = Number(args.percent ?? NaN);
      if (!Number.isFinite(percent)) {
        return {
          verdict: "deny",
          reference: "POL-DISC-000",
          reason: "A discount needs a numeric `percent`.",
        };
      }
      if (percent <= 10) {
        return {
          verdict: "allow",
          reference: "POL-DISC-010",
          reason: "Discounts up to 10% are pre-approved.",
        };
      }
      if (percent <= 30) {
        return {
          verdict: "require_approval",
          reference: "POL-DISC-030",
          reason: "Discounts between 10% and 30% need a manager's approval.",
        };
      }
      return {
        verdict: "deny",
        reference: "POL-DISC-099",
        reason: "Discounts above 30% are never allowed.",
      };
    }
    case "create_ticket":
      return {
        verdict: "allow",
        reference: "POL-TICKET-001",
        reason: "Opening a ticket is low-risk and reversible.",
      };
    case "update_record":
      return {
        verdict: "require_approval",
        reference: "POL-CRM-002",
        reason: "Edits to customer records need a human to confirm.",
      };
    case "delete_record":
      return {
        verdict: "deny",
        reference: "POL-CRM-009",
        reason: "Deleting customer records is not permitted from chat.",
      };
    default:
      return {
        verdict: "deny",
        reference: "POL-DEFAULT-DENY",
        reason: `\`${tool}\` is not a governed tool, so it is denied by default.`,
      };
  }
}

export const GOVERNED_TOOLS = [
  "send_email",
  "apply_discount",
  "create_ticket",
  "update_record",
  "delete_record",
] as const;
// #endregion policy

// #region execution
/**
 * The side effect itself — simulated. The receipt is what the audit ledger
 * shows as the execution result.
 */
function executeSideEffect(tool: string, args: Record<string, unknown>) {
  const receipt = `${tool.split("_")[0].toUpperCase()}-${randomUUID().slice(0, 8)}`;
  return { executed: true, tool, receipt, arguments: args };
}

/** The doc's `handleApproval`, verbatim. */
async function handleApproval(action: GovernedAction, response: ApprovalResponse) {
  if (
    response.approved &&
    response.actionId === action.id &&
    response.reference === action.reference
  ) {
    return executeSideEffect(action.tool, action.arguments);
  }

  return {
    skipped: true,
    reason: "The user did not approve this action.",
  };
}
// #endregion execution

// #region ledger
/**
 * Every proposal the server has issued, by id. Server memory, not shared
 * state: shared state round-trips through the browser, and the guardrails say
 * the verdict must not be something the client can rewrite.
 */
const proposals = new Map<
  string,
  GovernedAction & { reason: string; settled: boolean }
>();

export type AuditDecision =
  | "pending"
  | "approved"
  | "rejected"
  | "blocked"
  | "auto-approved";

export interface AuditEntry {
  id: string;
  summary: string;
  tool: string;
  reference: string;
  verdict: GovernedAction["verdict"];
  reason: string;
  decision: AuditDecision;
  outcome: "awaiting-decision" | "executed" | "skipped";
  result?: unknown;
  at: string;
}

export interface GovernedState {
  governedActions?: AuditEntry[];
}

function writeAudit(context: BackendToolContext, entry: AuditEntry) {
  const state = context.getState() as GovernedState & Record<string, unknown>;
  const log = [...(state.governedActions ?? [])];
  const index = log.findIndex((e) => e.id === entry.id);
  if (index >= 0) log[index] = entry;
  else log.push(entry);
  context.setState({ ...state, governedActions: log });
}

function propose(
  args: Record<string, unknown>,
  context: BackendToolContext,
): GovernedAction & { reason: string } {
  const tool = String(args.tool ?? "");
  const summary = String(args.summary ?? tool);
  const toolArgs =
    args.arguments && typeof args.arguments === "object"
      ? (args.arguments as Record<string, unknown>)
      : {};

  const decision = evaluatePolicy(tool, toolArgs);
  const action = {
    id: `act_${randomUUID().slice(0, 12)}`,
    summary,
    tool,
    reference: decision.reference,
    verdict: decision.verdict,
    arguments: toolArgs,
  } satisfies GovernedAction;

  proposals.set(action.id, { ...action, reason: decision.reason, settled: false });
  writeAudit(context, {
    ...action,
    reason: decision.reason,
    decision: "pending",
    outcome: "awaiting-decision",
    at: new Date().toISOString(),
  });
  console.log(
    `[governed] proposed ${action.id} ${tool} → ${action.verdict} (${action.reference})`,
  );
  return { ...action, reason: decision.reason };
}

/**
 * Settle one proposal exactly once: record the decision, run `handleApproval`,
 * log the result. `deny` is terminal — no response can execute it.
 */
async function settle(
  actionId: string,
  response: ApprovalResponse | null,
  cancelled: boolean,
  context: BackendToolContext,
) {
  const stored = proposals.get(actionId);
  if (!stored) {
    return { skipped: true, reason: `Unknown action id ${actionId}.` };
  }
  if (stored.settled) {
    return {
      skipped: true,
      reason: `Action ${actionId} was already settled; approvals cannot be replayed.`,
    };
  }
  stored.settled = true;

  const { reason, settled: _settled, ...action } = stored;

  let decision: AuditDecision;
  let result: unknown;
  if (action.verdict === "deny" || cancelled) {
    decision = "blocked";
    result = {
      skipped: true,
      reason:
        action.verdict === "deny"
          ? `Blocked by policy ${action.reference}: ${reason}`
          : "The user cancelled this action.",
    };
  } else {
    decision = response?.approved
      ? action.verdict === "allow"
        ? "auto-approved"
        : "approved"
      : "rejected";
    result = await handleApproval(
      action,
      response ?? { approved: false, actionId, reference: "" },
    );
  }

  const executed = (result as { executed?: boolean }).executed === true;
  writeAudit(context, {
    ...action,
    reason,
    decision,
    outcome: executed ? "executed" : "skipped",
    result,
    at: new Date().toISOString(),
  });
  console.log(`[governed] settled ${actionId}: ${decision} → ${executed ? "executed" : "skipped"}`);
  return { actionId, tool: action.tool, reference: action.reference, decision, result };
}
// #endregion ledger

// #region tool-schemas
const PROPOSE_SCHEMA: Anthropic.Tool = {
  name: "propose_governed_action",
  description:
    "Submit a side-effect action to the policy engine BEFORE doing it. Returns the governed action envelope (id, reference, verdict). Never claim an action happened without going through this.",
  input_schema: {
    type: "object",
    properties: {
      tool: {
        type: "string",
        enum: [...GOVERNED_TOOLS],
        description: "Which side-effect tool the action uses.",
      },
      summary: {
        type: "string",
        description: "One short human-readable line describing the action.",
      },
      arguments: {
        type: "object",
        description:
          "The exact arguments for the tool. send_email: {to, subject, body}. apply_discount: {customer, percent}. create_ticket: {title, priority}. update_record: {recordId, field, value}. delete_record: {recordId}.",
      },
    },
    required: ["tool", "summary", "arguments"],
  },
};

const EXECUTE_SCHEMA: Anthropic.Tool = {
  name: "execute_governed_action",
  description:
    "Run a governed action after the user has answered approve_governed_action for it. The server checks the user's recorded answer itself; pass only the id.",
  input_schema: {
    type: "object",
    properties: {
      action_id: {
        type: "string",
        description: "The `id` from the envelope.",
      },
    },
    required: ["action_id"],
  },
};
// #endregion tool-schemas

// ── Pattern 1: useInterrupt ──────────────────────────────────────────────────

export const INTERRUPT_TOOL_SCHEMAS: Anthropic.Tool[] = [PROPOSE_SCHEMA];

export const executeInterruptTool: ExecuteTool = (name, input, context) => {
  if (name !== PROPOSE_SCHEMA.name) {
    throw new Error(`Unknown backend tool: ${name}`);
  }
  const { reason, ...action } = propose(input, context);

  // The run ends on this. `agent-server.ts` turns the adapter's RUN_FINISHED
  // into `outcome: { type: "interrupt" }` carrying this interrupt, which is
  // what `useInterrupt` renders from — `interrupt.metadata.action`.
  context.interrupt?.({
    id: action.id,
    reason: "governed_action",
    message: `${action.summary} — ${reason}`,
    metadata: { action },
  });

  return {
    status: "awaiting_user_decision",
    id: action.id,
    verdict: action.verdict,
    reference: action.reference,
    instruction:
      "Stop here. The user is being shown this action. In ONE short sentence say what you proposed and that it is waiting on the policy/user decision, then end your turn. Do not claim it happened.",
  };
};

/**
 * The resumed run. The user's decision arrives as `resume[]`; each entry is
 * settled here, before the model runs, and the model is handed the result as
 * its next prompt so it can report what actually happened.
 */
export async function resumeInterrupt(
  entries: ResumeEntry[],
  context: BackendToolContext,
): Promise<string> {
  const results = [];
  for (const entry of entries) {
    const payload = (entry.payload ?? null) as ApprovalResponse | null;
    results.push(
      await settle(entry.interruptId, payload, entry.status === "cancelled", context),
    );
  }
  return (
    "[governed-action outcome — produced by the server, not typed by the user]\n" +
    JSON.stringify(results, null, 2) +
    "\nReport this outcome to the user in one or two sentences, quoting the receipt if there is one. If something was blocked or rejected, say so plainly and suggest a safer alternative. Do not retry it, and do not call any tool — the ledger is already updated."
  );
}

export const GOVERNED_INTERRUPT_SYSTEM_PROMPT = `You are an operations assistant embedded in a CopilotKit app. You can send email, apply discounts, create tickets, update customer records and delete customer records — but ONLY through the policy engine.

For every such request, call \`propose_governed_action\` exactly once with the tool name, a one-line summary and the exact arguments, then stop as the tool result instructs. Never say an action happened until you receive a governed-action outcome message from the server. Handle one action per turn. The server keeps the \`governedActions\` audit ledger in shared state itself — never call \`ag_ui_update_state\` to edit it.`;

// ── Pattern 2: useHumanInTheLoop ─────────────────────────────────────────────

export const HITL_TOOL_SCHEMAS: Anthropic.Tool[] = [PROPOSE_SCHEMA, EXECUTE_SCHEMA];

/**
 * The user's answer, read from the thread. `approve_governed_action` is a
 * frontend tool, so its result is a `tool` message the browser added — the
 * model can mention an approval, but it cannot author one.
 */
function findApproval(
  messages: Message[],
  actionId: string,
): ApprovalResponse | null {
  const approvalCallIds = new Set<string>();
  for (const message of messages) {
    if (message.role === "assistant") {
      for (const call of message.toolCalls ?? []) {
        if (call.function.name === "approve_governed_action") {
          approvalCallIds.add(call.id);
        }
      }
    }
  }

  let found: ApprovalResponse | null = null;
  for (const message of messages) {
    if (message.role !== "tool" || !approvalCallIds.has(message.toolCallId)) {
      continue;
    }
    try {
      const parsed = JSON.parse(String(message.content)) as ApprovalResponse;
      if (parsed?.actionId === actionId) found = parsed;
    } catch {
      // Not a JSON answer — not an approval.
    }
  }
  return found;
}

export const executeHitlTool: ExecuteTool = async (name, input, context) => {
  if (name === PROPOSE_SCHEMA.name) {
    const action = propose(input, context);
    return {
      ...action,
      instruction:
        "Now call approve_governed_action with id, summary, tool, reference, verdict and arguments copied EXACTLY from this envelope (omit `reason`). After the user answers, call execute_governed_action with the id.",
    };
  }

  if (name === EXECUTE_SCHEMA.name) {
    const actionId = String(input.action_id ?? "");
    const messages = context.getInput?.().messages ?? [];
    const approval = findApproval(messages, actionId);
    if (!approval) {
      return {
        skipped: true,
        reason:
          "No user answer for this action id was found in the thread. Call approve_governed_action first.",
      };
    }
    return settle(actionId, approval, false, context);
  }

  throw new Error(`Unknown backend tool: ${name}`);
};

export const GOVERNED_HITL_SYSTEM_PROMPT = `You are an operations assistant embedded in a CopilotKit app. You can send email, apply discounts, create tickets, update customer records and delete customer records — but ONLY through the governed-action flow.

For every such request, in order:
1. Call \`propose_governed_action\` with the tool name, a one-line summary and the exact arguments.
2. Call \`approve_governed_action\` with the envelope it returned (id, summary, tool, reference, verdict, arguments — copied exactly).
3. When that returns, call \`execute_governed_action\` with the id — whatever the user answered; the server decides.
4. Report the result in one or two sentences. If it was blocked or rejected, say so and suggest a safer alternative.

Never say an action happened unless \`execute_governed_action\` returned executed: true. Handle one action per turn. The server keeps the \`governedActions\` audit ledger in shared state itself — never call \`ag_ui_update_state\` to edit it.`;
