import { HttpAgent } from "@ag-ui/client";
import { TranscriptionServiceOpenAI } from "@copilotkit/voice";
import type {
  CopilotRuntimeOptions,
  TranscribeFileOptions,
} from "@copilotkit/runtime/v2";
import {
  CopilotRuntime,
  TranscriptionService,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import type { NextRequest } from "next/server";
import OpenAI from "openai";

import { AGENT_URL } from "@/lib/agents";

/**
 * The Voice page's runtime route, as published, with one substitution.
 *
 * The doc imports `createClaudeHttpAgent` from
 * `@/app/api/_shared/claude-http-agent` and never publishes that file. Rather
 * than invent a wrapper, this uses `new HttpAgent({ url })` directly — which
 * is what the Quickstart publishes and what the wrapper is evidently a thin
 * factory for. See README §9.
 *
 * Everything else is the page's own code: the `[[...slug]]` catch-all so the
 * v2 runtime can route `/info`, `/agent/:id/run` and `/transcribe` under one
 * base path; `createCopilotRuntimeHandler` from `@copilotkit/runtime/v2`
 * because the v1 wrapper drops `transcriptionService`; and the guard class so
 * a missing key returns a readable error instead of an opaque 5xx.
 */

type VoiceOpenAI = ConstructorParameters<
  typeof TranscriptionServiceOpenAI
>[0]["openai"];

const voiceDemoAgent = new HttpAgent({ url: `${AGENT_URL}/voice-demo` });

type StaticRuntimeAgents = Awaited<
  Exclude<CopilotRuntimeOptions["agents"], (...args: never[]) => unknown>
>;
type RuntimeAgent = StaticRuntimeAgents[keyof StaticRuntimeAgents];

const voiceDemoAgents: Record<string, RuntimeAgent> = {
  "voice-demo": voiceDemoAgent as unknown as RuntimeAgent,
  default: voiceDemoAgent as unknown as RuntimeAgent,
};

class GuardedOpenAITranscriptionService extends TranscriptionService {
  private delegate: TranscriptionServiceOpenAI | null;

  constructor() {
    super();
    const apiKey = process.env.OPENAI_API_KEY;
    this.delegate = apiKey
      ? new TranscriptionServiceOpenAI({
          // @copilotkit/voice currently bundles its own OpenAI package copy.
          // The runtime client shape is compatible, but OpenAI's private fields
          // make TypeScript treat the two package instances nominally.
          openai: new OpenAI({ apiKey }) as unknown as VoiceOpenAI,
        })
      : null;
  }

  async transcribeFile(options: TranscribeFileOptions): Promise<string> {
    if (!this.delegate) {
      throw new Error(
        "OPENAI_API_KEY not configured for this deployment (api key missing). " +
          "Set OPENAI_API_KEY to enable voice transcription.",
      );
    }
    return this.delegate.transcribeFile(options);
  }
}

let cachedHandler: ((req: Request) => Promise<Response>) | null = null;
function getHandler(): (req: Request) => Promise<Response> {
  if (cachedHandler) return cachedHandler;

  const runtime = new CopilotRuntime({
    agents: voiceDemoAgents,
    transcriptionService: new GuardedOpenAITranscriptionService(),
  });

  cachedHandler = createCopilotRuntimeHandler({
    runtime,
    basePath: "/api/copilotkit-voice",
  });
  return cachedHandler;
}

export const POST = (req: NextRequest) => getHandler()(req);
export const GET = (req: NextRequest) => getHandler()(req);
export const PUT = (req: NextRequest) => getHandler()(req);
export const DELETE = (req: NextRequest) => getHandler()(req);
