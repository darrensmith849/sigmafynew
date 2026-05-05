import Link from "next/link";
import { Button, Card, Chip, Eyebrow, IconTile } from "@sigmafy/ui";
import { PageHero } from "../../_components/page-hero";

export const metadata = { title: "AI Evaluation — Sigmafy" };

const CAPS = [
  {
    title: "Per-topic grading prompts",
    body: "Each topic kind has its own versioned grading prompt — SIPOC, 5-Whys, Charter, Process Map, Fishbone, long-form. The prompt id + version is recorded with every grade.",
  },
  {
    title: "Inline + async paths",
    body: "Grading happens inline on submit (3–8s) by default. When Inngest is configured the same call goes async, with the topic page revalidating on completion.",
  },
  {
    title: "Audit-logged, traceable",
    body: "Every AI call writes an ai_call_record row — workspace, user, prompt id, prompt version, timestamp, token count. Reproducibility is non-negotiable.",
  },
];

const SAFEGUARDS = [
  {
    title: "Override is the default UX",
    body: "Trainers, sponsors, and admins see an Override card alongside every AI grading. The override is the canonical record once written — the original AI grading is dimmed.",
  },
  {
    title: "One provider abstraction",
    body: "@sigmafy/ai exposes a createAiClient adapter. App code never imports openai (or any other provider SDK) directly. Swapping providers is a one-file change.",
  },
  {
    title: "JSON-mode, schema-validated",
    body: "Every grading prompt asks for a strict JSON shape. The runner parses the response, validates required fields, and rejects anything malformed.",
  },
];

export default function AiFeaturePage() {
  return (
    <>
      <PageHero
        eyebrow="AI Evaluation"
        title="AI feedback on every submission. Override on by default."
        lede="Every Green Belt deliverable lands in front of an AI within seconds. Every AI grade can be overridden by a trainer, sponsor, or admin — and that override is the persisted record."
      >
        <Link href="/contact">
          <Button size="lg">Talk to us</Button>
        </Link>
      </PageHero>

      <section className="py-16 md:py-24">
        <div data-reveal className="mx-auto max-w-shell px-5 sm:px-8">
          <Eyebrow>What it does</Eyebrow>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {CAPS.map((c) => (
              <Card key={c.title} className="p-6">
                <IconTile tint="ai" size={36}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z" />
                  </svg>
                </IconTile>
                <h3 className="mt-4 text-lg font-semibold tracking-tightish text-fg">{c.title}</h3>
                <p className="mt-2 text-sm text-muted">{c.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div data-reveal className="mx-auto max-w-shell px-5 sm:px-8">
          <Eyebrow>Safeguards</Eyebrow>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {SAFEGUARDS.map((s) => (
              <Card key={s.title} className="p-6">
                <h3 className="text-lg font-semibold tracking-tightish text-fg">{s.title}</h3>
                <p className="mt-2 text-sm text-muted">{s.body}</p>
              </Card>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Chip tint="ai">Override default</Chip>
            <Chip tint="ai">Versioned prompts</Chip>
            <Chip tint="ai">JSON schema</Chip>
            <Chip tint="ai">Audit logged</Chip>
          </div>
        </div>
      </section>
    </>
  );
}
