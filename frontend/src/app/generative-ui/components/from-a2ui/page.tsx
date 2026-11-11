import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const BASE = "frontend/src/app/generative-ui/components/from-a2ui/demo-chat";

// The page's before/after pairs (React tab), verbatim, shown but not run.
const BEFORE_PROVIDER = `<CopilotKit runtimeUrl="/api/copilotkit" a2ui={{ catalog: myCatalog }}>`;
const AFTER_PROVIDER = `<CopilotKitProvider runtimeUrl="/api/copilotkit" generativeUI={{ ui: appUI }}>`;
const RUNTIME_BEFORE = `const runtime = new CopilotRuntime({
  agents,
  a2ui: { injectA2UITool: false, agents: ["shop"] },
});`;
const RUNTIME_AFTER = `// Nothing: a run that carries a catalog gets the render_ui tool and the guide.
// To force or limit it: generativeUI: true, or generativeUI: { agents: ["shop"] }.
const runtime = new CopilotRuntime({ agents });`;
const CATALOG_BEFORE = `import { createCatalog, DynamicStringSchema } from "@copilotkit/a2ui-renderer";

const definitions = {
  Airport: {
    props: z.object({ code: DynamicStringSchema, city: DynamicStringSchema }),
  },
  Arrow: { props: z.object({}) },
};
const renderers = { Airport, Arrow };
export const myCatalog = createCatalog(definitions, renderers, {
  catalogId: "acme/flights",
  includeBasicCatalog: true,
});`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/components/from-a2ui" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Moving from the <code>a2ui</code> renderer (A2UI v0.9) to components
          and surfaces (A2UI 1.0). The provider gets a <code>ui</code> in place
          of a <code>catalog</code>, the runtime loses its A2UI option, and
          each component becomes a single entry with a description and plain
          prop types, since the engine resolves bindings before the component
          sees them. The demo runs the &ldquo;After&rdquo; catalog.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Show a flight card from SFO (San Francisco) to JFK (New York) with a Book button"]}
            expect="Two Airport components (code, with the city underneath) with an Arrow between them, laid out with standard components, plus a standard Button. Not yet checked in a browser."
            fail="A plain text answer, or a rejection naming a v0.9 shape: the agent wrote { path } bindings or an old-style action, which the 1.0 engine refuses."
          />
        </div>
      </Panel>

      <Panel title="The After catalog, as published">
        <SourceCodeGroup
          files={[{ file: `${BASE}/app-ui.ts` }, { file: `${BASE}/scaffolding.tsx` }]}
          note="The catalog is the page's. Airport and Arrow are never defined on it; the two minimal components are borrowed from the aws-strands-ts harness, labelled in the file."
        />
      </Panel>

      <Panel title="The demo">
        <SourceCode file={`${BASE}/page.tsx`} />
      </Panel>

      <Panel
        title="Published but not run"
        description="The before/after pairs. The Before side is what the A2UI fixed- and dynamic-schema routes run."
      >
        <div className="space-y-4">
          <CodeBlock code={BEFORE_PROVIDER} filename="Before" language="tsx" />
          <CodeBlock code={AFTER_PROVIDER} filename="After" language="tsx" />
          <CodeBlock code={RUNTIME_BEFORE} filename="Runtime, before" language="ts" />
          <CodeBlock code={RUNTIME_AFTER} filename="Runtime, after" language="ts" />
          <CodeBlock code={CATALOG_BEFORE} filename="Convert a custom catalog — Before" language="ts" />
        </div>
      </Panel>

      <Callout tone="warn" title="Gaps and harness changes">
        <ul className="space-y-1.5">
          <li>
            · The After catalog uses <code>z</code>, <code>Airport</code> and{" "}
            <code>Arrow</code> with no import or definition; the import is
            added and the two components are borrowed scaffolding.
          </li>
          <li>
            · &ldquo;Runtime, after&rdquo; is <code>new CopilotRuntime(
            {"{ agents }"})</code>. The shared{" "}
            <code>/api/copilotkit-components</code> runtime has no A2UI option
            either (it sets <code>generativeUI: true</code>), so it stands in.
            The demo adds <code>agentId</code> to the provider, which the
            page&apos;s one-line provider leaves out.
          </li>
          <li>
            · The support matrix rules out agent tools built with{" "}
            <code>@ag-ui/a2ui-toolkit</code> 0.0.5, because they write v0.9
            operations. This repo&apos;s fixed-schema <code>display_flight</code>{" "}
            bridge emits the v0.9 operations of the A2UI page, so those
            surfaces cannot move to this engine as published.
          </li>
          <li>
            · The Before catalog is shown only; running it is the A2UI
            routes&apos; job.
          </li>
        </ul>
      </Callout>
    </>
  );
}
