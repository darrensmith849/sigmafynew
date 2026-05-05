# Architecture Decisions

Index of Architecture Decision Records (ADRs). Each ADR follows the standard
**Context / Decision / Consequences** shape and lives in `docs/adr/`.

| # | Title | Status |
|---|---|---|
| [0001](adr/0001-monorepo-layout.md) | Monorepo layout (pnpm + Turborepo) | Accepted |
| [0002](adr/0002-ui-shadcn-source-of-truth.md) | UI source-of-truth — shadcn into `packages/ui` | Accepted |
| [0003](adr/0003-rls-from-day-one.md) | RLS from day one — `withWorkspace` is the only sanctioned seam | Accepted |
| [0004](adr/0004-billing-abstraction.md) | Billing provider abstraction — Paystack-first | Accepted |
| [0005](adr/0005-stats-gateway-pattern.md) | Stats gateway pattern — allowlist + signed call + audit log | Accepted |
| [0006](adr/0006-single-branch-while-no-users.md) | Single-branch flow while no live users — push directly to `main` | Accepted |
| [0007](adr/0007-ai-provider-openai.md) | AI provider default — OpenAI in `@sigmafy/ai` | Accepted |
| [0008](adr/0008-email-provider-brevo.md) | Email provider default — Brevo in `@sigmafy/emails` | Accepted |
| [0009](adr/0009-workspace-routing-path-prefix.md) | Workspace routing — path prefix `/w/{slug}/...` | Accepted |

## When to add a new ADR

- The decision is hard to reverse later (storage choice, framework, security boundary).
- Reasonable people would disagree about the chosen option.
- A future contributor would need to know *why* we chose this, not just *what*.

Trivial decisions (variable names, file layouts that don't cross packages, etc.)
do not warrant an ADR.
