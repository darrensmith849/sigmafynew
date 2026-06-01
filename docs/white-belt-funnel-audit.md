# White Belt Conversion Funnel — Audit & Prototype Notes

> **Status:** Surface-only prototype. Not connected to live users, emails, ads
> pixels, payments, CRM, or any production system. Sign-off required before
> any backend integration begins.

This document accompanies the prototype at
`/white-belt-funnel-preview` (in `apps/web`). It explains what already
exists in the codebase, what the prototype adds, what it explicitly does
not touch, and the gate that must be cleared before any real wiring.

---

## 1. Audit — current state of the codebase (2026-06-01)

The Sigmafy repo is in **Phase 1 — SSA Pilot**, ~92% complete by code
volume. The funnel prototype was authored against the `dev` branch at
`60ec8d9` (post brand-sprint BS.12).

### Today's reality, by funnel area

| Area | Today's reality | Files (representative) |
|---|---|---|
| White Belt course content | **Does not exist.** Only a Green Belt project template is shipped (`packages/db/src/templates/green-belt.ts`). | — |
| Course / module / lesson schema | **Does not exist.** Schema covers projects, topics, classes, enrolments, but not courses/modules/lessons/progress/completion. | — |
| Learner / delegate portal | **Does not exist.** Delegates currently see their projects on `/dashboard`. There is no "my courses" surface. | `apps/web/app/(app)/dashboard/page.tsx` |
| Completion detection | **Project-level only.** No course-completion concept. | — |
| Certificate page (learner-facing) | **Does not exist as a UI.** A working PDF endpoint exists for *project* completion. | `apps/web/app/api/certificates/[projectId]/route.ts`, `apps/web/lib/certificate.tsx` |
| Upsell logic | **Does not exist.** | — |
| Email flows | **Transactional only.** Welcome, topic-graded, phase approval requested/decided, workspace invitation. Sent via Brevo through `@sigmafy/emails`. | `packages/emails/src/templates/*` |
| Event tracking | **Audit log + stats-call log only.** No general `track()` or funnel-event infra. | `packages/db/src/schema/audit-log.ts`, `packages/stats-gateway/src/gateway.ts` |
| Sales / CRM funnel | **Does not exist.** | — |
| Referral / reseller logic | **Does not exist.** | — |

### How White Belt users enter today

They don't. There is no White Belt course in the system. SSA's existing
White Belt learners live in the legacy Laravel platform and are
out-of-scope for this prototype.

### What happens after completion today

Nothing. There is no "after completion" because there is no White Belt
inside Sigmafy yet.

### Risks of touching current functionality

Low — the prototype is a fully isolated route under a new `(prototype)`
route group, with one tightly-scoped middleware addition (a single new
public-path entry). The shared `@sigmafy/auth/middleware` is **not**
modified. No schemas, no migrations, no changes to `@sigmafy/billing` /
`@sigmafy/ai` / `@sigmafy/emails` / `@sigmafy/stats-gateway` /
`@sigmafy/db` / `@sigmafy/auth`. Existing routes (`/`, `/dashboard`,
`/dashboard/*`, `/projects/[id]`, marketing pages, sign-in/up) are
untouched.

---

## 2. Gaps the prototype surfaces

The prototype visualises the following concepts that the codebase does
not yet have:

- A White Belt course shape (course → modules → lessons → knowledge
  check → resources → completion).
- A learner-facing certificate page (separate from the existing
  project-level PDF download).
- A post-course portal with a prioritised CTA stack.
- An upgrade funnel covering Yellow / Green / Black Belt with discount
  *concepts* (not real coupons).
- A referral programme concept (rewards illustrative only).
- A company-invite lead-capture surface.
- A Sigmafy stats CTA aimed at company decision-makers.
- A reseller / partner CTA aimed at Six Sigma practitioners.
- A remarketing map (channels + statuses + event timeline + next-best
  actions).
- A sales portal with lead scoring concept.
- A library of 11 funnel email templates.
- An email agent concept with mandatory human approval before send.
- A documented mock API contract (10 endpoints, docs only).
- Future-integration and compliance/consent notes.
- An explicit sign-off gate.

---

## 3. Recommended future integration points

These are notes, not commitments. Detail also lives in the prototype's
Integration tab.

- **Course content & progress:** new schema for `courses`, `modules`,
  `lessons`, `lesson_progress`, `certificates`. Reuse the
  `withWorkspace()` RLS pattern from `@sigmafy/db`.
- **Enrolments:** extend the existing `classes` /
  `classEnrolments` tables (Slice B) with belt-level and per-course
  progression.
- **Certificates:** the project-level PDF pipeline in
  `apps/web/lib/certificate.tsx` is a good base for a course-level
  variant.
- **Event tracking:** new `funnel_events` table + a `@sigmafy/events`
  client. The event keys in `_data/events.ts` are the proposed canonical
  taxonomy.
- **Funnel stages & lead scoring:** stage transitions derived from
  events; lead-score rules in a config table.
- **Offers + discounts:** new offer catalog + per-belt discount rules,
  coupled to `@sigmafy/billing` for real promo codes when ready.
- **Referral / company / reseller:** three distinct record types. The
  referral *reward* model is **not** finalised and is blocked on
  commercial sign-off.
- **Email sequences:** trigger engine + template versioning. Brevo
  adapter already exists for transactional sends.
