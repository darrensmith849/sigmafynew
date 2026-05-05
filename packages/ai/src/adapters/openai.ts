import OpenAI from "openai";
import type { AiProvider } from "../provider";
import type { AiRequest, AiResponse } from "../types";

const DEFAULT_MODEL = "gpt-4o-mini";

export interface OpenAiAdapterOptions {
  apiKey: string;
  /** e.g. "gpt-4o", "gpt-4o-mini", "gpt-4-turbo". */
  defaultModelId?: string;
}

/**
 * OpenAI adapter for the Sigmafy AI provider abstraction.
 *
 * `complete()` does a non-streaming chat completion. Pass `responseFormat:
 * "json_object"` via `AiRequest.metadata` if you want JSON-mode output.
 *
 * `stream()` streams text deltas via the SDK's stream API.
 *
 * Costing is intentionally NOT computed here — the AiResponse only carries
 * tokens in/out + the modelId. The caller (`@sigmafy/ai/logging`) computes
 * cost via a price table so we can tune prices without redeploying adapters.
 */
export function createOpenAiAdapter(opts: OpenAiAdapterOptions): AiProvider {
  if (!opts.apiKey) {
    return {
      async complete() {
        throw new Error("OPENAI_API_KEY missing — cannot call OpenAI");
      },
      async *stream() {
        throw new Error("OPENAI_API_KEY missing — cannot call OpenAI");
        yield "";
      },
    };
  }

  const client = new OpenAI({ apiKey: opts.apiKey });

  return {
    async complete(req: AiRequest): Promise<AiResponse> {
      const modelId = req.modelId || opts.defaultModelId || DEFAULT_MODEL;
      const completion = await client.chat.completions.create({
        model: modelId,
        messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
        max_tokens: req.maxTokens,
        temperature: req.temperature,
        ...(req.responseFormat === "json_object" ? { response_format: { type: "json_object" } } : {}),
      });

      const choice = completion.choices[0];
      const text = choice?.message?.content ?? "";
      const usage = completion.usage;
      return {
        text,
        modelId: completion.model,
        tokensIn: usage?.prompt_tokens ?? 0,
        tokensOut: usage?.completion_tokens ?? 0,
      };
    },

    async *stream(req: AiRequest) {
      const modelId = req.modelId || opts.defaultModelId || DEFAULT_MODEL;
      const stream = await client.chat.completions.create({
        model: modelId,
        messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
        max_tokens: req.maxTokens,
        temperature: req.temperature,
        stream: true,
      });
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) yield delta;
      }
    },
  };
}
