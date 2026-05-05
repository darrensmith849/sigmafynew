import Link from "next/link";
import { Button, Card, Eyebrow, IconTile } from "@sigmafy/ui";
import { PageHero } from "../_components/page-hero";

export const metadata = { title: "Product — Sigmafy" };

const PILLARS = [
  {
    tint: "projects" as const,
    title: "DMAIC project workspace",
    body: "Charter, SIPOC, Process Map, 5-Whys, Fishbone, hypothesis tests, control plans. Every Green Belt deliverable in one place, with sponsor sign-off at every phase boundary.",
  },
  {
    tint: "spc" as const,
    title: "Statistics, properly gated",
    body: "Pareto, histograms, I-MR, X-bar/R, capability, t-tests. Each call goes through the @sigmafy/stats-gateway allowlist — adding a new tool is a code-review event.",
  },
  {
    tint: "training" as const,
    title: "Training that produces evidence",
    body: "Cohorts, delegate enrolment, exam scoring, branded certificates. Sponsor sees ROI per project, per cohort, per workspace.",
  },
  {
    tint: "ai" as const,
    title: "AI assistance with override on by default",
    body: "Every submission graded in seconds. Trainers, sponsors, and admins can override any AI feedback — and the override is the persisted record.",
  },
];

const AUDIENCE = [
  { who: "Training providers", body: "Run cohorts of Green Belt projects end-to-end without spreadsheets." },
  { who: "Quality teams", body: "Track real DMAIC work alongside the statistics that prove the gain." },
  { who: "Sponsors", body: "Approve phases, see live ROI, sign certificates — all in the same surface." },
];

export default function ProductPage() {
  return (
    <>
      <PageHero
        eyebrow="Product"
        title="One platform for projects, training, and proof."
        lede="Sigmafy is the operating system for Six Sigma and Lean improvement work. Train your delegates, run their projects, and prove the impact — without juggling four tools."
      >
        <Link href="/contact">
          <Button size="lg">Talk to us</Button>
        </Link>
        <Link href="/pricing">
          <Button size="lg" variant="secondary">
            Pricing
          </Button>
        </Link>
      </PageHero>

      <section className="py-16 md:py-24">
        <div data-reveal className="mx-auto max-w-shell px-5 sm:px-8">
          <Eyebrow>How it fits together</Eyebrow>
          <h2 className="h-display-md mt-4 max-w-3xl text-fg">
            Four pillars, one source of truth.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {PILLARS.map((p) => (
              <Card key={p.title} className="h-full p-6">
                <div className="flex items-start gap-4">
                  <IconTile tint={p.tint}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                  </IconTile>
                  <div className="grid gap-2">
                    <h3 className="text-lg font-semibold tracking-tightish text-fg">{p.title}</h3>
                    <p className="text-sm text-muted">{p.body}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div data-reveal className="mx-auto max-w-shell px-5 sm:px-8">
          <Eyebrow>Who it&apos;s for</Eyebrow>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {AUDIENCE.map((a) => (
              <Card key={a.who} className="p-6">
                <h3 className="text-base font-semibold tracking-tightish text-fg">{a.who}</h3>
                <p className="mt-2 text-sm text-muted">{a.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
