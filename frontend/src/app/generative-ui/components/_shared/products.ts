/**
 * Repo data, not doc code. The Catalogs page's `ProductCard` says "copy every
 * value from a product of a tool result", and the Surfaces page's
 * `FeaturedProducts` takes `products` as a prop — neither page publishes where
 * the products come from. The demos hand this list to the agent through
 * `useAgentContext` instead of a backend tool, so no bridge is needed.
 */

export type Product = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
};

export const PRODUCTS: Product[] = [
  { productId: "p-lamp", name: "Arc Desk Lamp", price: 89, imageUrl: "https://picsum.photos/seed/lamp/320/200" },
  { productId: "p-chair", name: "Oak Lounge Chair", price: 349, imageUrl: "https://picsum.photos/seed/chair/320/200" },
  { productId: "p-mug", name: "Stoneware Mug", price: 18, imageUrl: "https://picsum.photos/seed/mug/320/200" },
  { productId: "p-rug", name: "Wool Runner Rug", price: 129, imageUrl: "https://picsum.photos/seed/rug/320/200" },
  { productId: "p-clock", name: "Wall Clock", price: 45, imageUrl: "https://picsum.photos/seed/clock/320/200" },
  { productId: "p-vase", name: "Glass Vase", price: 32, imageUrl: "https://picsum.photos/seed/vase/320/200" },
];

export const PRODUCTS_CONTEXT_DESCRIPTION =
  "The store's product catalog. Use these exact values when rendering products.";
