# Build State

Source-of-truth snapshot of where the build is right now. Update this after
every meaningful implementation session.

## Current phase

**Phase 0B — Product Proof**: in progress (2026-05-05). Slices 1, 2, 3, 5
shipped to production; awaiting end-user verification before Completion
Report can be sealed.

| Slice | Scope | Status |
|---|---|---|
| 1 | OpenAI SIPOC grading + display on project page | ✅ shipped |
| 2 | Brevo welcome + topic-graded emails | ✅ shipped |
| 3 | ROI capture on project + sponsor widget on dashboard | ✅ shipped |
| 5 | apps/admin tenant list + workspace detail + audit log; bootstrap audit (closes deferred 0A) | ✅ shipped |
| 4 | Inngest async grading job | 🟡 deferred — needs `INNGEST_*` keys; inline grading fully functional |
| 6 | UI polish | 🟡 rolled into Phase 1 prep |

**Phase 0A — Architecture Proof**: ✅ complete (2026-05-05).

## Direction shifts (2026-05-05)

- **Branch flow**: `dev` retired while there are zero live users. All work
  pushes directly to `main`. Reverts to dev/PR flow before Phase 1 SSA pilot
  (ADR 0006).
- **AI provider**: default adapter swapped from Anthropic Claude to OpenAI in
  `@sigmafy/ai` (ADR 0007). Abstraction surface unchanged.
- **Email provider**: default adapter swapped from Resend to Brevo in
  `@sigmafy/emails` (ADR 0008). React Email components retained.

## What works (Phase 0B additions)

- **AI grading**: `@sigmafy/ai` OpenAI adapter calls `gpt-4o-mini` chat
  completions in JSON mode. SIPOC submissions trigger inline grading
  (~3-8s wait); result persists into `topic_solutions.grading` and renders
  on the project page below the form.
- **Email**: `@sigmafy/emails` Brevo adapter renders React Email
  components (`WelcomeEmail`, `TopicGradedEmail`) to HTML and sends via
  Brevo's transactional endpoint. Welcome fires on first signup
  (idempotent); topic-graded fires after each successful grading.
- **ROI**: `projects.roi_estimated_zar_cents` (BIGINT, applied via
  migration `0002_phase_0b_grading_column` along with the grading column)
  captured via `RoiPanel` on the project page; aggregated on
  `/dashboard` as a workspace-total card + per-project badge. ZAR
  formatted via `Intl.NumberFormat('en-ZA', ...)`.
- **Admin app** (`apps/admin`): `/` lists tenants with member/project/ROI
  counts; `/workspaces/[id]` shows projects, members, recent topic
  submissions; `/audit-log` shows the last 100 entries. Protected by
  `SIGMAFY_ADMIN_EMAILS` env-var allowlist (Clerk org roles in Phase 1).
  Every cross-tenant view writes an `audit_log` row.
- **Bootstrap auditing**: `bootstrapUserAndWorkspace` now writes a
  `bootstrap.create_workspace` audit-log row. Closes the deferred
  Phase 0A item.

## What works (Phase 0A — recap)

- Phase -1 monorepo + Phase 0A architecture all green: 24/24 turbo tasks
  pass on `pnpm turbo run lint typecheck test build`.
- **DB & RLS** — provably sound. 4/4 integration tests on live Neon:
  no-context fail-closed, per-tenant scoping, cross-tenant insert rejection,
  malformed UUID rejection. Real schema (workspaces, users, memberships,
  projects, project_templates, topic_solutions, stats_call_log, audit_log)
  with RLS policies. `app_user` Postgres role has no BYPASSRLS;
  `withWorkspace(db, ws, fn)` is the only sanctioned data seam.
- **Stats gateway** — Pareto allowlisted; 2/2 integration tests against
  live Fly.io. Type-system blocks calls to non-allowlisted endpoints.
  `createDbStatsLogger` persists every call into `stats_call_log` under the
  workspace context.
- **Auth** — `@sigmafy/auth` wraps Clerk (Next 15). `bootstrapUserAndWorkspace`
  creates user + personal workspace + owner membership + starter Green Belt
  project on first login (idempotent, audited service-role usage).
- **DMAIC UI** — marketing landing, sign-in/sign-up via Clerk components,
  `/dashboard` lists projects RLS-scoped, `/projects/[id]` with phase nav and
  three topic kinds wired (Charter view, SIPOC editor + save, Pareto form +
  gateway call + result table).
- Both Next.js 15 apps boot to placeholder pages with shared `@sigmafy/ui`.
  - `apps/web` on port 3000 — marketing at `/`, dashboard at `/dashboard`.
  - `apps/admin` on port 3001 — single placeholder page.
- Tailwind 4 with shared preset and CSS-variable tokens (Sigmafy blue + neutral ramp).
- CI workflow runs `lint`, `typecheck`, `test`, `build` on PRs and pushes to
  `main`, with concurrency cancellation and Turbo Remote Cache.

## What's stubbed (fails loudly)

- `@sigmafy/billing` — every Paystack adapter method throws. Lands in
  Phase 1 (Paystack billing test using internal/comped workspace per
  master plan §16).

## Live deployments

| App | Project | URL | Status |
|---|---|---|---|
| web | `pumpbots-projects/sigmafy-web` | https://web-seven-gold-84.vercel.app | Production |
| admin | `pumpbots-projects/sigmafy-admin` | https://sigmafy-admin.vercel.app | Production |

After the direction-shift commit pushes to `main`, both Vercel projects
auto-deploy production. Phase-0a app routes are wired but signup will return
401 until Clerk keys are populated in Vercel project envs.

## Known issues / deferred items

- **End-user verification of Phase 0B slices 1/2/3/5 pending** — see
  Handover note at the bottom. Specifically: ROI capture round-trip,
  topic-graded email landing in inbox, and admin app rendering all three
  pages.
- **Inngest deferred (Slice 4)**: AI grading runs inline (~3-8s request).
  Needs `INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY` from inngest.com to
  move it to a background job.
- **Cross-domain admin impersonation deferred**: master plan §15 calls
  for "2KO admin can impersonate with logging." Slice 5 satisfies the
  "view the workspace" half. True impersonation (admin acts as user)
  needs a JWT/cookie handoff between admin.vercel.app and web.vercel.app
  with strict scoping. Phase 1 prep.
- **Stale tenants from phase-0a development**: `acme` and `zeta`
  workspaces + their users remain in Neon. Harmless; clean up before
  the SSA pilot.
- **Single-branch risk**: every commit to `main` ships to production.
  Fine while there are zero live users; reinstate dev/PR flow before
  Phase 1 (ADR 0006).
- **Secrets to rotate**: OpenAI key, Brevo key, and Neon `neondb_owner`
  password were all pasted into a chat session and logged. Rotate before
  any external party uses the platform.
- `TURBO_TOKEN` (secret) and `TURBO_TEAM` (variable) must be added
  manually to the GitHub repo for Remote Cache to work.
- Vercel auto-deploy via GitHub App not wired — deploys are CLI-driven
  (`vercel deploy --prod` from the linked dir). Connect both Vercel
  projects to the GitHub App before Phase 1.
- Playwright not in CI yet.
- `apps/stats-api` is a placeholder; the existing FastAPI service stays
  on Fly.io and is consumed by `@sigmafy/stats-gateway`.

## How to verify locally

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm format:check
pnpm test
pnpm build
pnpm --filter @sigmafy/web dev      # visit http://localhost:3000
pnpm --filter @sigmafy/admin dev    # visit http://localhost:3001
vercel build --cwd apps/web         # parity with Vercel deploy
vercel build --cwd apps/admin
```

All commands must exit 0.
