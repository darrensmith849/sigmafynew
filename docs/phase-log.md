# Phase Log

Reverse-chronological log of completed phases. Each entry: date, branch,
commit(s), deliverables checked off, decisions, and open questions.

---

## Phase -1 — Empty Repo Bootstrap

- **Date completed**: 2026-05-04
- **Branch**: `dev`
- **Commit(s)**: TBD (filled in by the bootstrap commit)

### Deliverables (verbatim from §13 of the master build plan)

- [x] **Git baseline** — `dev` branch created and is the active implementation branch.
- [x] **Monorepo tooling** — pnpm workspace, Turborepo, root `package.json`,
      lint, format, TypeScript, test config.
- [x] **Apps scaffold** — `apps/web` and `apps/admin` as Next.js 15 App Router
      apps; `apps/stats-api` placeholder.
- [x] **Packages scaffold** — `ui`, `auth`, `db`, `billing`, `stats-client`,
      `stats-gateway`, `ai`, `emails`, `config`.
- [x] **Vercel readiness** — `vercel.json` + verbatim project setup steps in
      `docs/environment-setup.md`.
- [x] **Environment docs** — `docs/environment-setup.md` with full env var
      table + first-time setup walkthrough.
- [x] **Build state docs** — `docs/build-state.md`, `docs/phase-log.md`,
      `docs/architecture-decisions.md` + 5 ADRs.
- [x] **Design baseline** — `packages/ui` tokens (Sigmafy blue + neutral ramp)
      and four primitives (Button, Input, Label, Card).
- [x] **CI baseline** — `.github/workflows/ci.yml` runs lint, typecheck, test,
      build on PRs to `dev`/`main` and pushes to `dev`.

### Decisions made

- ADR 0001 — Monorepo layout (pnpm + Turborepo).
- ADR 0002 — UI source-of-truth (shadcn-into-`packages/ui`).
- ADR 0003 — RLS from day one (`withWorkspace` is the only sanctioned read/write seam).
- ADR 0004 — Billing abstraction (Paystack-first behind a provider interface).
- ADR 0005 — Stats gateway pattern (allowlist + signed call + audit log).

User-confirmed direction:

- Single `apps/web` with route groups for marketing + authed product (one Vercel project for product; admin is its own).
- `packages/db` uses `@neondatabase/serverless` driver.
- Repo is private + proprietary (`"license": "UNLICENSED"`).

### Open questions carried into Phase 0A

- Confirm Clerk's organisation model maps cleanly to a Sigmafy workspace + the
  five Sigmafy roles, before we lock the role enum in `@sigmafy/auth/types.ts`.
- Confirm whether Pareto is the right first stats endpoint to allowlist (it
  is the simplest and is in the V1 stats list, but a one-sample t-test would
  better stress the request shape).
- Decide where the workspace context is propagated: subdomain (`acme.sigmafy.co`)
  vs path prefix (`/w/acme/...`). The brief mentions subdomain in §8 but we
  can validate this in Phase 0A with one tenant.
