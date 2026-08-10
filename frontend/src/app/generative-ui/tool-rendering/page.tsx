import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const ZERO_CONFIG = `// Opt in to CopilotKit's built-in default tool-call card. Called with
// no config so the package-provided \`DefaultToolCallRenderer\` is used
// as the wildcard renderer — this is the "out-of-the-box" UI the cell
// is meant to showcase.
useDefaultRenderTool();`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/tool-rendering" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Three levels of tool-call UI, in increasing specificity. Call{" "}
          <code>useDefaultRenderTool()</code> bare and every tool call gets the
          package&apos;s own status card. Pass it a <code>render</code> and you
          own the wildcard. Add <code>useRenderTool(&#123; name &#125;)</code>{" "}
          and that one tool gets a card of its own, with the wildcard catching
          the rest.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Without any of them the runtime has no <code>*</code> renderer at all
          and tool calls are simply invisible — the user only sees the
          assistant&apos;s final text.
        </p>
      </Panel>

      <Panel title="This route does not work, and why">
        <Callout tone="warn" title="get_weather is a backend tool, and backend tools cannot be registered">
          <p>
            The page publishes the complete backend half —{" "}
            <code>GET_WEATHER_TOOL</code> and a <code>getWeather()</code>{" "}
            executor. What it does not publish is the thing that would connect
            them to the agent. The Quickstart&apos;s{" "}
            <code>runWithClaudeAgentSdk</code> hands both to{" "}
            <code>buildBackendToolServer(&#123;&hellip;&#125;)</code> to get the{" "}
            <code>mcpServers</code> / <code>allowedTools</code> pair{" "}
            <code>ClaudeAgentAdapter</code> needs — and that function is defined
            on no page in this framework&apos;s docs.
          </p>
          <p className="mt-2">
            This repo does not write one. So the model is never offered{" "}
            <code>get_weather</code>, never calls it, and neither renderer
            fires. Both are left wired: if a bridge is ever published, the demo
            file should work unchanged.
          </p>
        </Callout>

        <div className="mt-4">
          <TryIt
            prompts={["What's the weather in Lisbon?"]}
            expect="Currently: a prose answer and no card. That is the documented-gap behaviour, and it is what this route is here to record."
            fail="A rendered WeatherCard would mean a backend tool got registered somehow — which would make this status table entry wrong, not right."
          />
        </div>
      </Panel>

      <Panel title="Zero-config: the built-in card">
        <CodeBlock
          code={ZERO_CONFIG}
          language="tsx"
          filename="from the doc page — the simplest entry point"
        />
      </Panel>

      <Panel title="The demo">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/tool-rendering/demo-chat/page.tsx" },
            { file: "frontend/src/app/generative-ui/tool-rendering/weather-card.tsx" },
            { file: "frontend/src/app/generative-ui/tool-rendering/catchall-renderer.tsx" },
            { file: "frontend/src/app/generative-ui/tool-rendering/parse-json-result.ts" },
          ]}
          note={
            <>
              The two hook calls are the doc&apos;s, verbatim.{" "}
              <code>WeatherCard</code>, <code>CustomCatchallRenderer</code> and{" "}
              <code>parseJsonResult</code> are referenced by every snippet on
              the page and published by none of them, so those three are this
              repo&apos;s — with the prop signatures the doc&apos;s renderers
              dictate.
            </>
          }
        />
      </Panel>

      <Panel title="The backend half, as published">
        <SourceCode file="backend/src/agents/weather-tool-backend.snippet.ts" />
      </Panel>

      <Panel title="Renderers the page names but never defines a backend for">
        <Callout tone="info" title="search_flights, get_stock_price, roll_dice">
          The page wires frontend renderers for all three alongside{" "}
          <code>get_weather</code>, and publishes a backend definition for{" "}
          <code>get_weather</code> only. Since none of the four can be
          registered here anyway, this route carries the one tool the docs
          fully describe rather than inventing schemas for the other three.
        </Callout>
      </Panel>
    </>
  );
}
