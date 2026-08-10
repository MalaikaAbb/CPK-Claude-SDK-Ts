/**
 * Verbatim from the Fixed Schema A2UI doc page.
 * https://docs.copilotkit.ai/claude-sdk-typescript/generative-ui/a2ui/fixed-schema
 *
 * Live: `A2UI_FIXED_SYSTEM_PROMPT` is the agent's system prompt.
 *
 * Inert: `DISPLAY_FLIGHT_TOOL_SCHEMA` and `buildDisplayFlightOperations`.
 * `display_flight` is a backend tool, so it needs the unpublished
 * `buildBackendToolServer` bridge, and the runtime is configured with
 * `injectA2UITool: false` per the page — meaning nothing puts a drawing tool
 * in front of the model. The agent will answer about flights in prose and the
 * surface never mounts. See README §9.
 *
 * `flight_schema.json` / `booked_schema.json` are also never published on any
 * page; the copies in `a2ui_schemas/` are the Google ADK repo's, which the
 * page's own component tree diagram matches.
 */

import type Anthropic from "@anthropic-ai/sdk";

import flightSchema from "./a2ui_schemas/flight_schema.json";

export const A2UI_FIXED_CATALOG_ID = "copilotkit://flight-fixed-catalog";
export const A2UI_FIXED_SURFACE_ID = "flight-fixed-schema";

export const FLIGHT_SCHEMA: unknown[] = flightSchema as unknown[];

export const A2UI_FIXED_SYSTEM_PROMPT =
  "You help users find flights. When asked about a flight, call " +
  "display_flight with origin (3-letter code), destination (3-letter " +
  "code), airline, and price (e.g. '$289'). Keep any chat reply to one " +
  "short sentence.";

export const DISPLAY_FLIGHT_TOOL_SCHEMA: Anthropic.Tool = {
  name: "display_flight",
  description:
    "Show a flight card for the given trip. Emits an a2ui_operations " +
    "container the frontend renders into a flight card via the fixed " +
    "schema catalog.",
  input_schema: {
    type: "object",
    properties: {
      origin: {
        type: "string",
        description: "Origin airport code, e.g. 'SFO'",
      },
      destination: {
        type: "string",
        description: "Destination airport code, e.g. 'JFK'",
      },
      airline: { type: "string", description: "Airline name, e.g. 'United'" },
      price: { type: "string", description: "Price string, e.g. '$289'" },
    },
    required: ["origin", "destination", "airline", "price"],
  },
};

/**
 * Build the `a2ui_operations` payload the A2UI runtime middleware
 * detects in tool results and forwards to the frontend renderer.
 *
 * Ops MUST use the v0.9 NESTED operation shape
 * (`{ version, createSurface: {...} }` / `updateComponents` /
 * `updateDataModel`) that `@ag-ui/a2ui-middleware`'s
 * `getOperationSurfaceId` and the React A2UI renderer walk. The legacy
 * flat shape (`{ type: "create_surface", surfaceId, ... }`) looks
 * plausible but the middleware's matcher never recognizes it — every op
 * lands on the fallback "default" surface and the renderer never
 * receives the schema, so the `a2ui-fixed-card` never mounts. See the
 * identical fix note in `showcase/shared/python/tools/generate_a2ui.py`
 * (`build_a2ui_operations_from_tool_call`).
 */
export function buildDisplayFlightOperations(input: {
  origin: string;
  destination: string;
  airline: string;
  price: string;
}): { a2ui_operations: unknown[] } {
  return {
    a2ui_operations: [
      {
        version: "v0.9",
        createSurface: {
          surfaceId: A2UI_FIXED_SURFACE_ID,
          catalogId: A2UI_FIXED_CATALOG_ID,
        },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: A2UI_FIXED_SURFACE_ID,
          components: FLIGHT_SCHEMA,
        },
      },
      {
        version: "v0.9",
        updateDataModel: {
          surfaceId: A2UI_FIXED_SURFACE_ID,
          path: "/",
          value: input,
        },
      },
    ],
  };
}
