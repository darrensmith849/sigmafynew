/**
 * SIPOC grading — current pointer.
 *
 * This file selects which versioned SIPOC prompt is "live" and exposes it
 * through the generic `GradingPrompt` interface. To roll out a new prompt
 * version: write `sipoc.v2.ts` (never edit v1), then update the import here.
 */

import type { GradingPrompt, CommonGrading } from "../types";
import {
  PROMPT_ID,
  VERSION,
  SYSTEM_PROMPT,
  buildSipocUserPrompt,
  type SipocGradingResult,
} from "./sipoc.v1";

export interface SipocInput {
  suppliers: string[];
  inputs: string[];
  process: string[];
  outputs: string[];
  customers: string[];
}

/** Map the v1 column-keyed feedback to the canonical section-keyed shape. */
function v1ToCommon(v: SipocGradingResult): CommonGrading {
  return {
    score: v.score,
    decision: v.decision,
    summary: v.summary,
    feedback: v.feedback.map((f) => ({ section: f.column, note: f.note })),
  };
}

export const SipocPrompt: GradingPrompt<SipocInput> = {
  id: PROMPT_ID,
  version: VERSION,
  systemPrompt: SYSTEM_PROMPT,
  buildUserPrompt(input) {
    return buildSipocUserPrompt(input);
  },
  temperature: 0.2,
  maxTokens: 600,
  parse(json) {
    const v = json as Partial<SipocGradingResult>;
    if (
      typeof v.score !== "number" ||
      typeof v.decision !== "string" ||
      typeof v.summary !== "string" ||
      !Array.isArray(v.feedback)
    ) {
      throw new Error("SIPOC grading: response missing required fields");
    }
    return v1ToCommon(v as SipocGradingResult);
  },
};
