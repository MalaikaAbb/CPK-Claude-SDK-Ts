"use client";

/**
 * The surface the agent's tool mutates.
 *
 * The page imports `Background` and `DEFAULT_BACKGROUND` from `./background`
 * and publishes neither, so both are this repo's — kept to the minimum that
 * makes the tool's effect visible.
 */
export const DEFAULT_BACKGROUND =
  "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)";

export function Background({
  background,
  children,
}: {
  background: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="h-full w-full transition-all duration-700" style={{ background }}>
      {children}
    </div>
  );
}
