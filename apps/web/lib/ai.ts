import {
  createAiClient,
  consoleAiLogger,
  gradingPrompts,
  type AiProvider,
  type AiCallRecord,
  type CommonGrading,
  type GradeableTopic,
  type Prompts,
} from "@sigmafy/ai";

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

export interface PersistedGrading extends CommonGrading {
  promptId: string;
  promptVersion: string;
  modelId: string;
  gradedAt: string;
}

/**
 * Grade a topic submission via the configured AI provider, dispatched by
 * topic kind through the prompt registry.
 *
 * Adding a new graded topic kind: add the kind to `GradeableTopic` and
 * register a `GradingPrompt` in `@sigmafy/ai`'s `gradingPrompts`. No
 * changes here.
 *
 * The persisted grading shape is the canonical `CommonGrading` plus the
 * call provenance (prompt id + version, model id, timestamp). Every
 * grading row in the DB is traceable to a specific prompt revision.
 */
export async function gradeTopic(args: {
  workspaceId: string;
  userId: string;
  topic: GradeableTopic;
}): Promise<{ grading: PersistedGrading; call: AiCallRecord }> {
  const { kind, input } = args.topic;
  const prompt = gradingPrompts[kind];
  if (!prompt) throw new Error(`No grading prompt registered for kind: ${kind}`);

  const ai = getAi();
  const startedAt = Date.now();

  try {
    const response = await ai.complete({
      workspaceId: args.workspaceId,
      userId: args.userId,
      promptId: prompt.id,
      promptVersion: prompt.version,
      modelId: process.env.AI_DEFAULT_MODEL_ID ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: prompt.systemPrompt },
        { role: "user", content: prompt.buildUserPrompt(input) },
      ],
      temperature: prompt.temperature,
      maxTokens: prompt.maxTokens,
      responseFormat: "json_object",
    });

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(response.text);
    } catch {
      throw new Error(`${kind} grading: model returned non-JSON: ${response.text.slice(0, 200)}`);
    }
    const grading = prompt.parse(parsedJson);

    const call: AiCallRecord = {
      workspaceId: args.workspaceId,
      userId: args.userId,
      promptId: prompt.id,
      promptVersion: prompt.version,
      modelId: response.modelId,
      tokensIn: response.tokensIn,
      tokensOut: response.tokensOut,
      latencyMs: Date.now() - startedAt,
      costUsd: 0,
      status: "ok",
      occurredAt: new Date().toISOString(),
    };
    void consoleAiLogger.log(call);

    return {
      grading: {
        ...grading,
        promptId: prompt.id,
        promptVersion: prompt.version,
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
      promptId: prompt.id,
      promptVersion: prompt.version,
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

/**
 * @deprecated — use `gradeTopic({ topic: { kind: "sipoc", input } })`.
 *
 * Kept for the inline-grading code path in `save-sipoc.ts` and the Inngest
 * grading function during the Slice A.2 migration. Remove once both
 * callsites are switched.
 */
export async function gradeSipoc(args: {
  workspaceId: string;
  userId: string;
  content: Prompts.SipocInput;
}): Promise<{
  grading: Omit<PersistedGrading, "feedback"> & {
    feedback: Array<{ column: string; note: string }>;
  };
  call: AiCallRecord;
}> {
  const { grading, call } = await gradeTopic({
    workspaceId: args.workspaceId,
    userId: args.userId,
    topic: { kind: "sipoc", input: args.content },
  });
  // Phase 0B's stored shape used `column` not `section`. Map back so any
  // residual code that reads grading.feedback[].column keeps working.
  const { feedback: _section, ...rest } = grading;
  return {
    grading: {
      ...rest,
      feedback: grading.feedback.map((f) => ({ column: f.section, note: f.note })),
    },
    call,
  };
}
