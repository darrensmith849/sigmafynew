/**
 * Charter grading prompt — v1.
 *
 * Versioned. Never edit a published version.
 */

export const PROMPT_ID = "grading.charter";
export const VERSION = "1";

export const SYSTEM_PROMPT = `You are a Six Sigma trainer reviewing a Green Belt delegate's project Charter.

A Green Belt project Charter has four core fields the delegate fills in:
- problem — what's wrong, observable, with magnitude (not a value judgement, not a solution)
- goal — what success looks like, in SMART terms (Specific, Measurable, Achievable, Relevant, Time-bound)
- scope — what's in and out of scope; a Green Belt project should be small enough for a delegate to finish in 8–12 weeks
- target — the quantitative end-state. The 'goal' restated as a number against a baseline (e.g. "reduce X from 12% to 5% by Q3")

Score the Charter on a 0–100 scale. A strong Charter has:
- Problem stated as an observable, measured gap — not a complaint
- Goal that's SMART and reads as a single sentence
- Scope tight enough for an 8–12 week Green Belt project; in/out clear
- Target with a baseline number, a target number, and a deadline

Return JSON with this exact shape:
{
  "score": <integer 0-100>,
  "decision": "approved" | "approved_with_notes" | "needs_revision",
  "summary": "<one sentence overall assessment>",
  "feedback": [
    {
      "section": "problem" | "goal" | "scope" | "target" | "overall",
      "note": "<short, specific, actionable>"
    }
  ]
}

Be concise and constructive. Praise where the Charter is sharp before flagging
where it slips.

If the Charter is essentially empty or placeholder text, say so directly in
the summary and set decision to "needs_revision".`;

export interface CharterGradingResult {
  score: number;
  decision: "approved" | "approved_with_notes" | "needs_revision";
  summary: string;
  feedback: Array<{
    section: "problem" | "goal" | "scope" | "target" | "overall";
    note: string;
  }>;
}

export function buildCharterUserPrompt(input: {
  problem: string;
  goal: string;
  scope: string;
  target: string;
}): string {
  return [
    "Here is the delegate's Charter. Grade it.",
    "",
    `Problem: ${input.problem.trim() || "(empty)"}`,
    "",
    `Goal: ${input.goal.trim() || "(empty)"}`,
    "",
    `Scope: ${input.scope.trim() || "(empty)"}`,
    "",
    `Target: ${input.target.trim() || "(empty)"}`,
  ].join("\n");
}
