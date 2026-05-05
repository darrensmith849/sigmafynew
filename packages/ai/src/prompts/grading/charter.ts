import type { GradingPrompt, CommonGrading } from "../types";
import {
  PROMPT_ID,
  VERSION,
  SYSTEM_PROMPT,
  buildCharterUserPrompt,
  type CharterGradingResult,
} from "./charter.v1";

export interface CharterInput {
  problem: string;
  goal: string;
  scope: string;
  target: string;
}

export const CharterPrompt: GradingPrompt<CharterInput> = {
  id: PROMPT_ID,
  version: VERSION,
  systemPrompt: SYSTEM_PROMPT,
  buildUserPrompt(input) {
    return buildCharterUserPrompt(input);
  },
  temperature: 0.2,
  maxTokens: 600,
  parse(json): CommonGrading {
    const v = json as Partial<CharterGradingResult>;
    if (
      typeof v.score !== "number" ||
      typeof v.decision !== "string" ||
      typeof v.summary !== "string" ||
      !Array.isArray(v.feedback)
    ) {
      throw new Error("Charter grading: response missing required fields");
    }
    return {
      score: v.score,
      decision: v.decision,
      summary: v.summary,
      feedback: (v.feedback as CharterGradingResult["feedback"]).map((f) => ({
        section: f.section,
        note: f.note,
      })),
    };
  },
};
