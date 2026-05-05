# Sigmafy — Final Master Build Plan

**Fresh Vercel + Empty Git Repo Agent Brief**

| Item | Decision / Rule |
|---|---|
| Company | 2KO Pty Ltd |
| Product | Sigmafy — Six Sigma and Lean SaaS Platform |
| First tenant | Six Sigma South Africa |
| Build context | Start from scratch in a new empty Git repository connected to Vercel |
| Primary deployment target | Vercel for Next.js apps; Fly.io for existing FastAPI stats API when integrated |
| Design reference | https://dev-portal.sigmafy.co/ |
| Document purpose | Source-of-truth master brief for an AI/code agent to plan, structure and build systematically phase by phase |
| Version date | 5 May 2026 (direction-shift revision; original 4 May 2026) |

> Markdown mirror of the master `.docx`. The two are kept in sync. This file
> is the canonical source-of-truth referenced by `CLAUDE.md` and CI; the
> `.docx` is the human-readable artefact. ADRs 0006/0007/0008 record the
> direction shift dated 2026-05-05.

**Core instruction**: Build the smallest complete version that proves SSA can
run one real Green Belt cohort end-to-end inside Sigmafy. Do not build
marketplace, enterprise, mobile, or non-V1 surfaces before V1 is proven.

---

## 0. Agent Operating Contract

This document is the source of truth for the first Sigmafy build. The agent
must treat it as a phase-based implementation contract, not a brainstorm.

**Absolute build lens**: Fresh empty Git repo. New build from scratch.
Vercel-first deployment. No inherited frontend codebase. Old Sigmafy/Laravel
is a migration/reference source only, not the foundation for new product
architecture.

- Work phase by phase. Do not skip ahead.
- Do not build anything outside the approved current phase unless it is
  foundational plumbing required by that phase.
- Update build state and changelog after every meaningful implementation
  session.
- After completing each phase, provide a phase completion report and
  recommend the next phase to start.
- Never end a completed phase by merely saying "done"; always suggest the
  next concrete phase and why it should come next.
- **(Revised 2026-05-05)** While there are zero live users, push
  implementation work directly to `main`. Reinstate dev/PR flow before Phase
  1 SSA pilot launch (ADR 0006).

---

## 1. Product Vision and V1 Thesis

Sigmafy is the operating system for Six Sigma and Lean improvement work. It
combines structured training, DMAIC project execution, statistical analysis,
AI guidance, approvals, ROI tracking and certification into one coherent
platform.

**V1 thesis**: A South African Six Sigma training company can run real Green
Belt projects through Sigmafy — delegates enrol into a workspace, work
through structured DMAIC phases, use statistical tools, get AI guidance,
capture project ROI, and finish with a certificate — with Six Sigma South
Africa as the first live tenant.

- **Train** — classes, cohorts, course materials and certification support.
- **Do** — structured DMAIC/Lean projects with tools, submissions, reviews
  and approvals.
- **Prove** — statistical analysis, project ROI and sponsor-visible
  dashboards.
- **Scale later** — selected company pilots, public SaaS, enterprise
  hardening and marketplace only after V1 proves itself.

**Failure condition**: If V1 does not end with SSA running live Green Belt
training projects on the new platform, V1 has failed.

---

## 2. Build Context: Empty Git Repo + Vercel

| Context item | Rule |
|---|---|
| Repository state | Started empty; phase-0a now landed on `main`. |
| Git branch (revised 2026-05-05) | Single-branch flow: all work pushes directly to `main` while there are zero live users. `dev` retired. Reinstate before Phase 1 (ADR 0006). |
| Vercel | Repo is connected to Vercel. `apps/web` and `apps/admin` are Vercel-deployable Next.js apps. |
| Stats API | The existing FastAPI stats engine may be folded in as `apps/stats-api` when available. Do not rewrite its statistical logic. |
| Old Laravel app | Treat as migration/reference only. Do not reproduce its architecture. |
| Design reference | dev-portal.sigmafy.co is the canonical visual reference. |
| Agent scope | The agent must both plan and build architecture systematically, with phase gates and documented progress. |

