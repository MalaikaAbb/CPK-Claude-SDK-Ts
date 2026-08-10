"use client";

import { CopilotSidebar } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

/**
 * `<CopilotSidebar agentId defaultOpen />` rendered as a sibling of the main
 * content, exactly as the page shows.
 *
 * Rendering it as a sibling rather than a wrapper is the point: it slides out
 * without reflowing the page underneath.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/prebuilt-components/sidebar"
      subtitle="agent: prebuilt-sidebar"
    >
      <main className="h-full overflow-y-auto p-10">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Main content
        </h1>
        <p className="mt-3 max-w-prose text-sm text-slate-600 dark:text-slate-400">
          Collapse the sidebar with its toggle and watch this column keep its
          width. The sidebar is a sibling of this element, not a wrapper around
          it.
        </p>
      </main>
      <CopilotSidebar agentId="prebuilt-sidebar" defaultOpen={true} />
    </DemoFrame>
  );
}
