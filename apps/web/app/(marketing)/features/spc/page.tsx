import Link from "next/link";
import { Button, Card, Chip, Eyebrow, IconTile } from "@sigmafy/ui";
import { PageHero } from "../../_components/page-hero";

export const metadata = { title: "Statistical Process Control — Sigmafy" };

const TOOLS = [
  { name: "Pareto", body: "Quantify defect categories so the vital few stand out from the trivial many." },
  { name: "Histogram", body: "Visualise distribution shape — spot skew, outliers, near-normality at a glance." },
  { name: "I-MR Chart", body: "Individuals + Moving Range. Use when you have one observation per period." },
  { name: "X-bar / R Chart", body: "Subgrouped control chart for variable data with equal-sized subgroups." },
  { name: "Cp / Cpk", body: "Compare process spread against spec limits — capable processes hit ≥ 1.33." },
  { name: "1-sample t", body: "Compare a sample mean against a hypothesised target (e.g. spec target 10.0)." },
  { name: "2-sample t", body: "Compare two sample means (e.g. shift A vs shift B cycle times)." },
];

export default function SpcPage() {
  return (
    <>
      <PageHero
        eyebrow="Statistical Process Control"
        title="Seven tools, one allowlist."
        lede="Every statistical call goes through the @sigmafy/stats-gateway service — so the surface stays small, predictable, and code-reviewed. No surprise tools in production."
      >
        <Link href="/contact">
          <Button size="lg">Talk to us</Button>
        </Link>
      </PageHero>

      <section className="py-16 md:py-24">
        <div data-reveal className="mx-auto max-w-shell px-5 sm:px-8">
          <Eyebrow>Tools</Eyebrow>
          <h2 className="h-display-md mt-4 max-w-3xl text-fg">
            The V1 statistics allowlist.
          </h2>
          <p className="t-lede mt-4 max-w-2xl">
            Adding a new tool is a code review event — never an admin toggle.
          </p>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t) => (
              <Card key={t.name} className="p-5">
                <div className="flex items-center gap-3">
                  <IconTile tint="spc" size={36}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <path d="M3 19h18M5 16l4-7 4 4 5-9" />
                    </svg>
                  </IconTile>
                  <h3 className="text-base font-semibold tracking-tightish text-fg">{t.name}</h3>
                </div>
                <p className="mt-3 text-sm text-muted">{t.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div data-reveal className="mx-auto max-w-shell px-5 sm:px-8">
          <Eyebrow>Capabilities</Eyebrow>
          <h2 className="h-headline mt-3 max-w-3xl text-fg">
            Type-safe in, calibrated out.
          </h2>
          <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
            <Chip tint="spc">Allowlist gateway</Chip>
            <Chip tint="spc">Type-checked endpoints</Chip>
            <Chip tint="spc">Server-side computation</Chip>
            <Chip tint="spc">Audit-logged calls</Chip>
            <Chip tint="spc">Workspace-scoped</Chip>
          </div>
        </div>
      </section>
    </>
  );
}
