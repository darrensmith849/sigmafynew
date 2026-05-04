import { createClaudeAdapter } from "./adapters/claude";
import type { AiProvider } from "./provider";
import type { AiProviderId } from "./types";

export interface AiClientEnv {
  AI_PROVIDER?: AiProviderId;
  ANTHROPIC_API_KEY?: string;
  AI_DEFAULT_MODEL_ID?: string;
}

export function createAiClient(env: AiClientEnv): AiProvider {
  const provider = env.AI_PROVIDER ?? "claude";
  switch (provider) {
    case "claude":
      return createClaudeAdapter({
        apiKey: env.ANTHROPIC_API_KEY ?? "",
        defaultModelId: env.AI_DEFAULT_MODEL_ID,
      });
    default: {
      const _exhaustive: never = provider;
      throw new Error(`unknown AI provider: ${String(_exhaustive)}`);
    }
  }
}
