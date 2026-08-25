# Agent Config

> Forward typed configuration from your UI into the agent's reasoning loop.


<!-- interactive demo: agent-config -->


You have a working agent and want the user to be able to tune how it behaves: tone, expertise level, response length, language, persona. By the end of this guide, your UI will own a typed config object that the agent reads on every run and rebuilds its system prompt from.

## When to use this

Reach for agent config whenever the agent's behaviour depends on user-controllable settings that don't fit naturally as chat input:

- **Tone, voice, persona**: "playful", "formal", "casual"
- **Expertise level**: "beginner", "intermediate", "expert"
- **Response shape**: short / medium / long, structured / prose, language
- **Domain switches**: which knowledge base to consult, which tool subset to enable

If the values are a *channel* the user occasionally tunes (a settings panel, a toolbar of selects), agent config is the right shape. If the values are *content* the agent should write back to (notes, a document, a plan), use [Shared State](/claude-sdk-typescript/shared-state) instead.

How agent config flows from the UI into the agent's reasoning loop depends on your runtime architecture. Agents living behind a runtime read it from agent state on every run, while in-process agents receive the same object as forwarded properties on the provider — same UX, slightly different wiring on each side.



## How it works

<Steps>
  <Step>
    ### Make runtime configuration explicit

    The Claude Agent SDK demo reads configuration from shared state and folds it
    into the system prompt. This keeps the agent behavior visible to the UI and
    lets users tune model behavior without rebuilding the backend.

    
~~~~typescript title="agent-config-prompt.ts"
export type Tone = "professional" | "casual" | "enthusiastic";
export type Expertise = "beginner" | "intermediate" | "expert";
export type ResponseLength = "concise" | "detailed";

const DEFAULT_TONE: Tone = "professional";
const DEFAULT_EXPERTISE: Expertise = "intermediate";
const DEFAULT_RESPONSE_LENGTH: ResponseLength = "concise";

const VALID_TONES: ReadonlySet<string> = new Set<Tone>([
  "professional",
  "casual",
  "enthusiastic",
]);
const VALID_EXPERTISE: ReadonlySet<string> = new Set<Expertise>([
  "beginner",
  "intermediate",
  "expert",
]);
const VALID_RESPONSE_LENGTHS: ReadonlySet<string> = new Set<ResponseLength>([
  "concise",
  "detailed",
]);

const TONE_RULES: Record<Tone, string> = {
  professional: "Use neutral, precise language. No emoji. Short sentences.",
  casual:
    "Use friendly, conversational language. Contractions OK. Light humor welcome.",
  enthusiastic:
    "Use upbeat, energetic language. Exclamation points OK. Emoji OK.",
};

const EXPERTISE_RULES: Record<Expertise, string> = {
  beginner: "Assume no prior knowledge. Define jargon. Use analogies.",
  intermediate:
    "Assume common terms are understood; explain specialized terms.",
  expert: "Assume technical fluency. Use precise terminology. Skip basics.",
};

const LENGTH_RULES: Record<ResponseLength, string> = {
  concise: "Respond in 1-3 sentences.",
  detailed: "Respond in multiple paragraphs with examples where relevant.",
};

function readString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function buildAgentConfigSystemPrompt(
  forwardedProps: Record<string, unknown>,
): string {
  const rawTone = readString(forwardedProps.tone) ?? DEFAULT_TONE;
  const rawExpertise =
    readString(forwardedProps.expertise) ?? DEFAULT_EXPERTISE;
  const rawLength =
    readString(forwardedProps.responseLength) ?? DEFAULT_RESPONSE_LENGTH;

  const tone = (VALID_TONES.has(rawTone) ? rawTone : DEFAULT_TONE) as Tone;
  const expertise = (
    VALID_EXPERTISE.has(rawExpertise) ? rawExpertise : DEFAULT_EXPERTISE
  ) as Expertise;
  const responseLength = (
    VALID_RESPONSE_LENGTHS.has(rawLength) ? rawLength : DEFAULT_RESPONSE_LENGTH
  ) as ResponseLength;

  return [
    "You are a helpful assistant.",
    "",
    `Tone: ${TONE_RULES[tone]}`,
    `Expertise level: ${EXPERTISE_RULES[expertise]}`,
    `Response length: ${LENGTH_RULES[responseLength]}`,
  ].join("\n");
}

export const AGENT_CONFIG_DEFAULT_SYSTEM_PROMPT = buildAgentConfigSystemPrompt(
  {},
);
~~~~

  </Step>
</Steps>

Agent config is a typed object the frontend owns and publishes to the agent as
runtime context. The backend reads that context entry and turns it into a
system prompt.


Hold the typed config in React state, then mirror every change into the agent
through `useAgentContext`:

```tsx title="frontend/src/app/page.tsx — UI publishes the typed config"
function ConfigContextRelay({ config }: { config: AgentConfig }) {
  useAgentContext({
    description: "Agent response preferences",
    value: {
      tone: config.tone,
      expertise: config.expertise,
      responseLength: config.responseLength,
    },
  });
  return null;
}
```




The backend half is also a single node. Read the latest config context at the top of every run and use it to build the system prompt for that turn:

```python title="backend/agent.py — agent reads config and rebuilds the system prompt"
import json

CONFIG_KEYS = ("tone", "expertise", "responseLength")

def read_config_value(entry):
    value = entry.get("value")
    if isinstance(value, str):
        try:
            value = json.loads(value)
        except json.JSONDecodeError:
            return None
    if not isinstance(value, dict):
        return None
    if any(key in value for key in CONFIG_KEYS):
        return value
    return None

async def my_agent_node(state: AgentState, config: RunnableConfig):
    context_entries = state.get("copilotkit", {}).get("context", [])
    cfg = next(
        (
            value
            for entry in reversed(context_entries)
            if (value := read_config_value(entry)) is not None
        ),
        {},
    )
    tone = cfg.get("tone", "professional")
    expertise = cfg.get("expertise", "intermediate")
    response_length = cfg.get("responseLength", "concise")
    system_prompt = build_system_prompt(tone, expertise, response_length)
    # ...
```

The agent reads the latest typed config at the start of every turn, rebuilds the system prompt, runs the turn. This is the same shape as the [shared-state write-side pattern](/claude-sdk-typescript/shared-state#writing-to-agent-state); agent config is just a specific use of that pattern with a UI-owned typed object on top.





<IntegrationGrid path="agent-config" />
