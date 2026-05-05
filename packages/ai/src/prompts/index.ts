/**
 * Prompt registry.
 *
 * Convention: each topic kind has a "current version pointer" file
 * (e.g. `grading/sipoc.ts`) that imports from a versioned source
 * (`grading/sipoc.v1.ts`). Versioned files are immutable — never edit a
 * published version. New revisions land as a new file (`sipoc.v2.ts`)
 * and the pointer file's import is bumped.
 *
 * The `gradingPrompts` registry below is what the app's grading runner
 * indexes into by topic kind.
 */

export type { CommonGrading, GradingPrompt } from "./types";
export { SipocPrompt, type SipocInput } from "./grading/sipoc";
export { FiveWhysPrompt, type FiveWhysInput } from "./grading/five-whys";

import type { GradingPrompt } from "./types";
import { SipocPrompt, type SipocInput } from "./grading/sipoc";
import { FiveWhysPrompt, type FiveWhysInput } from "./grading/five-whys";

/** Discriminated union of every kind we know how to grade. */
export type GradeableTopic =
  | { kind: "sipoc"; input: SipocInput }
  | { kind: "five-whys"; input: FiveWhysInput };

/**
 * Compile-time registry. New topic kinds: add to GradeableTopic above and
 * register the prompt here.
 */
export const gradingPrompts: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in GradeableTopic["kind"]]: GradingPrompt<any>;
} = {
  sipoc: SipocPrompt,
  "five-whys": FiveWhysPrompt,
};

// Backwards-compatible namespace export (Phase 0B code still imports
// `Prompts.SipocGradingV1.SipocGradingResult`).
export * as SipocGradingV1 from "./grading/sipoc.v1";
