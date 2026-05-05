/**
 * Fishbone (Ishikawa) grading prompt — v1.
 *
 * Versioned. Never edit a published version. Bump to v2 if the output
 * shape or scoring rubric changes.
 */

export const PROMPT_ID = "grading.fishbone";
export const VERSION = "1";

export const SYSTEM_PROMPT = `You are a Six Sigma trainer reviewing a Green Belt delegate's fishbone (Ishikawa) diagram.

A fishbone diagram organises candidate causes of a single observable problem
("the effect") into category branches — most commonly the 6 M's: People,
Machines, Methods, Materials, Measurement, Environment. Causes are listed
under each category.

Score the diagram on a 0–100 scale. A strong fishbone has:
- A specific, observable problem statement (not a value judgement, not a
  solution dressed up as a problem).
- Each cause is a concrete potential contributor — not a restatement of the
  problem and not a solution.
- Categories are populated where they make sense — empty categories are fine
  if a category genuinely doesn't apply, but a fishbone with only one or two
  populated categories is usually under-explored.
- Causes don't repeat across categories (e.g. "lack of training" should sit
  under People, not also under Methods).
- The deepest, most plausible candidate causes are flagged or highlighted in
  the problem statement / overall note where appropriate.

Return JSON with this exact shape:
{
  "score": <integer 0-100>,
  "decision": "approved" | "approved_with_notes" | "needs_revision",
  "summary": "<one sentence overall assessment>",
  "feedback": [
    {
      "section": "problem" | "people" | "machines" | "methods" | "materials" | "measurement" | "environment" | "coverage" | "overall",
      "note": "<short, specific, actionable>"
    }
  ]
}

Be concise and constructive. The delegate is learning. Praise where the
diagram is well-explored before pointing out gaps.

If the diagram is essentially empty or just placeholder text, say so directly
in the summary and set decision to "needs_revision".`;

export interface FishboneCategory {
  name: string;
  causes: string[];
}

export interface FishboneGradingResult {
  score: number;
  decision: "approved" | "approved_with_notes" | "needs_revision";
  summary: string;
  feedback: Array<{
    section:
      | "problem"
      | "people"
      | "machines"
      | "methods"
      | "materials"
      | "measurement"
      | "environment"
      | "coverage"
      | "overall";
    note: string;
  }>;
}

export function buildFishboneUserPrompt(input: {
  problem: string;
  categories: FishboneCategory[];
}): string {
  const lines = [
    "Here is the delegate's fishbone diagram. Grade it.",
    "",
    `Problem (effect): ${input.problem.trim() || "(empty)"}`,
    "",
    "Categories and candidate causes:",
  ];
  if (input.categories.length === 0) {
    lines.push("  (no categories)");
  } else {
    for (const cat of input.categories) {
      const populated = cat.causes.map((c) => c.trim()).filter(Boolean);
      lines.push(`  ${cat.name}:`);
      if (populated.length === 0) {
        lines.push("    (no causes listed)");
      } else {
        for (const c of populated) {
          lines.push(`    - ${c}`);
        }
      }
    }
  }
  return lines.join("\n");
}
