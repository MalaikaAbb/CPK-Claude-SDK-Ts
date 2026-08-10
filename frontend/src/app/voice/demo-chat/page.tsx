"use client";

import { CopilotChat, CopilotKit } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";
import { nestedInspectorSetting } from "@/lib/inspector";

import { SampleAudioButton } from "../sample-audio-button";

/**
 * The one route with its own `<CopilotKit>`, because it needs its own runtime.
 *
 * Transcription only exists on the v2 runtime handler, so `/api/copilotkit-voice`
 * is a separate endpoint built with `createCopilotRuntimeHandler` and given a
 * `TranscriptionService`. That is what makes `/info` advertise
 * `audioFileTranscriptionEnabled: true`, which is the only reason the composer
 * grows a mic button. Nothing on this component asks for the mic.
 *
 * The page sets `enableInspector={false}` here because the dev inspector
 * overlay intercepts pointer events on top of the sample-audio button. This
 * repo routes that through `lib/inspector.ts` instead, which already stands
 * the root inspector down on this path — same outcome, decided in one place.
 */

const SAMPLE_TEXT = "What can you help me with today?";

/**
 * The page describes dropping the transcript into the composer's textarea
 * (matched via `data-testid="copilot-chat-textarea"`) using the native value
 * setter plus a synthetic `input` event, so React's managed state updates.
 * That description is the whole specification it gives; this is it in code.
 */
function insertIntoComposer(text: string) {
  const el = document.querySelector<HTMLTextAreaElement>(
    '[data-testid="copilot-chat-textarea"]',
  );
  if (!el) return;
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value",
  )?.set;
  setter?.call(el, text);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.focus();
}

export default function Page() {
  return (
    <DemoFrame parentPath="/voice" subtitle="agent: voice-demo · own runtime">
      <CopilotKit
        runtimeUrl="/api/copilotkit-voice"
        agent="voice-demo"
        useSingleEndpoint={false}
        enableInspector={nestedInspectorSetting}
      >
        <div className="mx-auto flex h-full w-full max-w-4xl flex-col">
          <div className="shrink-0 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
            <SampleAudioButton
              onTranscribed={insertIntoComposer}
              sampleText={SAMPLE_TEXT}
            />
          </div>
          <div className="min-h-0 flex-1">
            <CopilotChat agentId="voice-demo" />
          </div>
        </div>
      </CopilotKit>
    </DemoFrame>
  );
}
