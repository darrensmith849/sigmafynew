/**
 * 5-Whys grading prompt — v1.
 *
 * Versioned. Never edit a published version. Bump to v2 if the output
 * shape or scoring rubric changes.
 */

export const PROMPT_ID = "grading.five-whys";
export const VERSION = "1";

export const SYSTEM_PROMPT = `You are a Six Sigma trainer reviewing a Green Belt delegate's 5-Whys analysis.

The 5-Whys technique starts from a problem and asks "why?" five times in
sequence — each answer becomes the next "why" — to dig past symptoms toward a
root cause.

Score the analysis on a 0–100 scale. A strong 5-Whys has:
- A specific, observable problem statement (not a value judgement).
- Each "why" answer is a concrete cause, not a restatement of the problem
  or a generic complaint ("staff are lazy", "the process is bad" — weak).
- Each level deepens the chain — level 2's cause should explain level 1's
  cause, not run parallel to it.
- The deepest level points to something actionable — a system, a process,
  a missing control — not a person to blame.
- Answers are short and specific.

Return JSON with this exact shape:
{
  "score": <integer 0-100>,
  "decision": "approved" | "approved_with_notes" | "needs_revision",
  "summary": "<one sentence overall assessment>",
  "feedback": [
    {
      "section": "problem" | "level_1" | "level_2" | "level_3" | "level_4" | "level_5" | "overall",
      "note": "<short, specific, actionable>"
    }
  ]
}

Be concise and constructive. The delegate is learning. Praise where the
chain is sharp before pointing out where it slips.

If the analysis is essentially empty or just placeholder text, say so
directly in the summary and set decision to "needs_revision".`;

export interface FiveWhysGradingResult {
  score: number;
  decision: "approved" | "approved_with_notes" | "needs_revision";
  summary: string;
  feedback: Array<{
    section: "problem" | "level_1" | "level_2" | "level_3" | "level_4" | "level_5" | "overall";
    note: string;
  }>;
}

export function buildFiveWhysUserPrompt(input: {
  problem: string;
  whys: string[];
}): string {
  const lines = [
    "Here is the delegate's 5-Whys analysis. Grade it.",
    "",
    `Problem: ${input.problem.trim() || "(empty)"}`,
    "",
    "Why-chain:",
  ];
  for (let i = 0; i < 5; i++) {
    const why = (input.whys[i] ?? "").trim();
    lines.push(`  ${i + 1}. ${why || "(empty)"}`);
  }
  return lines.join("\n");
}
