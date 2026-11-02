import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, KeyValue, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/components/surfaces" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A surface is one piece of generated UI. It renders into a{" "}
          <em>target</em>: either the chat, or a spot on the page marked with{" "}
          <code>&lt;GenerativeUISurface id=…&gt;</code>. The demo page has four
          targets: <code>featured</code> (limited to ProductGrid +
          ProductCard, with a static fallback), two per-item{" "}
          <code>recommendations-&lt;id&gt;</code> rows, and{" "}
          <code>sidebar-notes</code> with <code>autoScroll</code> off. The
          provider also carries the page&apos;s <code>errorBoundary</code>{" "}
          config, and its <code>onError</code> output is mirrored into a
          visible log.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Show me the products in the featured row.",
              "Recommend something under the Arc Desk Lamp.",
              "Show the featured products again.",
              "Put a short note about shipping in the notes area.",
            ]}
            expect="1: the static fallback row is replaced by a ProductGrid of ProductCards (images, names, prices) in the featured area, not in the chat. 2: cards appear under the lamp, never including the lamp. 3: per the target's description the surface is deleted and the fallback returns. 4: the notes area fills without the page scrolling to it."
            fail="UI landing in the chat instead of the page means the agent never saw the targets (Inspector → Prompt). A red log line with kind 'operation' means a component outside the target's `components` list was rejected."
          />
        </div>
      </Panel>

      <Panel title="GenerativeUISurface props">
        <KeyValue
          rows={[
            ["id", "The name the agent uses to render here."],
            ["description", "Read on every run, so write it as an instruction."],
            ["fallback", "Shown until the agent renders, and again after it deletes the surface."],
            ["ui + components", "Restrict this target to these components (root included). Omit both for the whole catalog."],
            ["autoScroll", "Scroll the target into view when the agent renders there, unless it's already visible. Default on."],
          ]}
        />
      </Panel>

      <Panel title="What the agent sees each run">
        <Callout tone="info">
          <p>
            The on-screen targets with their descriptions and limits, the
            surfaces that already exist (so it updates in place), values the
            user typed (which it cannot overwrite), and any rejected operations
            with the reason.
          </p>
        </Callout>
      </Panel>

      <Panel title="Source">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/components/surfaces/demo-chat/page.tsx" },
            { file: "frontend/src/app/generative-ui/components/_shared/shop-catalog.tsx" },
            { file: "frontend/src/app/generative-ui/components/_shared/products.ts" },
          ]}
          note={
            <>
              <code>ProductRow</code> (the fallback) and the product list are
              repo code. The page passes <code>products</code> as a prop and
              says to copy values &ldquo;from a tool result&rdquo;, but never
              says where they come from, so the demo gives them to the agent
              with <code>useAgentContext</code>.
            </>
          }
        />
      </Panel>
    </>
  );
}
