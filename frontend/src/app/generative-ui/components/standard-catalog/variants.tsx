"use client";

/**
 * The Standard catalog page's four ways to use `standardUI`: as-is, extend,
 * omit, override. Each is the page's snippet; they all reuse the id
 * "acme/app@1" as published, which is safe because only one is mounted at a
 * time (the demo keys its provider on the variant).
 * https://docs.copilotkit.ai/claude-sdk-typescript/generative-ui/components/standard-catalog
 *
 * `ProductCard` and `productSchema` in the extend snippet are undefined on the
 * page; the pair below is repo code.
 */

import { z } from "zod";
import {
  createGenerativeUI,
  standardUI,
  type GenerativeUI,
  type GenerativeUIComponentProps,
} from "@copilotkit/react-core/v2/generative-ui";

const productSchema = z.object({ name: z.string(), price: z.number() });

function ProductCard({ name, price }: z.infer<typeof productSchema>) {
  return (
    <article className="rounded-lg border p-3">
      <h4 className="font-medium">{name}</h4>
      <p>${price}</p>
    </article>
  );
}

// ── Extend ─────────────────────────────────────────────────────────────────
export const extendedUI = createGenerativeUI({
  id: "acme/app@1",
  extends: [standardUI],
  components: {
    ProductCard: { component: ProductCard, props: productSchema },
  },
});

// ── Omit ───────────────────────────────────────────────────────────────────
export const omittedUI = createGenerativeUI({
  id: "acme/app@1",
  extends: [standardUI.omit(["Map", "Video", "HtmlView"])],
  components: {},
});

// ── Override ───────────────────────────────────────────────────────────────
function MyCard({ children }: GenerativeUIComponentProps<typeof standardUI, "Card">) {
  return <div className="rounded-2xl border p-6 shadow-sm">{children}</div>;
}

export const overriddenUI = createGenerativeUI({
  id: "acme/app@1",
  extends: [standardUI],
  overrides: { Card: { component: MyCard } },
  components: {},
});

export type VariantKey = "as-is" | "extend" | "omit" | "override";

export const VARIANTS: Record<
  VariantKey,
  { ui: GenerativeUI; label: string; note: string }
> = {
  "as-is": {
    ui: standardUI,
    label: "As-is",
    note: "standardUI unchanged — all 69 components.",
  },
  extend: {
    ui: extendedUI,
    label: "Extend",
    note: "standardUI + a ProductCard of our own.",
  },
  omit: {
    ui: omittedUI,
    label: "Omit",
    note: "Map, Video and HtmlView removed — the model no longer sees them.",
  },
  override: {
    ui: overriddenUI,
    label: "Override",
    note: "Card is rendered by MyCard (rounded-2xl, shadow) instead of the built-in.",
  },
};
