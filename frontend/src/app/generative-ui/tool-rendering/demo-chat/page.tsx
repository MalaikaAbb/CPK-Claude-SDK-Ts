"use client";

import {
  CopilotChat,
  useDefaultRenderTool,
  useRenderTool,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

import { DemoFrame } from "@/components/demo-frame";

import {
  CustomCatchallRenderer,
  type CatchallToolStatus,
} from "../catchall-renderer";
import { parseJsonResult } from "../parse-json-result";
import { WeatherCard } from "../weather-card";

/**
 * Both renderer kinds the page shows: a named renderer for `get_weather`, and
 * `useDefaultRenderTool` as the wildcard for everything else.
 *
 * The hook calls are the doc's, verbatim.
 *
 * ── Why nothing renders ──────────────────────────────────────────────────
 * `get_weather` is a BACKEND tool. The page publishes its schema and executor
 * (both are in `backend/src/agents/weather-tool-backend.snippet.ts`), but
 * registering a backend tool needs `buildBackendToolServer`, which the
 * Quickstart calls and no page defines. So the model is never offered
 * `get_weather`, never calls it, and neither renderer below ever fires.
 *
 * The renderers are kept wired anyway: the moment a bridge is published, this
 * file should work unchanged. See the notes page and README §9.
 *
 * The page also names `search_flights`, `get_stock_price` and `roll_dice`, but
 * publishes a backend definition for none of them — not even a blocked one —
 * so they are not carried here.
 */

interface WeatherResult {
  city?: string;
  temperature?: number;
  humidity?: number;
  wind_speed?: number;
  conditions?: string;
}

function Chat() {
  // Per-tool renderer: get_weather → branded WeatherCard.
  useRenderTool(
    {
      name: "get_weather",
      parameters: z.object({
        location: z.string(),
      }),
      render: ({ parameters, result, status }) => {
        const loading = status !== "complete";
        const parsed = parseJsonResult<WeatherResult>(result);
        return (
          <WeatherCard
            loading={loading}
            location={parameters?.location ?? parsed.city ?? ""}
            temperature={parsed.temperature}
            humidity={parsed.humidity}
            windSpeed={parsed.wind_speed}
            conditions={parsed.conditions}
          />
        );
      },
    },
    [],
  );

  // Wildcard catch-all for anything that doesn't match a per-tool
  // renderer above.
  useDefaultRenderTool(
    {
      render: ({ name, parameters, status, result }) => (
        <CustomCatchallRenderer
          name={name}
          parameters={parameters}
          status={status as CatchallToolStatus}
          result={result}
        />
      ),
    },
    [],
  );

  return <CopilotChat agentId="tool-rendering" />;
}

export default function Page() {
  return (
    <DemoFrame
      parentPath="/generative-ui/tool-rendering"
      subtitle="agent: tool-rendering · no backend tools registered"
    >
      <div className="mx-auto flex h-full w-full max-w-4xl flex-col">
        <p className="shrink-0 border-b border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">
          The agent has no <code>get_weather</code> tool — the docs never
          publish the bridge that would register one. Expect a prose answer and
          no card.
        </p>
        <div className="min-h-0 flex-1">
          <Chat />
        </div>
      </div>
    </DemoFrame>
  );
}
