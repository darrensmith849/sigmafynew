/**
 * Fishbone (Ishikawa) grading — current pointer. See `sipoc.ts` for the pattern.
 */

import type { GradingPrompt, CommonGrading } from "../types";
import {
  PROMPT_ID,
  VERSION,
  SYSTEM_PROMPT,
  buildFishboneUserPrompt,
  type FishboneCategory,
  type FishboneGradingResult,
} from "./fishbone.v1";

export interface FishboneInput {
  problem: string;
  categories: FishboneCategory[];
}

export const FishbonePrompt: GradingPrompt<FishboneInput> = {
  id: PROMPT_ID,
  version: VERSION,
  systemPrompt: SYSTEM_PROMPT,
  buildUserPrompt(input) {
    return buildFishboneUserPrompt(input);
  },
  temperature: 0.2,
  maxTokens: 800,
  parse(json): CommonGrading {
    const v = json as Partial<FishboneGradingResult>;
    if (
      typeof v.score !== "number" ||
      typeof v.decision !== "string" ||
      typeof v.summary !== "string" ||
      !Array.isArray(v.feedback)
    ) {
      throw new Error("Fishbone grading: response missing required fields");
    }
    return {
      score: v.score,
      decision: v.decision,
      summary: v.summary,
      feedback: (v.feedback as FishboneGradingResult["feedback"]).map((f) => ({
        section: f.section,
        note: f.note,
      })),
    };
  },
};
