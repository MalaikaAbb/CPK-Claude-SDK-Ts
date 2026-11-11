"use client";

import { DemoFrame } from "@/components/demo-frame";

import MCPAppsDemo from "../_demo/page";

/**
 * The page's `src/app/demos/mcp-apps/page.tsx` (demo Code tab), mounted
 * unchanged. It brings its own `<CopilotKit>` against
 * `/api/copilotkit-mcp-apps`, which points at the public Excalidraw MCP server.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/generative-ui/mcp-apps" subtitle="agent: mcp-apps · server: excalidraw">
      <MCPAppsDemo />
    </DemoFrame>
  );
}
