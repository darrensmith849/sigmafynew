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

- **Status**: ✅ **COMPLETE** — verified end-to-end on production URL
  https://web-seven-gold-84.vercel.app on 2026-05-05.
- **Branch**: `main`.
- **Commit(s)**: `5aa9a3b` (phase-0a code, originally `13ca4ab` on retired
  dev), `f8caf45` + `e211ed5` (direction shift to main-only / OpenAI / Brevo),
  `c74b7d0` (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY rename), `c4fa495`
  (ClerkProvider moved inside `<body>` for React 19 hydration), `099fda6`
  (explicit path/routing on Clerk SignIn/SignUp), `8bb81dd` (middleware
  matcher literal — root cause of blank /sign-up page).

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

### Phase Completion Report

Phase completed: **Phase 0A — Architecture Proof**
Branch: `main`
Commit(s): `5aa9a3b`, `f8caf45`, `e211ed5`, `c74b7d0`, `c4fa495`, `099fda6`,
`8bb81dd` — all on `main`. Originally landed as `13ca4ab` on the retired
`dev` branch.

What was built:
- Real Postgres schema on Neon — workspaces, users, memberships, projects,
  project_templates, topic_solutions, stats_call_log, audit_log.
- `app_user` Postgres role (no BYPASSRLS) + `neondb_owner` audited service
  role. RLS policies on every tenant-owned table reading
  `current_setting('app.current_workspace', true)`. `withWorkspace()`
  is the only sanctioned data seam.
- Clerk auth wired with five Sigmafy roles modelled in `@sigmafy/auth`.
- `bootstrapUserAndWorkspace()` in `apps/web/lib/auth.ts` creates the
  Sigmafy user + personal workspace + owner membership + starter Green
  Belt project on first sign-in. Idempotent. Service-role usage justified
  (no workspace context exists yet at signup).
- `@sigmafy/stats-gateway` with Pareto allowlisted; type-system blocks
  calls to non-allowlisted endpoints. `createDbStatsLogger` persists every
  call into `stats_call_log` under workspace context.
- DMAIC UI: marketing landing → Clerk sign-up → /dashboard with project
  list → /projects/[id] with phase nav (D-M-A-I-C-Exec Summary) and three
  topic kinds wired (Charter view, SIPOC editor + save, Pareto form +
  gateway call + result table with cumulative %).

Direction shifts applied during this phase (2026-05-05):
- Branch flow: `dev` retired; main-only while no live users (ADR 0006).
  Reinstate before Phase 1 SSA pilot.
- AI provider: Anthropic Claude → OpenAI in `@sigmafy/ai` (ADR 0007).
  Adapter is signature-only in 0A; first real call lands in 0B.
- Email provider: Resend → Brevo in `@sigmafy/emails` (ADR 0008). React
  Email components retained.

Checks run:
- `pnpm turbo run lint typecheck test build` → 34/34 green.
- `packages/db` RLS integration tests → 4/4 pass on live Neon.
- `packages/stats-gateway` Pareto integration tests → 2/2 pass against
  live Fly.io.
- Production verification on https://web-seven-gold-84.vercel.app —
  signup, workspace bootstrap, dashboard, project, Charter, SIPOC,
  Pareto round-trip all green; rows verified in `topic_solutions` and
  `stats_call_log` under correct `workspace_id`.

Live verification artefacts (2026-05-05):
- User: `darren.smith.210193@gmail.com`, Sigmafy id `0d142d31…`.
- Workspace: slug `darren-smith-210193-0d142d`, id `4ece1461…`.
- SIPOC row: `topic_solutions` at `topic_path = define.charter.sipoc`,
  status `submitted`, content with 5-column object.
- Pareto row: `topic_solutions` at `topic_path = define.charter.pareto`,
  content includes input + result (total=25, sorted figure data,
  cumulative %).
- Stats call: `stats_call_log` entry endpoint=`pareto`, status=`ok`,
  latency=307ms.

Issues fixed during 0A close-out:
- Pre-existing `.env.example` used `CLERK_PUBLISHABLE_KEY` instead of
  `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (Clerk's Next.js SDK requires the
  `NEXT_PUBLIC_` prefix). Fixed in `c74b7d0`.
- `<ClerkProvider>` was wrapping `<html>`; React 19 + Next.js 15 + Clerk
  v6/v7 require it INSIDE `<body>` to avoid hydration mismatch. Fixed in
  `c4fa495`.
- Catch-all sign-in/sign-up routes needed explicit `path`+`routing`
  props for Clerk to bind properly. Fixed in `099fda6`.
- **Root-cause of blank /sign-up page**: `middleware.ts` re-exported
  `config` from `@sigmafy/auth/middleware`. Next.js requires `config` to
  be a statically analyzable literal in `middleware.ts`. Re-exports get
  erased; the matcher was unset; the middleware ran on every path
  including `/_next/static/chunks/*`; Clerk's `protect-rewrite` 404'd
  every JS/CSS asset. Fixed in `8bb81dd` by defining `config` as a
  literal in `apps/web/middleware.ts`.
- Clerk dev instance had `auth_phone.required_for_sign_up=true` but
  Clerk's phone verification doesn't support South African numbers.
  Disabled via `clerk config patch` (Clerk dashboard, not in repo).

Known issues / deferred items:
- `audit_log` table is empty even though `bootstrapUserAndWorkspace`
  uses service-role bypass. ADR 0003 calls for service-role usage to be
  audited. Phase 0B should write an audit entry for each
  service-role-protected operation (workspace creation, admin
  impersonation).
- Two stale workspaces (`acme`, `zeta`) and users from phase-0a
  development tests linger in the DB. Harmless. Clean up before SSA
  pilot.
- Vercel auto-deploy from GitHub isn't wired through the GitHub App;
  current deploys are CLI-driven (`vercel deploy --prod`). The
  auto-created `sigmafynew` Vercel project picks up pushes to main but
  has wrong settings. Connect `sigmafy-web` and `sigmafy-admin` to the
  GitHub App in Vercel before Phase 0B to remove the manual step.
- `STATS_API_SIGNING_SECRET` is documented but not yet enforced; the
  stats gateway accepts unsigned calls. Fine for V1's threat model
  (stats endpoint is read-only Pareto), but harden before exposing more
  endpoints in Phase 1.
- One-time chore: rotate the OpenAI, Brevo, and Neon credentials that
  were pasted in chat during this session.

Recommended next phase: **Phase 0B — Product Proof**

Why this phase should come next:
- Phase 0A proves the architecture works (RLS, gateway, auth, Clerk,
  Vercel, Neon all wired). It does NOT yet add product value the user
  can demo to SSA: there is no AI grading, no ROI capture, no email
  notification, no admin app. Phase 0B adds exactly those.
- Master plan §15 deliverable for 0B: SIPOC graded by AI Copilot via
  OpenAI; user receives Brevo email when grading completes; user enters
  estimated ROI; sponsor-visible ROI on workspace dashboard; 2KO admin
  can view + impersonate workspaces with audit logging.
- Done means SSA team can use the staging URL and give meaningful
  feedback. That unlocks Phase 1 (SSA pilot).

Required approval before continuing:
- 2KO signoff required: **yes** — confirm Phase 0A acceptance and
  approve Phase 0B kickoff before implementation begins.

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