---

## 3. Success Criteria for V1

1. SSA is using the new platform as their live operational system for new
   cohorts.
2. The existing Laravel app is being sunset for new training cohorts.
3. At least one full Green Belt cohort has completed a project end-to-end
   on the platform.
4. At least one ROI figure has been captured and shown to a delegate
   sponsor.
5. AI guidance is available on all project topics and is voluntarily used
   by at least 50% of active delegates during the SSA pilot.
6. At least 80% of AI guidance interactions receive no negative
   trainer/admin override.
7. At least 5 statistical tools are live in the UI and used by delegates.
8. SSA admins can independently create a class, enrol delegates, assign
   projects, review progress, approve phases, issue certificates, export
   reports and view ROI without 2KO engineering intervention.
9. The platform has had no tenant-isolation incident, verified through RLS
   and audit logs.

---

## 4. Design and Styling Direction

The canonical visual reference for Sigmafy V1 is
https://dev-portal.sigmafy.co/. The app should feel like the dev portal has
become a real product, not like a separate enterprise admin system.

| Design rule | Application |
|---|---|
| Light mode first | White and very light grey backgrounds. No unnecessary dark mode work in V1. |
| Sigmafy blue | Use blue as the primary accent for CTAs, active phase states, selected nav items and key UI signals. |
| Apple-style simplicity | Generous whitespace, minimal chrome, clear hierarchy and calm product screens. |
| Typography | Clean sans-serif typography, confident headings, readable body text and restrained labels. |
| Cards | Rounded cards with subtle borders and soft shadows. |
| Buttons | Pill-shaped primary CTAs, clear secondary actions, one primary action per screen. |
| Motion | Subtle and functional only. |
| Mobile | All screens must be responsive from day one. |

### 4.1 Reusable UI System

All reusable components must live in `packages/ui`. Do not style screens ad
hoc. Shared UI primitives are mandatory.

### 4.2 Project UX Rules

The project experience is the product core. The hierarchy must always be
obvious: Project → Phase → Section → Topic → Solution → Review.

---

## 5. V1 Scope

### 5.1 In Scope

| Area | V1 includes |
|---|---|
| Multi-tenant workspaces | Workspace creation, membership and RLS-enforced tenant isolation from day one. |
| Roles | Workspace Owner, Admin, Sponsor, Trainer and Delegate. No custom permissions in V1. |
| Authentication | Email/password and Google login (via Clerk). No SAML/SCIM in V1. |
| Projects | Full DMAIC structure: Define, Measure, Analyse, Improve, Control and Executive Summary. |
| Project templates | One canonical Green Belt DMAIC template, initially hardcoded and later editable. |
| Sigmafy tools | SIPOC, Process Map, Fishbone, 5-Whys and Pareto. |
| Statistical analysis | 5-8 allowlisted stats endpoints surfaced in the UI. |
| AI Project Copilot | Phase-specific guidance and solution grading. |
| ROI tracking | Estimated annual savings in ZAR per project and sponsor-visible aggregate. |
| Notifications | In-app inbox and key email notifications via Brevo (revised 2026-05-05; was Resend). |
| Certificates | One workspace certificate template, PDF generated on completion. |
| Classes/cohorts | Manual scheduling by SSA admin and delegate enrolment. |
| Reporting | Workspace dashboard for projects, progress, ROI and delegate status. |
| Billing | Paystack-first, manual invoice support and billing abstraction. |
| 2KO Admin | Tenant directory, logged impersonation and basic platform metrics. |
| Public site | Single-page Apple-style marketing site with signup CTA. |

### 5.2 V1 Stats Allowlist

- Pareto
- Histogram
- I-MR chart
- X-bar R chart
- Capability Cp/Cpk
- 1-sample t-test
- 2-sample t-test

