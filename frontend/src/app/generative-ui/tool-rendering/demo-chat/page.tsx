"use client";

import {
  CopilotChat,
  CopilotChatConfigurationProvider,
  useDefaultRenderTool,
  useRenderTool,
} from "@copilotkit/react-core/v2";
import { useState } from "react";
import { z } from "zod";

import { DemoFrame } from "@/components/demo-frame";
import {
  CustomCatchallRenderer,
  type CatchallToolStatus,
} from "../catchall-renderer";
import { parseJsonResult } from "../parse-json-result";
import { WeatherCard } from "../weather-card";
import {
  GroupSlot,
  GroupedCustomRow,
  LineDisplay,
} from "../grouping/grouping-demo";

/**
 * Tabs: the existing renderers, plus one per "Grouping tool calls" snippet.
 * Each tab mounts its own chat (keyed), so only that tab's renderers are
 * registered. Grouping tabs reach the same agent through a configuration
 * provider, since the page's snippets name no agent (harness glue).
 */
const TABS = [
  { id: "renderers", label: "Per-tool + catch-all" },
  { id: "group-row", label: "Grouping: custom row (group: true)" },
  { id: "line", label: "Grouping: toolCallDisplay=\"line\"" },
  { id: "group-slot", label: "Grouping: group slot" },
] as const;

type TabId = (typeof TABS)[number]["id"];

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
  const [tab, setTab] = useState<TabId>("renderers");

  return (
    <DemoFrame
      parentPath="/generative-ui/tool-rendering"
      subtitle="agent: tool-rendering · no backend tools registered"
    >
      <div className="mx-auto flex h-full w-full max-w-4xl flex-col">
        <div className="flex shrink-0 flex-wrap gap-2 border-b border-slate-200 p-2 dark:border-slate-800">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-md border px-3 py-1 text-xs font-medium ${
                tab === t.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div key={tab} className="min-h-0 flex-1">
          {tab === "renderers" ? (
            <Chat />
          ) : (
            <CopilotChatConfigurationProvider agentId="tool-rendering">
              {tab === "group-row" && <GroupedCustomRow />}
              {tab === "line" && <LineDisplay />}
              {tab === "group-slot" && <GroupSlot />}
            </CopilotChatConfigurationProvider>
          )}
        </div>
      </div>
    </DemoFrame>
  );
}
