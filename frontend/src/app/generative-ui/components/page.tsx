import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const DOC_ROUTE = `import { chat } from "@tanstack/ai";
import { openaiText } from "@tanstack/ai-openai";
import {
  BuiltInAgent,
  convertInputToTanStackAI,
  CopilotRuntime,
  createCopilotRuntimeHandler,
  InMemoryAgentRunner,
} from "@copilotkit/runtime/v2";

const agent = new BuiltInAgent({
  type: "tanstack",
  factory: ({ input, abortController }) => {
    const { messages, systemPrompts, tools } = convertInputToTanStackAI(input);
    return chat({
      adapter: openaiText("gpt-5.5"),
      messages,
      systemPrompts: [
        "You are a helpful assistant. When a visual answer helps, render it with generative UI.",
        ...systemPrompts,
      ],
      tools,
      abortController,
    });
  },
});

const runtime = new CopilotRuntime({
  agents: { default: agent },
  runner: new InMemoryAgentRunner(),
});

const handler = createCopilotRuntimeHandler({ runtime, basePath: "/api/copilotkit" });

export const GET = handler;
export const POST = handler;`;

const DOC_PROVIDERS = `"use client";
import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import { standardUI } from "@copilotkit/react-core/v2/generative-ui";
import "@copilotkit/react-core/v2/styles.css";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKitProvider runtimeUrl="/api/copilotkit" generativeUI={{ ui: standardUI }}>
      {children}
    </CopilotKitProvider>
  );
}`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/components" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Native generative UI on A2UI 1.0 (marked experimental). One provider
          prop, <code>generativeUI=&#123;&#123; ui: standardUI &#125;&#125;</code>,
          hands the agent a catalog of React components. The runtime adds a{" "}
          <code>render_ui</code> tool plus a usage guide to each run, and the
          agent&apos;s tool calls arrive as interactive UI in the chat.
          The sub-pages cover the three main ideas: <em>surfaces</em> (where
          UI goes), <em>catalogs</em> (what can be drawn) and{" "}
          <em>transports</em> (how it gets there).
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Compare the Starter, Team, and Enterprise plans in a table"]}
            expect="A rendered Table (rows per plan, columns per feature) in the chat, not a markdown table — plus a short text reply."
            fail="A markdown/prose table means render_ui never reached Claude: check the runtime has generativeUI enabled and the Inspector's Generative UI → Prompt tab. An empty card means the operations were rejected — see Inspector → Surfaces → Rejected operations."
          />
        </div>
      </Panel>

      <Panel title="Runtime: what the doc publishes vs what runs here">
        <Callout tone="warn" title="The doc's agent is OpenAI via TanStack AI, not Claude">
          <p>
            The page&apos;s <code>route.ts</code> builds a <code>BuiltInAgent</code>{" "}
            on <code>@tanstack/ai</code> + <code>@tanstack/ai-openai</code>{" "}
            and needs <code>OPENAI_API_KEY</code>. This repo tests the Claude
            Agent SDK, so <code>/api/copilotkit-components</code> routes to the
            same <code>ClaudeAgentAdapter</code> backend as every other route.
            The page&apos;s requirement, &ldquo;keep both <code>tools</code>{" "}
            and <code>systemPrompts</code>&rdquo;, still holds: the adapter
            forwards <code>input.tools</code> (which carries{" "}
            <code>render_ui</code>) and <code>input.context</code> (which
            carries the guide) to Claude. The system prompt is the one from the
            doc, word for word.
          </p>
        </Callout>
        <div className="mt-4 space-y-4">
          <CodeBlock code={DOC_ROUTE} language="ts" filename="from the doc page — app/api/copilotkit/[[...slug]]/route.ts (not used)" />
          <SourceCode file="frontend/src/app/api/copilotkit-components/[[...slug]]/route.ts" />
        </div>
      </Panel>

      <Panel title="Provider and chat">
        <CodeBlock code={DOC_PROVIDERS} language="tsx" filename="from the doc page — app/providers.tsx" />
        <div className="mt-4">
          <SourceCodeGroup
            files={[
              { file: "frontend/src/app/generative-ui/components/demo-chat/page.tsx" },
              { file: "backend/src/agents/registry.ts" },
            ]}
          />
        </div>
      </Panel>

      <Panel title="Debugging with the Inspector">
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>No Generative UI pane: the provider has no <code>generativeUI</code> config.</li>
          <li>Surface renders empty: Surfaces tab → Rejected operations.</li>
          <li>Wrong values: Surfaces tab shows the data model.</li>
          <li>A component is never used: Catalog tab.</li>
          <li>What the model was actually told: Prompt tab.</li>
        </ul>
      </Panel>
    </>
  );
}
