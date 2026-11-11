import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const DIR = "frontend/src/app/generative-ui/mcp-apps";

// "MCP Apps with Intelligence" — the page's snippet, verbatim, shown not run.
const WITH_INTELLIGENCE = `import {
  BuiltInAgent,
  CopilotKitIntelligence,
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";

const agent = new BuiltInAgent({
  model: "openai/gpt-6-luna",
  prompt: "You are a helpful assistant.",
});

const runtime = new CopilotRuntime({
  agents: { default: agent },
  // Intelligence stores threads and runs. Do not pass \`runner\` as well.
  intelligence: new CopilotKitIntelligence({
    apiKey: process.env.CPK_INTELLIGENCE_API_KEY!,
  }),
  // Replace this fixed user with the user from your verified session.
  identifyUser: () => ({ id: "demo-user", name: "Demo User" }),
  // Unchanged from the in-memory setup.
  mcpApps: {
    servers: [
      {
        type: "http",
        url: "https://mcp.excalidraw.com/mcp",
        serverId: "excalidraw",
      },
    ],
  },
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit",
});

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;`;

const SAME_ORIGIN = `<CopilotKit runtimeUrl="/api/copilotkit" mcpApps={{ allowSameOriginFallback: true }}>
  {children}
</CopilotKit>`;

const TRANSPORTS = `// HTTP
{
  type: "http",
  url: "http://localhost:3101/mcp",
  serverId: "my-http-server"
}

// SSE
{
  type: "sse",
  url: "https://mcp.example.com/sse",
  headers: {
    "Authorization": "Bearer token"
  },
  serverId: "my-sse-server"
}`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/mcp-apps" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Give the runtime <code>mcpApps.servers</code> and it attaches the MCP
          Apps middleware to its agents. The agent is offered the MCP
          server&apos;s tools; when it calls one that carries a UI resource,
          the middleware fetches that resource and the built-in renderer
          mounts it inline as a sandboxed iframe. Nothing is registered on the
          frontend: the chat is a plain one.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Draw a simple flowchart: Idea → Build → Ship.",
              "Sketch a box labelled Frontend connected to a box labelled Agent.",
            ]}
            expect="The agent calls an Excalidraw MCP tool and an interactive Excalidraw canvas appears in the chat inside an iframe. Not yet checked in a browser."
            fail={
              <>
                A text-only reply means the MCP tools never reached Claude:
                check the Inspector for the run&apos;s tool list. A runtime
                error usually means <code>https://mcp.excalidraw.com</code>{" "}
                (set <code>MCP_SERVER_URL</code> to override) was unreachable.
                A 500 with no body is the rethrow that replaces the
                unpublished error helper.
              </>
            }
          />
        </div>
      </Panel>

      <Panel title="The runtime — from the demo Code tab">
        <SourceCodeGroup
          files={[{ file: "frontend/src/app/api/copilotkit-mcp-apps/route.ts" }]}
          note={
            <>
              The Code tab&apos;s <code>route.ts</code>, with its{" "}
              <code>@ts-ignore</code> and single <code>POST</code> export. Two
              unpublished imports are swapped or commented out, each marked{" "}
              <code>HARNESS</code> in the file.
            </>
          }
        />
      </Panel>

      <Panel title="The page — from the demo Code tab">
        <SourceCodeGroup
          files={[
            { file: `${DIR}/_demo/page.tsx` },
            { file: `${DIR}/_demo/chat.tsx` },
            { file: `${DIR}/demo-chat/page.tsx` },
          ]}
          note="The first file is the Code tab's page.tsx unchanged. chat.tsx is borrowed (the page imports ./chat and never shows it)."
        />
      </Panel>

      <Panel
        title="MCP Apps with Intelligence — shown, not run"
        description="Requires a CopilotKit Intelligence key (premium) — not testable locally without one."
      >
        <CodeBlock code={WITH_INTELLIGENCE} language="ts" filename="from the doc page — app/api/copilotkit/[[...slug]]/route.ts" />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          The snippet builds a CopilotKit <code>BuiltInAgent</code> on an
          OpenAI model. This harness runs only Claude agents, so if it were
          wired here the agent would be an <code>HttpAgent</code> to this
          backend, with everything else (<code>intelligence</code>,{" "}
          <code>identifyUser</code>, <code>mcpApps</code>) as printed. It is
          not wired: the demo above runs the in-memory path.
        </p>
      </Panel>

      <Panel title="Widget storage and transports — shown, not run">
        <div className="space-y-4">
          <CodeBlock code={SAME_ORIGIN} language="tsx" filename="from the doc page — allowSameOriginFallback (trusted widgets only)" />
          <CodeBlock code={TRANSPORTS} language="ts" filename="from the doc page — server entry shapes" />
        </div>
      </Panel>

      <Callout tone="warn" title="What the page leaves out">
        <ul className="space-y-1.5">
          <li>
            · <code>./chat</code> is imported and never published.{" "}
            <code>_demo/chat.tsx</code> is a plain{" "}
            <code>&lt;CopilotChat agentId=&quot;mcp-apps&quot;&gt;</code>,
            borrowed from the aws-strands-ts harness.
          </li>
          <li>
            · <code>createClaudeHttpAgent</code> and{" "}
            <code>internalRuntimeErrorResponse</code> come from{" "}
            <code>@/app/api/_shared/*</code>, which no page publishes. The
            first is replaced by the Quickstart&apos;s <code>HttpAgent</code>{" "}
            (README §9.7); the second is commented out and the error rethrown.
          </li>
          <li>
            · No backend agent is published for <code>/mcp-apps</code>. The
            backend serves the Quickstart&apos;s agent there (Quickstart
            prompt, no tools); the MCP tools reach it per run from the
            middleware. <code>headless-complete</code> in the route&apos;s
            agent map is kept as printed.
          </li>
          <li>
            · The Intelligence snippet uses{" "}
            <code>https://mcp.excalidraw.com/mcp</code>; the demo route uses
            the bare host.
          </li>
        </ul>
      </Callout>
    </>
  );
}
