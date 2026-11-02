"use client";

import { useCallback, useState } from "react";
import {
  CopilotChat,
  CopilotKitProvider,
  useAgentContext,
} from "@copilotkit/react-core/v2";
import {
  useGenerativeUIFunction,
  useGenerativeUIState,
} from "@copilotkit/react-core/v2/generative-ui";

import { DemoFrame } from "@/components/demo-frame";
import { nestedInspectorSetting } from "@/lib/inspector";

import { PRODUCTS, PRODUCTS_CONTEXT_DESCRIPTION } from "../../_shared/products";
import { shopUI, type Cart } from "../shop-catalog";

const AGENT_ID = "gen-ui-state-actions";

/** The page's `CartState`, verbatim: feeds `state.cart` to every surface. */
function CartState({ cart }: { cart: Cart }) {
  useGenerativeUIState(shopUI, "cart", { items: cart.items });
  return null;
}

/**
 * The page's `CartActions`, with `cart.addItem` being this page's setter.
 * `track` and `reload` handlers are repo code so their calls show in the log.
 */
function CartActions({
  addItem,
  log,
}: {
  addItem: (productId: string, quantity: number) => void;
  log: (line: string) => void;
}) {
  useGenerativeUIFunction(shopUI, "addToCart", ({ productId, quantity }) => {
    addItem(productId, quantity);
    log(`addToCart(${productId}, ${quantity})`);
    return { added: productId };
  });
  useGenerativeUIFunction(shopUI, "track", ({ event }) => {
    log(`track(${event})`);
  });
  useGenerativeUIFunction(shopUI, "reload", () => {
    log("reload() — agentOnly; the page says the agent cannot call it yet");
  });
  return null;
}

function ProductsContext() {
  useAgentContext({ description: PRODUCTS_CONTEXT_DESCRIPTION, value: PRODUCTS });
  return null;
}

export default function Page() {
  const [cart, setCart] = useState<Cart>({ items: [] });
  const [activity, setActivity] = useState<string[]>([]);

  const log = useCallback(
    (line: string) => setActivity((prev) => [`${new Date().toLocaleTimeString()} ${line}`, ...prev]),
    [],
  );

  const addItem = useCallback((productId: string, quantity: number) => {
    setCart((prev) => {
      const existing = prev.items.find((i) => i.productId === productId);
      return {
        items: existing
          ? prev.items.map((i) =>
              i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i,
            )
          : [...prev.items, { productId, quantity }],
      };
    });
  }, []);

  return (
    <DemoFrame
      parentPath="/generative-ui/components/state-and-actions"
      subtitle={`agent: ${AGENT_ID} · ui: shopUI + standardUI`}
    >
      <CopilotKitProvider
        runtimeUrl="/api/copilotkit-components"
        agentId={AGENT_ID}
        generativeUI={{ ui: shopUI }}
        enableInspector={nestedInspectorSetting}
      >
        <CartState cart={cart} />
        <CartActions addItem={addItem} log={log} />
        <ProductsContext />

        <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[1fr_320px]">
          <CopilotChat agentId={AGENT_ID} className="h-full min-h-0" />

          <aside className="min-h-0 space-y-4 overflow-y-auto border-l border-slate-200 p-4 text-sm dark:border-slate-800">
            <section>
              <h2 className="mb-1 font-semibold">App cart (state.cart)</h2>
              {cart.items.length === 0 ? (
                <p className="text-slate-500">Empty.</p>
              ) : (
                <ul className="space-y-1">
                  {cart.items.map((i) => (
                    <li key={i.productId} className="flex justify-between">
                      <code>{i.productId}</code>
                      <span>× {i.quantity}</span>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={() => addItem("p-lamp", 1)}
                className="mt-2 rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-700"
              >
                Add p-lamp from the app
              </button>
              <p className="mt-1 text-xs text-slate-500">
                A rendered ProductCard for p-lamp should update its &ldquo;In cart&rdquo; count.
              </p>
            </section>

            <section>
              <h2 className="mb-1 font-semibold">Function calls</h2>
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs text-slate-600 dark:text-slate-300">
                {activity.join("\n") || "None yet."}
              </pre>
            </section>
          </aside>
        </div>
      </CopilotKitProvider>
    </DemoFrame>
  );
}
