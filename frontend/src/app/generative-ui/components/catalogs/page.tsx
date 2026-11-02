import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, KeyValue, Panel, TryIt } from "@/components/ui";

const VALIBOT = `import * as v from "valibot";
import { toStandardJsonSchema } from "@valibot/to-json-schema";

props: toStandardJsonSchema(v.object({ name: v.string(), price: v.number() })),`;

const EXPORT = `import { exportA2UICatalog } from "@copilotkit/react-core/v2/generative-ui";

const catalog = exportA2UICatalog(appUI, { title: "Acme app" });
fs.writeFileSync("acme-catalog.json", JSON.stringify(catalog, null, 2));`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/components/catalogs" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A catalog, built with <code>createGenerativeUI</code>, is the list of
          components the agent may draw. Each entry is a React component, a
          description, and a props schema. Child components are filled
          through <code>slots</code> or <code>child()</code> refs. The demo
          uses the page&apos;s <code>shopUI</code> verbatim, combines it with{" "}
          <code>standardUI</code> through <code>extends</code>, and adds the
          page&apos;s <code>Hero</code>, <code>Panel</code> (with{" "}
          <code>parameterOrder</code>) and a <code>child()</code>-based
          TabbedPanel. A footer runs <code>exportA2UICatalog(appUI)</code>{" "}
          live.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Show all the products in a product grid titled 'Shop'.",
              "Make a hero that says 'Autumn sale', then a panel titled 'Picks' containing two product cards.",
              "Show a tabbed panel with one tab per product category.",
            ]}
            expect="1: the doc's ProductGrid — a two-column grid of unstyled cards (image, name, $price). 2: a gradient Hero above a bordered Panel holding cards. 3: collapsible sections, each holding a child component. The footer's 'Show exportA2UICatalog' button prints a JSON catalog that includes Hero, Panel, ProductGrid and the standard components."
            fail="The agent drawing standard Cards instead of ProductCard means shopUI did not merge: check the Inspector's Catalog tab. An error at load time about duplicate names means two catalogs declare the same component."
          />
        </div>
      </Panel>

      <Panel title="Component and catalog fields">
        <KeyValue
          rows={[
            ["component", "The React component."],
            ["description", "Tells the model when and how to use it."],
            ["props", "Any Standard Schema object; must validate synchronously (zod 3, zod 4.2+, ArkType, Valibot via @valibot/to-json-schema)."],
            ["slots", '"single" or "multiple" child props.'],
            ["child() / childList()", "Child references nested inside props."],
            ["events · bind · writable", "See State and actions."],
            ["parameterOrder", "CopilotKit metadata for positional order, not an A2UI keyword."],
            ["id / extends", "Versioned catalog id (acme/shop@1); bases to merge in."],
            ["accessibility", '"wrapper" (default) or "self" + useGenerativeUIAccessibility() for components that must not be wrapped.'],
          ]}
        />
      </Panel>

      <Panel title="Doc snippets not run here">
        <Callout tone="info" title="Valibot is not installed; fs doesn't exist in the browser">
          <p>
            The schema-library example uses Valibot, which this repo does not
            depend on, so it is shown rather than run. The export snippet
            writes a file with <code>fs</code>, so the demo calls the same
            function in the browser and offers the result as a download.
          </p>
        </Callout>
        <div className="mt-4 space-y-4">
          <CodeBlock code={VALIBOT} language="ts" filename="from the doc page — Valibot props" />
          <CodeBlock code={EXPORT} language="ts" filename="from the doc page — export" />
        </div>
      </Panel>

      <Panel title="Source">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/components/catalogs/app-catalog.tsx" },
            { file: "frontend/src/app/generative-ui/components/_shared/shop-catalog.tsx" },
            { file: "frontend/src/app/generative-ui/components/catalogs/demo-chat/page.tsx" },
          ]}
          note={
            <>
              The page&apos;s combine snippet extends <code>[standardUI, cartUI]</code>,
              and <code>cartUI</code> is defined nowhere. <code>shopUI</code>{" "}
              stands in for it. The <code>Hero</code> and <code>Panel</code>{" "}
              bodies are repo code; the page publishes only their schemas.
            </>
          }
        />
      </Panel>
    </>
  );
}
