"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The page's `attachments` config, using its base64 `onUpload` variant.
 *
 * Three of the doc's four options are set here — `enabled`, `accept`,
 * `maxSize` — plus the handler that turns a File into an AG-UI content part.
 * The base64 variant is the one that works with no extra infrastructure; the
 * page's other variant POSTs to `/api/upload` and returns `{ type: "url" }`,
 * which would need a storage endpoint this repo does not have.
 *
 * `onUploadFailed` and `onError` are the page's error hooks; both are wired so
 * a rejected file says so instead of failing silently.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/multimodal-attachments" subtitle="agent: multimodal">
      <div className="mx-auto h-full w-full max-w-4xl">
        <CopilotChat
          agentId="multimodal"
          attachments={{
            enabled: true,
            accept: "image/*,audio/*,video/*,application/pdf",
            maxSize: 10 * 1024 * 1024,
            onUpload: async (file: File) => {
              const buffer = await file.arrayBuffer();
              const base64 = btoa(
                String.fromCharCode(...new Uint8Array(buffer)),
              );
              return {
                type: "data",
                value: base64,
                mimeType: file.type,
              };
            },
            // Left un-annotated on purpose: the argument is CopilotKit's
            // `AttachmentUploadError` — `{ reason, file, message }` — not a
            // JS `Error`. Annotating it as `Error` does not compile.
            onUploadFailed: (error) => {
              console.error("[multimodal] upload failed", error);
              window.alert(error.message);
            },
          }}
        />
      </div>
    </DemoFrame>
  );
}
