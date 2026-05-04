# @sigmafy/ai

Provider-agnostic AI client. **All AI calls in Sigmafy go through this package** —
no app code may import `@anthropic-ai/sdk` directly.

## Phase -1

Signature-only. The Claude adapter exposes the full `AiProvider` interface, but
every method throws `"AI not implemented in Phase -1"`.

## Phase 0B (next material work)

Wire the Anthropic SDK in `adapters/claude.ts`, add the SIPOC grading prompt
under `prompts/grading/sipoc.v1.ts`, and run grading via Inngest with logging
through `consoleAiLogger` (replaced with a DB logger in Phase 1).

## Hard rules

- Apps import `createAiClient` and `consoleAiLogger` only.
- Every prompt lives in a versioned file under `src/prompts/`. Never edit a
  published version.
- Every `complete()` / `stream()` call must be logged via an `AiLogger`.
- Trainer/sponsor/admin override of AI feedback must be the default UX —
  not an edge case.
