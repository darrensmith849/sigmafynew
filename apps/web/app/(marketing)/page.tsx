import Link from "next/link";
import { Button, Card, Chip, Eyebrow, IconTile } from "@sigmafy/ui";

const FEATURES = [
  {
    href: "/features/spc",
    tint: "spc" as const,
    eyebrow: "SPC",
    title: "Statistical Process Control",
    body: "Pareto, histograms, I-MR and X-bar/R control charts, capability (Cp/Cpk), 1- and 2-sample t-tests — all built in, all gated through the stats allowlist.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M3 19h18M5 16l4-7 4 4 5-9" />
      </svg>
    ),
  },
  {
    href: "/features/projects",
    tint: "projects" as const,
    eyebrow: "Projects",
    title: "DMAIC project execution",
    body: "Charter, SIPOC, Process Map, 5-Whys, Fishbone, hypothesis tests, control plans — every Green Belt deliverable in one structured workspace.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M5 4v16M5 8h6a2 2 0 012 2M5 14h8a2 2 0 012 2M13 10h4M15 16h4" />
      </svg>
    ),
  },
  {
    href: "/features/training",
    tint: "training" as const,
    eyebrow: "Training",
    title: "Cohorts, exams, certificates",
    body: "Schedule classes, enrol delegates, track sponsor sign-off, and ship a branded certificate when the project's done.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="4" y="4" width="16" height="14" rx="2" />
        <circle cx="12" cy="11" r="3" />
        <path d="M9 18l-1 4 4-2 4 2-1-4" />
      </svg>
    ),
  },
  {
    href: "/features/ai",
    tint: "ai" as const,
    eyebrow: "AI",
    title: "AI evaluation, with guardrails",
    body: "Every submission is graded by AI within seconds — and trainers, sponsors, and admins can override any AI feedback. The override is the default UX.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3zM18 15l.8 2.2 2.2.8-2.2.8L18 21l-.8-2.2-2.2-.8 2.2-.8L18 15z" />
      </svg>
    ),
  },
];

const TRUSTED = [
  "Six Sigma South Africa",
  "2KO Pty Ltd",
  "Quality teams worldwide",
  "Training providers",
  "DMAIC practitioners",
];

