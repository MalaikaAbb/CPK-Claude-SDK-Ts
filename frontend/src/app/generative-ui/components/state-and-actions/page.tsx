import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, KeyValue, Panel, TryIt } from "@/components/ui";

const ACTION_MESSAGE = `// forwardedProps.copilotkit.ui.metadata.extensions.copilotkit_action
{
  "version": "v1.0",
  "action": {
    "name": "choose",
    "surfaceId": "plans",
    "sourceComponentId": "team-button",
    "timestamp": "2026-10-20T10:00:00.000Z",
    "userMessage": "Show me the Team plan",
    "context": { "plan": "team" }
  }
}`;

const FUNCTION_VALUES = `{ "@call": "formatCurrency", "args": { "value": { "@path": "/total" }, "currency": "EUR" } }

{ "@call": "calc", "args": {
    "expression": "seats * 29 * (annual ? 0.8 : 1)",
    "seats": { "@path": "/seats" },
    "annual": { "@path": "/annual" } } }`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/components/state-and-actions" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          This page connects generated UI to the app in five ways. The app
          pushes live <strong>state</strong> into surfaces with{" "}
          <code>useGenerativeUIState</code>, and a <code>bind</code> selector
          turns it into a prop. Component <strong>events</strong> call{" "}
          <strong>functions</strong> you register with{" "}
          <code>useGenerativeUIFunction</code>. An event with no matching
          function is <strong>sent to the agent</strong> as a user message.{" "}
          <strong>Writable</strong> props give a component a setter so user
          input survives agent updates. <strong>Function values</strong>{" "}
          (<code>calc</code>, <code>formatCurrency</code>…) compute in the
          browser.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Show product cards for the lamp and the mug.",
              "Show Starter, Team and Enterprise plans as plan cards.",
              "Show a checkout form for my email.",
              "Build a seat estimator: a Slider for seats (1–50) bound to /seats and a Text showing the monthly price with calc, $29 per seat.",
            ]}
            expect="1: clicking Add to cart on a card logs addToCart(…) and updates the sidebar cart. 'In cart' on that card updates through bind, and so does the sidebar's 'Add p-lamp' button. 2: clicking Choose posts a visible user message and the agent responds to it. 3: what you type in the input stays when the agent sends more updates. 4: moving the slider recomputes the price live, with no agent round-trip."
            fail="'In cart' stuck at 0 after Add means the useGenerativeUIState → bind path broke. A click that logs nothing means the event didn't match a function, so check the onX → x naming."
          />
        </div>
      </Panel>

      <Panel title="Function definition fields">
        <KeyValue
          rows={[
            ["description / parameters", "What the function does and its schema."],
            ["allowedCallers", '"rendererOnly" (default), "agentOnly", "rendererOrAgent".'],
            ["requiresUserActivation", "true forces rendererOnly (like openUrl)."],
            ["returnType", "string · number · boolean · array · object · validationResult · any · void"],
          ]}
        />
      </Panel>

      <Panel title="Caveats from the page">
        <Callout tone="warn" title="Agent-called renderer functions are not supported yet">
          <ul className="list-disc space-y-1 pl-4">
            <li>The agent cannot call renderer functions in this version. A <code>callRendererFunction</code> is rejected and never shown to the model, so <code>reload</code> (agentOnly) is registered but cannot fire.</li>
            <li>An event cannot match an <code>agentOnly</code> function.</li>
            <li><code>calc</code> and <code>series</code> run only in the browser.</li>
            <li>The agent never sees <code>useGenerativeUIState</code> data. The demo sends the product list through <code>useAgentContext</code> for that reason.</li>
          </ul>
        </Callout>
        <div className="mt-4 space-y-4">
          <CodeBlock code={ACTION_MESSAGE} language="json" filename="from the doc page — what a send-to-agent event carries" />
          <CodeBlock code={FUNCTION_VALUES} language="json" filename="from the doc page — function values" />
        </div>
      </Panel>

      <Panel title="Source">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/components/state-and-actions/shop-catalog.tsx" },
            { file: "frontend/src/app/generative-ui/components/state-and-actions/demo-chat/page.tsx" },
          ]}
          note={<>The page shows each feature as its own <code>createGenerativeUI</code> call, all under one id. They are merged into one catalog here. <code>PlanCard</code> is repo code that hosts the page&apos;s <code>onChoose</code> event.</>}
        />
      </Panel>
    </>
  );
}
