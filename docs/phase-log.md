# Phase Log

Reverse-chronological log of completed phases. Each entry: date, branch,
commit(s), deliverables checked off, decisions, and open questions.

---

## Direction shift — 2026-05-05

- Branch model retired `dev`; all work goes to `main` while no live users.
  Reinstates before Phase 1 SSA pilot (ADR 0006).
- AI provider default: Anthropic Claude → OpenAI in `@sigmafy/ai` (ADR 0007).
- Email provider default: Resend → Brevo in `@sigmafy/emails` (ADR 0008).
- Master build plan updated in §6, §10, §11, §12, §15, §18; mirrored to
  `docs/master-build-plan.md`.

---

## Phase 0A — Architecture Proof

- **Status**: code complete; **awaiting live signup verification** with Clerk
  keys before Completion Report can be sealed.
- **Branch**: originally `dev`, now landed on `main` via merge `ef637d3`.
- **Commit(s)**: `13ca4ab` (phase-0a code), `0bfe5f9` (Vercel deploys wired),
  `ef637d3` (merge of dev→main during direction shift).

### Deliverables (verbatim from §14 of the master build plan)

- [x] User signs up — wired (Clerk components, middleware, bootstrap). **Live
      verification pending Clerk keys.**
- [x] Workspace is created and RLS-protected from row one — `bootstrapUserAndWorkspace`.
- [x] User is assigned a Green Belt project from the canonical template — starter
      project created on first login.
- [x] User opens Define phase — `/projects/[id]` phase nav.
- [x] User views one topic: Project Charter — `charter-topic.tsx`.
- [x] User submits a SIPOC solution — `sipoc-topic.tsx` + `save-sipoc` action.
- [x] SIPOC saves to the DB under RLS — verified by 4/4 RLS integration tests.
- [x] User runs one Pareto analysis through the stats gateway — `pareto-topic.tsx`
      + `run-pareto` action; verified by 2/2 gateway integration tests.

### Verification

- `pnpm turbo run lint typecheck test build` → 24/24 green.
- `packages/db` RLS integration → 4/4 pass on live Neon (fail-closed,
  per-tenant scoping, cross-tenant rejection, malformed UUID rejection).
- `packages/stats-gateway` Pareto integration → 2/2 pass against live
  Fly.io; log row written + RLS-isolated.

### Decisions made (during Phase 0A)

- Schema for the DMAIC slice landed in two migrations:
  `0000_phase_0a_init.sql` (tables) and `0001_phase_0a_rls.sql` (policies).
- `app_user` Postgres role created without BYPASSRLS; `neondb_owner` is the
  audited service-role bypass.
- `withWorkspace(db, ws, fn)` opens a tx, sets the GUC, runs the callback.
- Pareto chosen as the first allowlisted stats endpoint.

### Open questions to settle in Phase 0B

- Lock the role enum in `@sigmafy/auth/types.ts` once Clerk's organisation
  model is confirmed against the five Sigmafy roles in production signup.
- Decide subdomain vs path prefix for workspace routing — phase-0a uses
  path-style; revisit when adding `apps/admin` impersonation flow.

### Pending before Completion Report can be sealed

- Wire `CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` into Vercel envs.
- Sign up as a real user end-to-end on the live URL.
- Submit a SIPOC and run a Pareto. Verify rows in `topic_solutions` and
  `stats_call_log`.
- Append the Phase 0A Completion Report below this entry.

---

## Phase -1 — Empty Repo Bootstrap

- **Date completed**: 2026-05-04
- **Branch**: `dev` (retired 2026-05-05)
- **Commit(s)**: `cf58fc9` (bootstrap), `0bfe5f9` (Vercel deploys wired).

### Deliverables (verbatim from §13 of the master build plan)

- [x] **Git baseline** — `dev` branch created and active during Phase -1.
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
      build on PRs and pushes (since updated to `main`-only).

### Decisions made

- ADR 0001 — Monorepo layout (pnpm + Turborepo).
- ADR 0002 — UI source-of-truth (shadcn-into-`packages/ui`).
- ADR 0003 — RLS from day one (`withWorkspace` is the only sanctioned read/write seam).
- ADR 0004 — Billing abstraction (Paystack-first behind a provider interface).
- ADR 0005 — Stats gateway pattern (allowlist + signed call + audit log).
