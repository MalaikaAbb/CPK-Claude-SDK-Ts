import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const EXAMPLE_MESSAGE = `{
  "ui": [
    { "metric": { "props": { "label": "Total Revenue", "value": "$1.2M" } } },
    {
      "pieChart": {
        "props": {
          "title": "Revenue by Segment",
          "data": "[{\\"label\\":\\"Enterprise\\",\\"value\\":600000},{\\"label\\":\\"SMB\\",\\"value\\":400000},{\\"label\\":\\"Startup\\",\\"value\\":200000}]"
        }
      }
    }
  ]
}`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/hashbrown" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The streaming counterpart to JSON Render. The agent replies with one{" "}
          <code>&#123; ui: [...] &#125;</code> envelope, and Hashbrown&apos;s{" "}
          <code>useJsonParser</code> parses it <em>progressively</em>.
          Finished entries render while the rest is still streaming. The
          components the agent may use (<code>metric</code>,{" "}
          <code>pieChart</code>, <code>barChart</code>, <code>dealCard</code>{" "}
          and Markdown) come from a UI kit built with <code>useUiKit</code>.
          One kit is created per page in <code>HashBrownDashboard</code> and
          shared with the message renderer through context.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Show me a Q4 sales dashboard. Include a total-revenue metric card, a pie chart of revenue by segment, and a bar chart of monthly revenue.",
              "Break down Q4 revenue by product category as a pie chart. Include at least four segments with realistic sample values.",
              "Show me three deals in the pipeline at different stages.",
            ]}
            expect="Components appear one by one as the reply streams (a heading, then the metric, then the charts), not all at once at the end. Deal cards get a coloured stage badge. The first two prompts are also offered as suggestion chips."
            fail="A blank assistant message means useJsonParser couldn't parse the envelope, usually prose or a code fence before the JSON. A chart that never appears while the others do means its `data` string isn't valid JSON yet. The wrapper renders nothing until it parses, which is intended mid-stream but a bug if it lasts."
          />
        </div>
      </Panel>

      <Panel title="Agent output contract">
        <CodeBlock code={EXAMPLE_MESSAGE} language="json" filename="from the doc page — example assistant message" />
        <div className="mt-4">
          <Callout tone="info" title="Chart data is a JSON string, on purpose">
            <p>
              Hashbrown&apos;s schema validator rejects example prompts whose
              JSX attribute values don&apos;t match the schema type. So{" "}
              <code>data</code> is declared as a string, and the chart
              wrappers <code>JSON.parse</code> it before rendering. Unlike
              JSON Render, the reply must be a bare JSON object: no fence and
              no preamble.
            </p>
          </Callout>
        </div>
      </Panel>

      <Panel title="Where the code comes from">
        <Callout tone="info">
          <p>
            The doc page prints <code>page.tsx</code>, <code>chat.tsx</code>{" "}
            and <code>hashbrown-renderer.tsx</code>. All three match the
            CopilotKit showcase&apos;s <code>claude-sdk-typescript</code>{" "}
            copies byte for byte. The renderer&apos;s imports (metric card,
            charts, <code>types.ts</code>, <code>suggestions.ts</code>) and
            the agent prompt come from the showcase too. The page&apos;s
            renderer comment points at a Python agent (
            <code>byoc_hashbrown_agent.py</code>); this TypeScript
            integration&apos;s prompt is <code>byoc-hashbrown-prompt.ts</code>.
          </p>
          <p className="mt-2">
            Versions are pinned to the page&apos;s:{" "}
            <code>@hashbrownai/core</code> and <code>@hashbrownai/react</code>{" "}
            <code>0.5.0-beta.4</code>, a pre-release.
          </p>
        </Callout>
      </Panel>

      <Panel title="Frontend — as published on the doc page">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/hashbrown/demo-chat/page.tsx" },
            { file: "frontend/src/app/generative-ui/hashbrown/chat.tsx" },
            { file: "frontend/src/app/generative-ui/hashbrown/hashbrown-renderer.tsx" },
          ]}
          note={<>The demo page is the published <code>page.tsx</code> inside this harness&apos;s DemoFrame: <code>h-screen</code> became <code>h-full</code> and a token wrapper was added.</>}
        />
      </Panel>

      <Panel title="Frontend — from the showcase's Code tab">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/hashbrown/types.ts" },
            { file: "frontend/src/app/generative-ui/hashbrown/suggestions.ts" },
            { file: "frontend/src/app/generative-ui/hashbrown/metric-card.tsx" },
            { file: "frontend/src/app/generative-ui/hashbrown/charts/bar-chart.tsx" },
            { file: "frontend/src/app/generative-ui/hashbrown/charts/pie-chart.tsx" },
          ]}
        />
      </Panel>

      <Panel title="Runtime and agent">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/api/copilotkit-declarative-hashbrown/route.ts" },
            { file: "backend/src/agents/byoc-hashbrown-prompt.ts" },
          ]}
        />
      </Panel>
    </>
  );
}
