import Link from "next/link";
import { Button, Card, Chip, Eyebrow, IconTile } from "@sigmafy/ui";
import { PageHero } from "../../_components/page-hero";

export const metadata = { title: "Training & Learning — Sigmafy" };

const CAPABILITIES = [
  {
    title: "Cohort scheduling",
    body: "Group delegates into a class with shared start / end dates, a trainer, and a sponsor. Each delegate gets their own Green Belt project automatically.",
  },
  {
    title: "Bulk delegate import",
    body: "Upload a CSV of names + emails. Sigmafy emails an invite to each, and they land directly in their cohort once they sign up.",
  },
  {
    title: "Sponsor sign-off",
    body: "Every DMAIC phase requires sponsor approval before the delegate can move on. Approvals queue surfaces what's waiting on whom.",
  },
  {
    title: "Branded certificates",
    body: "Project completion ships a SSA-styled PDF certificate via @react-pdf/renderer. One click, one source of truth.",
  },
];

export default function TrainingFeaturePage() {
  return (
    <>
      <PageHero
        eyebrow="Training & Learning"
        title="Run a cohort without spreadsheets."
        lede="Cohorts, delegates, exam scoring, and certificates — all in the same surface as the projects they produce. Trainer reviews are mandatory; the AI is a first pass, not the final word."
      >
        <Link href="/contact">
          <Button size="lg">Talk to us</Button>
        </Link>
      </PageHero>

      <section className="py-16 md:py-24">
        <div data-reveal className="mx-auto max-w-shell px-5 sm:px-8">
          <Eyebrow>Capabilities</Eyebrow>
          <h2 className="h-display-md mt-4 max-w-3xl text-fg">
            One cohort, one source of truth.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {CAPABILITIES.map((c) => (
              <Card key={c.title} className="p-6">
                <div className="flex items-start gap-4">
                  <IconTile tint="training">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <rect x="4" y="4" width="16" height="14" rx="2" />
                      <circle cx="12" cy="11" r="3" />
                      <path d="M9 18l-1 4 4-2 4 2-1-4" />
                    </svg>
                  </IconTile>
                  <div className="grid gap-2">
                    <h3 className="text-lg font-semibold tracking-tightish text-fg">{c.title}</h3>
                    <p className="text-sm text-muted">{c.body}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div data-reveal className="mx-auto max-w-shell px-5 sm:px-8 flex flex-wrap gap-3">
          <Chip tint="training">Cohorts</Chip>
          <Chip tint="training">CSV import</Chip>
          <Chip tint="training">Sponsor sign-off</Chip>
          <Chip tint="training">Certificates</Chip>
          <Chip tint="training">ROI roll-up</Chip>
        </div>
      </section>
    </>
  );
}
