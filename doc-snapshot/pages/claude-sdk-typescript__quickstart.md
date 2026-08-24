# Quickstart

> Run a Claude Agent SDK TypeScript agent behind CopilotKit.


This quickstart gives you two working paths:

- **Start from scratch** to scaffold the full Claude Agent SDK TypeScript showcase.
- **Use an existing agent** to expose your own Claude Agent SDK process over AG-UI and connect it to a React app.

## Prerequisites

Before you begin, you'll need the following:

- An Anthropic API key
- Node.js 20+
- Your favorite package manager

## Getting started

<Steps>
  <Step>
    ### Choose your starting point

    <TailoredContent className="step" id="agent">
      <TailoredContentOption
        id="starter"
        title="Start from scratch"
        description="Scaffold the canonical Claude Agent SDK TypeScript starter."
      >
        <Step>
          ### Run the CLI

          ```bash
          npx copilotkit@latest init --framework claude-sdk-typescript
          ```

          The starter contains three pieces:

          - `src/agent_server.ts` - the Claude Agent SDK backend process
          - `src/app/api/copilotkit/route.ts` - the CopilotKit runtime route that proxies to the agent
          - `src/app/page.tsx` - the starter chat UI to inspect first
        </Step>

        <Step>
          ### Configure your environment

          Create a `.env` file in the generated project root:

          ```plaintext title=".env"
          ANTHROPIC_API_KEY=your_anthropic_api_key
          CLAUDE_MODEL=claude-sonnet-4-6
          ```

          The runtime route defaults to `AGENT_URL=http://localhost:8000`, which is where the starter's agent server listens.
        </Step>

        <Step>
          ### Install dependencies

          <Tabs groupId="package-manager" items={['npm', 'pnpm', 'yarn', 'bun']}>
            <Tab value="npm">
              ```bash
              npm install
              ```
            </Tab>
            <Tab value="pnpm">
              ```bash
              pnpm install
              ```
            </Tab>
            <Tab value="yarn">
              ```bash
              yarn install
              ```
            </Tab>
            <Tab value="bun">
              ```bash
              bun install
              ```
            </Tab>
          </Tabs>
        </Step>

        <Step>
          ### Start the development server

          <Tabs groupId="package-manager" items={['npm', 'pnpm', 'yarn', 'bun']}>
            <Tab value="npm">
              ```bash
              npm run dev
              ```
            </Tab>
            <Tab value="pnpm">
              ```bash
              pnpm dev
              ```
            </Tab>
            <Tab value="yarn">
              ```bash
              yarn dev
              ```
            </Tab>
            <Tab value="bun">
              ```bash
              bun dev
              ```
            </Tab>
          </Tabs>

          This starts both the Next.js app and the TypeScript agent server.
        </Step>
      </TailoredContentOption>

      <TailoredContentOption
        id="bring-your-own"
        title="Use an existing agent"
        description="I already have a Claude Agent SDK TypeScript agent and want to add CopilotKit."
      >
        <Step>
          ### Install the required packages

          Install the Claude Agent SDK adapter, AG-UI event packages, and Express server dependencies for the agent process:

          ```bash
          npm install @anthropic-ai/claude-agent-sdk@^0.2.58 @anthropic-ai/sdk @ag-ui/claude-agent-sdk @ag-ui/core @ag-ui/encoder express dotenv zod
          npm install -D typescript tsx @types/node @types/express
          ```
        </Step>

        <Step>
          ### Configure your agent environment

          Create a `.env` file for the process that runs your Claude agent:

          ```plaintext title=".env"
          ANTHROPIC_API_KEY=your_anthropic_api_key
          CLAUDE_MODEL=claude-sonnet-4-6
          AGENT_PORT=8000
          ```
        </Step>

        <Step>
          ### Expose Claude Agent SDK over AG-UI

          CopilotKit talks to agents over AG-UI. The small server below receives AG-UI run input, passes it to `ClaudeAgentAdapter`, and streams AG-UI events back to the runtime.

          ```ts title="src/agent-server.ts"
          import express from "express";
          import { randomUUID } from "node:crypto";
          import { EventType, type RunAgentInput } from "@ag-ui/core";
          import { EventEncoder } from "@ag-ui/encoder";
          import { ClaudeAgentAdapter } from "@ag-ui/claude-agent-sdk";
          import dotenv from "dotenv";

          dotenv.config();

          const app = express();
          app.use(express.json({ limit: "10mb" }));

          const agent = new ClaudeAgentAdapter({
            agentId: "claude_agent",
            model: process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6",
            systemPrompt: "You are a helpful assistant embedded in a CopilotKit app.",
            tools: [],
            permissionMode: "dontAsk",
            maxTurns: 10,
          });

          app.post("/", (req, res) => {
            const input = req.body as RunAgentInput;
            const runId = input.runId ?? randomUUID();
            const threadId = input.threadId ?? randomUUID();
            const encoder = new EventEncoder();

            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");

            agent.run({ ...input, runId, threadId }).subscribe({
              next: (event) => res.write(encoder.encodeSSE(event)),
              error: (error) => {
                const message = error instanceof Error ? error.message : String(error);
                res.write(
                  encoder.encodeSSE({
                    type: EventType.RUN_ERROR,
                    runId,
                    threadId,
                    message,
                  }),
                );
                res.end();
              },
              complete: () => res.end(),
            });
          });

          app.get("/health", (_req, res) => {
            res.json({ status: "ok" });
          });

          const port = Number(process.env.AGENT_PORT ?? 8000);
          app.listen(port, () => {
            console.log(`Claude Agent SDK listening on http://localhost:${port}`);
          });
          ```

          Start it and confirm the health check:

          ```bash
          npx tsx src/agent-server.ts
          curl http://localhost:8000/health
          ```
        </Step>

        <Step>
          ### Create your frontend

          CopilotKit works with any React app. This example uses Next.js App Router:

          ```bash
          npx create-next-app@latest frontend
          cd frontend
          npm install @copilotkit/runtime @copilotkit/react-core @ag-ui/client
          ```
        </Step>

        <Step>
          ### Add the CopilotKit runtime route

          Create `app/api/copilotkit/route.ts` in your Next.js app. It registers the Claude agent server as an AG-UI `HttpAgent`.

          ```ts title="app/api/copilotkit/route.ts"
          import { HttpAgent } from "@ag-ui/client";
          import {
            CopilotRuntime,
            ExperimentalEmptyAdapter,
            copilotRuntimeNextJSAppRouterEndpoint,
          } from "@copilotkit/runtime";
          import { NextRequest } from "next/server";

          const runtime = new CopilotRuntime({
            agents: {
              claude_agent: new HttpAgent({
                url: process.env.AGENT_URL ?? "http://localhost:8000",
              }),
            },
          });

          export const POST = async (req: NextRequest) => {
            const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
              endpoint: "/api/copilotkit",
              runtime,
              serviceAdapter: new ExperimentalEmptyAdapter(),
            });

            return handleRequest(req);
          };
          ```
        </Step>

        <Step>
          ### Mount CopilotKit in React

          Wrap your app with `CopilotKit` and target the agent name you registered in the runtime route.

          ```tsx title="app/layout.tsx"
          import { CopilotKit } from "@copilotkit/react-core/v2";
          import "@copilotkit/react-core/v2/styles.css";
          import "./globals.css";

          export default function RootLayout({ children }: { children: React.ReactNode }) {
            return (
              <html lang="en">
                <body>
                  <CopilotKit runtimeUrl="/api/copilotkit" agent="claude_agent">
                    {children}
                  </CopilotKit>
                </body>
              </html>
            );
          }
          ```

          Add a chat surface:

          ```tsx title="app/page.tsx"
          "use client";

          import { CopilotSidebar } from "@copilotkit/react-core/v2";

          export default function Page() {
            return (
              <main>
                <CopilotSidebar />
              </main>
            );
          }
          ```
        </Step>

        <Step>
          ### Start the UI

          Keep the agent server running, then start the frontend in a second terminal:

          ```bash
          npm run dev
          ```
        </Step>
      </TailoredContentOption>
    </TailoredContent>
  </Step>

  <Step>
    ### Verify the integration

    Open `http://localhost:3000` and ask:

    ```plaintext
    Tell me in one sentence what this app can do.
    ```

    If the chat streams a Claude response, CopilotKit is connected to your Claude Agent SDK TypeScript agent.

    <Accordions className="mb-4">
      <Accordion title="Troubleshooting">
        - If the runtime cannot reach the agent, check that the agent server is running on `http://localhost:8000` or set `AGENT_URL` in the frontend.
        - If Claude returns an authentication error, make sure `ANTHROPIC_API_KEY` is available to the agent server process.
        - If a custom tool call stalls, add the backend tool bridge shown below instead of leaving `tools: []`.
      </Accordion>
    </Accordions>
  </Step>

    <Step>
        ### Open Inspector and confirm setup

