/**
 * The page imports `parseJsonResult` from `../_shared/parse-json-result` in
 * every renderer and never publishes it. This is this repo's version: a tool
 * result arrives as a JSON string, and a renderer wants the object.
 *
 * Returns an empty object rather than throwing, because a renderer runs while
 * the result is still streaming in and will be handed partial or absent data.
 */
export function parseJsonResult<T>(result: unknown): Partial<T> {
  if (!result) return {};
  if (typeof result === "object") return result as Partial<T>;
  if (typeof result !== "string") return {};
  try {
    const parsed = JSON.parse(result);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Partial<T>)
      : {};
  } catch {
    return {};
  }
}
