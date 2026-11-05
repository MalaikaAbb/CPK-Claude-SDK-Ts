import type { CSSProperties, ReactNode } from "react";

/**
 * The JSON Render and Hashbrown demo components are copied verbatim from the
 * CopilotKit showcase, and they style themselves with the showcase's
 * shadcn-style tokens (`var(--card)`, `var(--border)`, …). This app's
 * globals.css doesn't define those names, so without this wrapper the cards
 * render borderless and unthemed.
 *
 * Scoped to the wrapper rather than added globally, so no other route's
 * styling changes. Values are a neutral light palette — repo code, not doc
 * code; the showcase's own theme file is not on either doc page.
 */
const TOKENS = {
  "--background": "#ffffff",
  "--foreground": "#0f172a",
  "--card": "#ffffff",
  "--border": "#e2e8f0",
  "--muted-foreground": "#64748b",
  "--primary": "#4f46e5",
  "--destructive": "#dc2626",
  "--secondary": "#f1f5f9",
  "--font-body": "inherit",
} as CSSProperties;

export function ShowcaseTokens({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div style={TOKENS} className={`bg-[var(--background)] text-[var(--foreground)] ${className ?? ""}`}>
      {children}
    </div>
  );
}