On localhost, click the Inspector button in the corner of the app.

1. Open **Agents**, then **Agent**. Your agent is listed.
2. Send a chat message. Open **Agents**, then **AG-UI Events**. Events are moving.
3. Open **Threads**. The list is unlocked (Intelligence is on), or locked with Enable Intelligence (Intelligence is off).

More detail: [Inspector](/claude-sdk-typescript/inspector).

    </Step>

</Steps>

## Backend tools and state

The minimal server above is enough for text chat. To support backend tools, shared state snapshots, and richer demos, expose your tool schemas through the Claude SDK MCP bridge and emit AG-UI state events:

<Steps>
  <Step>
    ### Install the Claude Agent SDK packages

    ```bash
    npm install @ag-ui/core @ag-ui/encoder @ag-ui/claude-agent-sdk @anthropic-ai/claude-agent-sdk@^0.2.58 @anthropic-ai/sdk zod
    ```
  </Step>

  <Step>
    ### Bridge Claude Agent SDK to AG-UI

    Use `ClaudeAgentAdapter` from `@ag-ui/claude-agent-sdk`. The adapter
    receives the AG-UI run input, emits AG-UI events back to CopilotKit, and can
    expose backend tools through an in-process Claude SDK MCP server.

    
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


    
~~~~typescript title="claude-agent-sdk-adapter.ts"
export async function runWithClaudeAgentSdk({
  input,
  emit,
  runId,
  threadId,
  systemPrompt,
  toolSchemas,
  initialState,
  model,
  executeTool,
  forwardedHeaders,
}: {
  input: RunAgentInput;
  emit: Emit;
  runId: string;
  threadId: string;
  systemPrompt: string;
  toolSchemas: Anthropic.Tool[];
  initialState: Record<string, unknown>;
  model: string;
  executeTool: ExecuteTool;
  forwardedHeaders?: Record<string, string>;
}): Promise<void> {
  let state = { ...initialState };
  const pendingStateSnapshots: Record<string, unknown>[] = [];
  const adapter = createClaudeAgentAdapter({
    toolSchemas,
    emit,
    getState: () => state,
    setState: (nextState) => {
      state = nextState;
      pendingStateSnapshots.push(state);
    },
    executeTool,
    systemPrompt,
    model,
  });

  if (forwardedHeaders && Object.keys(forwardedHeaders).length > 0) {
    adapter.headers = forwardedHeaders;
  }

  const runInput: RunAgentInput = {
    ...input,
    runId,
    threadId,
    state: input.state ?? initialState,
  };

  await new Promise<void>((resolve) => {
    adapter.run(runInput).subscribe({
      next: (event) => {
        if (event.type === EventType.TOOL_CALL_RESULT) {
          const snapshot = pendingStateSnapshots.shift();
          if (snapshot) {
            emit({ type: EventType.STATE_SNAPSHOT, snapshot });
          }
        }
        emit(event);
      },
      error: (error) => {
        const message =
          error instanceof Error ? error.stack || error.message : String(error);
        emit({ type: EventType.RUN_ERROR, runId, threadId, message });
        resolve();
      },
      complete: () => resolve(),
    });
  });
}
~~~~

  </Step>
</Steps>
