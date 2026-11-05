"use client";

import { useState } from "react";
import { CopilotChat, CopilotKitProvider } from "@copilotkit/react-core/v2";
import {
  GenerativeUISurface,
  standardUI,
} from "@copilotkit/react-core/v2/generative-ui";

import { DemoFrame } from "@/components/demo-frame";
import { nestedInspectorSetting } from "@/lib/inspector";

const AGENT_ID = "gen-ui-markdown";

/**
 * The page's enable snippet — `generativeUI={{ ui: standardUI, transport:
 * "markdown" }}` — plus its two options as toggles, and a page target so a
 * ```a2ui target=featured fence has somewhere to land.
 *
 * `sendContext: false` is the page's "build your own prompt" mode. This
 * harness's backend does not read `forwardedProps.copilotkit.ui` (the page's
 * example for that is Python), so with it off the model gets no guide and is
 * expected to answer in plain text.
 */
export default function Page() {
  const [sendContext, setSendContext] = useState(true);
  const [includeCatalog, setIncludeCatalog] = useState(true);

  return (
    <DemoFrame
      parentPath="/generative-ui/components/markdown-mode"
      subtitle={`agent: ${AGENT_ID} · transport: markdown · sendContext: ${sendContext} · includeCatalog: ${includeCatalog}`}
    >
      <CopilotKitProvider
        key={`${sendContext}-${includeCatalog}`}
        runtimeUrl="/api/copilotkit-components"
        agentId={AGENT_ID}
        generativeUI={{ ui: standardUI, transport: "markdown", sendContext, includeCatalog }}
        enableInspector={nestedInspectorSetting}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex shrink-0 flex-wrap items-center gap-4 border-b border-slate-200 px-4 py-2 text-xs dark:border-slate-800">
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={sendContext} onChange={(e) => setSendContext(e.target.checked)} />
              sendContext
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={includeCatalog} onChange={(e) => setIncludeCatalog(e.target.checked)} />
              includeCatalog
            </label>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_380px]">
            <CopilotChat agentId={AGENT_ID} className="h-full min-h-0" />
            <aside className="min-h-0 overflow-y-auto border-l border-slate-200 p-4 dark:border-slate-800">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Page target <code>featured</code>
              </h2>
              <GenerativeUISurface
                id="featured"
                description="A panel beside the chat. Render here when the user asks for something 'in the side panel'."
                fallback={<p className="text-sm text-slate-400">Nothing rendered here yet.</p>}
              />
            </aside>
          </div>
        </div>
      </CopilotKitProvider>
    </DemoFrame>
  );
}
