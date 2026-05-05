/**
 * Common grading-result shape across every topic kind.
 *
 * Per-kind feedback always lands as a list of `{ section, note }` pairs.
 * `section` is whatever the prompt chose to attribute the note to — e.g.
 * SIPOC uses column names ("suppliers", "inputs", ...), 5-Whys uses level
 * indices ("level_1", "level_3", ...), Charter uses field names
 * ("problem_statement", "scope", ...). The renderer is responsible for
 * humanising it.
 *
 * Keep this shape stable — it's persisted in `topic_solutions.grading` and
 * reflected in every emailed grading-result template.
 */
export interface CommonGrading {
  score: number;
  decision: "approved" | "approved_with_notes" | "needs_revision";
  summary: string;
  feedback: Array<{
    /** Domain-specific identifier the renderer maps to a label. */
    section: string;
    note: string;
  }>;
}

/**
 * A versioned grading prompt for a specific topic kind.
 *
 * `id` and `version` flow through to AiCallRecord and into the persisted
 * grading row, so every grading is traceable to the exact prompt revision.
 *
 * `buildUserPrompt` shapes the topic submission into a string. The runner
 * always uses `SYSTEM_PROMPT` + the built user prompt + JSON-mode + a known
 * model id.
 *
 * `parse` validates the model's JSON output and casts to CommonGrading.
 * Throw to signal an unparseable response — the runner converts that into
 * a logged error + grading failure.
 */
export interface GradingPrompt<TInput> {
  id: string;
  version: string;
  systemPrompt: string;
  buildUserPrompt(input: TInput): string;
  /** Default chat-completion temperature for this prompt. */
  temperature?: number;
  /** Default max output tokens for this prompt. */
  maxTokens?: number;
  /**
   * Parse the model's JSON response into the canonical CommonGrading shape.
   * Throw if the response doesn't conform.
   */
  parse(json: unknown): CommonGrading;
}
