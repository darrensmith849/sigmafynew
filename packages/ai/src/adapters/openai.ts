import type { AiProvider } from "../provider";

const PHASE_0A_NOT_WIRED =
  "AI provider not wired yet — implementation lands in Phase 0B (see docs/master-build-plan.md §15).";

export interface OpenAiAdapterOptions {
  apiKey: string;
  /** e.g. gpt-4o, gpt-4o-mini, gpt-4-turbo. Default chosen at call site. */
  defaultModelId?: string;
}

export function createOpenAiAdapter(_opts: OpenAiAdapterOptions): AiProvider {
  return {
    async complete() {
      throw new Error(PHASE_0A_NOT_WIRED);
    },
    async *stream() {
      throw new Error(PHASE_0A_NOT_WIRED);
      yield ""; // unreachable; satisfies async generator type
    },
  };
}
