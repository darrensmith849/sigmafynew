import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Chip,
  Eyebrow,
} from "@sigmafy/ui";
import { mockCertificate } from "../_data/certificate";
import {
  mockCohortComparison,
  mockCohortHeadline,
} from "../_data/cohort-comparison";
import type { FunnelEventType } from "../_data/events";
import { mockLearner } from "../_data/learner";
import { SectionHeader } from "./shell";
import { MockEventChip } from "./mock-event-chip";

const ROUTE = "/white-belt-funnel-preview";

export function CertificateTab() {
  return (
    <div className="flex flex-col gap-10">
      <SectionHeader
        eyebrow="Step 2 — Certificate"
        title="The dopamine page"
        description="A short, polished win. The certificate is the artefact; the page itself is what converts. Conversion CTAs sit immediately below."
      />
      <CertificatePage />
      <CohortComparison />
      <ReadyForYellowBelt />
      <WhatsNext />
    </div>
  );
}

function CertificatePage() {
  const c = mockCertificate;
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <AchievementBadge />
          <Chip tint="training">Certificate · ID {c.certificateId}</Chip>
        </div>
        <CardTitle>
          You did it, {mockLearner.fullName.split(" ")[0]}.
        </CardTitle>
        <p className="text-[14px] text-muted-foreground">
          You&apos;ve completed {c.courseTitle} — a real, recognised credential.
          You now speak the language every Six Sigma project runs on.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <CertificateCard />
        <SocialProofRow />
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
          <p className="text-[12px] text-muted-foreground">
            PDF download and share actions are placeholders in this prototype.
          </p>
          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" size="md">
                Download PDF
              </Button>
              <Button variant="outline" size="md">
                Share certificate
              </Button>
              <Button variant="ghost" size="md">
                Add to LinkedIn
              </Button>
            </div>
            <MockEventChip
              event="certificate_downloaded"
              futureAction="If no upgrade click within 24h, start Yellow Belt sequence."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Achievement badge — premium, restrained, no childish gamification.
 * Uses the training tint and a layered radial accent.
 */
function AchievementBadge() {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="relative inline-flex h-12 w-12 items-center justify-center rounded-pill border pulse-soft"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--tint-training) 25%, var(--color-surface)) 0%, color-mix(in srgb, var(--tint-training) 8%, var(--color-surface)) 70%)",
          borderColor:
            "color-mix(in srgb, var(--tint-training) 38%, transparent)",
          color: "var(--tint-training)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M8 21h8" />
          <path d="M12 17v4" />
          <circle cx="12" cy="9" r="6" />
          <path d="M5 6c0 4 3 6 5 7" />
          <path d="M19 6c0 4-3 6-5 7" />
        </svg>
      </span>
      <div>
        <Eyebrow>Achievement unlocked</Eyebrow>
        <p className="text-sm font-semibold text-fg">White Belt · 26 May 2026</p>
      </div>
    </div>
  );
}

