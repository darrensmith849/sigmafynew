# Sigmafy

Six Sigma & Lean SaaS platform. Built by 2KO Pty Ltd.

> **Status**: Phase 1 (SSA Pilot) — code ~85% complete; cutover work
> (Paystack billing test, Laravel ETL) remaining. Phase 0A and 0B sealed.

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

- **All implementation work pushes to `dev`**. `main` updates only via
  reviewed pull requests (Vercel auto-deploys `main` to production).
- Single-branch flow ran during Phase 0A/0B and most of Phase 1 while no
  users existed. Reinstated to dev/PR in Slice D.4 (2026-05-05) ahead of
  the SSA pilot launch.
- ADR 0006 documents the original switch + reversion. ADR 0009 covers
  workspace routing.
- See [CLAUDE.md](CLAUDE.md) for the full agent operating contract.

## Tech stack

Next.js 15 · React 19 · TypeScript 5.6 · Tailwind 4 · Turborepo · pnpm 10 ·
Drizzle · Neon (serverless Postgres) · Clerk · OpenAI · Paystack ·
Brevo · Inngest · Upstash Redis · Pusher · Vercel · Fly.io

## License

Proprietary. All rights reserved.
