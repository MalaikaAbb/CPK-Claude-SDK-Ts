import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel } from "@/components/ui";

const DOC = "frontend/src/app/generative-ui/a2ui/_doc";

/** The page's Python helper snippet, shown as text: this backend is Node. */
const PY_HELPERS = `from copilotkit import a2ui

a2ui.create_surface(surface_id, catalog_id=...)
a2ui.update_components(surface_id, components)
a2ui.update_data_model(surface_id, {"items": data})
a2ui.render(operations=[...])  # wraps in a2ui_operations and serializes`;

/**
 * The A2UI overview page. It introduces the two approaches and the two ways to
 * switch A2UI on, which this repo already runs on the Dynamic Schema and Fixed
 * Schema routes. Layout follows the aws-strands-py sibling's overview route;
 * the snippets are this page's, kept byte-for-byte in `_doc/` and type-checked.
 */
export default function Page() {
  const link = "text-[var(--accent)] underline underline-offset-4";
  return (
    <>
      <RouteHeader path="/generative-ui/a2ui" />

      <Panel title="What the page covers">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          An A2UI surface is assembled from three operations, in order:{" "}
          <code>createSurface</code>, <code>updateComponents</code> (the tree),
          and <code>updateDataModel</code> (the data, bound through JSON
          Pointer paths). The schema comes from one of two places:{" "}
          <Link href="/generative-ui/a2ui/dynamic-schema" className={link}>
            Dynamic Schema
          </Link>{" "}
          (a secondary LLM designs tree and data per request) or{" "}
          <Link href="/generative-ui/a2ui/fixed-schema" className={link}>
            Fixed Schema
          </Link>{" "}
          (the tree is authored up front and the agent only streams data).
          A2UI is switched on by a catalog on the provider or by an{" "}
          <code>a2ui</code> block on the runtime, and the basic catalog&apos;s
          colors are CSS variables.
        </p>
      </Panel>

      <Panel
        title="Setup 1: a catalog on the provider (recommended)"
        description="Turns A2UI on and injects generate_a2ui. Runs on /generative-ui/a2ui/dynamic-schema."
      >
        <SourceCodeGroup
          files={[
            { file: `${DOC}/provider-catalog.tsx` },
            { file: "frontend/src/app/generative-ui/a2ui/dynamic-schema/demo-chat/page.tsx" },
          ]}
          note="Top: the page's snippet (myCatalog and children are never defined on the page; suppressed, not filled in). Bottom: this repo's running form of it."
        />
      </Panel>

      <Panel
        title="Setup 2: enable on the runtime"
        description="The page's no-catalog path sets injectA2UITool: true. This repo's runtime has an a2ui block with injectA2UITool: false, scoped to the Fixed Schema agent."
      >
        <SourceCode file={`${DOC}/runtime-no-catalog.ts`} />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Compare <code>frontend/src/app/api/copilotkit/[[...slug]]/route.ts</code>{" "}
          (<code>a2ui: &#123; injectA2UITool: false, agents: [...] &#125;</code>).
          No route here runs the exact no-catalog, auto-inject combination the
          page shows, and <code>myAgent</code> is never defined on the page.
        </p>
      </Panel>

      <Callout tone="info" title="The helper snippet is Python, on a TypeScript page">
        <p>
          The page lists the three operations through{" "}
          <code>from copilotkit import a2ui</code>, the CopilotKit Python SDK.
          This integration&apos;s backend is Node, with no such package. Its
          Fixed Schema tool returns the <code>a2ui_operations</code> envelope
          from TypeScript instead
          (<code>backend/src/agents/display-flight-mcp-server.ts</code>, repo
          code). The snippet is shown as text only.
        </p>
        <div className="mt-3">
          <CodeBlock code={PY_HELPERS} language="python" filename="from the doc page — not runnable here" />
        </div>
      </Callout>

      <Panel
        title="Colors and dark mode"
        description="CSS variables on .a2ui-surface; shown, not applied in this repo."
      >
        <SourceCode file={`${DOC}/surface-colors.css`} />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          The{" "}
          <Link href="/generative-ui/components/theming" className={link}>
            Components theming
          </Link>{" "}
          route drives the same <code>--a2ui-*</code> variables live.
        </p>
      </Panel>
    </>
  );
}