**Stats endpoint rule**: Only allowlisted endpoints are exposed through the
V1 gateway.

### 5.3 Explicitly Out of Scope for V1

Trainer marketplace, Stripe Connect, Stripe Identity/KYC, SSO/SAML/SCIM,
custom domains, white-label, mobile app/PWA, full slide deck builder, full
LMS and exams, support ticketing, CRM, tenant API/webhooks, embedded
analytics, suggestion box, template marketplace, anonymised benchmarks,
localisation, multi-region deployment, compliance certifications,
integrations (Slack/Teams/Calendar/Salesforce), public certificate
verification.

---

## 6. Target Architecture

```
sigmafy/
├── apps/
│   ├── web/             Next.js 15 — public marketing + authenticated app
│   ├── admin/           Next.js 15 — 2KO platform admin
│   └── stats-api/       Existing FastAPI stats service when integrated
│
├── packages/
│   ├── ui/              Shared React components / design system
│   ├── auth/            Clerk wrapper
│   ├── db/              Drizzle schema + Postgres RLS helpers
│   ├── billing/         Provider abstraction, Paystack adapter first
│   ├── stats-client/    Auto-generated TypeScript client from FastAPI OpenAPI
│   ├── stats-gateway/   Server-side gateway: auth, quota, allowlist, logging
│   ├── ai/              OpenAI wrapper, prompts, provider abstraction (revised 2026-05-05; was Claude)
│   ├── emails/          React Email templates rendered to HTML, sent via Brevo (revised 2026-05-05; was Resend)
│   └── config/          Shared ESLint, TypeScript, Prettier
│
├── docs/
│   ├── master-build-plan.md
│   ├── build-state.md
│   ├── phase-log.md
│   ├── architecture-decisions.md
│   └── environment-setup.md
│
├── turbo.json
└── pnpm-workspace.yaml
```

| Layer | Decision |
|---|---|
| Frontend | Next.js 15 App Router with TypeScript. |
| Hosting | Vercel for web/admin apps. |
| Stats service | FastAPI on Fly.io. |
| Database | Postgres via Neon. |
| ORM | Drizzle. |
| Tenant isolation | Middleware context + Drizzle scopes + Postgres RLS + audited bypass paths. |
| Cache | Upstash Redis. |
| Async jobs | Inngest. |
| File storage | Vercel Blob for small files, S3 for large files. |
| **Email** | **Brevo + React Email** (revised 2026-05-05; was Resend). |
| Real-time | Pusher Channels. |
| **AI** | **OpenAI through provider abstraction** (revised 2026-05-05; was Anthropic Claude). |
| Auth | Clerk. |
| Billing | Paystack-first through provider abstraction. |
| Monitoring | Sentry + Vercel Analytics + PostHog. |
| Testing | Vitest, Playwright and Pytest where applicable. |
| Styling | Tailwind CSS + CSS variables + shared `packages/ui`. |

---

## 7. Core Domain Model

Workspace, User, Membership, Class/Cohort, Project template, Project, Phase,
Section, Topic, Solution, Review/Approval, AI feedback, Stats result, ROI
entry, Certificate, Notification, Audit log.

---

## 8. Tenant Isolation and Security Rules

**Non-negotiable**: Tenant isolation must be implemented before meaningful
product data is added. Do not build product features on unscoped tables.

1. Route middleware resolves workspace context from subdomain/session and
   fails closed when invalid.
2. Drizzle repositories must be workspace-scoped. Raw tenant data queries
   are forbidden in app code.
3. Postgres Row Level Security must be enabled on every tenant-owned table.
4. Background jobs must carry workspace ID and set the same DB session
   context before data access.
5. Service-role access must be isolated in a small audited module in
   `packages/db`.
6. Every service-role caller must have code-review justification.

```sql
-- RLS policy pattern
workspace_id = current_setting('app.current_workspace_id')::uuid
```

