# ADR 0009 — Workspace routing — path prefix `/w/{slug}/...`

- **Status**: Accepted
- **Date**: 2026-05-05
- **Resolves**: Phase 0A open question on subdomain vs path prefix.

## Context

Sigmafy is multi-tenant. Each workspace has a slug. For Phase 1+ the
URLs need to identify which workspace a request belongs to (sponsors
viewing a delegate's project, admins linking to a class, delegates
sharing a topic — all need a stable URL).

Two options for the routing scheme:

1. **Subdomain** — `acme.sigmafy.co/projects/...`
2. **Path prefix** — `app.sigmafy.co/w/acme/projects/...`

Master plan §8 mentions subdomain in passing but explicitly leaves it
open for Phase 0A to validate.

## Decision

**Use path prefix routing (`/w/{workspace-slug}/...`) for V1 (Phase 1
through V3 public self-serve).** Subdomain routing is a V4 enterprise
concern; revisit when adding white-label.

## Trade-offs

### Why path prefix wins for V1

- **Zero DNS / SSL work** — one Vercel domain handles every workspace.
  Subdomains need wildcard certs and dynamic DNS or pre-provisioning.
- **No Clerk satellite-domain config** — Clerk's subdomain support
  needs primary+satellite app setup, JWT cookie sharing, and per-domain
  publishable keys. None of that for path-prefix.
- **Cheaper to evolve** — slugs can change without DNS work. We can
  introduce subdomains later (`acme.sigmafy.co` redirects to
  `app.sigmafy.co/w/acme/...`) without breaking links.
- **Cookie scoping is simpler** — one cookie per session, no
  cross-subdomain plumbing.
- **Vercel auto-deploys handle path prefix natively** — no project
  multiplication.

### What we give up

- **Branding** — `acme.sigmafy.co` reads as "Acme's app" more than
  `app.sigmafy.co/w/acme/...`. SSA doesn't care for V1; enterprise
  customers will when V4 ships.
- **Workspace-scoped HTTP cookies** — with path-prefix, all cookies
  scope to the parent domain. Mitigation: include workspace context
  in JWTs / DB-backed sessions, not in cookies.
- **Per-workspace CDN caching** — less granular cache keys. Not a
  problem at V1 scale.

## Consequences

- Phase 1 Slice B introduces:
  - Routes restructured under `/w/[slug]/...` (e.g. `/w/[slug]/dashboard`,
    `/w/[slug]/projects/[id]`, `/w/[slug]/classes/[id]`).
  - Middleware resolves the `[slug]` segment, looks up the workspace,
    and fails closed if the user doesn't have a membership for it.
  - `requireAuthContext` becomes route-aware (currently picks the
    user's first membership).
  - Existing `/dashboard` and `/projects/[id]` URLs become redirects
    that resolve the user's default workspace and rewrite to
    `/w/{slug}/...`.
- Phase 0A's "single workspace per user" simplification ends. The
  `bootstrapUserAndWorkspace` function still creates a default
  workspace; users who get added to multiple workspaces (e.g. SSA
  trainers in Phase 1) will rely on the slug to switch.
- Subdomain routing remains an option for V4 enterprise. ADR will be
  superseded when that lands.

## Reversion plan

If path-prefix proves a usability problem during the SSA pilot:
- Add subdomain routing as an alternate frontend (Vercel project per
  enterprise tenant on opt-in) without removing path-prefix. Both can
  resolve to the same backend.
