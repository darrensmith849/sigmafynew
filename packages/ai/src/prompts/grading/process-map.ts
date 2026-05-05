/**
 * Process Map grading — current pointer. See `sipoc.ts` for the pattern.
 */

import type { GradingPrompt, CommonGrading } from "../types";
import {
  PROMPT_ID,
  VERSION,
  SYSTEM_PROMPT,
  buildProcessMapUserPrompt,
  type ProcessMapStep,
  type ProcessMapGradingResult,
} from "./process-map.v1";

export interface ProcessMapInput {
  description: string;
  steps: ProcessMapStep[];
}

export const ProcessMapPrompt: GradingPrompt<ProcessMapInput> = {
  id: PROMPT_ID,
  version: VERSION,
  systemPrompt: SYSTEM_PROMPT,
  buildUserPrompt(input) {
    return buildProcessMapUserPrompt(input);
  },
  temperature: 0.2,
  maxTokens: 700,
  parse(json): CommonGrading {
    const v = json as Partial<ProcessMapGradingResult>;
    if (
      typeof v.score !== "number" ||
      typeof v.decision !== "string" ||
      typeof v.summary !== "string" ||
      !Array.isArray(v.feedback)
    ) {
      throw new Error("Process Map grading: response missing required fields");
    }
    return {
      score: v.score,
      decision: v.decision,
      summary: v.summary,
      feedback: (v.feedback as ProcessMapGradingResult["feedback"]).map((f) => ({
        section: f.section,
        note: f.note,
      })),
    };
  },
};
