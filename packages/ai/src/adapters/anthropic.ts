import Anthropic from "@anthropic-ai/sdk";
import type { AiProvider } from "../provider";
import type { AiMessage, AiRequest, AiResponse } from "../types";

/**
 * Anthropic adapter for the Sigmafy AI provider abstraction. Phase 9A
 * uses this for the AI agent platform; Phase 9B (Enterprise moat) builds
 * on top with workspace-specific tool wiring.
 *
 * This is the baseline text-completion + streaming adapter. Tool-use
 * (the agentic side that lets the model call /api/v1/* endpoints) is
 * handled separately by the chat handler in apps/stats-studio because
 * it requires more than the bare AiProvider interface — see Slice 4.
 */

// Picked 2026-05-25. Override per-request via `AiRequest.modelId` or
// globally via the `ANTHROPIC_DEFAULT_MODEL_ID` env var. Update this
// fallback as Anthropic releases newer models.
const DEFAULT_MODEL = "claude-sonnet-4-5";

export interface AnthropicAdapterOptions {
  apiKey: string;
  /** e.g. "claude-opus-4-7", "claude-sonnet-4-5", "claude-haiku-4-5". */
  defaultModelId?: string;
}

/**
 * Split out `system` messages: Anthropic's Messages API takes them as a
 * top-level `system` parameter, not inline in the `messages` array.
 */
function splitSystem(messages: AiMessage[]): {
  system: string | undefined;
  rest: { role: "user" | "assistant"; content: string }[];
} {
  const systems: string[] = [];
  const rest: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of messages) {
    if (m.role === "system") {
      systems.push(m.content);
    } else {
      rest.push({ role: m.role, content: m.content });
    }
  }
  return {
    system: systems.length ? systems.join("\n\n") : undefined,
    rest,
  };
}

export function createAnthropicAdapter(opts: AnthropicAdapterOptions): AiProvider {
  if (!opts.apiKey) {
    return {
      async complete() {
        throw new Error("ANTHROPIC_API_KEY missing — cannot call Anthropic");
      },
      async *stream() {
        throw new Error("ANTHROPIC_API_KEY missing — cannot call Anthropic");
        yield "";
      },
    };
  }

  const client = new Anthropic({ apiKey: opts.apiKey });

  return {
    async complete(req: AiRequest): Promise<AiResponse> {
      if (req.responseFormat === "json_object") {
        // The bare-bones text interface doesn't model Anthropic's
        // structured-output story. Phase 9A doesn't need JSON mode for
        // the chat path; if a future caller does, we'll wire up
        // input/output schemas separately.
        throw new Error(
          "Anthropic adapter does not support responseFormat='json_object' yet — request a Claude tool_use with an input_schema instead.",
        );
      }
      const modelId = req.modelId || opts.defaultModelId || DEFAULT_MODEL;
      const { system, rest } = splitSystem(req.messages);
      const response = await client.messages.create({
        model: modelId,
        // Anthropic requires max_tokens; default to a safe cap if not provided.
        max_tokens: req.maxTokens ?? 4096,
        temperature: req.temperature,
        system,
        messages: rest,
      });

      // Concatenate all text blocks. Tool-use blocks are intentionally
      // ignored at this level — the chat handler reads the structured
      // blocks separately when it's running an agentic loop.
      const text = response.content
        .filter((block): block is { type: "text"; text: string } & typeof block => block.type === "text")
        .map((block) => block.text)
        .join("");

      return {
        text,
        modelId: response.model,
        tokensIn: response.usage.input_tokens,
        tokensOut: response.usage.output_tokens,
      };
    },

    async *stream(req: AiRequest) {
      if (req.responseFormat === "json_object") {
        throw new Error(
          "Anthropic adapter does not support responseFormat='json_object' yet.",
        );
      }
      const modelId = req.modelId || opts.defaultModelId || DEFAULT_MODEL;
      const { system, rest } = splitSystem(req.messages);
      const stream = client.messages.stream({
        model: modelId,
        max_tokens: req.maxTokens ?? 4096,
        temperature: req.temperature,
        system,
        messages: rest,
      });

      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          yield event.delta.text;
        }
      }
    },
  };
}
