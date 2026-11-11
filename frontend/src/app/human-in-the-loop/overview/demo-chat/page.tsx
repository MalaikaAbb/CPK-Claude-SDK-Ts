"use client";

import { DemoFrame } from "@/components/demo-frame";

import HitlInChatDemo from "../_demo/page";

/**
 * The HITL Overview page's demo Code tab (`src/app/demos/hitl-in-chat/page.tsx`),
 * mounted unchanged. It brings its own `<CopilotKit runtimeUrl="/api/copilotkit"
 * agent="hitl-in-chat">`; this repo's main runtime already serves that agent,
 * so the Code tab's showcase `route.ts` is not copied.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/human-in-the-loop/overview" subtitle="agent: hitl-in-chat · Code tab">
      <HitlInChatDemo />
    </DemoFrame>
  );
}
