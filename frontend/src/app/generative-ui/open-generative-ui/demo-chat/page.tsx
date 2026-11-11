"use client";

import Link from "next/link";

import { DemoFrame } from "@/components/demo-frame";

import OpenGenUiDemo from "../_demo/open-gen-ui/page";

/**
 * The page's minimal demo (`src/app/demos/open-gen-ui/page.tsx`), mounted as
 * published apart from the commented-out design skill. It brings its own
 * `<CopilotKit>` against `/api/copilotkit-ogui`.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/generative-ui/open-generative-ui" subtitle="Minimal · agent: open-gen-ui">
      <div className="flex h-full flex-col">
        <p className="shrink-0 border-b border-slate-200 px-4 py-1.5 text-xs text-slate-500 dark:border-slate-800">
          Minimal setup.{" "}
          <Link
            href="/generative-ui/open-generative-ui/demo-chat/advanced"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Switch to the advanced demo (sandbox functions) →
          </Link>
        </p>
        <div className="min-h-0 flex-1">
          <OpenGenUiDemo />
        </div>
      </div>
    </DemoFrame>
  );
}
