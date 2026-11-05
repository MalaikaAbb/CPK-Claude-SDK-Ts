import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, KeyValue, Panel, TryIt } from "@/components/ui";

const EXAMPLE_REPLY = `Here is an estimate you can play with:

\`\`\`a2ui
{"version":"v1.0","createSurface":{"surfaceId":"plan-estimator","dataModel":{"seats":10,"price":"$290 / month"},"components":[{"id":"root","component":"Card","children":["seats","price"]}]}}
{"version":"v1.0","updateComponents":{"surfaceId":"plan-estimator","components":[{"id":"seats","component":"Slider","label":"Seats","min":1,"max":50,"value":{"@path":"/seats"}},{"id":"price","component":"Text","text":{"@path":"/price"}}]}}
\`\`\`

Move the slider to change the seat count.`;

const ENVELOPE = `{
  "v1.0": {
    "supportedCatalogIds": ["copilotkit/standard@1"],
    "inlineCatalogs": [
      {
        "catalogId": "copilotkit/standard@1",
        "protocolVersion": "1.0",
        "components": { "Card": { "props": { "type": "object" } } },
        "functions": {},
        "instructions": "You can show interactive UI in your reply ..."
      }
    ]
  },
  "metadata": {
    "extensions": {
      "copilotkit_format": 3,
      "copilotkit_transport": "markdown",
      "copilotkit_targets": [{ "id": "chat", "kind": "chat" }],
      "copilotkit_surfaces": {},
      "copilotkit_contextSent": false
    }
  }
}`;

const PYTHON = `ui = input.forwarded_props["copilotkit"]["ui"]
catalog = ui["v1.0"]["inlineCatalogs"][0]
system = f"{MY_PROMPT}\\n\\n{catalog['instructions']}\\n\\nComponents:\\n{json.dumps(catalog['components'])}"`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/components/markdown-mode" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The agent writes A2UI operations in <code>```a2ui</code> fences
          inside an ordinary text reply. There is no tool call, so it works
          with any agent that streams text. Surfaces render as the fence
          streams in. Adding <code>target=&lt;id&gt;</code> to the fence sends
          the surface to a <code>GenerativeUISurface</code> on the page. The
          demo has a <code>featured</code> target beside the chat, plus
          toggles for <code>sendContext</code> and{" "}
          <code>includeCatalog</code>.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Give me a seat price estimator I can play with: a slider for seats and the monthly price at $29/seat.",
              "Show a short checklist in the side panel.",
              "(with sendContext off) Show me a card with today's date.",
            ]}
            expect="1: text, then a Card with a working Slider inline in the same reply, then more text. 2: the checklist appears in the right-hand 'featured' panel, not the chat. 3: plain text only, because without context entries the model gets no guide, and this backend doesn't build its own prompt from the envelope."
            fail="Raw JSON shown as a code block: the fence wasn't recognised. Check it starts at column 0 (an indented fence inside a list counts as code). A surface that never updates after a 'deleted' status is expected, because surfaceIds can't be reused."
          />
        </div>
      </Panel>

      <Panel title="Options">
        <KeyValue
          rows={[
            ["sendContext", "false = no context entries. The backend builds its prompt from forwardedProps.copilotkit.ui."],
            ["includeCatalog", "false = leave component schemas out of the envelope."],
            ["agentIds", "Limit the envelope to these agents."],
          ]}
        />
      </Panel>

      <Panel title="Limits and caveats">
        <Callout tone="warn">
          <ul className="list-disc space-y-1 pl-4">
            <li>A fence must start at the beginning of a line.</li>
            <li>Values must be literals, <code>&#123;&quot;@path&quot;&#125;</code> or <code>&#123;&quot;@call&quot;&#125;</code>. There are no operators outside <code>calc</code> and no list-mapping function.</li>
            <li>A surfaceId is never reused. Statuses: <code>deleted</code> (id retired), <code>failed</code> (browser rejected createSurface).</li>
            <li>v1 chat (<code>@copilotkit/react-ui</code>) renders fences only if the v1 provider gets the same <code>generativeUI</code> prop. This repo uses v2 only, so that path isn&apos;t exercised.</li>
            <li>The page&apos;s own-prompt example is Python. This TypeScript backend relies on the context entries, so <code>sendContext: false</code> is expected to produce plain text here.</li>
          </ul>
        </Callout>
        <div className="mt-4 space-y-4">
          <CodeBlock code={EXAMPLE_REPLY} language="md" filename="from the doc page — an example reply" />
          <CodeBlock code={ENVELOPE} language="json" filename="from the doc page — forwardedProps.copilotkit.ui" />
          <CodeBlock code={PYTHON} language="python" filename="from the doc page — building your own prompt (Python, not run)" />
        </div>
      </Panel>

      <Panel title="Source">
        <SourceCode file="frontend/src/app/generative-ui/components/markdown-mode/demo-chat/page.tsx" />
      </Panel>
    </>
  );
}
