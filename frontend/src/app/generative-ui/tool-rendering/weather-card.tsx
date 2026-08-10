"use client";

/**
 * The card `useRenderTool({ name: "get_weather" })` paints.
 *
 * The page's renderer passes exactly these props — `loading`, `location`,
 * `temperature`, `humidity`, `windSpeed`, `conditions` — so the signature is
 * fixed by the doc even though the component body is never published. The
 * body below is this repo's, kept minimal.
 *
 * In this repo it never renders, because `get_weather` is a backend tool and
 * no bridge to register one is published. See the route's notes page.
 */
export function WeatherCard({
  loading,
  location,
  temperature,
  humidity,
  windSpeed,
  conditions,
}: {
  loading: boolean;
  location: string;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  conditions?: string;
}) {
  return (
    <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {location || "—"}
        </p>
        {loading ? (
          <span className="animate-pulse text-xs text-slate-500">Running…</span>
        ) : (
          <span className="text-xs text-slate-500">{conditions}</span>
        )}
      </div>
      {!loading && (
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            ["Temp", temperature != null ? `${temperature}°` : "—"],
            ["Humidity", humidity != null ? `${humidity}%` : "—"],
            ["Wind", windSpeed != null ? `${windSpeed}` : "—"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-slate-50 py-2 dark:bg-slate-800">
              <dt className="text-[10px] uppercase tracking-wider text-slate-500">
                {label}
              </dt>
              <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
