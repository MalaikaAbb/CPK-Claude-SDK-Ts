"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { z } from "zod";

/**
 * The component the agent renders by calling it as a tool.
 *
 * The page shows the `useComponent({ name, description, parameters, render })`
 * call and says the example "uses Recharts for the bar chart; it doesn't know
 * anything about CopilotKit" — but never publishes the component or its
 * schema. Both below are this repo's, kept minimal: a schema of labelled
 * numbers, and a chart that reads only its props.
 *
 * The schema is the contract the LLM fills, so the `.describe()` calls matter
 * more than the styling does.
 */

export const barChartPropsSchema = z.object({
  title: z.string().describe("A short title for the chart."),
  data: z
    .array(
      z.object({
        label: z.string().describe("The category name for this bar."),
        value: z.number().describe("The numeric height of this bar."),
      }),
    )
    .describe("The bars to plot, in display order."),
});

export type BarChartProps = z.infer<typeof barChartPropsSchema>;

export function BarChart({ title, data }: BarChartProps) {
  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </p>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" fontSize={11} />
            <YAxis fontSize={11} />
            <Tooltip />
            <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
