# Frontend Tools

> Let your agent interact with and update your application's UI.



<!-- interactive demo: frontend-tools -->


<Callout type="info" title="See this in Inspector">
  Open Inspector on localhost. Go to **Agents**, then **Frontend Tools**.
  Your tool and its schema are listed.

  More detail: [Inspector](/claude-sdk-typescript/inspector).
</Callout>


## What is this?

Frontend tools let your agent define and invoke client-side functions that run entirely in the user's browser. Because the handler executes on the frontend, it has direct access to component state, browser APIs, and any third-party UI library the page already uses. That's how an agent can "reach into" the app: update React state, trigger animations, read `localStorage`, pop a toast, or steer the user's view.

This page covers the "agent drives the UI" shape of frontend tools. The same primitive also powers Generative UI and Human-in-the-loop; see those pages for interaction patterns.

## When should I use this?

Use frontend tools when your agent needs to:

- Read or modify React component state
- Access browser APIs like `localStorage`, `sessionStorage`, or cookies
- Trigger UI updates, animations, or transitions
- Show alerts, toasts, or notifications
- Interact with third-party frontend libraries
- Perform anything that requires the user's immediate browser context

## How it works in code

<Steps>
  <Step>
    ### Forward browser tools to Claude

    Frontend tools registered with `useFrontendTool` arrive in the AG-UI run
    input. Convert each AG-UI tool definition into an Anthropic Messages API
    tool schema before calling the model. Runs that carry frontend tools use
    the direct Messages API path rather than the Claude Agent SDK.

    
~~~~typescript title="agent_server.ts"
function buildTools(tools: RunAgentInput["tools"]): Anthropic.Tool[] {
  if (!tools || tools.length === 0) return [];

  return tools.map((tool) => {
    let inputSchema: Anthropic.Tool.InputSchema = {
      type: "object",
      properties: {},
    };
    if (tool.parameters) {
      try {
        const parsed =
          typeof tool.parameters === "string"
            ? JSON.parse(tool.parameters)
            : tool.parameters;
        inputSchema = parsed as Anthropic.Tool.InputSchema;
      } catch (parseErr) {
        // Don't silently swap in an empty schema — Claude will then accept
        // any input shape, which compounds whatever caller bug produced
        // the malformed JSON. Warn loudly so the tool definition gets
        // fixed instead of being papered over.
        const message =
          parseErr instanceof Error ? parseErr.message : String(parseErr);
        console.warn(
          `[agent_server] failed to parse tool.parameters for ${tool.name}; using empty schema. error=${message}`,
        );
      }
    }
// [!code highlight:5]
    return {
      name: tool.name,
      description: tool.description ?? "",
      input_schema: inputSchema,
    };
  });
}
~~~~

  </Step>
</Steps>

Register a frontend tool with `useFrontendTool`. Give it a name, a Zod schema for parameters, and a handler. The agent can then call it like any other tool and your frontend runs it in the browser.

```typescript
// src/app/demos/frontend-tools/page.tsx
import React, { useState } from "react";
import {
  CopilotKit,
  CopilotSidebar,
  useFrontendTool,
} from "@copilotkit/react-core/v2";
import { z } from "zod";
import { Background, DEFAULT_BACKGROUND } from "./background";
import { useFrontendToolsSuggestions } from "./suggestions";

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
```

The handler receives the parsed, type-safe parameters and can do anything
the browser can: update state, call an API, touch the DOM. Its return value
is sent back to the agent as the tool result so the model can reason about
what happened.

```typescript
// src/app/demos/frontend-tools/page.tsx
    handler: async ({ background }) => {
      setBackground(background);
      return { status: "success" };
    },
```

<IntegrationGrid path="frontend-tools" />
