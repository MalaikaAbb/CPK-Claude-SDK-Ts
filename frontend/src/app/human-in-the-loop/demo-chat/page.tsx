"use client";

import { CopilotChat, useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { z } from "zod";

import { DemoFrame } from "@/components/demo-frame";

import { TimePickerCard, type TimeSlot } from "../time-picker-card";

/**
 * `useHumanInTheLoop` — the agent-initiated pause.
 *
 * The hook call and `DEFAULT_SLOTS` are both the doc's, verbatim. The LLM
 * decides to call `book_call`; CopilotKit routes the call through `render`,
 * which shows the picker; `respond(...)` resolves the promise the tool call is
 * awaiting; the same run continues with the user's answer as the tool result.
 *
 * Works on the plain quickstart server: a HITL tool is a frontend tool, so it
 * arrives in `input.tools` and `ClaudeAgentAdapter` bridges it into its own
 * `ag_ui` MCP server. No backend registration involved.
 *
 * The page's second pattern, `useInterrupt`, is LangGraph-only — it needs a
 * server-side `interrupt()` in a graph, which this framework has no equivalent
 * for. The Programmatic Control page says the same thing and redirects here.
 */

const DEFAULT_SLOTS: TimeSlot[] = [
  { label: "Tomorrow 10:00 AM", iso: "2026-04-19T10:00:00-07:00" },
  { label: "Tomorrow 2:00 PM", iso: "2026-04-19T14:00:00-07:00" },
  { label: "Monday 9:00 AM", iso: "2026-04-21T09:00:00-07:00" },
  { label: "Monday 3:30 PM", iso: "2026-04-21T15:30:00-07:00" },
];


function Chat() {
   useHumanInTheLoop({
    agentId: "hitl-in-chat",
    name: "book_call",
    description:
      "Ask the user to pick a time slot for a call. The picker UI presents fixed candidate slots; the user's choice is returned to the agent.",
    parameters: z.object({
      topic: z
        .string()
        .describe("What the call is about (e.g. 'Intro with sales')"),
      attendee: z
        .string()
        .describe("Who the call is with (e.g. 'Alice from Sales')"),
    }),
    // The doc's snippet types this parameter `any` literally. Kept verbatim
    // rather than tightened, so the code here matches what the page publishes.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render: ({ args, status, respond }: any) => (
      <TimePickerCard
        topic={args?.topic ?? "a call"}
        attendee={args?.attendee}
        slots={DEFAULT_SLOTS}
        status={status}
        onSubmit={(result) => respond?.(result)}
      />
    ),
  });

  return <CopilotChat agentId="hitl-in-chat" />;
}

export default function Page() {
  return (
    <DemoFrame parentPath="/human-in-the-loop" subtitle="agent: hitl-in-chat">
      <div className="mx-auto h-full w-full max-w-4xl">
        <Chat />
      </div>
    </DemoFrame>
  );
}
