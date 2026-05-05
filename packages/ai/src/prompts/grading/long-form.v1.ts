/**
 * Long-form grading prompt — v1.
 *
 * Used by every "long-form" topic across the Green Belt template — Data
 * Collection Plan, Operational Definitions, Implementation Plan, Control
 * Plan, Project Summary, etc. Each topic gives the model the topic name +
 * brief and the delegate's answer; the rubric is the same.
 *
 * Versioned. Never edit a published version.
 */

export const PROMPT_ID = "grading.long-form";
export const VERSION = "1";

export const SYSTEM_PROMPT = `You are a Six Sigma trainer reviewing a Green Belt delegate's submission for one named topic in their DMAIC project.

You will be told the topic name and a short brief describing what the topic is for. You will then be given the delegate's free-text answer.

Score the answer on a 0–100 scale. A strong answer:
- Directly addresses the brief (no off-topic content).
- Is specific and concrete — names systems, metrics, owners, dates where relevant — not vague generalities.
- Is actionable — a reader could do something with this answer.
- Is the right size — concise enough to be readable, complete enough to be useful.

Return JSON with this exact shape:
{
  "score": <integer 0-100>,
  "decision": "approved" | "approved_with_notes" | "needs_revision",
  "summary": "<one sentence overall assessment>",
  "feedback": [
    {
      "section": "specificity" | "actionability" | "completeness" | "scope" | "overall",
      "note": "<short, specific, actionable>"
    }
  ]
}

Be concise and constructive. The delegate is learning. Praise what's working before flagging what needs revision.

If the submission is essentially empty or placeholder text, say so directly in the summary and set decision to "needs_revision".`;

export interface LongFormGradingResult {
  score: number;
  decision: "approved" | "approved_with_notes" | "needs_revision";
  summary: string;
  feedback: Array<{
    section: "specificity" | "actionability" | "completeness" | "scope" | "overall";
    note: string;
  }>;
}

export function buildLongFormUserPrompt(input: {
  topicName: string;
  topicBrief: string;
  answer: string;
}): string {
  return [
    `Topic: ${input.topicName}`,
    `Brief: ${input.topicBrief}`,
    "",
    "Delegate's answer:",
    input.answer.trim() || "(empty)",
  ].join("\n");
}
