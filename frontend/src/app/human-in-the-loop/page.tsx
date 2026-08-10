import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/human-in-the-loop" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The agent pauses mid-run, asks the user something, and resumes with
          the answer folded into its reasoning — without losing context. The
          mechanism is an ordinary frontend tool with a promise-based handler:
          the LLM calls it, your <code>render</code> shows a component, and{" "}
          <code>respond(...)</code> resolves the promise the tool call is
          blocked on.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Please book an intro call with the sales team to discuss pricing.",
              "Schedule a 1:1 with Alice next week to review Q2 goals.",
            ]}
            expect="A slot picker appears inline and the chat stops. Click a slot: the card flips to “Answered”, and the agent's next message references the specific time you chose."
            fail="If the agent invents a time without showing the picker it answered in prose instead of calling the tool. If clicking does nothing, respond never fired and the run stays suspended."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/human-in-the-loop/demo-chat/page.tsx" },
            { file: "frontend/src/app/human-in-the-loop/time-picker-card.tsx" },
          ]}
          note={
            <>
              The <code>useHumanInTheLoop</code> call and{" "}
              <code>DEFAULT_SLOTS</code> are the doc&apos;s, verbatim.{" "}
              <code>TimePickerCard</code> is referenced and never published, so
              it is this repo&apos;s — with the prop signature the doc&apos;s{" "}
              <code>render</code> dictates.
            </>
          }
        />
      </Panel>
    </>
  );
}
