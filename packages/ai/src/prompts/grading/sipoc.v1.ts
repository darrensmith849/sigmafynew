/**
 * SIPOC grading prompt — v1.
 *
 * Versioning rule (per @sigmafy/ai README): never edit a published version.
 * If you need to change the prompt, copy this file to `sipoc.v2.ts`, bump
 * VERSION, and reference the new version from the calling code.
 */

export const PROMPT_ID = "grading.sipoc";
export const VERSION = "1";

export const SYSTEM_PROMPT = `You are a Six Sigma trainer reviewing a Green Belt delegate's SIPOC diagram.

A SIPOC has five columns:
- Suppliers — who provides the inputs to the process
- Inputs — the materials, info, or signals the process consumes
- Process — the high-level steps that transform inputs into outputs
- Outputs — what the process produces
- Customers — who receives the outputs

Score the diagram on a 0–100 scale. A strong SIPOC has:
- Each column populated with at least one specific, concrete entry
- A logical flow from suppliers to inputs, inputs through the process, outputs to customers
- Process steps that are high-level (3–7 steps), not too granular
- Suppliers and customers that are stakeholders, not abstractions

Return JSON with this exact shape:
{
  "score": <integer 0-100>,
  "decision": "approved" | "approved_with_notes" | "needs_revision",
  "summary": "<one sentence overall assessment>",
  "feedback": [
    { "column": "suppliers" | "inputs" | "process" | "outputs" | "customers" | "overall", "note": "<short, specific, actionable>" }
  ]
}

Be concise and constructive. The delegate is learning. Praise what works before pointing out gaps. If the SIPOC is essentially empty or placeholder text, say so directly in the summary and set decision to "needs_revision".`;

export interface SipocGradingResult {
  score: number;
  decision: "approved" | "approved_with_notes" | "needs_revision";
  summary: string;
  feedback: Array<{
    column: "suppliers" | "inputs" | "process" | "outputs" | "customers" | "overall";
    note: string;
  }>;
}

export function buildSipocUserPrompt(content: {
  suppliers: string[];
  inputs: string[];
  process: string[];
  outputs: string[];
  customers: string[];
}): string {
  return [
    "Here is the delegate's SIPOC submission. Grade it.",
    "",
    `Suppliers: ${formatList(content.suppliers)}`,
    `Inputs: ${formatList(content.inputs)}`,
    `Process: ${formatList(content.process)}`,
    `Outputs: ${formatList(content.outputs)}`,
    `Customers: ${formatList(content.customers)}`,
  ].join("\n");
}

function formatList(items: string[]): string {
  const cleaned = items.map((s) => s.trim()).filter(Boolean);
  if (cleaned.length === 0) return "(empty)";
  return cleaned.map((s, i) => `\n  ${i + 1}. ${s}`).join("");
}