export default function MarketingHome() {
  return (
    <>
      {/* === Hero === */}
      <section className="relative overflow-hidden pt-16 pb-16 md:pt-24 md:pb-24 lg:pt-28">
        <div className="absolute inset-x-0 -top-24 -z-10 h-[520px]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(60% 70% at 50% 0%, color-mix(in srgb, var(--color-accent-2) 22%, transparent) 0%, transparent 70%)",
              filter: "blur(48px)",
              opacity: 0.85,
            }}
          />
          <div className="absolute inset-0 bg-grid opacity-50" />
          <div
            className="bg-orb orb-drift-a"
            style={{
              width: 360,
              height: 360,
              top: -80,
              left: -120,
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--color-accent-2) 70%, transparent) 0%, transparent 70%)",
            }}
          />
          <div
            className="bg-orb orb-drift-b"
            style={{
              width: 420,
              height: 420,
              top: 40,
              right: -160,
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--tint-spc) 50%, transparent) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="mx-auto max-w-shell px-5 sm:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
            <div data-reveal className="lg:col-span-6">
              <Eyebrow>Quality + training, unified</Eyebrow>
              <h1 className="h-display-xl mt-4 text-fg">
                Run Six Sigma projects, train your people, prove the impact.
              </h1>
              <p className="t-lede mt-6 max-w-xl">
                Sigmafy brings Six Sigma project execution, statistical process
                control, training, exams, AI evaluation, and company
                administration into one clean platform.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href="/contact">
                  <Button size="lg" data-magnetic="6">
                    Start a project
                    <ArrowRight />
                  </Button>
                </Link>
                <Link href="/product">
                  <Button size="lg" variant="secondary">
                    See features
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative lg:col-span-6">
              <HeroDevices />
            </div>
          </div>
        </div>
      </section>

      {/* === Trusted-by marquee === */}
      <section className="py-10 md:py-14">
        <div data-reveal className="mx-auto max-w-shell px-5 sm:px-8">
          <p className="text-center text-[12px] font-medium uppercase tracking-[0.14em] text-muted-2">
            Trusted by training providers and quality teams worldwide
          </p>
          <div className="marquee mt-7" aria-hidden>
            <div className="marquee-track">
              {[...TRUSTED, ...TRUSTED].map((label, i) => (
                <span
                  key={`${label}-${i}`}
                  className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold tracking-tightish text-fg/60 transition-opacity hover:opacity-90"
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--color-fg)_8%,transparent)]">
                    <DotIcon />
                  </span>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* === Feature blocks === */}
      <section className="py-16 md:py-24">
        <div data-reveal className="mx-auto max-w-shell px-5 sm:px-8">
          <Eyebrow>How it fits together</Eyebrow>
          <h2 className="h-display-md mt-4 max-w-3xl text-fg">
            Five capabilities. One platform. One source of truth.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {FEATURES.map((f) => (
              <Link key={f.href} href={f.href as never} className="group block">
                <Card className="h-full p-6 transition-transform group-hover:-translate-y-0.5">
                  <div className="flex items-start gap-4">
                    <IconTile tint={f.tint}>{f.icon}</IconTile>
                    <div className="grid gap-2">
                      <Eyebrow className="!text-[11px]">{f.eyebrow}</Eyebrow>
                      <h3 className="text-lg font-semibold tracking-tightish text-fg">
                        {f.title}
                      </h3>
                      <p className="text-sm text-muted">{f.body}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* === CTA strip === */}
      <section className="pb-24">
        <div data-reveal className="mx-auto max-w-shell px-5 sm:px-8">
          <Card className="relative overflow-hidden p-10 md:p-14">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(60% 80% at 80% 50%, color-mix(in srgb, var(--color-accent-2) 18%, transparent) 0%, transparent 70%)",
                filter: "blur(32px)",
              }}
            />
            <Eyebrow>Ready when you are</Eyebrow>
            <h2 className="h-display-md mt-3 max-w-2xl text-fg">
              Get a real quote in one call.
            </h2>
            <p className="t-lede mt-4 max-w-xl">
              Tell us about your team — cohort size, training cadence, and the
              quality outcomes you&apos;re targeting. We&apos;ll send a tailored
              proposal back the same day.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/contact">
                <Button size="lg" data-magnetic="6">
                  Talk to us
                  <ArrowRight />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="secondary">
                  See pricing
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}

