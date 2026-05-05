/**
 * 5-Whys grading — current pointer. See `sipoc.ts` for the pattern.
 */

import type { GradingPrompt, CommonGrading } from "../types";
import {
  PROMPT_ID,
  VERSION,
  SYSTEM_PROMPT,
  buildFiveWhysUserPrompt,
  type FiveWhysGradingResult,
} from "./five-whys.v1";

export interface FiveWhysInput {
  problem: string;
  whys: string[];
}

export const FiveWhysPrompt: GradingPrompt<FiveWhysInput> = {
  id: PROMPT_ID,
  version: VERSION,
  systemPrompt: SYSTEM_PROMPT,
  buildUserPrompt(input) {
    return buildFiveWhysUserPrompt(input);
  },
  temperature: 0.2,
  maxTokens: 600,
  parse(json): CommonGrading {
    const v = json as Partial<FiveWhysGradingResult>;
    if (
      typeof v.score !== "number" ||
      typeof v.decision !== "string" ||
      typeof v.summary !== "string" ||
      !Array.isArray(v.feedback)
    ) {
      throw new Error("5-Whys grading: response missing required fields");
    }
    return {
      score: v.score,
      decision: v.decision,
      summary: v.summary,
      feedback: (v.feedback as FiveWhysGradingResult["feedback"]).map((f) => ({
        section: f.section,
        note: f.note,
      })),
    };
  },
};