### 8.1 Audited Bypass Paths

- Workspace creation before a workspace exists.
- Platform admin cross-tenant views, with admin ID, target workspace,
  justification, IP and user-agent logged.
- Migrations run by CI/CD only.
- Platform analytics rollups.
- Support impersonation with mandatory log entry.

---

## 9. Stats API and Compute Placement

### 9.1 Middleware vs Gateway

| Component | Responsibility |
|---|---|
| Middleware | Resolve workspace and user identity. Fail closed. Do not act as stats proxy. |
| Stats gateway | Auth, workspace context, endpoint allowlist, quota, logging and typed calls through stats-client. |
| Stats API | Statistical computation only. Tenant users never call it directly. |

### 9.2 Compute Placement

| Platform | Use |
|---|---|
| Vercel functions | Request/response orchestration, route handlers, auth checks and short Server Actions. |
| Fly.io stats API | All statistical computation. |
| Inngest | AI grading, certificate generation, bulk imports, report generation and retry-sensitive workflows. |

---

## 10. Billing, AI and Auth Rules

| Area | Rule |
|---|---|
| Billing | Paystack-first for South Africa. Manual invoice support. Billing provider abstraction from day one. |
| Internal workspaces | Support comped/internal workspace flag for 2KO/SSA dogfooding without accounting noise. |
| Stripe | Do not assume Stripe/Stripe Connect until legal, regional and operational availability is validated. |
| AI | All AI calls go through `packages/ai`. **OpenAI is the default adapter** (revised 2026-05-05; ADR 0007). No direct provider calls scattered through app code. |
| AI logging | Log grading calls, user action, prompt version, outcome and override signal. |
| AI override | Trainer/sponsor/admin must be able to override AI feedback. |
| Email | All transactional sends go through `packages/emails`. **Brevo is the default adapter** (revised 2026-05-05; ADR 0008). |
| Auth | Clerk orgs map to workspaces if validated. Verify Sponsor role before locking role model. |

---

## 11. Git, Vercel and Collaboration Rules

### 11.1 Branch Rules (revised 2026-05-05)

- **While there are zero live users**, all implementation work pushes
  directly to `main`. The `dev` branch is retired.
- **Reinstate the dev/PR flow before Phase 1 (SSA pilot launch)** —
  ADR 0006 specifies the reversion path.
- Do not trigger production deployment changes until Phase 0A and Phase 0B
  are explicitly approved by 2KO (the deploy targets are already wired,
  but external announcement waits for sign-off).

### 11.2 Pull-Latest Rules

Before every new implementation session:

```
git status
git checkout main
git pull --rebase origin main
pnpm install
pnpm lint
pnpm test
```

Before every commit:

```
git status
git pull --rebase origin main
# Resolve conflicts if any, then run the relevant checks:
pnpm lint
pnpm test
pnpm build
git add <files>
git commit -m "phase-x: concise description"
git push origin main
```

### 11.3 Conflict Handling Rules

- Never overwrite another person's changes without explicitly understanding
  the diff.
- If conflict resolution changes product behaviour, document it in
  `docs/phase-log.md`.
- If the agent cannot safely resolve a conflict, it must stop and report
  the exact files and conflict reason.
- Do not force push unless explicitly authorised by 2KO.

---

## 12. Agent Session and Phase Workflow

### 12.1 At the Start of Every Session

1. Pull latest `main` branch changes.
2. Read `docs/build-state.md`.
3. Read `docs/phase-log.md`.
4. Identify the active phase and current open tasks.
5. Run quick health checks relevant to the touched area.
6. State what phase is being worked on before implementing changes.

### 12.2 During Each Phase

- Implement only the current approved phase scope.
- Keep changes small enough to review.
- Update `docs/phase-log.md` after meaningful changes.
- Add or update tests for core flows.
- Preserve design consistency through `packages/ui`.
- Do not add out-of-scope features "because they are easy".

