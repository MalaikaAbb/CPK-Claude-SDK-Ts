"use client";

import { CopilotKit } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";
import { ShowcaseTokens } from "@/components/showcase-tokens";
import { nestedInspectorSetting } from "@/lib/inspector";

import { HashBrownDashboard } from "../hashbrown-renderer";
import { Chat } from "../chat";

/**
 * The doc page's `page.tsx`, inside this harness's DemoFrame. Changes:
 *  - `h-screen` became `h-full`, since the frame already owns the viewport;
 *  - `enableInspector` routes the Inspector to this nested provider;
 *  - ShowcaseTokens supplies the CSS variables the copied components expect.
 * `runtimeUrl` and `agent` are the published values, unchanged.
 */
export default function ByocHashbrownDemoPage() {
  return (
    <DemoFrame
      parentPath="/generative-ui/hashbrown"
      subtitle="agent: declarative-hashbrown-demo · @hashbrownai/react 0.5.0-beta.4"
    >
      <CopilotKit
        runtimeUrl="/api/copilotkit-declarative-hashbrown"
        agent="declarative-hashbrown-demo"
        enableInspector={nestedInspectorSetting}
      >
        <ShowcaseTokens className="h-full">
          <HashBrownDashboard>
            <div className="flex h-full flex-col gap-3 p-6">
              <header>
                <h1 className="text-lg font-semibold">Declarative UI: Hashbrown</h1>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Streaming structured output via <code>@hashbrownai/react</code>.
                  The agent emits a catalog-constrained UI envelope that renders
                  progressively as data streams.
                </p>
              </header>
              <div className="flex-1 overflow-hidden rounded-md border border-[var(--border)]">
                <Chat />
              </div>
            </div>
          </HashBrownDashboard>
        </ShowcaseTokens>
      </CopilotKit>
    </DemoFrame>
  );
}
