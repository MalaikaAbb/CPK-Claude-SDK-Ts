"use client";

import { CopilotChat, CopilotKitProvider } from "@copilotkit/react-core/v2";
import { standardUI } from "@copilotkit/react-core/v2/generative-ui";

import { DemoFrame } from "@/components/demo-frame";
import { nestedInspectorSetting } from "@/lib/inspector";

const AGENT_ID = "gen-ui-components";

/**
 * The page's `providers.tsx` + `page.tsx`, folded into one route: a provider
 * with `generativeUI={{ ui: standardUI }}` and a bare `<CopilotChat />`.
 *
 * Its own provider, because `generativeUI` is per-provider and the app-wide
 * one must not hand the catalog to every other route's agent. The runtime is
 * /api/copilotkit-components (`generativeUI: true`), not the doc's TanStack
 * `BuiltInAgent` — see the notes page.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/generative-ui/components"
      subtitle={`agent: ${AGENT_ID} · ui: standardUI`}
    >
      <CopilotKitProvider
        runtimeUrl="/api/copilotkit-components"
        agentId={AGENT_ID}
        generativeUI={{ ui: standardUI }}
        enableInspector={nestedInspectorSetting}
      >
        <CopilotChat agentId={AGENT_ID} className="h-full" />
      </CopilotKitProvider>
    </DemoFrame>
  );
}
