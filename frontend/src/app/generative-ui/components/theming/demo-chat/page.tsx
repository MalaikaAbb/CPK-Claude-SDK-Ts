"use client";

import { useMemo, useState } from "react";
import { CopilotChat, CopilotKitProvider } from "@copilotkit/react-core/v2";
import {
  standardUI,
  type GenerativeUITheme,
} from "@copilotkit/react-core/v2/generative-ui";

import { DemoFrame } from "@/components/demo-frame";
import { nestedInspectorSetting } from "@/lib/inspector";

const AGENT_ID = "gen-ui-theming";

const FONTS = ["Inter, sans-serif", "Georgia, serif", "ui-monospace, monospace"];

/**
 * The page's provider theme, with each value wired to a control:
 *  - top-level `--a2ui-color-accent` / `--a2ui-font-family` / `--a2ui-radius-md`
 *    (the page's first snippet, defaults are its values),
 *  - `dark` overrides (the per-mode snippet, its values),
 *  - the `.a2ui-surface` CSS rule, toggleable, to show the page's
 *    "a value in `theme` wins over CSS" rule — clear the theme accent and the
 *    CSS one shows through.
 * Dark mode is the page's `dark` class, put on an ancestor div instead of
 * `<html>` so it doesn't flip the rest of the harness.
 */
export default function Page() {
  const [accent, setAccent] = useState("#d97706");
  const [useThemeAccent, setUseThemeAccent] = useState(true);
  const [font, setFont] = useState(FONTS[0]);
  const [radius, setRadius] = useState(10);
  const [dark, setDark] = useState(false);
  const [cssOverride, setCssOverride] = useState(false);

  const theme = useMemo<GenerativeUITheme>(
    () => ({
      ...(useThemeAccent ? { "--a2ui-color-accent": accent } : {}),
      "--a2ui-font-family": font,
      "--a2ui-radius-md": `${radius}px`,
      dark: {
        "--a2ui-color-panel": "#1f2937",
        "--a2ui-color-surface": "#111827",
      },
    }),
    [accent, useThemeAccent, font, radius],
  );

  return (
    <DemoFrame
      parentPath="/generative-ui/components/theming"
      subtitle={`agent: ${AGENT_ID} · ${dark ? "dark" : "light"}`}
    >
      {cssOverride && <style>{`.a2ui-surface { --a2ui-color-accent: #16a34a; }`}</style>}

      <div className="flex h-full min-h-0 flex-col">
        <div className="flex shrink-0 flex-wrap items-center gap-4 border-b border-slate-200 px-4 py-2 text-xs dark:border-slate-800">
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={useThemeAccent} onChange={(e) => setUseThemeAccent(e.target.checked)} />
            theme accent
            <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} disabled={!useThemeAccent} />
          </label>
          <label className="flex items-center gap-1">
            font
            <select value={font} onChange={(e) => setFont(e.target.value)} className="rounded border px-1">
              {FONTS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1">
            radius-md {radius}px
            <input type="range" min={0} max={24} value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} />
            .dark ancestor
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={cssOverride} onChange={(e) => setCssOverride(e.target.checked)} />
            .a2ui-surface CSS accent (#16a34a)
          </label>
        </div>

        <div className={`min-h-0 flex-1 ${dark ? "dark bg-slate-950" : ""}`}>
          <CopilotKitProvider
            runtimeUrl="/api/copilotkit-components"
            agentId={AGENT_ID}
            generativeUI={{ ui: standardUI, theme }}
            enableInspector={nestedInspectorSetting}
          >
            <CopilotChat agentId={AGENT_ID} className="h-full" />
          </CopilotKitProvider>
        </div>
      </div>
    </DemoFrame>
  );
}
