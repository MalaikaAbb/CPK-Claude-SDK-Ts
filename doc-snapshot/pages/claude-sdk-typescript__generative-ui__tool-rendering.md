# Tool Call Rendering

> Render your agent's tool calls with custom UI components.



<!-- interactive demo: tool-rendering -->


## What is this?

Tools are how an LLM invokes predefined, typically-deterministic functions.
Tool rendering lets you decide how each of those tool calls appears in the
chat. Instead of showing raw JSON, you register a React component that draws
a branded card for the call (arguments, live status, and the eventual
result). This is the **Generative UI** variant CopilotKit calls **tool
rendering**.

<Callout type="info">
  **Free course:** See this pattern built end-to-end in [Build Interactive
  Agents with Generative
  UI](https://www.deeplearning.ai/short-courses/build-interactive-agents-with-generative-ui/)
  — a free DeepLearning.AI short course taught by CopilotKit's CEO covering the
  full Generative UI spectrum (Controlled, Declarative, and Open-Ended).
</Callout>

## When should I use this?

Render tool calls when you want to:

- Show users exactly what tools the agent is invoking and with what arguments
- Display live progress indicators while a tool executes
- Render rich, polished results once a tool completes
- Give tool-heavy agents a transparent, on-brand chat experience

## Default tool rendering (zero-config)

The simplest entry point: call `useDefaultRenderTool()` with no arguments.
CopilotKit registers its built-in `DefaultToolCallRenderer` as the `*`
wildcard: every tool call renders as a tidy status card (tool name, live
**Running → Done** pill, collapsible arguments/result) without you writing
any UI.

Without this hook the runtime has no `*` renderer and tool calls are
invisible; the user only sees the assistant's final text summary.

```typescript
// src/app/demos/tool-rendering-default-catchall/page.tsx
  // Opt in to CopilotKit's built-in default tool-call card. Called with
  // no config so the package-provided `DefaultToolCallRenderer` is used
  // as the wildcard renderer — this is the "out-of-the-box" UI the cell
  // is meant to showcase.
  useDefaultRenderTool();
```

Here's what the built-in status card looks like for each tool call:


<!-- interactive demo: tool-rendering-default-catchall -->


## Custom catch-all

Once you want on-brand chrome, pass a `render` function to
`useDefaultRenderTool`. It's a convenience wrapper around
`useRenderTool({ name: "*", ... })`: one wildcard renderer handles every
tool call, named or not:

```typescript
// src/app/demos/tool-rendering-custom-catchall/page.tsx
  // `useDefaultRenderTool` is a convenience wrapper around
  // `useRenderTool({ name: "*", ... })` — a single wildcard renderer
  // that handles every tool call not claimed by a named renderer.
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
```

Here's the branded catch-all in action, where every tool call gets the same on-brand card:


<!-- interactive demo: tool-rendering-custom-catchall -->


## Per-tool renderers

The most expressive path is one renderer per tool name. The primary
`tool-rendering` cell wires two: `get_weather` draws a branded
`WeatherCard`, `search_flights` draws a `FlightListCard`. Each renderer
receives the tool's parsed arguments, a live `status`, and (once the agent
returns) the `result`:

The frontend pattern is the same for every backend. This shared, docs-only
example includes every component, type, and helper that its renderers use:

```tsx title="components/weather-card.tsx"
export interface WeatherCardProps {
  loading: boolean;
  location: string;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  conditions?: string;
}

export function WeatherCard({
  loading,
  location,
  temperature,
  humidity,
  windSpeed,
  conditions,
}: WeatherCardProps) {
  return (
    <article className="rounded-xl border p-4">
      <h3 className="font-semibold">{location || "Weather"}</h3>
      {loading ? (
        <p>Fetching weather...</p>
      ) : (
        <dl>
          <div>
            <dt>Conditions</dt>
            <dd>{conditions ?? "--"}</dd>
          </div>
          <div>
            <dt>Temperature</dt>
            <dd>{temperature ?? "--"}&deg;F</dd>
          </div>
          <div>
            <dt>Humidity</dt>
            <dd>{humidity ?? "--"}%</dd>
          </div>
          <div>
            <dt>Wind</dt>
            <dd>{windSpeed ?? "--"} mph</dd>
          </div>
        </dl>
      )}
    </article>
  );
}
```

