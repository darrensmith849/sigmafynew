/**
 * Process Map grading prompt — v1.
 *
 * Versioned. Never edit a published version. Bump to v2 if the output
 * shape or scoring rubric changes.
 */

export const PROMPT_ID = "grading.process-map";
export const VERSION = "1";

export const SYSTEM_PROMPT = `You are a Six Sigma trainer reviewing a Green Belt delegate's process map.

A process map is a sequential list of the steps that make up the process being
improved. It is not a value-stream map and is not a swim-lane diagram — for
this V1 it is intentionally a simple linear sequence.

Score the map on a 0–100 scale. A strong process map has:
- A short description that names the process and where it starts/ends.
- Steps that are concrete actions (verbs), not vague phases.
- Steps in true execution order — no missing handoffs between roles.
- Each step is at the same level of detail (don't mix "make the part" with
  "tighten bolt #3 to 12 Nm").
- 5–15 steps in total. Fewer than 5 usually means the process is too coarse;
  more than 15 usually means it should be split into sub-processes.
- Where useful, an actor is named per step (who does this).

Return JSON with this exact shape:
{
  "score": <integer 0-100>,
  "decision": "approved" | "approved_with_notes" | "needs_revision",
  "summary": "<one sentence overall assessment>",
  "feedback": [
    {
      "section": "description" | "steps" | "ordering" | "granularity" | "actors" | "overall",
      "note": "<short, specific, actionable>"
    }
  ]
}

Be concise and constructive. The delegate is learning. Praise where the map
is clear before pointing out where it slips.

If the map is essentially empty or just placeholder text, say so directly in
the summary and set decision to "needs_revision".`;

export interface ProcessMapStep {
  label: string;
  detail?: string;
  actor?: string;
}

export interface ProcessMapGradingResult {
  score: number;
  decision: "approved" | "approved_with_notes" | "needs_revision";
  summary: string;
  feedback: Array<{
    section: "description" | "steps" | "ordering" | "granularity" | "actors" | "overall";
    note: string;
  }>;
}

export function buildProcessMapUserPrompt(input: {
  description: string;
  steps: ProcessMapStep[];
}): string {
  const lines = [
    "Here is the delegate's process map. Grade it.",
    "",
    `Process description: ${input.description.trim() || "(empty)"}`,
    "",
    "Steps:",
  ];
  if (input.steps.length === 0) {
    lines.push("  (no steps yet)");
  } else {
    input.steps.forEach((step, i) => {
      const label = step.label.trim() || "(empty)";
      const actor = step.actor?.trim();
      const detail = step.detail?.trim();
      let line = `  ${i + 1}. ${label}`;
      if (actor) line += ` — actor: ${actor}`;
      lines.push(line);
      if (detail) lines.push(`       detail: ${detail}`);
    });
  }
  return lines.join("\n");
}
