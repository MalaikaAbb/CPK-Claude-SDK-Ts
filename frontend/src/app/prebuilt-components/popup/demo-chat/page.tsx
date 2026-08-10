"use client";

import { CopilotPopup } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

/**
 * `<CopilotPopup>` with the page's own `defaultOpen` and `labels` props.
 *
 * The difference from the sidebar is what happens to the page underneath:
 * the popup overlays it rather than sitting beside it.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/prebuilt-components/popup"
      subtitle="agent: prebuilt-popup"
    >
      <main className="h-full overflow-y-auto p-10">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Main content
        </h1>
        <p className="mt-3 max-w-prose text-sm text-slate-600 dark:text-slate-400">
          The popup floats over this column instead of displacing it. Close it
          with its header control and the launcher returns to the bottom-right.
        </p>
      </main>
      <CopilotPopup
        agentId="prebuilt-popup"
        defaultOpen={true}
        labels={{
          chatInputPlaceholder: "Ask the popup anything...",
        }}
      />
    </DemoFrame>
  );
}
