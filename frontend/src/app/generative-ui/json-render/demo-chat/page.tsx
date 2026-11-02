"use client";

import { CopilotKit } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";
import { ShowcaseTokens } from "@/components/showcase-tokens";
import { nestedInspectorSetting } from "@/lib/inspector";

import { AGENT_ID, Chat } from "../chat";

/**
 * The showcase's `declarative-json-render/page.tsx` — the doc page names it
 * but doesn't print it — inside this harness's DemoFrame. Changes:
 *  - `h-screen` became `h-full`, since the frame already owns the viewport;
 *  - `enableInspector` routes the Inspector to this nested provider
 *    (see lib/inspector.ts);
 *  - ShowcaseTokens supplies the CSS variables the copied components expect.
 * `chat.tsx`, `json-render-renderer.tsx`, `catalog.ts` and `registry.tsx` are
 * byte-identical to the code on the doc page.
 */
export default function ByocJsonRenderDemo() {
  return (
    <DemoFrame
      parentPath="/generative-ui/json-render"
      subtitle={`agent: ${AGENT_ID} · @json-render/react 0.18.0`}
    >
      <CopilotKit
        runtimeUrl="/api/copilotkit-declarative-json-render"
        agent={AGENT_ID}
        enableInspector={nestedInspectorSetting}
      >
        <ShowcaseTokens className="h-full">
          <div className="flex justify-center items-center h-full w-full">
            <div className="h-full w-full max-w-4xl">
              <Chat />
            </div>
          </div>
        </ShowcaseTokens>
      </CopilotKit>
    </DemoFrame>
  );
}
