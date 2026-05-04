# @sigmafy/db

Drizzle ORM + Neon serverless driver. Tenant isolation via Postgres RLS is the
load-bearing concern of this package.

## Phase -1

- `createDb(url, { role })` — Neon serverless client factory (works).
- `withWorkspace(db, workspaceId, fn)` — signature only; throws "not implemented".
- `createServiceRoleDb(url)` — audited bypass factory (works, but to be used
  only from `apps/admin`, `apps/*\/jobs`, or migration scripts).
- `WorkspaceScopedRepository` — abstract base class (signature).
- One placeholder schema: `_phase_minus_one_probe`. Delete in Phase 0A.

## Phase 0A (next)

- Real schema for workspaces, users, memberships, projects, phases, sections,
  topics, solutions, reviews, AI feedback, stats results, ROI, certificates,
  notifications, audit logs.
- RLS policy SQL in `migrations/`.
- `withWorkspace()` body: `BEGIN; SET LOCAL app.current_workspace = $1; … ; COMMIT;`.

## Hard rules

- Apps **must** use `withWorkspace()` for every read/write of tenant data.
- Service-role access **must** import from `./service-role.js`, with a written
  justification in the PR description and a corresponding audit-log entry.
- New tenant tables **must** ship with an RLS policy in the same migration.