### 12.3 At the End of Each Phase

The agent must produce a Phase Completion Report and suggest the next
phase to start. Template:

```
## Phase Completion Report

Phase completed: [Phase name]
Branch: main
Commit(s): [hashes]

What was built:
- ...

Checks run:
- pnpm lint
- pnpm test
- pnpm build
- relevant e2e / smoke checks

Known issues / deferred items:
- ...

Recommended next phase:
[Name of next phase]

Why this phase should come next:
- ...

Required approval before continuing:
- 2KO signoff required: yes/no
```

---

## 13. Phase -1 — Empty Repo Bootstrap

Status: **complete** (2026-05-04). See `docs/phase-log.md`.

---

## 14. Phase 0A — Architecture Proof

Target: 2–3 weeks. Goal: prove the foundational architecture works
end-to-end with the thinnest possible product surface.

### 0A Deliverable

1. User signs up.
2. Workspace is created and RLS-protected from row one.
3. User is assigned a Green Belt project from the canonical template.
4. User opens Define phase.
5. User views one topic: Project Charter.
6. User submits a SIPOC solution.
7. SIPOC saves to the DB under RLS.
8. User runs one Pareto analysis through the stats gateway.

### 0A Includes

- Clerk auth with workspace organisations and five roles.
- Postgres + Drizzle + RLS policies on base tables.
- Service-role module with audit logging.
- Workspace-context middleware.
- `packages/stats-gateway` with Pareto endpoint allowlisted.
- OpenAPI-generated TypeScript stats client.
- One hardcoded Green Belt DMAIC project template.
- Minimal Apple-style UI using `packages/ui`.

**0A done means**: Architecture is provably sound. No AI yet, no ROI yet,
no admin app yet, no email yet.

Current status (2026-05-05): code complete on `main` (commit `13ca4ab`).
Awaiting Clerk-key live verification before Completion Report can be sealed.

---

## 15. Phase 0B — Product Proof

Target: 2–3 weeks. Goal: add the product-shaped layer on top of the proven
architecture.

### 0B Deliverable

1. The same user sees their SIPOC graded by AI Copilot.
2. The user receives an email notification when grading completes.
3. The user enters an estimated ROI figure.
4. The user sees ROI in the workspace dashboard.
5. 2KO admin can view the workspace.
6. 2KO admin can impersonate with logging.

### 0B Includes

- `apps/admin` with tenant list and audited impersonation.
- **OpenAI integration** via `packages/ai` (revised 2026-05-05; was Claude).
- One SIPOC grading prompt and one grading decision pattern.
- ROI capture field and sponsor-visible ROI dashboard widget.
- **Brevo welcome email and topic-graded email** (revised 2026-05-05; was
  Resend) — React Email components rendered to HTML and POSTed to Brevo's
  transactional API.
- Inngest AI grading job.
- Polished Apple-style UI for all 0A and 0B screens.
- Real session recorded as proof artifact.

**0B done means**: SSA team can use a staging URL and give meaningful
feedback.

---

## 16. Phase 1 — SSA Pilot

Target: 8–12 weeks after Phase 0. Goal: SSA's next live Green Belt cohort
runs entirely on the new platform. The Laravel app is no longer used for
new cohorts.

- Full DMAIC phases and full topic/section structure.
- 5–8 statistical tools in UI, allowlisted through the gateway.
- Sigmafy Tools UI: SIPOC, Process Map, Fishbone, 5-Whys and Pareto.
- Phase approval workflow with Sponsor sign-off.
- Topic comments and notifications.
- Project completion → SSA-branded certificate PDF.
- ROI dashboard for sponsors and admins.
- Manual class/cohort scheduling and CSV delegate import.
- AI grading on every submitted topic (OpenAI).
- Phase-aware AI Copilot guidance.
- AI override and feedback loop.
- Paystack sandbox and production billing test using internal/comped
  workspace.
