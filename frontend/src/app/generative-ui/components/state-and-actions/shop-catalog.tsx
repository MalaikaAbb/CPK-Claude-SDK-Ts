"use client";

/**
 * The State and actions page's snippets merged into one `shopUI`.
 * https://docs.copilotkit.ai/claude-sdk-typescript/generative-ui/components/state-and-actions
 *
 * The page shows each feature as a separate `createGenerativeUI` call with
 * the same id; one catalog can only have one of each component, so they are
 * combined here:
 *  - Live state: `state.cart` + `bind.inCart` on ProductCard.
 *  - Functions: `addToCart` (the callers snippet's `allowedCallers` /
 *    `returnType` merged into the functions snippet's definition), `track`,
 *    `reload`. ProductCard's `onAddToCart` event matches `addToCart`.
 *  - Send to agent: PlanCard's `onChoose` has parameters and no `choose`
 *    function, so a click becomes a user message to the agent.
 *  - Writable: CheckoutForm's `email`.
 * `extends: [standardUI]` is repo code, so the agent also has Text, Slider etc.
 * for the page's `calc` / `formatCurrency` function-value examples.
 */

import { useState } from "react";
import { z } from "zod";
import {
  createGenerativeUI,
  standardUI,
  type GenerativeUIComponentProps,
} from "@copilotkit/react-core/v2/generative-ui";

const cartSchema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number() })),
});

export type Cart = z.infer<typeof cartSchema>;

function ProductCard({ productId, name, inCart, onAddToCart }: GenerativeUIComponentProps<typeof shopUI, "ProductCard">) {
  const [error, setError] = useState<string>();
  return (
    <article className="rounded-lg border p-3">
      <h4 className="font-medium">{name}</h4>
      <p className="text-xs text-slate-500">In cart: {inCart}</p>
      <button
        className="mt-2 rounded border px-2 py-1 text-sm"
        onClick={async () => {
          const result = await onAddToCart?.({ productId });
          if (result && !result.ok) setError(result.error.message);
        }}
      >
        Add to cart
      </button>
      {error ? <p role="alert">{error}</p> : null}
    </article>
  );
}

function PlanCard({ plan, price, onChoose }: GenerativeUIComponentProps<typeof shopUI, "PlanCard">) {
  return (
    <article className="rounded-lg border p-3">
      <h4 className="font-medium capitalize">{plan}</h4>
      {price ? <p className="text-sm">{price}</p> : null}
      <button className="mt-2 rounded border px-2 py-1 text-sm" onClick={() => onChoose?.({ plan })}>
        Choose {plan}
      </button>
    </article>
  );
}

function CheckoutForm({ email, setEmail }: GenerativeUIComponentProps<typeof shopUI, "CheckoutForm">) {
  return <input className="rounded border px-2 py-1" placeholder="email" value={email ?? ""} onChange={(event) => setEmail(event.target.value)} />;
}

export const shopUI = createGenerativeUI({
  id: "acme/shop@1",
  extends: [standardUI],
  state: { cart: cartSchema },
  functions: {
    addToCart: {
      description: "Add a product to the cart",
      parameters: z.object({ productId: z.string(), quantity: z.number().default(1) }),
      allowedCallers: "rendererOrAgent",
      returnType: "object",
    },
    track: { parameters: z.object({ event: z.string() }), returnType: "void" },
    reload: { parameters: z.object({}), allowedCallers: "agentOnly" },
  },
  components: {
    ProductCard: {
      component: ProductCard,
      props: z.object({ productId: z.string(), name: z.string(), inCart: z.number() }),
      bind: {
        inCart: (state, { productId }) =>
          state.cart.items.find((item) => item.productId === productId)?.quantity ?? 0,
      },
      events: { onAddToCart: {} },
    },
    PlanCard: {
      component: PlanCard,
      description: "One pricing plan with a Choose button.",
      props: z.object({ plan: z.string(), price: z.string().optional() }),
      events: {
        onChoose: {
          description: "The user picked a plan",
          parameters: z.object({ plan: z.string() }),
        },
      },
    },
    CheckoutForm: {
      component: CheckoutForm,
      props: z.object({ email: z.string().optional() }),
      writable: ["email"],
    },
  },
});
