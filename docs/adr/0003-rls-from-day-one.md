# ADR 0003 — RLS from day one

**Status**: Accepted
**Date**: 2026-05-04

## Context

The brief is unambiguous: tenant isolation is non-negotiable, and no product
features may be built on unscoped tables. Every customer is a workspace; every
tenant-owned table must be filtered by `workspace_id`. A single RLS oversight
in early V1 could leak one tenant's project data to another and end the
business case.

## Decision

- All tenant-owned tables ship with Postgres Row Level Security policies of
  the form
  `USING (workspace_id = current_setting('app.current_workspace')::uuid)`.
- App code accesses tenant data **only** through `withWorkspace(db, workspaceId, fn)`,
  which opens a transaction, runs `SET LOCAL app.current_workspace = $1`, and
  passes the tx-bound db to the callback. RLS does the filtering — the
  application layer cannot forget.
- Workspace-scoped repositories (`WorkspaceScopedRepository`) take a
  `withWorkspace`-bound db in their constructor. Concrete repos cannot be
  instantiated outside that boundary.
- Service-role connections live in `packages/db/src/service-role.ts`, which
  carries a banner comment marking imports as a code-review block. Service-role
  is permitted only in: `apps/admin`, `apps/*\/jobs`, and migration scripts.
  Every call site needs a written justification and an audit-log entry.

## Alternatives considered

- **App-level filtering only** — a single missed `WHERE workspace_id = …` is a
  data leak. Postgres can enforce this for us; we should let it.
- **One Postgres role per workspace** — true isolation but operationally
  miserable (role count grows linearly with tenants). RLS gives us 95% of the
  guarantee at much lower complexity.
- **Schema-per-tenant** — works for very large tenants, but creates extra
  migration overhead and breaks shared analytics.

## Consequences

- The cost is paid once (set up `withWorkspace`, write RLS policies, train the
  team) and pays back forever.
- Every new tenant table gets a policy in the same migration. PR reviews must
  block merge if a tenant table lacks a policy.
- Any code that needs cross-tenant access has to import from `service-role.ts`
  with explicit justification — making misuse visible.
- Phase 0A migration tests must seed two workspaces and assert that workspace A
  cannot read workspace B's data, even with the same SQL query.
