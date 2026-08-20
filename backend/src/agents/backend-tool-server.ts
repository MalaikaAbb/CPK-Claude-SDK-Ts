/**
 * The bridge the Quickstart calls and no doc page defines.
 * https://docs.copilotkit.ai/claude-sdk-typescript/quickstart
 *
 * The Quickstart's `runWithClaudeAgentSdk` is published in full, and it opens
 * with:
 *
 *     const backendToolServer = buildBackendToolServer({
 *       toolSchemas, emit, getState, setState, executeTool,
 *     });
 *     const adapter = new ClaudeAgentAdapter({
 *       ..., mcpServers: backendToolServer.mcpServers,
 *            allowedTools: backendToolServer.allowedTools,
 *     });
 *
 * `buildBackendToolServer` is never shown, and neither are the `Emit` and
 * `ExecuteTool` types it takes — so this file is written here, against the
 * call site the doc does publish. Everything it has to satisfy is visible
 * there: it returns `{ mcpServers, allowedTools }` in the shape
 * `ClaudeAgentAdapter` accepts, and the tools it registers must run
 * `executeTool` and be free to call `setState`, because the caller queues a
 * snapshot on every `setState` and emits it just before the matching
 * `TOOL_CALL_RESULT`.
 *
 * The mechanics are the Claude Agent SDK's in-process MCP server:
 * `createSdkMcpServer` + `tool`, with each tool's JSON Schema converted to the
 * Zod shape `tool()` wants. Nothing here spawns a process or opens a socket —
 * the tools run in this server, in the same closure as the run's state.
 *
 * `ClaudeAgentAdapter` builds a *second* in-process server of its own, named
 * `ag_ui`, out of `input.tools` (frontend tools) plus its built-in
 * `ag_ui_update_state`. Both survive: the adapter merges what it builds into
 * whatever `mcpServers` it was constructed with, and appends to `allowedTools`
 * rather than replacing it.
 */

import type { BaseEvent } from "@ag-ui/core";
import type Anthropic from "@anthropic-ai/sdk";
import {
  createSdkMcpServer,
  tool,
  type McpSdkServerConfigWithInstance,
} from "@anthropic-ai/claude-agent-sdk";
import { z, type ZodRawShape, type ZodTypeAny } from "zod";

/** The AG-UI event sink for a single run. Named by the doc, defined here. */
export type Emit = (event: BaseEvent) => void;

/** What a tool executor is handed besides its arguments. */
export interface BackendToolContext {
  /** The run's current shared state. */
  getState: () => Record<string, unknown>;
  /**
   * Replace the run's shared state. The caller is expected to queue a
   * snapshot per call — see `runWithBackendTools` in `agent-server.ts`.
   */
  setState: (next: Record<string, unknown>) => void;
  /** Emit an AG-UI event mid-run, for anything state snapshots don't cover. */
  emit: Emit;
}

/** Runs one tool call. Named by the doc, defined here. */
export type ExecuteTool = (
  name: string,
  input: Record<string, unknown>,
  context: BackendToolContext,
) => unknown | Promise<unknown>;

/** The MCP server name backend tools are registered under. */
export const BACKEND_TOOL_SERVER_NAME = "backend_tools";

export interface BackendToolServer {
  mcpServers: Record<string, McpSdkServerConfigWithInstance>;
  allowedTools: string[];
}

type JsonSchemaProperty = {
  type?: string;
  description?: string;
  enum?: [string, ...string[]];
  items?: JsonSchemaProperty;
};

function jsonSchemaPropertyToZod(property: JsonSchemaProperty): ZodTypeAny {
  let zodType: ZodTypeAny;
  switch (property.type) {
    case "string":
      zodType = property.enum ? z.enum(property.enum) : z.string();
      break;
    case "number":
    case "integer":
      zodType = z.number();
      break;
    case "boolean":
      zodType = z.boolean();
      break;
    case "array":
      zodType = z.array(
        property.items ? jsonSchemaPropertyToZod(property.items) : z.unknown(),
      );
      break;
    case "object":
      zodType = z.record(z.string(), z.unknown());
      break;
    default:
      zodType = z.unknown();
  }
  return property.description ? zodType.describe(property.description) : zodType;
}

/**
 * Convert an Anthropic tool's `input_schema` into the Zod shape `tool()` takes.
 *
 * Only the subset the doc's own schemas use is handled — the tool definitions
 * these docs publish are flat objects of strings, numbers, booleans and string
 * arrays. Anything else lands as `z.unknown()`, which keeps the tool callable
 * instead of failing to register.
 */
function inputSchemaToZodShape(schema: Anthropic.Tool.InputSchema): ZodRawShape {
  const properties = (schema.properties ?? {}) as Record<
    string,
    JsonSchemaProperty
  >;
  const required = new Set((schema.required as string[] | undefined) ?? []);
  // Built as a mutable record and widened at the end: `ZodRawShape` is
  // readonly in zod 4, so it cannot be filled in place.
  const shape: Record<string, ZodTypeAny> = {};

  for (const [key, property] of Object.entries(properties)) {
    const zodType = jsonSchemaPropertyToZod(property);
    shape[key] = required.has(key) ? zodType : zodType.optional();
  }
  return shape as ZodRawShape;
}

export function buildBackendToolServer({
  toolSchemas,
  emit,
  getState,
  setState,
  executeTool,
}: {
  toolSchemas: Anthropic.Tool[];
  emit: Emit;
  getState: () => Record<string, unknown>;
  setState: (next: Record<string, unknown>) => void;
  executeTool: ExecuteTool;
}): BackendToolServer {
  const context: BackendToolContext = { getState, setState, emit };

  const tools = toolSchemas.map((schema) =>
    tool(
      schema.name,
      schema.description ?? "",
      inputSchemaToZodShape(schema.input_schema),
      async (args) => {
        // A thrown error would surface to the model as an MCP transport
        // failure with no usable text. Returning the message as the result
        // keeps the run going and lets the model report or retry.
        try {
          const result = await executeTool(
            schema.name,
            (args ?? {}) as Record<string, unknown>,
            context,
          );
          return {
            content: [
              {
                type: "text" as const,
                text:
                  typeof result === "string" ? result : JSON.stringify(result),
              },
            ],
          };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          console.warn(`[backend_tools] ${schema.name} failed: ${message}`);
          return {
            content: [{ type: "text" as const, text: `Error: ${message}` }],
          };
        }
      },
    ),
  );

  return {
    mcpServers: {
      [BACKEND_TOOL_SERVER_NAME]: createSdkMcpServer({
        name: BACKEND_TOOL_SERVER_NAME,
        version: "1.0.0",
        tools,
      }),
    },
    // The SDK addresses in-process MCP tools as `mcp__<server>__<tool>`, and
    // `permissionMode: "dontAsk"` still requires them to be allow-listed.
    allowedTools: toolSchemas.map(
      (schema) => `mcp__${BACKEND_TOOL_SERVER_NAME}__${schema.name}`,
    ),
  };
}
