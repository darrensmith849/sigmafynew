import Link from "next/link";
import { Button, Card, Eyebrow, IconTile } from "@sigmafy/ui";
import { PageHero } from "../../_components/page-hero";

export const metadata = { title: "Project Management — Sigmafy" };

const PHASES = [
  { phase: "Define", topics: ["Charter", "SIPOC", "Process Map", "Pareto"] },
  { phase: "Measure", topics: ["Data Collection Plan", "Operational Definitions", "Histogram", "I-MR Chart", "X-bar / R", "Capability"] },
  { phase: "Analyse", topics: ["5-Whys", "Fishbone", "Hypotheses", "1-sample t", "2-sample t"] },
  { phase: "Improve", topics: ["Solution Selection", "Implementation Plan"] },
  { phase: "Control", topics: ["Control Plan", "Sustain"] },
  { phase: "Executive Summary", topics: ["One-page sponsor brief"] },
];

export default function ProjectsFeaturePage() {
  return (
    <>
      <PageHero
        eyebrow="Project Management"
        title="DMAIC, end to end, in one workspace."
        lede="A delegate opens a Green Belt project and walks straight through Define → Measure → Analyse → Improve → Control. Every topic has a structured form, AI grading, and a sponsor sign-off gate."
      >
        <Link href="/contact">
          <Button size="lg">Talk to us</Button>
        </Link>
      </PageHero>

      <section className="py-16 md:py-24">
        <div data-reveal className="mx-auto max-w-shell px-5 sm:px-8">
          <Eyebrow>Hierarchy</Eyebrow>
          <h2 className="h-display-md mt-4 max-w-3xl text-fg">
            Workspace · Class · Delegate · Project · Phase · Section · Topic.
          </h2>
          <p className="t-lede mt-4 max-w-2xl">
            Every artefact lives at the right scope. RLS policies in Postgres
            enforce tenant isolation — there is no application-level escape
            hatch.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PHASES.map((p) => (
              <Card key={p.phase} className="p-6">
                <div className="flex items-center gap-3">
                  <IconTile tint="projects" size={36}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <path d="M5 4v16M5 8h6a2 2 0 012 2M5 14h8a2 2 0 012 2M13 10h4M15 16h4" />
                    </svg>
                  </IconTile>
                  <h3 className="text-base font-semibold tracking-tightish text-fg">
                    {p.phase}
                  </h3>
                </div>
                <ul className="mt-4 grid gap-1.5 text-sm text-muted">
                  {p.topics.map((t) => (
                    <li key={t}>· {t}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
