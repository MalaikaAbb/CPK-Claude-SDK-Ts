"use client";

import { CopilotSidebar, useFrontendTool } from "@copilotkit/react-core/v2";
import { useState } from "react";
import { z } from "zod";

import { DemoFrame } from "@/components/demo-frame";

import { Background, DEFAULT_BACKGROUND } from "../background";

/**
 * A tool that runs in the browser and changes the page.
 *
 * The `useFrontendTool` call — name, description, Zod parameters, handler — is
 * the doc's, verbatim. The handler closes over `setBackground`, which is the
 * whole point: it has direct access to component state because it executes on
 * the client, not on the agent server.
 *
 * Its return value goes back to the agent as the tool result, so the model can
 * reason about what happened and confirm it in prose.
 *
 * This works on the plain quickstart server. A frontend tool travels in the
 * AG-UI run input, and `ClaudeAgentAdapter` converts `input.tools` into its own
 * in-process `ag_ui` MCP server — nothing has to be registered server-side.
 */
function Chat() {
  const [background, setBackground] = useState<string>(DEFAULT_BACKGROUND);

  useFrontendTool({
    name: "change_background",
    description:
      "Change the page background. Accepts any valid CSS background value — colors, linear or radial gradients, etc.",
    parameters: z.object({
      background: z
        .string()
        .describe("The CSS background value. Prefer gradients."),
    }),
    handler: async ({ background }) => {
      setBackground(background);
      return { status: "success" };
    },
  });

  return (
    <Background background={background}>
      <main className="h-full overflow-y-auto p-10">
        <h1 className="text-2xl font-semibold text-slate-900">
          Frontend Tools - Claude Agent Adapter
        </h1>
        <p className="mt-6 font-mono text-xs text-slate-600">
          current: {background}
        </p>
      </main>
    </Background>
  );
}

export default function Page() {
  return (
    <DemoFrame parentPath="/frontend-tools" subtitle="agent: frontend-tools">
      <Chat />
      <CopilotSidebar agentId="frontend-tools" defaultOpen />
    </DemoFrame>
  );
}
