import { getHealth } from "@/lib/health";

import { RecheckButton } from "./recheck-button";

function Row({
  ok,
  label,
  detail,
  neutral,
}: {
  ok: boolean;
  label: string;
  detail: string;
  neutral?: boolean;
}) {
  const dot = neutral ? "bg-slate-400" : ok ? "bg-emerald-500" : "bg-rose-500";
  return (
    <li className="flex items-start gap-3">
      <span
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`}
        aria-hidden
      />
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {label}
        </p>
        <p className="break-words text-xs text-slate-500 dark:text-slate-400">
          {detail}
        </p>
      </div>
    </li>
  );
}

/**
 * Server component: probes the agent server and the runtime during render.
 *
 * This is what makes the runtime route's Intelligence configuration visible
 * rather than something you have to infer from source. Three independent axes
 * get their own row, because they fail independently and are easy to conflate.
 */
export async function BackendHealth() {
  const health = await getHealth();

  const threads = health.threadEndpoints;
  // The runtime's own `mode` is the only honest signal. A key can be set and
  // still unread, and SSE mode already reports `threadEndpoints.list: true`
  // from its in-memory runner — so the thread flags alone read as a false
  // positive. `mutations` and `realtimeMetadata` are the two that only an
  // Intelligence-backed runtime turns on.
  const intelligenceLive = health.mode === "intelligence";

  const enabledThreadEndpoints = Object.entries(threads ?? {})
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(", ");

  const intelligenceDetail = intelligenceLive
    ? `Mode "intelligence"${
        enabledThreadEndpoints
          ? `, threadEndpoints ${enabledThreadEndpoints}`
          : ""
      }. This says the key was read, not that the platform accepted it — a bad key still reports this. Confirm by sending a message and looking for the thread in your project dashboard.`
    : health.intelligenceKeySet
      ? 'INTELLIGENCE_API_KEY is set, but /info still reports mode "sse" — the key was rejected or never reached the platform. Check the project dashboard for a thread.'
      : 'Not configured. /info reports mode "sse": an in-memory runner backs the threads, so chat works everywhere and thread list/inspect answer locally, but mutations and realtime metadata stay off and nothing persists across a restart.';

  // A THIRD axis, independent of both the key and the mode. The drawer and
  // other client-side feature UIs gate on `/info`'s licenseStatus, which comes
  // from the runtime's licenseToken — not from the Intelligence project key. A
  // runtime can serve threads perfectly and still show every drawer as locked.
  const licenseOk =
    health.licenseStatus === "valid" || health.licenseStatus === "expiring";

  const licenseDetail = licenseOk
    ? `/info reports licenseStatus "${health.licenseStatus}" — feature UIs like the Threads Drawer are unlocked.`
    : health.licenseStatus
      ? `/info reports licenseStatus "${health.licenseStatus}"${
          health.licenseTokenSet ? "" : " — no COPILOTKIT_LICENSE_TOKEN is set"
        }. Threads still work if mode is "intelligence", but the Threads Drawer renders its locked Upgrade view, which gates on this field and not on the Intelligence key.`
      : "Not reported — the runtime is not in Intelligence mode, so no license status is published.";

  return (
    <div>
      <ul className="space-y-3">
        <Row
          ok
          label="Next.js app"
          detail="Serving this page, so the frontend is up."
        />
        <Row
          ok={health.runtime.ok}
          label="Copilot Runtime (v2, multi-route)"
          detail={health.runtime.detail}
        />
        <Row
          ok={health.agent.ok}
          label="Claude Agent SDK server"
          detail={health.agent.detail}
        />
        <Row
          ok={intelligenceLive}
          neutral={!intelligenceLive && !health.intelligenceKeySet}
          label="CopilotKit Intelligence"
          detail={intelligenceDetail}
        />
        <Row
          ok={licenseOk}
          neutral={!licenseOk && !health.licenseStatus}
          label="Feature license (drawer, gated UIs)"
          detail={licenseDetail}
        />
      </ul>

      {health.agentIds.length > 0 && (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Registered agents:{" "}
          <code className="break-all">{health.agentIds.join(", ")}</code>
        </p>
      )}

      <RecheckButton />
    </div>
  );
}
