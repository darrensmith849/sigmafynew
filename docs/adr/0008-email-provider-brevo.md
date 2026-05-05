# ADR 0008 — Email provider default — Brevo in `@sigmafy/emails`

- **Status**: Accepted
- **Date**: 2026-05-05
- **Supersedes**: Email-provider mentions in master build plan §6, §15
  (originally Resend).

## Context

The master build plan originally specified Resend + React Email as the
transactional email stack. Phase -1 wired the React Email scaffolding
(`packages/emails/templates/_placeholder.tsx`) and a `sendEmail()` signature
that throws "not implemented." No live email has been sent.

2KO has decided to use Brevo (formerly Sendinblue) instead. Reasons (per
2KO):
- ZA-friendly pricing and deliverability.
- Existing Brevo account.
- Cheaper at expected V1 volume.

## Decision

Make Brevo the default transactional email provider:

- `@sigmafy/emails` keeps every React Email component (`PlaceholderEmail`
  and the Phase 0B welcome + topic-graded templates).
- The send mechanism switches: render the React component to HTML via
  `@react-email/render`, then POST to Brevo's transactional email endpoint
  using `@getbrevo/brevo`.
- `BREVO_API_KEY` replaces `RESEND_API_KEY` in `.env.example` and Vercel
  envs.
- `EMAIL_FROM` must match a sender that's been verified in Brevo (DNS
  records on `sigmafy.co`).

Hard rule added: **app code never imports `@getbrevo/brevo` directly** —
only `@sigmafy/emails`. Same pattern as billing/AI/stats.

## Consequences

Positive:
- Cheaper at scale; better ZA deliverability.
- React Email components stay — no template rewrite needed.

Negative / cost:
- Brevo's transactional API is shaped differently from Resend's; the
  `sendEmail` adapter rewrite in Phase 0B is non-trivial (auth header,
  batch endpoint shape, attachment handling).
- DNS verification is a one-time chore that 2KO must complete before
  Phase 0B's first live send.

Future work:
- Phase 0B `packages/emails/src/send.ts` calls Brevo's transactional API
  with the rendered HTML and proper sender verification.
- Phase 1 may add a per-workspace "from" address (white-label is V4
  per the master plan, so this is a hook only).
