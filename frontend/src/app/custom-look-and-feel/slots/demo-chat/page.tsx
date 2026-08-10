"use client";

import {
  CopilotChat,
  CopilotChatAssistantMessage,
  CopilotChatInput,
  CopilotChatView,
} from "@copilotkit/react-core/v2";
import { DemoFrame } from "@/components/demo-frame";

/**
 * The page's three overridden slots, at the three levels it describes.
 *
 * The doc's own extract file (`slot-overrides.snippet.tsx`) only ever shows
 * the *plumbing* — it `declare`s `CustomWelcomeScreen`, `CustomAssistantMessage`
 * and `CustomDisclaimer` as opaque `ComponentType`s and never publishes their
 * bodies. So the three components below are this repo's, deliberately kept to
 * the minimum that makes the override visible: a strongly coloured container
 * and a badge naming the slot you are looking at. The casts and the slot
 * wiring are the doc's, unchanged.
 */

/**
 * One hue per slot, so which override you are looking at is unambiguous.
 *
 * Solid fills rather than alpha tints on purpose: a `bg-accent/5` wash is
 * invisible against a white chat surface, which defeats the point of a demo
 * whose only job is to prove the override took effect. Each tone carries an
 * explicit dark-mode value so contrast holds in both themes.
 */
const TONES = {
  welcome: {
    badge: "bg-amber-600 text-white",
    card: "border-amber-500 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/50",
  },
  assistant: {
    badge: "bg-violet-600 text-white",
    card: "border-violet-500 bg-violet-50 dark:border-violet-600 dark:bg-violet-950/50",
  },
  disclaimer: {
    // Solid only — the disclaimer is a single small pill, so a tinted card
    // behind it would be the same invisibility problem at a smaller size.
    badge: "bg-teal-700 text-white",
  },
} as const;

const Badge = ({
  children,
  tone,
}: {
  children: string;
  tone: keyof typeof TONES;
}) => (
  <span
    className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm ${TONES[tone].badge}`}
  >
    {children}
  </span>
);

/**
 * The welcome screen is the ENTIRE chat while there are no messages —
 * `CopilotChatView` renders only this slot in the empty state, and hands the
 * composer down as the `input` prop. So an override that ignores `input`
 * removes the only way to send a first message, and the chat can never leave
 * the empty state.
 *
 * That is why the doc says its version "still renders the default input and
 * suggestions": both arrive as pre-bound elements and have to be placed.
 */
function CustomWelcomeScreen({
  input,
  suggestionView,
}: {
  input?: React.ReactNode;
  suggestionView?: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col justify-center gap-4 p-4">
      <div
        className={`rounded-xl border-2 border-dashed p-8 text-center shadow-sm ${TONES.welcome.card}`}
      >
        <Badge tone="welcome">welcomeScreen slot</Badge>
        <p className="mt-3 text-lg font-bold text-amber-950 dark:text-amber-100">
          Custom empty state
        </p>
        <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
          Send a message and watch the assistantMessage slot take over.
        </p>
      </div>
      {suggestionView}
      {input}
    </div>
  );
}

function CustomAssistantMessage(
  props: React.ComponentProps<typeof CopilotChatAssistantMessage>,
) {
  return (
    <div
      className={`rounded-xl border-2 border-l-8 p-3 shadow-sm ${TONES.assistant.card}`}
    >
      <Badge tone="assistant">assistantMessage slot</Badge>
      <div className="mt-2">
        <CopilotChatAssistantMessage {...props} />
      </div>
    </div>
  );
}

function CustomDisclaimer() {
  return (
    <div className="flex justify-center px-3 pb-2">
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${TONES.disclaimer.badge}`}
      >
        disclaimer slot — still overridden
      </span>
    </div>
  );
}

export default function Page() {
  // The doc's extract, verbatim: each override is pulled into a local so the
  // three levels are easy to see, then cast to the slot's own type.
  const welcomeScreen =
    CustomWelcomeScreen as unknown as typeof CopilotChatView.WelcomeScreen;

  const messageView = {
    assistantMessage:
      CustomAssistantMessage as unknown as typeof CopilotChatAssistantMessage,
  };

  const input = {
    disclaimer:
      CustomDisclaimer as unknown as typeof CopilotChatInput.Disclaimer,
  };

  return (
    <DemoFrame
      parentPath="/custom-look-and-feel/slots"
      subtitle="agent: chat-slots"
    >
      <div className="mx-auto h-full w-full max-w-4xl">
        <CopilotChat
          agentId="chat-slots"
          welcomeScreen={welcomeScreen}
          messageView={messageView}
          input={input}
        />
      </div>
    </DemoFrame>
  );
}