function CohortComparison() {
  return (
    <Card data-reveal>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Eyebrow>{mockCohortHeadline.eyebrow}</Eyebrow>
            <CardTitle>{mockCohortHeadline.title}</CardTitle>
          </div>
          <Chip>Illustrative · mock cohort</Chip>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3 sm:grid-cols-3">
          {mockCohortComparison.map((s) => (
            <li
              key={s.id}
              className="flex flex-col gap-1 rounded-card border border-border-subtle bg-surface p-4"
            >
              <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                {s.label}
              </p>
              <div className="flex items-baseline gap-3 pt-1">
                <span className="t-num text-[20px] font-semibold text-fg">
                  {s.you}
                </span>
                <span className="text-[12px] text-muted-foreground">you</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span
                  className="t-num text-[18px] font-semibold"
                  style={{ color: "var(--tint-training)" }}
                >
                  {s.cohort}
                </span>
                <span className="text-[12px] text-muted-foreground">cohort</span>
              </div>
              <p className="mt-1 text-[12px] italic text-muted-foreground">
                {s.note}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function CertificateCard() {
  const c = mockCertificate;
  return (
    <div
      className="relative overflow-hidden rounded-card border p-10"
      style={{
        background:
          "radial-gradient(circle at 80% 0%, color-mix(in srgb, var(--tint-training) 10%, transparent) 0%, transparent 55%), color-mix(in srgb, var(--tint-training) 4%, var(--color-surface))",
        borderColor:
          "color-mix(in srgb, var(--tint-training) 22%, transparent)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-card"
        style={{
          boxShadow:
            "inset 0 0 0 1px color-mix(in srgb, var(--tint-training) 18%, transparent)",
        }}
      />
      <div className="relative flex flex-col items-center gap-3 text-center">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {c.issuedBy}
        </p>
        <h3 className="text-[28px] font-semibold tracking-tight text-fg">
          Certificate of Completion
        </h3>
        <p className="text-[13px] text-muted-foreground">
          This is to certify that
        </p>
        <p className="text-[26px] font-semibold text-fg">{c.learnerName}</p>
        <p className="text-[13px] text-muted-foreground">
          has successfully completed
        </p>
        <p className="text-[18px] font-medium text-fg">{c.courseTitle}</p>
        <p className="mt-4 text-[12px] text-muted-foreground">
          {c.completionDate} · Verify at {c.verificationUrl}
        </p>
      </div>
    </div>
  );
}

function SocialProofRow() {
  const stats: { label: string; value: string }[] = [
    {
      label: "of graduates start Yellow Belt within 7 days",
      value: "68%",
    },
    {
      label: "graduates this month",
      value: "184",
    },
    {
      label: "average time to next belt",
      value: "9 days",
    },
  ];
  return (
    <aside
      className="rounded-card border border-border-subtle bg-surface p-4"
    >
      <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        You&apos;re in good company
      </p>
      <ul className="mt-2 grid gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <li key={s.label} className="flex items-baseline gap-2">
            <span
              className="t-num text-[20px] font-semibold"
              style={{ color: "var(--tint-training)" }}
            >
              {s.value}
            </span>
            <span className="text-[12px] text-muted-foreground">{s.label}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] italic text-muted-foreground">
        Numbers above are illustrative — the prototype is not connected to live
        data.
      </p>
    </aside>
  );
}

function ReadyForYellowBelt() {
  return (
    <Card
      style={{
        borderColor:
          "color-mix(in srgb, var(--tint-training) 35%, transparent)",
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--tint-training) 6%, var(--color-surface)) 0%, var(--color-surface) 70%)",
      }}
    >
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Eyebrow>The next step</Eyebrow>
            <CardTitle>You are now ready for Yellow Belt</CardTitle>
          </div>
          <Chip tint="training">Recommended next belt</Chip>
        </div>
        <p className="text-[14px] text-muted-foreground">
          Yellow Belt is where the language becomes practice. You&apos;ll run
          your first DMAIC under a coach and walk away with a measurable
          improvement to point at.
        </p>
      </CardHeader>
      <CardContent className="flex flex-wrap items-end justify-between gap-3 border-t border-border-subtle pt-4">
        <ul className="flex flex-col gap-1 text-[13px] text-fg">
          <li className="flex items-start gap-2">
            <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            <span>Six hours, self-paced — fits around your day job</span>
          </li>
          <li className="flex items-start gap-2">
            <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            <span>Graduate discount available · 7 days from today</span>
          </li>
          <li className="flex items-start gap-2">
            <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            <span>One-to-one coach feedback on your project</span>
          </li>
        </ul>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <Button variant="primary" size="md" asChild>
              <Link href={`${ROUTE}?tab=upgrade`}>View Yellow Belt</Link>
            </Button>
            <Button variant="outline" size="md" asChild>
              <Link href={`${ROUTE}?tab=portal`}>Open portal</Link>
            </Button>
          </div>
          <MockEventChip
            event="yellow_belt_clicked"
            futureAction="Add to Yellow Belt high-intent audience."
          />
        </div>
      </CardContent>
    </Card>
  );
}

function WhatsNext() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Or — three other directions</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          Not everyone goes straight to Yellow Belt. Here are the other paths
          most graduates take.
        </p>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <NextStep
          eyebrow="For your company"
          title="Bring Six Sigma in-house"
          description="Custom 2KO training cohort + Sigmafy for project tracking."
          ctaLabel="Request a proposal"
          href={`${ROUTE}?tab=referral`}
          event="company_invite_started"
          futureAction="Notify sales · start company sequence."
        />
        <NextStep
          eyebrow="Your portal"
          title="Post-course portal"
          description="All next-best actions in one prioritised place."
          ctaLabel="Open portal"
          href={`${ROUTE}?tab=portal`}
          event="next_belt_cta_viewed"
        />
        <NextStep
          eyebrow="See the platform"
          title="Sigmafy statistics"
          description="What Sigmafy looks like inside a company already running projects."
          ctaLabel="See sample stats"
          href={`${ROUTE}?tab=stats`}
          event="sigmafy_stats_viewed"
          futureAction="Send company-ROI email +24h."
        />
      </CardContent>
    </Card>
  );
}

function NextStep({
  eyebrow,
  title,
  description,
  ctaLabel,
  href,
  event,
  futureAction,
}: {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  event: FunnelEventType;
  futureAction?: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-card border border-border-subtle bg-surface p-4">
      <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        {eyebrow}
      </p>
      <p className="text-base font-medium text-fg">{title}</p>
      <p className="text-[13px] text-muted-foreground">{description}</p>
      <Button variant="outline" size="sm" className="mt-auto self-start" asChild>
        <Link href={href}>{ctaLabel}</Link>
      </Button>
      <MockEventChip event={event} futureAction={futureAction} />
    </div>
  );
}