function HeroDevices() {
  return (
    <div className="relative aspect-[5/4] w-full">
      {/* Main device — Project DMAIC progress */}
      <div className="float-a absolute left-[6%] top-[6%] w-[78%]">
        <div className="overflow-hidden rounded-device border border-border-subtle bg-surface shadow-card-lift">
          <DeviceBar title="Project — Reduce Defect Rate" />
          <div className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <IconTile tint="projects" size={36}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M5 4v16M5 8h6a2 2 0 012 2M5 14h8a2 2 0 012 2M13 10h4M15 16h4" />
                  </svg>
                </IconTile>
                <div>
                  <div className="text-[13px] font-semibold tracking-tightish text-fg">
                    Define · Measure · Analyse
                  </div>
                  <div className="text-[11.5px] text-muted">
                    4 sections · 14 topics · 3 reviewers
                  </div>
                </div>
              </div>
              <Chip tint="projects">On track</Chip>
            </div>

            <div className="space-y-2.5">
              {[
                { label: "Project Charter", pct: 78 },
                { label: "Process Mapping", pct: 54 },
                { label: "Cause & Effect", pct: 32 },
                { label: "Capability Study", pct: 8 },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3 text-[12.5px] text-fg">
                  <span className="w-32 truncate text-muted">{row.label}</span>
                  <div className="relative h-1.5 flex-1 overflow-hidden rounded-pill bg-surface-3">
                    <div
                      className="h-full rounded-pill bg-fg/80"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                  <span className="t-num w-9 text-right text-[12px] text-muted">
                    {row.pct}%
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Chip tint="ai">AI graded</Chip>
              <Chip>3 deliverables awaiting review</Chip>
            </div>
          </div>
        </div>
      </div>

      {/* Capability device */}
      <div className="float-b absolute right-[2%] top-[42%] w-[44%]">
        <div className="overflow-hidden rounded-device border border-border-subtle bg-surface shadow-card-lift">
          <DeviceBar title="I-MR · Cp/Cpk" />
          <div className="space-y-3 p-3.5">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                Capability
              </div>
              <Chip tint="spc">In control</Chip>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { v: "1.42", k: "Cp" },
                { v: "1.21", k: "Cpk" },
                { v: "99.4%", k: "Yield" },
              ].map((s) => (
                <div
                  key={s.k}
                  className="rounded-lg border border-border-subtle bg-surface-2 py-2 text-center"
                >
                  <div className="t-num text-[18px] font-semibold text-fg">{s.v}</div>
                  <div className="text-[10.5px] uppercase tracking-[0.1em] text-muted">
                    {s.k}
                  </div>
                </div>
              ))}
            </div>
            <svg
              viewBox="0 0 160 50"
              className="h-12 w-full"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--tint-spc)" }}
              aria-hidden
            >
              <path d="M0 30 Q 10 24 20 28 T 40 22 T 60 32 T 80 18 T 100 26 T 120 20 T 140 28 T 160 22" opacity="0.85" />
              <path d="M0 35 L 160 35" strokeDasharray="2 4" opacity="0.35" />
              <path d="M0 14 L 160 14" strokeDasharray="2 4" opacity="0.35" />
            </svg>
          </div>
        </div>
      </div>

      {/* Cohort device */}
      <div className="float-c absolute bottom-[4%] left-[2%] w-[42%]">
        <div className="overflow-hidden rounded-device border border-border-subtle bg-surface shadow-card-lift">
          <DeviceBar />
          <div className="p-3.5">
            <div className="flex items-center gap-3">
              <IconTile tint="training" size={40}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <rect x="4" y="4" width="16" height="14" rx="2" />
                  <circle cx="12" cy="11" r="3" />
                  <path d="M9 18l-1 4 4-2 4 2-1-4" />
                </svg>
              </IconTile>
              <div className="min-w-0">
                <div className="truncate text-[12.5px] font-semibold text-fg">
                  Green Belt · Cohort 24
                </div>
                <div className="truncate text-[11px] text-muted">
                  18/20 delegates completed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI status pill */}
      <div className="float-a absolute right-[12%] top-[6%]">
        <div className="flex items-center gap-2 rounded-pill border border-border-subtle bg-surface px-3.5 py-2.5 shadow-card">
          <span
            className="pulse-soft inline-block h-2 w-2 rounded-full"
            style={{ background: "var(--tint-ai)" }}
          />
          <span className="text-[12px] font-medium text-fg">AI evaluating · 3 of 5</span>
        </div>
      </div>
    </div>
  );
}

function DeviceBar({ title }: { title?: string }) {
  return (
    <div className="flex items-center gap-1.5 border-b border-border-subtle bg-surface-2 px-4 py-3">
      <span className="h-2 w-2 rounded-full bg-fg/30" />
      <span className="h-2 w-2 rounded-full bg-fg/20" />
      <span className="h-2 w-2 rounded-full bg-fg/10" />
      {title && (
        <span className="ml-3 text-[12px] font-medium tracking-tightish text-muted">
          {title}
        </span>
      )}
    </div>
  );
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function DotIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
      <circle cx="8" cy="8" r="3" />
    </svg>
  );
}