```tsx title="components/flight-list-card.tsx"
export interface Flight {
  airline?: string;
  flight?: string;
  depart?: string;
  arrive?: string;
  price_usd?: number;
}

export interface FlightListCardProps {
  loading: boolean;
  origin: string;
  destination: string;
  flights: Flight[];
}

export function FlightListCard({
  loading,
  origin,
  destination,
  flights,
}: FlightListCardProps) {
  return (
    <article className="rounded-xl border p-4">
      <h3 className="font-semibold">
        {origin || "?"} → {destination || "?"}
      </h3>
      {loading ? (
        <p>Searching...</p>
      ) : (
        <ul>
          {flights.map((flight, index) => (
            <li key={`${flight.flight ?? "flight"}-${index}`}>
              {flight.airline ?? "--"} {flight.flight ?? ""}:{" "}
              {flight.depart ?? "?"} → {flight.arrive ?? "?"}
              {flight.price_usd !== undefined ? ` ($${flight.price_usd})` : ""}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
```

```ts title="lib/parse-json-result.ts"
export function parseJsonResult<T>(result: unknown): T {
  if (!result) return {} as T;

  try {
    return (typeof result === "string" ? JSON.parse(result) : result) as T;
  } catch {
    return {} as T;
  }
}
```

```tsx title="app/tool-renderers.tsx"
"use client";

import { useRenderTool } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { WeatherCard } from "../components/weather-card";
import { FlightListCard, type Flight } from "../components/flight-list-card";
import { parseJsonResult } from "../lib/parse-json-result";

interface WeatherResult {
  city?: string;
  temperature?: number;
  humidity?: number;
  wind_speed?: number;
  conditions?: string;
}

interface FlightSearchResult {
  origin?: string;
  destination?: string;
  flights?: Flight[];
}

export function ToolRenderers() {
  useRenderTool(
    {
      name: "get_weather",
      parameters: z.object({ location: z.string() }),
      render: ({ parameters, result, status }) => {
        const parsed = parseJsonResult<WeatherResult>(result);
        return (
          <WeatherCard
            loading={status !== "complete"}
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

  useRenderTool(
    {
      name: "search_flights",
      parameters: z.object({
        origin: z.string(),
        destination: z.string(),
      }),
      render: ({ parameters, result, status }) => {
        const parsed = parseJsonResult<FlightSearchResult>(result);
        return (
          <FlightListCard
            loading={status !== "complete"}
            origin={parameters?.origin ?? parsed.origin ?? ""}
            destination={parameters?.destination ?? parsed.destination ?? ""}
            flights={parsed.flights ?? []}
          />
        );
      },
    },
    [],
  );

  return null;
}
```

Mount the renderers anywhere beneath the same `CopilotKit` provider as your
chat. The renderer component returns no layout of its own; it registers the
two named renderers for tool calls in the chat:

```tsx title="app/page.tsx"
"use client";

import { CopilotChat, CopilotKit } from "@copilotkit/react-core/v2";
import { ToolRenderers } from "./tool-renderers";

export default function Page() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="tool-rendering">
      <ToolRenderers />
      <CopilotChat agentId="tool-rendering" />
    </CopilotKit>
  );
}
```


<Callout type="info">
  The `name` you pass to `useRenderTool` must match the tool name the agent
  exposes; that's how the runtime routes the call to your component.
</Callout>

Per-tool renderers compose with a catch-all: named renderers claim the
"interesting" tools and a wildcard handles everything else. In the primary
cell, the same `CustomCatchallRenderer` from above catches `get_stock_price`
and `roll_dice`:

```typescript
// src/app/demos/tool-rendering/page.tsx
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
```

## The backend tool definition

The frontend renderer only sees what the agent sends down. Here's the
matching backend definition for `get_weather`: expose a tool named
`get_weather`, return structured data, and let the frontend renderer with
the same name paint the card.

