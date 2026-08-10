"use client";

import { CopilotChat, useComponent } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { BarChart, barChartPropsSchema } from "../bar-chart";

/**
 * `useComponent` registering a React component as a tool.
 *
 * The hook call is the doc's, verbatim. There is no handler and no backend
 * tool: the component *is* the tool. CopilotKit registers it as a frontend
 * tool, the agent calls it, Zod validates the arguments, and the component
 * renders inline with those arguments as props.
 *
 * This is why the route works while /generative-ui/tool-rendering does not.
 * A frontend tool arrives in the AG-UI run input, and `ClaudeAgentAdapter`
 * turns `input.tools` into its own in-process `ag_ui` MCP server — no
 * server-side registration needed, so no missing bridge to block it.
 */
function Chat() {
  useComponent({
    name: "render_bar_chart",
    description: "Display a bar chart with labeled numeric values.",
    parameters: barChartPropsSchema,
    render: BarChart,
  });

  return <CopilotChat agentId="gen-ui-tool-based" />;
}

export default function Page() {
  return (
    <DemoFrame
      parentPath="/generative-ui/tool-based"
      subtitle="agent: gen-ui-tool-based"
    >
      <div className="mx-auto h-full w-full max-w-4xl">
        <Chat />
      </div>
    </DemoFrame>
  );
}
