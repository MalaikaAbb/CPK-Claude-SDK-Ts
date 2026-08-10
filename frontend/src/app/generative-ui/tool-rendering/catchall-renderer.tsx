"use client";

export type CatchallToolStatus = "inProgress" | "executing" | "complete";

/**
 * The wildcard card `useDefaultRenderTool({ render })` paints for any tool
 * without a named renderer.
 *
 * The page's snippet passes `name`, `parameters`, `status` and `result` into a
 * `CustomCatchallRenderer` and never publishes it, so the body is this
 * repo's — a name, a live status pill, and the raw argument/result JSON.
 */
export function CustomCatchallRenderer({
  name,
  parameters,
  status,
  result,
}: {
  name: string;
  parameters: unknown;
  status: CatchallToolStatus;
  result: unknown;
}) {
  const done = status === "complete";
  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <code className="text-xs font-semibold text-slate-900 dark:text-slate-100">
          {name}
        </code>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
            done
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
              : "animate-pulse bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
          }`}
        >
          {done ? "Done" : "Running"}
        </span>
      </div>
      <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-50 p-2 text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        {JSON.stringify({ parameters, result }, null, 2)}
      </pre>
    </div>
  );
}
