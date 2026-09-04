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

      <Panel title="How get_weather is registered, and why that is not doc code">
        <Callout tone="warn" title="get_weather is a backend tool, and the docs publish no way to register one">
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
            This repo writes its own, clearly marked as repo code:{" "}
            <code>backend/src/agents/weather-mcp-server.ts</code> wraps the
            published <code>GET_WEATHER_TOOL</code> / <code>getWeather</code>{" "}
            in an in-process MCP server via the SDK&apos;s{" "}
            <code>createSdkMcpServer</code> + <code>tool()</code>, and the
            registry passes it to the adapter as <code>mcpServers</code> plus{" "}
            <code>allowedTools: [&quot;mcp__weather__get_weather&quot;]</code>.
            The adapter strips the MCP prefix on the way out, so the
            published renderers match without change. If a bridge is ever
            published, swap that one file.
          </p>
        </Callout>

        <div className="mt-4">
          <TryIt
            prompts={["What's the weather in Lisbon?"]}
            expect="A WeatherCard for Lisbon showing 68°, 55% humidity, 10 wind, Sunny (the executor's fixed values), then a short prose reply."
            fail="A prose-only answer means the tool was never offered or was denied — check the backend log for the weather MCP server and the mcp__weather__get_weather grant."
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
