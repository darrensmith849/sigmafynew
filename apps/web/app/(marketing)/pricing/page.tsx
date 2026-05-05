import Link from "next/link";
import { Button, Card, Chip, Eyebrow } from "@sigmafy/ui";
import { PageHero } from "../_components/page-hero";

export const metadata = { title: "Pricing — Sigmafy" };

const TIERS = [
  {
    name: "Starter",
    price: "Free",
    blurb: "For a single evaluation cohort.",
    features: [
      "1 active class",
      "Up to 10 delegates",
      "All 7 V1 stats tools",
      "AI grading on every submission",
      "Sponsor sign-off + ROI dashboard",
    ],
    cta: "Start a project",
    href: "/contact",
    featured: false,
  },
  {
    name: "Growth",
    price: "Talk to us",
    blurb: "For training providers running multiple cohorts.",
    features: [
      "Unlimited active classes",
      "CSV bulk delegate import",
      "Branded certificates",
      "Custom workspace branding",
      "Priority email support",
    ],
    cta: "Get a quote",
    href: "/contact",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    blurb: "For multi-tenant programmes and channel partners.",
    features: [
      "Multi-workspace admin",
      "SSO via Clerk org roles",
      "Audit-log export",
      "Dedicated onboarding",
      "SLA on AI grading latency",
    ],
    cta: "Talk to us",
    href: "/contact",
    featured: false,
  },
];

const FAQ = [
  {
    q: "Is the AI grade the final word?",
    a: "No. Trainer review is mandatory on every Green Belt project. The AI is a first pass; the trainer or sponsor override is the persisted record.",
  },
  {
    q: "Can I bring my own AI provider?",
    a: "All AI calls go through @sigmafy/ai's createAiClient adapter. We default to OpenAI; swapping is a one-file change. Contact us for the supported list.",
  },
  {
    q: "Where is data stored?",
    a: "Postgres on Neon (SA-region available on Enterprise). Tenant isolation is enforced at the database via Row-Level Security — there is no application-level escape hatch.",
  },
  {
    q: "How does ROI tracking work?",
    a: "Each project captures an estimated annual ZAR savings figure. We roll it up by class and by workspace; sponsors see the live total on their dashboard.",
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Pick the tier that matches your programme."
        lede="Three tiers — Starter, Growth, Enterprise. Talk to us for a real quote tailored to your cohort cadence and your stats workload."
      >
        <Link href="/contact">
          <Button size="lg">Talk to us</Button>
        </Link>
      </PageHero>

      <section className="py-16 md:py-24">
        <div data-reveal className="mx-auto max-w-shell px-5 sm:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {TIERS.map((t) => (
              <Card
                key={t.name}
                className={
                  t.featured
                    ? "relative overflow-hidden border-accent/40 bg-surface p-8 ring-1 ring-accent/30"
                    : "p-8"
                }
              >
                {t.featured && (
                  <div className="absolute right-4 top-4">
                    <Chip tint="projects">Most popular</Chip>
                  </div>
                )}
                <h3 className="text-base font-semibold tracking-tightish text-fg">{t.name}</h3>
                <p className="mt-2 text-sm text-muted">{t.blurb}</p>
                <p className="mt-6 t-num text-3xl font-semibold text-fg">{t.price}</p>
                <ul className="mt-6 grid gap-2 text-sm text-fg/80">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-fg/50" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link href={t.href}>
                    <Button size="md" variant={t.featured ? "primary" : "secondary"} className="w-full">
                      {t.cta}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div data-reveal className="mx-auto max-w-shell px-5 sm:px-8">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="h-headline mt-3 max-w-3xl text-fg">Common questions.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {FAQ.map((f) => (
              <Card key={f.q} className="p-6">
                <h3 className="text-base font-semibold tracking-tightish text-fg">{f.q}</h3>
                <p className="mt-2 text-sm text-muted">{f.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
