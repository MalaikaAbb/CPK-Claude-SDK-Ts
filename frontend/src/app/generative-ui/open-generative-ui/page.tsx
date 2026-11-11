import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const DIR = "frontend/src/app/generative-ui/open-generative-ui/_demo";

export default function Page() {
  const link = "text-[var(--accent)] underline underline-offset-4";
  return (
    <>
      <RouteHeader path="/generative-ui/open-generative-ui" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          With <code>openGenerativeUI</code> set on the runtime, the agent is
          offered a <code>generateSandboxedUi</code> frontend tool. The
          middleware turns its streamed arguments (CSS first, then HTML, then
          JS) into activity events, and the built-in renderer assembles the UI
          live inside a sandboxed iframe. The advanced demo also hands the
          provider sandbox functions that the generated page can call back on
          the host. The Claude adapter forwards the run&apos;s frontend tools
          to the model, which is the requirement the page warns about.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "(Minimal) Build me a simple greeting card.",
              "(Advanced) Calculator (calls evaluateExpression)",
            ]}
            expect="Minimal: a preview appears in the chat and fills in as the HTML streams. Advanced: the suggestion pills show; a calculator whose = button logs `[open-gen-ui/advanced] evaluateExpression` in the browser console and shows the result. Not yet checked in a browser."
            fail={
              <>
                A plain-text reply means the model never called{" "}
                <code>generateSandboxedUi</code>: check the Inspector for the
                tool on the run. On the minimal demo the provider&apos;s
                default design skill applies (the page&apos;s own is
                unpublished), so a text reply there is a possible outcome of
                the gap, not necessarily a wiring fault.
              </>
            }
          />
        </div>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Two demos:{" "}
          <Link href="/generative-ui/open-generative-ui/demo-chat" className={link}>
            minimal
          </Link>{" "}
          and{" "}
          <Link href="/generative-ui/open-generative-ui/demo-chat/advanced" className={link}>
            advanced (sandbox functions)
          </Link>
          .
        </p>
      </Panel>

      <Panel title="The runtime — from the demo Code tab">
        <SourceCodeGroup
          files={[{ file: "frontend/src/app/api/copilotkit-ogui/route.ts" }]}
          note="Changes from the Code tab are marked HARNESS in the file: two unpublished _shared helpers, and the agent URLs."
        />
      </Panel>

      <Panel title="Minimal demo">
        <SourceCodeGroup
          files={[
            { file: `${DIR}/open-gen-ui/page.tsx` },
            { file: `${DIR}/open-gen-ui/chat.tsx` },
          ]}
        />
      </Panel>

      <Panel title="Advanced demo — sandbox functions">
        <SourceCodeGroup
          files={[
            { file: `${DIR}/open-gen-ui-advanced/page.tsx` },
            { file: `${DIR}/open-gen-ui-advanced/sandbox-functions.ts` },
            { file: `${DIR}/open-gen-ui-advanced/suggestions.ts` },
          ]}
          note="All three are the Code tab's files, unchanged."
        />
      </Panel>

      <Panel title="The agents">
        <SourceCodeGroup
          files={[{ file: "backend/src/agents/registry.ts" }]}
          note={
            <>
              The Code tab also ships the showcase&apos;s own{" "}
              <code>src/agent_server.ts</code>, a raw Anthropic SDK loop that
              serves both agents at <code>/</code>. This harness keeps its
              ClaudeAgentAdapter server and mounts <code>open-gen-ui</code> and{" "}
              <code>open-gen-ui-advanced</code> at their own paths with that
              file&apos;s <code>/</code> prompt, verbatim, and no tools.
            </>
          }
        />
      </Panel>

      <Callout tone="warn" title="What the page leaves out, and what changed">
        <ul className="space-y-1.5">
          <li>
            · <code>./chat</code> (minimal demo) is never published;{" "}
            <code>chat.tsx</code> is a plain{" "}
            <code>&lt;CopilotChat agentId=&quot;open-gen-ui&quot;&gt;</code>,
            borrowed from the aws-strands-ts harness.
          </li>
          <li>
            · <code>./design-skill</code> (<code>VISUALIZATION_DESIGN_SKILL</code>)
            is never published. Its import and the{" "}
            <code>openGenerativeUI={"{{ designSkill }}"}</code> prop are
            commented out, so the minimal demo runs on the default design
            skill.
          </li>
          <li>
            · <code>createClaudeHttpAgent</code> and{" "}
            <code>internalRuntimeErrorResponse</code> (from{" "}
            <code>@/app/api/_shared/*</code>) are never published: the first is
            replaced by <code>HttpAgent</code> (README §9.7), the second
            commented out and the error rethrown.
          </li>
          <li>
            · The Code tab points both agents at <code>{"${AGENT_URL}/"}</code>;
            here they are <code>{"${AGENT_URL}/<id>"}</code>, like every other
            agent on this backend.
          </li>
        </ul>
      </Callout>
    </>
  );
}
