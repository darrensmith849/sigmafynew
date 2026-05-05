# ADR 0007 — AI provider default — OpenAI in `@sigmafy/ai`

- **Status**: Accepted
- **Date**: 2026-05-05
- **Supersedes**: AI-provider mentions in master build plan §6, §10, §15
  (originally Anthropic Claude).

## Context

The master build plan and Phase -1 docs originally specified Anthropic Claude
as the default AI provider, with `packages/ai` wrapping it behind an
abstraction. Phase 0A landed signature-only adapters; no real provider
integration shipped, so no production behaviour depends on the choice yet.

2KO has decided to use OpenAI as the default at Phase 0B grading time.
Reasons (per 2KO):
- Existing OpenAI account and tooling.
- Mature JSON-mode / structured-outputs and function-calling for grading.
- Cost profile preferred at Phase 0A/0B scale.

The provider abstraction in `@sigmafy/ai` (`AiProvider` interface,
`createAiClient`, `AiLogger`, prompt registry) was designed to make this
swap a one-adapter change, exactly for situations like this.

## Decision

Make OpenAI the default AI provider:

- `@sigmafy/ai` ships `createOpenAiAdapter` instead of `createClaudeAdapter`.
- `AI_PROVIDER` env var defaults to `openai`. `AiProviderId` is `"openai"`.
- `OPENAI_API_KEY` replaces `ANTHROPIC_API_KEY` in `.env.example` and Vercel
  envs.
- The abstraction surface (`AiProvider.complete`, `AiProvider.stream`,
  `AiRequest`, `AiResponse`, `AiCallRecord`) is unchanged.

Hard rule retained: **app code never imports `openai` directly** — only
`@sigmafy/ai`. The "never import the provider SDK" rule moves from Anthropic
to OpenAI.

## Consequences

Positive:
- Aligns with 2KO's existing tooling and cost preferences.
- Provider abstraction proves its design under a real swap.

Negative / cost:
- Phase 0B SIPOC grading prompt will need to be written and tuned for
  OpenAI's chat/completions API rather than Claude's messages API.
- Refusal patterns and JSON-mode behaviour differ; grading-decision logic
  must be tested against actual OpenAI outputs.

Future work:
- Phase 0B `adapters/openai.ts` swaps the throw-stub for a real client call.
- Phase 1+ may add multi-provider support per workspace; the abstraction
  already supports this — `AiProviderId` becomes a union and `client.ts`
  expands its switch.