- Laravel → Postgres ETL script.
- Parallel run during cutover.
- Laravel sunset for new cohorts after SSA signoff.
- **Reinstate dev/PR branch flow before launch** (ADR 0006).

**Phase 1 done means**: All V1 success criteria are met.

---

## 17. After V1 — Future Roadmap Context

| Future phase | Purpose |
|---|---|
| V2 — Selected company pilots | Onboard 3–5 paying companies beyond SSA. |
| V3 — Public self-serve SaaS | Open signup, trial and tiered pricing. |
| V4 — Enterprise hardening | SSO, SCIM, audit export and custom domains. |
| V5 — Trainer marketplace | Trainer onboarding, payouts, marketplace search and reviews. |
| V6 — International and network effects | Multi-currency, localisation, template marketplace and benchmarks. |

- V1 architecture must not block multi-tenant scale.
- Billing abstraction must remain provider-agnostic.
- AI provider abstraction must support future BYO key options.
- Roles should be modelled in a way that can support permission bundles
  later.
- Stats endpoint allowlist mechanism must support progressive expansion.

---

## 18. V1 Risks and Controls

| Risk | Control |
|---|---|
| SSA migration complexity | Allocate explicit ETL time; do not treat migration as an afterthought. |
| Scope creep | Use V1 success criteria as the contract. Defer non-V1 requests. |
| AI quality | Log every grading call, allow overrides and iterate prompt versions. |
| Paystack uncertainty | Spike subscription and invoice flows early. |
| Stats latency | Measure Vercel-to-Fly latency early. |
| RLS performance | Test with realistic tenant data and optimise policies; never disable RLS as workaround. |
| Clerk org model misfit | Verify workspace/role mapping before deep lock-in. |
| Service-role misuse | Treat unnecessary service-role access as a security issue. |
| Styling drift | Use `packages/ui` and dev-portal visual reference. No ad hoc page styling. |
| Concurrent Git conflicts | Pull latest before every session and before every commit. Do not force push. |
| **Single-branch risk** (added 2026-05-05) | Every commit to `main` ships to production. Control: pre-push lint/typecheck/test/build mandatory; revert path is `git revert` + push; reinstate dev/PR flow before Phase 1 (ADR 0006). |
| **AI provider switch retuning** (added 2026-05-05) | Prompts written for Claude must be re-tuned for OpenAI. Control: log every grading call, A/B test grading decisions in Phase 0B before Phase 1 broad rollout. |
| **Brevo deliverability** (added 2026-05-05) | First send must follow DNS-verified sender domain. Control: complete Brevo sender verification before Phase 0B's first email. |

---

## 19. What the Build Agent Should Do First (current state)

1. Phase -1 ✅ done.
2. Phase 0A code ✅ landed on `main` (commit `13ca4ab`).
3. **Pending**: live signup verification with Clerk keys.
4. **After 0A close**: produce Phase 0A Completion Report and recommend
   Phase 0B.

---

## 20. Final Build Principle

The goal is not to build every feature Sigmafy may one day need. The goal is
to prove that SSA can run one real Green Belt cohort end-to-end inside
Sigmafy with structured DMAIC projects, usable statistical tools, useful AI
guidance, sponsor approval, ROI tracking, certificate completion, clean
Apple-style UX and safe multi-tenant architecture.

**Build rule**: Build the smallest version that proves this completely.
Then expand.

---

## 21. Phase Completion Checklist

- All work is on `main` (revised 2026-05-05).
- Latest `main` was pulled before commit.
- Relevant lint/test/build checks passed or failures are documented.
- `docs/build-state.md` updated.
- `docs/phase-log.md` updated.
- Architecture decisions added where meaningful.
- No out-of-scope features introduced.
- No ad hoc styling outside `packages/ui` for reusable UI.
- No RLS bypass added without audit and explicit justification.
- Phase Completion Report produced.
- Recommended next phase stated clearly.
