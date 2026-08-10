"use client";

import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { rootInspectorSetting } from "@/lib/inspector";

/**
 * One provider for the whole app, so a conversation survives navigation
 * between test routes.
 *
 * The Quickstart wraps the tree in `<CopilotKit runtimeUrl agent="claude_agent">`
 * — one provider naming one agent. This harness has ~24 agents, so the agent
 * is named per surface with `agentId` instead. Same binding, chosen at the
 * component rather than the tree.
 *
 * Three routes mount a second, nested `<CopilotKit>` of their own rather than
 * using this one — Voice (different runtime, because transcription only exists
 * on the v2 runtime) and the two A2UI routes (each needs its own catalog, and
 * fixed-schema needs a runtime with tool injection off). Those are the cases
 * where the doc page is specifically about the provider, so an isolated
 * instance is the honest thing to show.
 */

const RUNTIME_URL = "/api/copilotkit";

export function Providers({ children }: { children: ReactNode }) {
  // The inspector can only watch the core it is attached to, and two of them
  // on one page is fatal — so on routes that bring their own provider, this
  // one yields. `lib/inspector.ts` owns that decision.
  const pathname = usePathname();

  return (
    <CopilotKitProvider
      runtimeUrl={RUNTIME_URL}
      showDevConsole={rootInspectorSetting(pathname)}
      // Bottom-left, because the prebuilt Popup and Sidebar launchers both
      // live bottom-right and would sit under the inspector button.
      inspectorDefaultAnchor={{ horizontal: "left", vertical: "bottom" }}
      onError={(event) => {
        console.error(`[CopilotKit ${event.code}]`, event.error);
      }}
    >
      {children}
    </CopilotKitProvider>
  );
}
