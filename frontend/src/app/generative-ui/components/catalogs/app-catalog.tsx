"use client";

/**
 * The Catalogs page's "combine", "parameterOrder", child-ref and
 * accessibility snippets, assembled into one catalog.
 * https://docs.copilotkit.ai/claude-sdk-typescript/generative-ui/components/catalogs
 *
 * Where the page leaves names undefined, this file fills them and says so:
 *  - `cartUI` in `extends: [standardUI, cartUI]` is never defined; `shopUI`
 *    (the page's own first example) stands in for it.
 *  - `Hero` and `Panel` have props schemas but no React bodies; the bodies
 *    below are repo code.
 *  - The `tabs` / `child()` line is a fragment; `TabbedPanel` wraps it.
 */

import type { ReactNode } from "react";
import { z } from "zod";
import {
  child,
  createGenerativeUI,
  standardUI,
  useGenerativeUIAccessibility,
} from "@copilotkit/react-core/v2/generative-ui";

import { shopUI } from "../_shared/shop-catalog";

function Hero({ title }: { title: string }) {
  // The page: call the hook in your component and spread it on the root.
  const a11y = useGenerativeUIAccessibility();
  return (
    <header
      {...a11y}
      className="rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 p-6 text-white"
    >
      <h2 className="text-2xl font-semibold">{title}</h2>
    </header>
  );
}

function Panel({
  title,
  color,
  children,
}: {
  title: string;
  color?: string;
  children?: ReactNode;
}) {
  return (
    <section
      className="rounded-lg border p-4"
      style={{ borderColor: color ?? undefined }}
    >
      <h3 className="mb-2 font-semibold">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function TabbedPanel({ tabs }: { tabs: { title: string; child: ReactNode }[] }) {
  return (
    <div className="space-y-3">
      {tabs.map((tab, i) => (
        <details key={i} open={i === 0} className="rounded border p-2">
          <summary className="cursor-pointer font-medium">{tab.title}</summary>
          <div className="mt-2">{tab.child}</div>
        </details>
      ))}
    </div>
  );
}

export const appUI = createGenerativeUI({
  id: "acme/app@1",
  extends: [standardUI, shopUI],
  components: {
    Hero: { component: Hero, props: z.object({ title: z.string() }) },
    Panel: {
      component: Panel,
      props: z.object({ title: z.string(), color: z.string().optional() }),
      slots: { children: "multiple" },
      parameterOrder: ["title", "children"],
    },
    TabbedPanel: {
      component: TabbedPanel,
      description: "Collapsible sections. Each tab holds the id of one child component.",
      props: z.object({ tabs: z.array(z.object({ title: z.string(), child: child() })) }),
    },
  },
});