- **Remarketing audience sync:** consent-gated outbound sync to Google
  Ads and Meta. **Pixel installation is a separate decision** that
  depends on cookie-consent infrastructure being in place.
- **CRM / sales pipeline:** today there is no CRM in the stack. The
  prototype's `SalesLead` shape is a starting point for whatever CRM is
  chosen.
- **Email reply handling + agent approval workflow:** inbound parsing
  via Brevo Inbound (or equivalent), classification through
  `@sigmafy/ai`, approval queue in `apps/admin`. **Hard rule: no
  auto-send.**
- **Consent management:** preference centre, unsubscribe, POPIA
  alignment. Touched by every send and every audience sync.
- **Admin configuration panels:** offers, discounts, email templates,
  trigger rules, lead-scoring rules — all editable from `apps/admin`.
- **Audit logs:** reuse existing `@sigmafy/db` audit-log infrastructure
  for sales actions, agent-approved sends, partner approvals.

---

## 4. What was intentionally not touched

- `@sigmafy/db` — no new schema, no migrations.
- `@sigmafy/auth` — no changes to roles, Clerk integration, or shared
  middleware. The `apps/web` local middleware was rewritten to a
  composed `clerkMiddleware()` with one additional public path
  (`/white-belt-funnel-preview(.*)`); the shared middleware remains
  identical.
- `@sigmafy/billing` — not imported.
- `@sigmafy/ai` — not imported. The "email agent" tab is a UI concept
  only.
- `@sigmafy/emails` — not imported. The email-templates tab is mock
  data; existing Brevo transactional templates are untouched.
- `@sigmafy/stats-gateway` / `@sigmafy/stats-client` — not imported.
  The Sigmafy stats tile values are mock numbers in a `.ts` file.
- All existing routes (`/`, `/dashboard`, `/dashboard/*`, `/projects/*`,
  `/sign-in`, `/sign-up`, `/accept-invite`, marketing pages) — not
  modified.
- All existing components and pages in `apps/web/app/(app)` and
  `apps/admin` — not modified.

---

## 5. Files added by this prototype

```
packages/ui/src/primitives/tabs.tsx               — new generic primitive
packages/ui/src/primitives/progress-bar.tsx       — new generic primitive
packages/ui/src/primitives/timeline.tsx           — new generic primitive
packages/ui/src/primitives/index.ts               — exports the above

apps/web/middleware.ts                            — composed inline; adds one public path
apps/web/app/(prototype)/layout.tsx               — pass-through
apps/web/app/(prototype)/white-belt-funnel-preview/page.tsx
apps/web/app/(prototype)/white-belt-funnel-preview/_data/*.ts   (13 mock data modules)
apps/web/app/(prototype)/white-belt-funnel-preview/_components/*.tsx (12 composite modules)

docs/white-belt-funnel-audit.md                   — this document
docs/phase-log.md                                 — appended entry
docs/build-state.md                               — pointer line added
```

No file under `packages/db`, `packages/auth`, `packages/billing`,
`packages/ai`, `packages/emails`, `packages/stats-gateway`,
`packages/stats-client`, `packages/config`, or `apps/admin` was modified.

---

## 6. Sign-off gate

**No backend integration, no live emails, no real ads pixels, no
payment links, no CRM connection, and no production data writes until
every item below is signed off in writing.**

The same checklist is rendered on the prototype's *Future Integration &
Compliance* tab.

- [ ] **Audit** — audit summary read and confirmed accurate.
- [ ] **Learner journey** — course + completion flow reviewed.
- [ ] **Certificate** — certificate dopamine page reviewed.
- [ ] **Post-course portal** — CTA priorities reviewed.
- [ ] **Upgrade offers** — Yellow / Green / Black pathways reviewed.
- [ ] **Discount concepts** — wording reviewed; we are not committing
      to terms yet.
- [ ] **Referral programme** — reward concept reviewed (not final).
- [ ] **Company invite** — form and flow reviewed.
- [ ] **Sigmafy stats CTA** — sample tiles reviewed.
- [ ] **Reseller opportunity** — partner concept reviewed (not final).
- [ ] **Remarketing map** — channels, statuses, next-best-action rules
      reviewed.
- [ ] **Event taxonomy** — event keys reviewed and approved as
      canonical.
- [ ] **Sales portal** — lead view + scoring rules reviewed.
- [ ] **Email templates** — all 11 templates reviewed.
- [ ] **Email agent concept** — approval-required pattern reviewed.
- [ ] **Mock endpoint contracts** — contracts reviewed before any
      backend implementation.
- [ ] **Future integration notes** — reviewed for completeness.
- [ ] **Compliance placeholders** — POPIA / GDPR considerations noted
      and a real compliance workstream sized.

---

## 7. How to review

1. `pnpm install && pnpm --filter @sigmafy/web dev`
2. Visit `http://localhost:3000/white-belt-funnel-preview`
3. Click through every tab (Journey → Certificate → Portal → Upgrade →
   Referral → Stats → Remarketing → Sales → Emails → Agent → Endpoints
   → Integration).
4. Confirm the "Prototype · Mock data · Not connected to live systems"
   banner is visible on every tab.
5. Confirm that `/`, `/dashboard`, `/projects/[id]`, `/sign-in`, and
   `/sign-up` continue to behave exactly as before (only relevant if
   you have a Clerk session for the authed routes).
