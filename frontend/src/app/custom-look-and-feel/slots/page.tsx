import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const LEVELS = `// 1. Tailwind classes — merged with the default component's classes
<CopilotChat
  messageView="bg-gray-50 dark:bg-gray-900 p-4"
  input="border-2 border-blue-400 rounded-xl"
/>

// 2. Props override — merged onto the default component's props
<CopilotChat
  messageView={{
    className: "my-custom-messages",
    "data-testid": "message-view",
  }}
  input={{ autoFocus: true }}
/>

// 3. Custom component — replaces the default entirely
<CopilotChat messageView={CustomMessageView} />`;

const NESTED = `// Two levels deep
<CopilotChat
  messageView={{
    assistantMessage: {
      toolbar: CustomToolbar,
      copyButton: CustomCopyButton,
    },
    userMessage: CustomUserMessage,
  }}
/>

// Three levels deep
<CopilotChat
  messageView={{
    assistantMessage: {
      copyButton: ({ onClick }) => (
        <button onClick={onClick}>Copy</button>
      ),
    },
  }}
/>`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/custom-look-and-feel/slots" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A slot is just a prop, and the same prop accepts three different kinds
          of value. Pass a string and it merges Tailwind classes; pass an object
          and it merges props; pass a component and it replaces the default
          outright. Slots nest, so you can drill into a sub-component at any
          depth without rebuilding its parent.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Hello"]}
            expect="Before you send: a gradient welcome card badged “welcomeScreen slot”. After: the reply sits in a tinted card badged “assistantMessage slot”, and the disclaimer under the composer stays overridden throughout."
            fail="Default chrome with no badges means the casts resolved to the built-ins — check the slot prop names against the table below."
          />
        </div>
      </Panel>

      <Panel title="The three levels">
        <CodeBlock code={LEVELS} language="tsx" filename="from the doc page" />
      </Panel>

      <Panel title="Drilling into nested slots">
        <CodeBlock code={NESTED} language="tsx" filename="from the doc page" />
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/custom-look-and-feel/slots/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Notes">
        <Callout tone="warn" title="Overriding welcomeScreen can remove the composer entirely">
          <p>
            While there are no messages,{" "}
            <code>CopilotChatView</code> renders <em>only</em> the{" "}
            <code>welcomeScreen</code> slot — the composer is handed down to it
            as an <code>input</code> prop, alongside{" "}
            <code>suggestionView</code>. An override that ignores{" "}
            <code>input</code> therefore leaves no way to send a first message,
            and since the empty state never ends, the chat is permanently
            unusable rather than just unstyled.
          </p>
          <p className="mt-2">
            The doc says only that its version &ldquo;still renders the default
            input and suggestions&rdquo;. That clause is the whole warning, and
            it is easy to read as a description rather than a requirement — this
            repo got it wrong first time round. The other two slots here have no
            such trap: overriding{" "}
            <code>assistantMessage</code> or the input&apos;s{" "}
            <code>disclaimer</code> replaces a leaf, not a container.
          </p>
        </Callout>

        <div className="mt-4">
          <Callout tone="info" title="The doc never publishes the override components">
            Its extract file declares <code>CustomWelcomeScreen</code>,{" "}
            <code>CustomAssistantMessage</code> and{" "}
            <code>CustomDisclaimer</code> as bare{" "}
            <code>ComponentType</code>s and shows only the wiring around them.
            The three components in this repo are therefore ours, kept to the
            smallest thing that makes each override visibly active — which is
            also why the <code>input</code> requirement above was not obvious
            from the page alone. The wiring — the locals, the casts, the slot
            props — is the doc&apos;s.
          </Callout>
        </div>
      </Panel>
    </>
  );
}
