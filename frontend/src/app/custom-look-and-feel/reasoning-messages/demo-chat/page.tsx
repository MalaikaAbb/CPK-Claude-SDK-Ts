"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

function CustomHeader({
  isOpen,
  label,
  hasContent,
  isStreaming,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isOpen?: boolean;
  label?: string;
  hasContent?: boolean;
  isStreaming?: boolean;
}) {
  return (
    <button
      className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium"
      {...props}
    >
      {isStreaming ? "🧠" : "💡"}
      <span>{label}</span>
      {hasContent && (
        <span className="ml-auto text-xs">{isOpen ? "Hide" : "Show"}</span>
      )}
    </button>
  );
}

function CustomContent({
  isStreaming,
  hasContent,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  isStreaming?: boolean;
  hasContent?: boolean;
}) {
  if (!hasContent && !isStreaming) return null;
  return (
    <div className="px-4 pb-3 text-sm text-gray-500 font-mono" {...props}>
      {children}
      {isStreaming && <span className="animate-pulse ml-1">▊</span>}
    </div>
  );
}

export default function Page() {
  return (
    <DemoFrame
      parentPath="/custom-look-and-feel/reasoning-messages"
      subtitle="agent: reasoning-default"
    >
      <div className="mx-auto h-full w-full max-w-4xl">
        <CopilotChat
          agentId="reasoning-default"
          messageView={{
            reasoningMessage: {
              header: CustomHeader,
              contentView: CustomContent,
            },
          }}
        />
      </div>
    </DemoFrame>
  );
}
