"use client";

import { CopilotChat, CopilotKitProvider } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";
import { nestedInspectorSetting } from "@/lib/inspector";

import { appUI } from "./app-ui";

const AGENT_ID = "gen-ui-from-a2ui";

/**
 * The page's "After" provider: `generativeUI={{ ui: appUI }}`. The doc's
 * provider line names no agent, so `agentId` is added like every other
 * Components demo here. Its runtime, `/api/copilotkit-components`, already
 * matches "Runtime, after": no `a2ui` option (it sets `generativeUI: true`,
 * one of the two forms the page's comment allows).
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/generative-ui/components/from-a2ui"
      subtitle={`agent: ${AGENT_ID} · createGenerativeUI (after)`}
    >
      <CopilotKitProvider
        runtimeUrl="/api/copilotkit-components"
        agentId={AGENT_ID}
        generativeUI={{ ui: appUI }}
        enableInspector={nestedInspectorSetting}
      >
        <CopilotChat agentId={AGENT_ID} className="h-full" />
      </CopilotKitProvider>
    </DemoFrame>
  );
}
