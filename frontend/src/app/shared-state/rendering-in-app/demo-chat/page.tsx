"use client";

import { CopilotSidebar, useAgent } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The same agent state, rendered as a main-view canvas instead of inside the
 * chat.
 *
 * `Canvas` and `toggleItem` are the doc's snippets. The point the page makes
 * is that there is nothing chat-specific about `useAgent` — it works in any
 * component under the provider, so agent state can drive your primary UI.
 *
 * Note `useAgent()` with no arguments in the doc's `Canvas`: it binds to the
 * provider's default agent. This surface names the agent explicitly instead,
 * because this harness has ~24 of them and no single default.
 *
 * Inherits the `set_notes` gap from /shared-state — the items here are written
 * through the adapter's built-in `ag_ui_update_state`.
 */

interface CanvasState {
  title: string;
  items: { id: string; label: string; done: boolean }[];
}

function Canvas() {
  const { agent } = useAgent({ agentId: "shared-state-read-write" });
  const state = (agent.state ?? {}) as Partial<CanvasState>;

  function toggleItem(id: string) {
    agent.setState({
      ...state,
      items: (state.items ?? []).map((it) =>
        it.id === id ? { ...it, done: !it.done } : it,
      ),
    });
  }

  const items = state.items ?? [];

  return (
    <main className="h-full overflow-y-auto p-10">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        {state.title ?? "Your canvas"}
      </h1>
      <p className="mt-2 max-w-prose text-sm text-slate-600 dark:text-slate-400">
        This is the page, not a chat panel. Ask the agent to build a checklist
        and it appears here; tick an item and the agent sees it on its next
        turn.
      </p>

      {items.length === 0 ? (
        <p className="mt-8 text-sm italic text-slate-500">
          Nothing yet — try &ldquo;make me a 4-item packing list for a
          weekend trip&rdquo;.
        </p>
      ) : (
        <ul className="mt-8 max-w-md space-y-2">
          {items.map((it) => (
            <li key={it.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
                <input
                  type="checkbox"
                  checked={it.done}
                  onChange={() => toggleItem(it.id)}
                  className="h-4 w-4"
                />
                <span
                  className={
                    it.done
                      ? "text-sm text-slate-400 line-through"
                      : "text-sm text-slate-800 dark:text-slate-200"
                  }
                >
                  {it.label}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default function Page() {
  return (
    <DemoFrame
      parentPath="/shared-state/rendering-in-app"
      subtitle="agent: shared-state-read-write"
    >
      <Canvas />
      <CopilotSidebar agentId="shared-state-read-write" defaultOpen />
    </DemoFrame>
  );
}
