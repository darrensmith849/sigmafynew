# Sigmafy

Six Sigma & Lean SaaS platform. Built by 2KO Pty Ltd.

> **Status**: Phase 0A (Architecture Proof) — code complete on `main`,
> awaiting live signup verification with Clerk keys.

## Quick start

```bash
nvm use                    # Node 22 (per .nvmrc)
corepack enable            # pnpm 10
pnpm install --frozen-lockfile
pnpm dev                   # apps/web on :3000, apps/admin on :3001
```

See [docs/environment-setup.md](docs/environment-setup.md) for first-time
setup, env vars, and Vercel project configuration. The full master plan
lives at [docs/master-build-plan.md](docs/master-build-plan.md).

## What's where

```
apps/
  web/         Public marketing + authenticated product (Next.js 15)
  admin/       2KO platform admin (Next.js 15)
  stats-api/   FastAPI stats engine (deployed on Fly.io)
packages/
  ui/          Design system primitives + tokens
  auth/        Clerk wrapper
  db/          Drizzle + Neon serverless + RLS helpers
  billing/     Provider-agnostic billing (Paystack adapter)
  stats-client/   Generated TS client for the stats API
  stats-gateway/  Server-side gateway: allowlist, quota, audit log
  ai/          Provider-agnostic AI (OpenAI adapter)
  emails/      React Email templates + Brevo send
  config/      Shared ESLint, TypeScript, Tailwind, Prettier configs
docs/
  master-build-plan.md       Full V1 master plan (canonical mirror)
  build-state.md             What works right now
  phase-log.md               Reverse-chronological phase history
  architecture-decisions.md  Index of ADRs
  environment-setup.md       Setup walkthrough
  adr/                       Individual ADR files
```

## Branch policy

- **While there are zero live users**, all work pushes directly to `main`.
  The `dev` branch is retired (ADR 0006).
- **Reinstate dev/PR flow before Phase 1 SSA pilot launch** — at that point
  every commit to `main` becomes a production deploy with real users on it.
- See [CLAUDE.md](CLAUDE.md) for the full agent operating contract.

## Tech stack

Next.js 15 · React 19 · TypeScript 5.6 · Tailwind 4 · Turborepo · pnpm 10 ·
Drizzle · Neon (serverless Postgres) · Clerk · OpenAI · Paystack ·
Brevo · Inngest · Upstash Redis · Pusher · Vercel · Fly.io

## License

Proprietary. All rights reserved.
