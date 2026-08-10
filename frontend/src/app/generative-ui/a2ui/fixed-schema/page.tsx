import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const RUNTIME_CONFIG = `const runtime = new CopilotRuntime({
  agents: { "a2ui-fixed-schema": agent },
  a2ui: { injectA2UITool: false, agents: ["a2ui-fixed-schema"] },
});`;

const ACTION_JSON = `{
  "Button": {
    "label": "Book",
    "action": {
      "name": "book_flight",
      "context": [
        { "key": "flightNumber", "value": { "path": "/flightNumber" } },
        { "key": "price", "value": { "path": "/price" } }
      ]
    }
  }
}`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/a2ui/fixed-schema" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The opposite trade from dynamic schema. The component tree is authored
          once as JSON and kept on the agent side; the tool supplies only the
          four data fields. Nothing is generated at runtime, so the surface
          paints on the first frame and the design can never drift.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Components without bindings (<code>Title</code>, <code>Arrow</code>)
          carry their value inline; bound ones (<code>Airport</code>) reference
          data by JSON Pointer, like{" "}
          <code>&#123; &quot;path&quot;: &quot;/origin&quot; &#125;</code>. The
          binder resolves those before the renderer runs, which is why renderer
          props are typed as resolved values.
        </p>
      </Panel>

      <Panel title="This route does not work, and why">
        <Callout tone="warn" title="Both paths to a drawing tool are closed here">
          <p>
            The page prescribes two things together:{" "}
            <code>injectA2UITool: false</code> on the runtime, and a backend{" "}
            <code>display_flight</code> tool the agent owns instead. The first
            is applied. The second cannot be — backend tool definition is given but it is incomplete.
            Its integration with ClaudeAgentAdapter is NOT provided in docs
          </p>
          <p className="mt-2">
            The net effect is an agent with no drawing tool at all. Injection
            was left off rather than flipped on, because flipping it would
            demonstrate the{" "}
            <a
              href="/generative-ui/a2ui/dynamic-schema"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              dynamic-schema
            </a>{" "}
            path under this page&apos;s name.
          </p>
        </Callout>

        <div className="mt-4">
          <TryIt
            prompts={["Find me a flight from SFO to JFK."]}
            expect="Currently: a one-sentence prose reply and no card. That is the documented-gap behaviour this route records."
            fail="A rendered flight card would mean a drawing tool got registered — which would make this status entry wrong."
          />
        </div>
      </Panel>

      <Panel title="The runtime half, as published">
        <CodeBlock
          code={RUNTIME_CONFIG}
          language="ts"
          filename="from the doc page — applied in frontend/src/app/api/copilotkit/route.ts"
        />
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/generative-ui/a2ui/fixed-schema/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The five-component catalog"
        description="Title, Airport, Arrow, AirlineBadge, PriceTag — plus Card and Button overrides — merged with the basic catalog."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/a2ui/fixed-schema/a2ui/catalog.ts" },
            { file: "frontend/src/app/generative-ui/a2ui/fixed-schema/a2ui/definitions.ts" },
            { file: "frontend/src/app/generative-ui/a2ui/fixed-schema/a2ui/renderers.tsx" },
          ]}
        />
      </Panel>

      <Panel title="The agent half, as published">
        <SourceCodeGroup
          files={[
            { file: "backend/src/agents/a2ui-fixed-prompt.ts" },
            { file: "backend/src/agents/a2ui_schemas/flight_schema.json" },
          ]}
          note={
            <>
              <code>flight_schema.json</code> is imported by the doc&apos;s
              snippet and its contents are never shown on any page. The copy
              here is the Google ADK repo&apos;s, which matches the component
              tree this page diagrams (Card &gt; Column &gt; [Title, Row, Row,
              Button]) exactly.
            </>
          }
        />
      </Panel>

      <Panel title="Action handlers">
        <Callout tone="info" title="Not available in the SDK yet, by the page's own admission">
          <p>
            The canonical reference pairs fixed schemas with{" "}
            <code>action_handlers</code> so clicking Book swaps in a
            &ldquo;booked&rdquo; schema. The page states the SDK&apos;s{" "}
            <code>a2ui.render</code> does not accept that argument yet, so the
            Book button is inert by design — a second gap, independent of the
            missing tool bridge.
          </p>
          <p className="mt-2">
            <code>booked_schema.json</code> is kept alongside the flight schema
            for the same reason the reference does: so the swap can be wired the
            moment the argument lands.
          </p>
        </Callout>

        <div className="mt-4">
          <CodeBlock
            code={ACTION_JSON}
            language="json"
            filename="how a button declares its action, once handlers exist"
          />
        </div>
      </Panel>
    </>
  );
}
