"use client";

/**
 * The Catalogs page's `app/catalog.tsx`, verbatim apart from the "use client"
 * directive this App Router needs and the eslint pragma on the doc's `<img>`.
 * https://docs.copilotkit.ai/claude-sdk-typescript/generative-ui/components/catalogs
 *
 * Shared by /surfaces and /catalogs, which both import `shopUI` from it.
 */

import { z } from "zod";
import {
  createGenerativeUI,
  type GenerativeUIComponentProps,
} from "@copilotkit/react-core/v2/generative-ui";

function ProductGrid({ title, children }: GenerativeUIComponentProps<typeof shopUI, "ProductGrid">) {
  return (
    <section>
      {title ? <h3>{title}</h3> : null}
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </section>
  );
}

function ProductCard({ name, price, imageUrl }: GenerativeUIComponentProps<typeof shopUI, "ProductCard">) {
  return (
    <article>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={name} />
      <h4>{name}</h4>
      <p>${price}</p>
    </article>
  );
}

export const shopUI = createGenerativeUI({
  id: "acme/shop@1",
  components: {
    ProductGrid: {
      component: ProductGrid,
      description: "A grid of products. Put the ids of ProductCard components in children.",
      props: z.object({ title: z.string().optional() }),
      slots: { children: "multiple" },
    },
    ProductCard: {
      component: ProductCard,
      description: "One product. Copy every value from a product of a tool result.",
      props: z.object({ name: z.string(), price: z.number(), imageUrl: z.string() }),
    },
  },
});
