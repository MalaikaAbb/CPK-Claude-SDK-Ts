"use client";

import { useState } from "react";
import {
  CopilotChat,
  CopilotKitProvider,
  useAgentContext,
} from "@copilotkit/react-core/v2";
import {
  GenerativeUISurface,
  type GenerativeUIErrorInfo,
} from "@copilotkit/react-core/v2/generative-ui";

import { DemoFrame } from "@/components/demo-frame";
import { nestedInspectorSetting } from "@/lib/inspector";

import {
  PRODUCTS,
  PRODUCTS_CONTEXT_DESCRIPTION,
  type Product,
} from "../../_shared/products";
import { shopUI } from "../../_shared/shop-catalog";

const AGENT_ID = "gen-ui-surfaces";

/** Repo code: the static row the doc's `fallback` points at but never shows. */
function ProductRow({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {products.slice(0, 3).map((p) => (
        <div
          key={p.productId}
          className="rounded-md border border-slate-200 p-3 text-sm dark:border-slate-700"
        >
          <p className="font-medium">{p.name}</p>
          <p className="text-slate-500">${p.price}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * The page's `FeaturedProducts`, verbatim except for `export`, which Next
 * does not allow on extra page-file symbols.
 */
function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <GenerativeUISurface
      id="featured"
      ui={shopUI}
      description="The Featured Products row of the home page. When the customer asks to see products here, show them as a ProductGrid with one ProductCard for each product. When they ask for the featured products again, delete this surface."
      components={["ProductGrid", "ProductCard"]}
      fallback={<ProductRow products={products} />}
    />
  );
}

function ShopPage() {
  useAgentContext({ description: PRODUCTS_CONTEXT_DESCRIPTION, value: PRODUCTS });

  return (
    <div className="space-y-8 overflow-y-auto p-6">
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Featured products · target <code>featured</code>
        </h2>
        <FeaturedProducts products={PRODUCTS} />
      </section>

      {/* Per-item targets, as published — one surface id per product. */}
      {PRODUCTS.slice(0, 2).map((product) => (
        <section key={product.productId}>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Under {product.name} · target <code>recommendations-{product.productId}</code>
          </h2>
          <GenerativeUISurface
            key={product.productId}
            id={`recommendations-${product.productId}`}
            description={`The "You might also like" row under ${product.name}. Show related products here. Never include ${product.name} itself.`}
            fallback={<p className="text-sm text-slate-400">No recommendations yet.</p>}
          />
        </section>
      ))}

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Notes · target <code>sidebar-notes</code> · autoScroll off
        </h2>
        <GenerativeUISurface
          id="sidebar-notes"
          autoScroll={false}
          description="A notes area. Put short notes or summaries here when asked."
        />
      </section>
    </div>
  );
}

/**
 * Its own provider: `generativeUI` carries `shopUI` and the page's
 * `errorBoundary` config. The `onError` callback is the doc's `console.warn`,
 * mirrored into a visible log so a rejected render shows up during a test.
 */
export default function Page() {
  const [errors, setErrors] = useState<string[]>([]);

  return (
    <DemoFrame
      parentPath="/generative-ui/components/surfaces"
      subtitle={`agent: ${AGENT_ID} · ui: shopUI · 4 page targets`}
    >
      {/* The page's sticky-header CSS, unchanged. */}
      <style>{`[data-generative-ui-surface] { scroll-margin-top: 6rem; }`}</style>
      <CopilotKitProvider
        runtimeUrl="/api/copilotkit-components"
        agentId={AGENT_ID}
        generativeUI={{
          ui: shopUI,
          errorBoundary: {
            onError: (info: GenerativeUIErrorInfo) => {
              console.warn(info.kind, info.surfaceId, info.error.message);
              setErrors((prev) => [
                `${info.kind} · ${info.surfaceId ?? "?"} · ${info.error.message}`,
                ...prev,
              ]);
            },
            fallback: ({ retry }) => <button onClick={retry}>Try again</button>,
          },
        }}
        enableInspector={nestedInspectorSetting}
      >
        <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[1fr_420px]">
          <div className="flex min-h-0 flex-col border-r border-slate-200 dark:border-slate-800">
            <ShopPage />
            {errors.length > 0 && (
              <pre className="max-h-32 shrink-0 overflow-auto border-t border-rose-200 bg-rose-50 p-2 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                {errors.join("\n")}
              </pre>
            )}
          </div>
          <CopilotChat agentId={AGENT_ID} className="h-full min-h-0" />
        </div>
      </CopilotKitProvider>
    </DemoFrame>
  );
}
