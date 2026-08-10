import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const URL_VARIANT = `<CopilotChat
  attachments={{
    enabled: true,
    onUpload: async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const { url } = await res.json();
      return {
        type: "url",
        value: url,
        mimeType: file.type,
      };
    },
  }}
/>`;

const METADATA_VARIANT = `onUpload: async (file) => {
  const url = await uploadToStorage(file);
  return {
    type: "url",
    value: url,
    mimeType: file.type,
    metadata: {
      uploadedBy: currentUser.id,
      category: "support-ticket",
    },
  };
},`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/multimodal-attachments" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          One prop turns the composer into a drop target.{" "}
          <code>attachments=&#123;&#123; enabled: true &#125;&#125;</code> is
          the whole minimum; <code>accept</code> and <code>maxSize</code> gate
          what gets through, and <code>onUpload</code> decides what the agent
          actually receives — an inline base64 part, or a URL your storage
          hands back.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Drag a PNG onto the composer, then ask: what is in this image?",
              "Attach a PDF and ask for a one-line summary.",
            ]}
            expect="A chip for the file above the composer, then a reply that refers to the file's actual contents."
            fail="A reply that talks about the filename only means the part never reached the model. A rejected drop means the file missed accept or maxSize — this route alerts on that rather than failing quietly."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/multimodal-attachments/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The other upload variants"
        description="Both are the page's, shown here because neither is wired into this route."
      >
        <CodeBlock
          code={URL_VARIANT}
          language="tsx"
          filename="URL upload — needs a storage endpoint this repo does not have"
        />
        <div className="mt-4">
          <CodeBlock
            code={METADATA_VARIANT}
            language="tsx"
            filename="attaching arbitrary metadata to the content part"
          />
        </div>
      </Panel>

      <Panel title="Note">
        <Callout tone="info" title="Base64 is the variant that runs standalone">
          The page shows two <code>onUpload</code> shapes. The URL one is the
          right answer for anything large — it keeps the payload out of the
          message — but it assumes a <code>/api/upload</code> route and a
          bucket behind it. This harness has neither, so the base64 variant is
          what the demo uses, with <code>maxSize</code> at the page&apos;s own
          10&nbsp;MB.
        </Callout>
      </Panel>
    </>
  );
}
