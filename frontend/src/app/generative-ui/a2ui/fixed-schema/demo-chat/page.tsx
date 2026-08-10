"use client";

import { CopilotChat, CopilotKit } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";
import { nestedInspectorSetting } from "@/lib/inspector";

import { catalog } from "../a2ui/catalog";

const AGENT_ID = "a2ui-fixed-schema";

/**
 * Its own provider, because A2UI is configured per-provider: `a2ui={{ catalog }}`
 * is what registers the component vocabulary the surface will be drawn with.
 *
 * The matching half is on the runtime, which sets `injectA2UITool: false` for
 * this agent — the page's instruction, on the grounds that the agent owns its
 * own `display_flight` tool and must not also be handed a `generate_a2ui`.
 *
 * ── Why nothing renders ──────────────────────────────────────────────────
 * `display_flight` is a backend tool, and the docs never publish
 * `buildBackendToolServer`, so it cannot be registered. Combined with
 * injection being off, the agent ends up with no drawing tool at all: it will
 * answer about flights in prose and the surface never mounts.
 *
 * Both halves are left exactly as the page prescribes rather than flipping
 * injection back on — doing that would quietly demonstrate the dynamic-schema
 * path under the fixed-schema page's name. See the notes page and README §9.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/generative-ui/a2ui/fixed-schema"
      subtitle={`agent: ${AGENT_ID} · no drawing tool registered`}
    >
      <CopilotKit
        runtimeUrl="/api/copilotkit"
        agent={AGENT_ID}
        a2ui={{ catalog }}
        // This provider owns the inspector on this route, because the chat
        // below runs on *its* core — the app-wide one would show an empty
        // event list. The root provider stands down here; the routing lives in
        // `lib/inspector.ts`, which also guarantees only one ever mounts.
        enableInspector={nestedInspectorSetting}
      >
        <div className="flex h-full flex-col">
          <div className="min-h-0 flex-1">
            <CopilotChat agentId={AGENT_ID} className="h-full" />
          </div>
        </div>
      </CopilotKit>
    </DemoFrame>
  );
}
