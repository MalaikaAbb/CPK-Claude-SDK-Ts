"use client";

import { useState } from "react";
import { CopilotChat, CopilotKitProvider } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";
import { nestedInspectorSetting } from "@/lib/inspector";

import { VARIANTS, type VariantKey } from "../variants";

const AGENT_ID = "gen-ui-standard-catalog";

/**
 * One chat, four catalogs. Switching variant remounts the provider (it is
 * keyed), so each variant starts a fresh conversation — which the page also
 * recommends after a catalog change.
 */
export default function Page() {
  const [variant, setVariant] = useState<VariantKey>("as-is");
  const { ui, note } = VARIANTS[variant];

  return (
    <DemoFrame
      parentPath="/generative-ui/components/standard-catalog"
      subtitle={`agent: ${AGENT_ID} · variant: ${variant}`}
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-2 text-xs dark:border-slate-800">
          {(Object.keys(VARIANTS) as VariantKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setVariant(key)}
              className={`rounded-md border px-2.5 py-1 ${
                key === variant
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
              }`}
            >
              {VARIANTS[key].label}
            </button>
          ))}
          <span className="text-slate-500">
            {note} · {ui.components.size} components
          </span>
        </div>

        <div className="min-h-0 flex-1">
          <CopilotKitProvider
            key={variant}
            runtimeUrl="/api/copilotkit-components"
            agentId={AGENT_ID}
            generativeUI={{ ui }}
            enableInspector={nestedInspectorSetting}
          >
            <CopilotChat agentId={AGENT_ID} className="h-full" />
          </CopilotKitProvider>
        </div>
      </div>
    </DemoFrame>
  );
}
