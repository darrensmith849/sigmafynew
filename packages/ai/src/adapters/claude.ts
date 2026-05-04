import type { AiProvider } from "../provider";

const PHASE_MINUS_ONE = "AI not implemented in Phase -1 — see docs/phase-log.md";

export interface ClaudeAdapterOptions {
  apiKey: string;
  /** e.g. claude-opus-4-7, claude-sonnet-4-6, claude-haiku-4-5-20251001. */
  defaultModelId?: string;
}

export function createClaudeAdapter(_opts: ClaudeAdapterOptions): AiProvider {
  return {
    async complete() {
      throw new Error(PHASE_MINUS_ONE);
    },
    async *stream() {
      throw new Error(PHASE_MINUS_ONE);
      yield ""; // unreachable; satisfies async generator type
    },
  };
}