```typescript
// src/app/demos/tool-rendering/weather-tool-backend.snippet.ts
import type Anthropic from "@anthropic-ai/sdk";

export const GET_WEATHER_TOOL: Anthropic.Tool = {
  name: "get_weather",
  description:
    "Get the current weather for a given location. Useful on its own for " +
    "weather questions, and a great companion to `search_flights`.",
  input_schema: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "The city or region to get weather for.",
      },
    },
    required: ["location"],
  },
};

export function getWeather(location: string): Record<string, unknown> {
  return {
    city: location,
    temperature: 68,
    humidity: 55,
    wind_speed: 10,
    conditions: "Sunny",
  };
}
```

The agent must also register this schema as an executable backend tool. This
setup shows the connection.

<Steps>
  <Step>
    ### Connect the adapter to the MCP server

    `buildBackendToolServer` converts the tool schemas from the agent. The
    `ClaudeAgentAdapter` receives the resulting `mcpServers` and
    `allowedTools` values.

    
~~~~typescript title="claude-agent-sdk-adapter.ts"
function createClaudeAgentAdapter({
  toolSchemas,
  emit,
  getState,
  setState,
  executeTool,
  model,
  systemPrompt,
}: {
  toolSchemas: Anthropic.Tool[];
  emit: Emit;
  getState: () => Record<string, unknown>;
  setState: (state: Record<string, unknown>) => void;
  executeTool: ExecuteTool;
  model: string;
  systemPrompt: string;
}) {
  const backendToolServer = buildBackendToolServer({
    toolSchemas,
    emit,
    getState,
    setState,
    executeTool,
  });

  return new ClaudeAgentAdapter({
    agentId: "claude-sdk-typescript",
    model: normalizeClaudeAgentSdkModel(model),
    systemPrompt,
    tools: [],
    mcpServers: backendToolServer.mcpServers,
    allowedTools: backendToolServer.allowedTools,
    permissionMode: "dontAsk",
    maxTurns: 10,
  });
}
~~~~

  </Step>

  <Step>
    ### Register the executable tool handlers

    Each schema becomes an `sdkTool` that calls its executable CopilotKit
    handler. `createSdkMcpServer` registers these tools. The allowlist uses
    their fully qualified `mcp__copilotkit__*` names.

    
~~~~typescript title="claude-agent-sdk-adapter.ts"
const COPILOTKIT_MCP_SERVER_NAME = "copilotkit";
const COPILOTKIT_TOOL_PREFIX = `mcp__${COPILOTKIT_MCP_SERVER_NAME}__`;

function buildBackendToolServer({
  toolSchemas,
  emit,
  getState,
  setState,
  executeTool,
}: {
  toolSchemas: Anthropic.Tool[];
  emit: Emit;
  getState: () => Record<string, unknown>;
  setState: (state: Record<string, unknown>) => void;
  executeTool: ExecuteTool;
}): {
  mcpServers?: Record<string, McpServerConfig>;
  allowedTools: string[];
} {
  if (toolSchemas.length === 0) {
    return { allowedTools: [] };
  }

  const tools = toolSchemas.map((schema) =>
    sdkTool(
      schema.name,
      schema.description ?? "",
      zodShapeFromJsonSchema(schema.input_schema),
      async (args) => {
        try {
          const result = await executeTool(
            schema.name,
            args as Record<string, unknown>,
            getState(),
            emit,
          );
          if (result.state) {
            setState(result.state);
          }
          return {
            content: [{ type: "text" as const, text: result.resultText }],
          };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          return {
            content: [{ type: "text" as const, text: message }],
            isError: true,
          };
        }
      },
    ),
  );

  return {
    mcpServers: {
      [COPILOTKIT_MCP_SERVER_NAME]: createSdkMcpServer({
        name: COPILOTKIT_MCP_SERVER_NAME,
        version: "1.0.0",
        tools,
      }),
    },
    allowedTools: toolSchemas.map(
      (schema) => `${COPILOTKIT_TOOL_PREFIX}${schema.name}`,
    ),
  };
}
~~~~

  </Step>
</Steps>

<Callout type="info">
  This MCP path handles compatible requests that use backend tools only.
  Requests with frontend tools, structured user content, or extended thinking
  use the direct Anthropic path. Requests with aimock transport also use this
  fallback.
</Callout>

<IntegrationGrid path="generative-ui/tool-rendering" />
