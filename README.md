# Sigmafy

Six Sigma & Lean SaaS platform. Built by 2KO Pty Ltd.

> **Status**: Phase -1 (empty repo bootstrap) complete. Phase 0A (Architecture
> Proof) is next.

## Quick start

```bash
nvm use                    # Node 22 (per .nvmrc)
corepack enable            # pnpm 10
pnpm install --frozen-lockfile
pnpm dev                   # apps/web on :3000, apps/admin on :3001
```

See [docs/environment-setup.md](docs/environment-setup.md) for first-time
setup, env vars, and Vercel project configuration.

## What's where

```
apps/
  web/         Public marketing + authenticated product (Next.js 15)
  admin/       2KO platform admin (Next.js 15)
  stats-api/   FastAPI stats engine (placeholder until Phase 0A)
packages/
  ui/          Design system primitives + tokens
  auth/        Clerk wrapper
  db/          Drizzle + Neon serverless + RLS helpers
  billing/     Provider-agnostic billing (Paystack adapter)
  stats-client/   Generated TS client for the stats API
  stats-gateway/  Server-side gateway: allowlist, quota, audit log
  ai/          Provider-agnostic AI (Claude adapter)
  emails/      React Email templates + Resend send
  config/      Shared ESLint, TypeScript, Tailwind, Prettier configs
docs/
  build-state.md             What works right now
  phase-log.md               Reverse-chronological phase history
  architecture-decisions.md  Index of ADRs
  environment-setup.md       Setup walkthrough
  adr/                       Individual ADR files
```

## Branch policy

- All work pushed to `dev`. **`main` is release-only and protected.**
- See [CLAUDE.md](CLAUDE.md) for the full agent operating contract.

## Tech stack

Next.js 15 · React 19 · TypeScript 5.6 · Tailwind 4 · Turborepo · pnpm 10 ·
Drizzle · Neon (serverless Postgres) · Clerk · Anthropic Claude · Paystack ·
Resend · Inngest · Upstash Redis · Pusher · Vercel · Fly.io

## License

Proprietary. All rights reserved.
