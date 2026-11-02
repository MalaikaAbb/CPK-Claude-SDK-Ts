"use client";

import { useMemo, useState } from "react";
import {
  CopilotChat,
  CopilotKitProvider,
  useAgentContext,
} from "@copilotkit/react-core/v2";
import { exportA2UICatalog } from "@copilotkit/react-core/v2/generative-ui";

import { DemoFrame } from "@/components/demo-frame";
import { nestedInspectorSetting } from "@/lib/inspector";

import { PRODUCTS, PRODUCTS_CONTEXT_DESCRIPTION } from "../../_shared/products";
import { appUI } from "../app-catalog";

const AGENT_ID = "gen-ui-catalogs";

function ProductsContext() {
  useAgentContext({ description: PRODUCTS_CONTEXT_DESCRIPTION, value: PRODUCTS });
  return null;
}

/**
 * The page's export snippet writes the catalog to disk with `fs`. In the
 * browser the same call feeds a viewer and a download link instead.
 */
function ExportPanel() {
  const [open, setOpen] = useState(false);
  const json = useMemo(
    () => JSON.stringify(exportA2UICatalog(appUI, { title: "Acme app" }), null, 2),
    [],
  );
  const href = useMemo(
    () => `data:application/json;charset=utf-8,${encodeURIComponent(json)}`,
    [json],
  );

  return (
    <div className="shrink-0 border-t border-slate-200 p-3 text-xs dark:border-slate-800">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded border border-slate-300 px-2 py-1 dark:border-slate-700"
        >
          {open ? "Hide" : "Show"} exportA2UICatalog(appUI)
        </button>
        <a href={href} download="acme-catalog.json" className="text-[var(--accent)] underline">
          Download acme-catalog.json
        </a>
        <span className="text-slate-500">{(json.length / 1024).toFixed(1)} KB</span>
      </div>
      {open && (
        <pre className="mt-2 max-h-72 overflow-auto rounded bg-slate-50 p-2 dark:bg-slate-900">
          {json}
        </pre>
      )}
    </div>
  );
}

/**
 * Provider gets `appUI` — `standardUI` + `shopUI` + this page's Hero, Panel
 * and TabbedPanel — so one chat can exercise every catalog feature the page
 * describes.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/generative-ui/components/catalogs"
      subtitle={`agent: ${AGENT_ID} · ui: appUI (acme/app@1)`}
    >
      <CopilotKitProvider
        runtimeUrl="/api/copilotkit-components"
        agentId={AGENT_ID}
        generativeUI={{ ui: appUI }}
        enableInspector={nestedInspectorSetting}
      >
        <ProductsContext />
        <div className="flex h-full min-h-0 flex-col">
          <div className="min-h-0 flex-1">
            <CopilotChat agentId={AGENT_ID} className="h-full" />
          </div>
          <ExportPanel />
        </div>
      </CopilotKitProvider>
    </DemoFrame>
  );
}
