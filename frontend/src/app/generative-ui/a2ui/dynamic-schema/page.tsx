import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/a2ui/dynamic-schema" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Bring-your-own-catalog generative UI. You declare a vocabulary of
          components — Zod prop schemas plus descriptions the model reads as
          prompt — and the agent composes a whole surface out of them per
          request. Nothing about the layout is decided in advance.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The frontend setup is one prop:{" "}
          <code>a2ui=&#123;&#123; catalog &#125;&#125;</code> on the provider.
          Passing a catalog auto-enables A2UI and injects the{" "}
          <code>generate_a2ui</code> tool, so the runtime needs no{" "}
          <code>a2ui</code> block at all.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Show me a dashboard for our API health: uptime 99.95%, p95 latency 240ms, 3 open incidents.",
              "Build a table of sales reps against quota.",
            ]}
            expect="A composed surface — cards, metrics, badges, maybe a table — assembled from the catalog and streaming in progressively as the operations arrive."
            fail="A plain markdown answer means generate_a2ui was never injected; check that the provider got a catalog and that this route is on /api/copilotkit-declarative-gen-ui."
          />
        </div>
      </Panel>

      <Panel title="Why this A2UI route works and the fixed-schema one does not">
        <Callout tone="success" title="The drawing tool is injected, not authored">
          <p>
            <code>generate_a2ui</code> is supplied by the runtime and reaches
            the agent as a <em>frontend</em> tool in the AG-UI run input — so{" "}
            <code>ClaudeAgentAdapter</code> bridges it into its own{" "}
            <code>ag_ui</code> MCP server automatically, the same way it handles{" "}
            <code>useFrontendTool</code>.
          </p>
          <p className="mt-2">
            <a
              href="/generative-ui/a2ui/fixed-schema"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              Fixed schema
            </a>{" "}
            deliberately turns that injection off so the agent can own a
            backend <code>display_flight</code> tool instead — which is exactly
            the thing this framework&apos;s docs give no way to register.
          </p>
        </Callout>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/generative-ui/a2ui/dynamic-schema/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The three-file catalog"
        description="definitions declare the vocabulary, renderers implement it, catalog merges the two with CopilotKit's built-ins."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/a2ui/dynamic-schema/a2ui/catalog.ts" },
            { file: "frontend/src/app/generative-ui/a2ui/dynamic-schema/a2ui/definitions.ts" },
            { file: "frontend/src/app/generative-ui/a2ui/dynamic-schema/a2ui/renderers.tsx" },
          ]}
          note={
            <>
              The definitions are the doc&apos;s. The renderers are leaf UI —
              the page shows them against a shadcn component library this repo
              does not carry, so they are re-pointed at the small primitives in{" "}
              <code>_components/primitives.tsx</code>. Shapes and names are
              unchanged, so the definitions still typecheck against them.
            </>
          }
        />
      </Panel>

      <Panel title="Its own runtime">
        <SourceCode file="frontend/src/app/api/copilotkit-declarative-gen-ui/route.ts" />
      </Panel>
    </>
  );
}
