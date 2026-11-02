import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, KeyValue, Panel, TryIt } from "@/components/ui";

const COLOR_SCHEME_SCRIPT = `const colorSchemeScript = \`(() => {
  const media = matchMedia("(prefers-color-scheme: dark)");
  const apply = () => document.documentElement.classList.toggle("dark", media.matches);
  apply();
  media.addEventListener("change", apply);
})();\`;

<head>
  <script dangerouslySetInnerHTML={{ __html: colorSchemeScript }} />
</head>;`;

const MAP_STYLE = `theme: {
  mapStyle: "https://tiles.example.com/light.json",
  dark: { mapStyle: "https://tiles.example.com/dark.json" },
},`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/components/theming" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Standard components read their colors, radii, shadows and font from{" "}
          <code>--a2ui-*</code> CSS variables. You set them through the
          provider&apos;s <code>theme</code> option, which is type-checked,
          or with CSS on <code>.a2ui-surface</code>. Dark mode follows a{" "}
          <code>dark</code> class on any ancestor, and{" "}
          <code>theme.dark</code> holds values that apply only in dark mode.
          The demo puts every one of these on a control.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Show a card with a title, a short paragraph, a badge and a primary button."]}
            expect="Change the accent: the button and badge recolor at once. Change the radius or font: the card reshapes or refonts. Tick '.dark ancestor': the panel and surface turn to the theme.dark values (#1f2937 / #111827). Untick 'theme accent' and tick the CSS override: the accent turns green, because CSS applies only when theme sets no value."
            fail="Nothing changes: the components aren't standard ones, or the theme isn't reaching the surface root, so inspect a .a2ui-surface element's inline style. With both the theme accent and the CSS override on, the accent should stay the theme color. If it turns green, the documented precedence is broken."
          />
        </div>
      </Panel>

      <Panel title="Variables">
        <KeyValue
          rows={[
            ["Accent", "--a2ui-color-accent, -on-accent, -control, -focus"],
            ["Surfaces", "--a2ui-color-surface, -surface-secondary, -surface-elevated, -panel, …"],
            ["Text", "--a2ui-color-text-default, -secondary, -tertiary, status variants"],
            ["Borders", "--a2ui-color-border-default, -subtle, -strong, -control"],
            ["Shape / type", "--a2ui-radius-*, --a2ui-shadow-xs…md, --a2ui-font-family"],
            ["Charts", "--a2ui-chart-1 … --a2ui-chart-6"],
          ]}
        />
        <p className="mt-2 text-xs text-slate-500">
          The page doesn&apos;t list every variable; use editor autocomplete
          on <code>GenerativeUITheme</code> for the full set.
        </p>
      </Panel>

      <Panel title="Doc snippets not run here">
        <Callout tone="info">
          <p>
            Following the system color scheme would flip the whole harness, so
            the demo toggles <code>dark</code> on a wrapper div instead. The
            Map style URLs are placeholders (tiles.example.com), so applying
            them would only break the Map.
          </p>
        </Callout>
        <div className="mt-4 space-y-4">
          <CodeBlock code={COLOR_SCHEME_SCRIPT} language="tsx" filename="from the doc page — follow the system scheme" />
          <CodeBlock code={MAP_STYLE} language="ts" filename="from the doc page — map styles" />
        </div>
      </Panel>

      <Panel title="Source">
        <SourceCode file="frontend/src/app/generative-ui/components/theming/demo-chat/page.tsx" />
      </Panel>
    </>
  );
}
