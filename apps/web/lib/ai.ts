import { createAiClient, consoleAiLogger, Prompts } from "@sigmafy/ai";
import type { AiProvider, AiCallRecord } from "@sigmafy/ai";

let _ai: AiProvider | null = null;

export function getAi(): AiProvider {
  if (_ai) return _ai;
  _ai = createAiClient({
    AI_PROVIDER: (process.env.AI_PROVIDER as "openai" | undefined) ?? "openai",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    AI_DEFAULT_MODEL_ID: process.env.AI_DEFAULT_MODEL_ID,
  });
  return _ai;
}

/**
 * Grade a SIPOC submission via the configured AI provider.
 *
 * Returns a structured result + the call metadata for logging. Throws on
 * provider error or unparseable JSON — callers decide whether to swallow
 * (treat as ungraded) or surface to the user.
 */
export async function gradeSipoc(args: {
  workspaceId: string;
  userId: string;
  content: {
    suppliers: string[];
    inputs: string[];
    process: string[];
    outputs: string[];
    customers: string[];
  };
}): Promise<{
  grading: Prompts.SipocGradingV1.SipocGradingResult & {
    promptId: string;
    promptVersion: string;
    modelId: string;
    gradedAt: string;
  };
  call: AiCallRecord;
}> {
  const { SipocGradingV1 } = Prompts;
  const ai = getAi();
  const startedAt = Date.now();

  try {
    const response = await ai.complete({
      workspaceId: args.workspaceId,
      userId: args.userId,
      promptId: SipocGradingV1.PROMPT_ID,
      promptVersion: SipocGradingV1.VERSION,
      modelId: process.env.AI_DEFAULT_MODEL_ID ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: SipocGradingV1.SYSTEM_PROMPT },
        { role: "user", content: SipocGradingV1.buildSipocUserPrompt(args.content) },
      ],
      temperature: 0.2,
      maxTokens: 600,
      responseFormat: "json_object",
    });

    let parsed: Prompts.SipocGradingV1.SipocGradingResult;
    try {
      parsed = JSON.parse(response.text) as Prompts.SipocGradingV1.SipocGradingResult;
    } catch {
      throw new Error(`SIPOC grading: model returned non-JSON: ${response.text.slice(0, 200)}`);
    }

    const call: AiCallRecord = {
      workspaceId: args.workspaceId,
      userId: args.userId,
      promptId: SipocGradingV1.PROMPT_ID,
      promptVersion: SipocGradingV1.VERSION,
      modelId: response.modelId,
      tokensIn: response.tokensIn,
      tokensOut: response.tokensOut,
      latencyMs: Date.now() - startedAt,
      costUsd: 0, // computed in Phase 1 via a price table
      status: "ok",
      occurredAt: new Date().toISOString(),
    };
    void consoleAiLogger.log(call);

    return {
      grading: {
        ...parsed,
        promptId: SipocGradingV1.PROMPT_ID,
        promptVersion: SipocGradingV1.VERSION,
        modelId: response.modelId,
        gradedAt: call.occurredAt,
      },
      call,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    void consoleAiLogger.log({
      workspaceId: args.workspaceId,
      userId: args.userId,
      promptId: SipocGradingV1.PROMPT_ID,
      promptVersion: SipocGradingV1.VERSION,
      modelId: process.env.AI_DEFAULT_MODEL_ID ?? "gpt-4o-mini",
      tokensIn: 0,
      tokensOut: 0,
      latencyMs: Date.now() - startedAt,
      costUsd: 0,
      status: "error",
      errorMessage,
      occurredAt: new Date().toISOString(),
    });
    throw err;
  }
}
