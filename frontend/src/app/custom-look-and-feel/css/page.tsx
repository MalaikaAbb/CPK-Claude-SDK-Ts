import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const CSS_PROPERTIES_HELPER = `import { CopilotKitCSSProperties } from "@copilotkit/react-ui";

<div
  style={
    {
      "--copilot-kit-primary-color": "#222222",
    } as CopilotKitCSSProperties
  }
>
  <CopilotSidebar />
</div>`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/custom-look-and-feel/css" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Re-skinning the chat without touching a component. Three layers, in
          increasing specificity: shadcn design tokens on{" "}
          <code>[data-copilotkit]</code>, then <code>.copilotKit*</code> class
          overrides for structure and fonts, then the <code>labels</code> prop
          for copy. Every selector is scoped to a wrapper class so nothing
          escapes the route.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Hello there"]}
            expect="Parchment background, serif message text, and your own message in a mono card with a copper “→” marker down its left edge."
            fail="Default slate-and-white chrome means theme.css was not bundled, or the wrapper class is missing from the tree."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/custom-look-and-feel/css/demo-chat/page.tsx" },
            { file: "frontend/src/app/custom-look-and-feel/css/demo-chat/theme.css" },
          ]}
        />
      </Panel>

      <Panel title="Two token systems, and which one applies here">
        <Callout tone="warn" title="The v1 variables in the doc's first table do nothing in v2">
          <p>
            The page leads with the <code>--copilot-kit-*</code> variables and a{" "}
            <code>CopilotKitCSSProperties</code> helper imported from{" "}
            <code>@copilotkit/react-ui</code>. That is the <strong>v1</strong>{" "}
            token system. This harness is built on{" "}
            <code>@copilotkit/react-core/v2</code>, which is Tailwind + shadcn
            and reads a different set entirely — <code>--primary</code>,{" "}
            <code>--background</code>, <code>--muted</code>,{" "}
            <code>--border</code>, <code>--radius</code>.
          </p>
          <p className="mt-2">
            The page does say so, in a callout well below the v1 reference
            table. <code>@copilotkit/react-ui</code> is not even a dependency
            here, so the snippet below is shown for comparison only and is not
            wired into the demo.
          </p>
        </Callout>

        <div className="mt-4">
          <CodeBlock
            code={CSS_PROPERTIES_HELPER}
            filename="the doc's v1 inline-override helper — not used by this route"
            language="tsx"
          />
        </div>
      </Panel>

      <Panel title="What is not reproducible here">
        <Callout tone="info" title="theme.css is only ever shown in excerpt">
          The page publishes two blocks of its <code>theme.css</code> — the
          HALCYON palette and the user-message bubble — out of a file that
          clearly styles far more than that. The rest is never shown, so{" "}
          <code>theme.css</code> in this repo is the published subset plus the
          page&apos;s generic <code>.copilotKitMessages</code> /{" "}
          <code>.copilotKitInput</code> examples, and nothing invented on top.
        </Callout>
      </Panel>

      <Panel title="The route this all hangs off">
        <SourceCode file="frontend/src/app/api/copilotkit/route.ts" />
      </Panel>
    </>
  );
}
