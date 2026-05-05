# @sigmafy/ai

Provider-agnostic AI client. **All AI calls in Sigmafy go through this package** —
no app code may import `openai` (or any other provider SDK) directly.

## Phase 0A

Signature-only. The OpenAI adapter exposes the full `AiProvider` interface, but
every method throws `"AI provider not wired yet"`.

## Phase 0B (next material work)

Wire the OpenAI SDK in `adapters/openai.ts`, add the SIPOC grading prompt under
`prompts/grading/sipoc.v1.ts`, and run grading via Inngest with logging through
`consoleAiLogger` (replaced with a DB logger in Phase 1).

## Hard rules

- Apps import `createAiClient` and `consoleAiLogger` only.
- Every prompt lives in a versioned file under `src/prompts/`. Never edit a
  published version.
- Every `complete()` / `stream()` call must be logged via an `AiLogger`.
- Trainer/sponsor/admin override of AI feedback must be the default UX —
  not an edge case.

## Provider history

The default adapter was switched from Anthropic Claude to OpenAI on
2026-05-05 (ADR 0007). The abstraction surface is unchanged, so a future
swap remains a one-adapter change.
