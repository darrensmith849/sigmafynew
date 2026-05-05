import type { GradingPrompt, CommonGrading } from "../types";
import {
  PROMPT_ID,
  VERSION,
  SYSTEM_PROMPT,
  buildLongFormUserPrompt,
  type LongFormGradingResult,
} from "./long-form.v1";

export interface LongFormInput {
  topicName: string;
  topicBrief: string;
  answer: string;
}

export const LongFormPrompt: GradingPrompt<LongFormInput> = {
  id: PROMPT_ID,
  version: VERSION,
  systemPrompt: SYSTEM_PROMPT,
  buildUserPrompt(input) {
    return buildLongFormUserPrompt(input);
  },
  temperature: 0.2,
  maxTokens: 600,
  parse(json): CommonGrading {
    const v = json as Partial<LongFormGradingResult>;
    if (
      typeof v.score !== "number" ||
      typeof v.decision !== "string" ||
      typeof v.summary !== "string" ||
      !Array.isArray(v.feedback)
    ) {
      throw new Error("Long-form grading: response missing required fields");
    }
    return {
      score: v.score,
      decision: v.decision,
      summary: v.summary,
      feedback: (v.feedback as LongFormGradingResult["feedback"]).map((f) => ({
        section: f.section,
        note: f.note,
      })),
    };
  },
};
