import { createOpenAiAdapter } from "./adapters/openai";
import { createAnthropicAdapter } from "./adapters/anthropic";
import type { AiProvider } from "./provider";
import type { AiProviderId } from "./types";

export interface AiClientEnv {
  /** Defaults to "anthropic" when ANTHROPIC_API_KEY is set, else "openai". */
  AI_PROVIDER?: AiProviderId;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  /** Generic — used by whichever adapter is selected. */
  AI_DEFAULT_MODEL_ID?: string;
  /** Anthropic-specific override (wins over AI_DEFAULT_MODEL_ID for the
   *  Anthropic adapter only). */
  ANTHROPIC_DEFAULT_MODEL_ID?: string;
  /** OpenAI-specific override (wins over AI_DEFAULT_MODEL_ID for the
   *  OpenAI adapter only). */
  OPENAI_DEFAULT_MODEL_ID?: string;
}

/**
 * Pick a default provider when AI_PROVIDER is not set explicitly. We
 * prefer Anthropic whenever its key is present — Phase 9A's headline
 * positioning is "AI-native" Claude wiring. Falls back to OpenAI for
 * the legacy DMAIC grading path that already shipped.
 */
function resolveProvider(env: AiClientEnv): AiProviderId {
  if (env.AI_PROVIDER) return env.AI_PROVIDER;
  if (env.ANTHROPIC_API_KEY) return "anthropic";
  return "openai";
}

export function createAiClient(env: AiClientEnv): AiProvider {
  const provider = resolveProvider(env);
  switch (provider) {
    case "openai":
      return createOpenAiAdapter({
        apiKey: env.OPENAI_API_KEY ?? "",
        defaultModelId: env.OPENAI_DEFAULT_MODEL_ID ?? env.AI_DEFAULT_MODEL_ID,
      });
    case "anthropic":
      return createAnthropicAdapter({
        apiKey: env.ANTHROPIC_API_KEY ?? "",
        defaultModelId:
          env.ANTHROPIC_DEFAULT_MODEL_ID ?? env.AI_DEFAULT_MODEL_ID,
      });
    default: {
      const _exhaustive: never = provider;
      throw new Error(`unknown AI provider: ${String(_exhaustive)}`);
    }
  }
}
