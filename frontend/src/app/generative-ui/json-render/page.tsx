import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const EXAMPLE_OUTPUT = `{
  "root": "revenue-card",
  "elements": {
    "revenue-card": {
      "type": "MetricCard",
      "props": { "label": "Total revenue", "value": "$184,302", "trend": "+12%" },
      "children": ["by-region"]
    },
    "by-region": {
      "type": "BarChart",
      "props": {
        "title": "Revenue by region",
        "description": null,
        "data": [
          { "label": "North America", "value": 112000 },
          { "label": "EMEA", "value": 72302 }
        ]
      }
    }
  }
}`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/json-render" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Bring your own component library. The agent replies with a single{" "}
          <code>&#123; root, elements &#125;</code> JSON object instead of
          prose. A custom <code>messageView.assistantMessage</code> slot parses
          it and hands it to <code>@json-render/react</code>&apos;s{" "}
          <code>&lt;Renderer&gt;</code>, which draws it through a typed
          registry. Only the three registered types (MetricCard, BarChart,
          PieChart) are accepted. Until the reply parses as a valid spec,
          including mid-stream, the normal assistant bubble is shown.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Show me the sales dashboard with metrics and a revenue chart",
              "Break down revenue by category as a pie chart",
              "Show me monthly expenses as a bar chart",
            ]}
            expect="The same three prompts appear as suggestion chips. 1: a MetricCard with a trend badge, with a BarChart nested under it (children). 2: a donut chart with a legend and percentages. 3: an animated bar chart. While the reply streams you see raw JSON in a normal bubble, which switches to the dashboard once the object closes and parses."
            fail="Raw JSON that never turns into a chart means parseSpec rejected it: an unknown type, a root not found in elements, or non-object props. A prose answer means the agent isn't running the JSON prompt, so check the backend registry entry for byoc_json_render."
          />
        </div>
      </Panel>

      <Panel title="Agent output contract">
        <CodeBlock code={EXAMPLE_OUTPUT} language="json" filename="from the doc page — example agent output" />
        <div className="mt-4">
          <Callout tone="warn" title="Props are not validated at runtime">
            <p>
              <code>parseSpec</code> checks the object shape and the type
              allowlist only. The Zod schemas in <code>catalog.ts</code> type
              the registry but are never run against what the agent emits. The
              page flags this itself: validate props yourself if you depend on
              them.
            </p>
          </Callout>
        </div>
      </Panel>

      <Panel title="Where the code comes from">
        <Callout tone="info">
          <p>
            The doc page prints four files: <code>chat.tsx</code>,{" "}
            <code>json-render-renderer.tsx</code>, <code>catalog.ts</code> and{" "}
            <code>registry.tsx</code>. The rest (page, types, suggestions,
            metric card, charts, runtime route and the agent prompt) sit
            behind the page&apos;s <strong>Code</strong> tab. They are copied
            here from the CopilotKit showcase&apos;s{" "}
            <code>claude-sdk-typescript</code> integration. The four printed
            files are byte-identical to the showcase copies. Only the runtime
            route differs: the showcase&apos;s <code>createClaudeHttpAgent</code>{" "}
            is unpublished (README §9.7), so <code>HttpAgent</code> is used.
          </p>
          <p className="mt-2">
            Versions are the showcase&apos;s: <code>@json-render/*</code>{" "}
            0.18.0, which needs Zod 4. The repo stays on Zod 3 and adds Zod 4
            under the <code>zod4</code> alias, the same way the page
            describes.
          </p>
        </Callout>
      </Panel>

      <Panel title="Frontend — as published on the doc page">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/json-render/chat.tsx" },
            { file: "frontend/src/app/generative-ui/json-render/json-render-renderer.tsx" },
            { file: "frontend/src/app/generative-ui/json-render/catalog.ts" },
            { file: "frontend/src/app/generative-ui/json-render/registry.tsx" },
          ]}
        />
      </Panel>

      <Panel title="Frontend — from the showcase's Code tab">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/json-render/demo-chat/page.tsx" },
            { file: "frontend/src/app/generative-ui/json-render/types.ts" },
            { file: "frontend/src/app/generative-ui/json-render/suggestions.ts" },
            { file: "frontend/src/app/generative-ui/json-render/metric-card.tsx" },
            { file: "frontend/src/app/generative-ui/json-render/charts/bar-chart.tsx" },
            { file: "frontend/src/app/generative-ui/json-render/charts/pie-chart.tsx" },
          ]}
        />
      </Panel>

      <Panel title="Runtime and agent">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/api/copilotkit-declarative-json-render/route.ts" },
            { file: "backend/src/agents/byoc-json-render-prompt.ts" },
          ]}
        />
      </Panel>

      <Panel title="Sibling pattern">
        <SourceCode file="frontend/src/app/generative-ui/hashbrown/chat.tsx" />
        <p className="mt-2 text-xs text-slate-500">
          Same scenario, rendered progressively with{" "}
          <a href="/generative-ui/hashbrown" className="text-[var(--accent)] underline underline-offset-4">
            Hashbrown
          </a>{" "}
          instead of one-shot.
        </p>
      </Panel>
    </>
  );
}
