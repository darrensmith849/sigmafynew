import Link from "next/link";
import { Button, Card, CardContent } from "@sigmafy/ui";

const FEATURES: Array<{ title: string; body: string }> = [
  {
    title: "Train",
    body:
      "Classes, cohorts, course materials and certification — all on one platform. Trainers schedule, delegates enrol, sponsors track progress.",
  },
  {
    title: "Do",
    body:
      "Run real Green Belt projects through structured DMAIC phases. SIPOC, Pareto, 5-Whys, control charts, capability — all built in.",
  },
  {
    title: "Prove",
    body:
      "Capture estimated annual ROI per project, get AI feedback on every submission, ship a branded certificate when the project's done.",
  },
];

const STATS_TOOLS = [
  "Pareto",
  "Histogram",
  "I-MR",
  "X-bar / R",
  "Cp/Cpk",
  "1-sample t",
  "2-sample t",
];

export default function MarketingHome() {
  return (
    <main className="bg-neutral-50">
      {/* Top bar */}
      <header className="border-b border-border/60 bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <span className="text-sm font-bold tracking-[0.2em] text-sigmafyBlue-600">
            SIGMAFY
          </span>
          <nav className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Sign in
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-sigmafyBlue-600">
          Six Sigma operating system
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-foreground leading-[1.1]">
          Run real Green Belt projects,
          <br />
          end&#8209;to&#8209;end.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Sigmafy is the platform Six Sigma trainers use to run cohorts,
          delegates use to work through DMAIC projects, and sponsors use to
          see the ROI roll up &mdash; with AI feedback on every submission.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Link href="/sign-up">
            <Button size="lg">Get started</Button>
          </Link>
          <Link href="/sign-in">
            <Button size="lg" variant="outline">
              Sign in
            </Button>
          </Link>
        </div>
      </section>

      {/* Three pillars */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="border-border/60 bg-background shadow-sm">
              <CardContent className="grid gap-3 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sigmafyBlue-600">
                  {f.title}
                </p>
                <p className="text-sm leading-relaxed text-foreground">{f.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats tools strip */}
      <section className="border-y border-border/60 bg-background">
        <div className="mx-auto max-w-4xl px-6 py-12 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Built-in statistical tools
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {STATS_TOOLS.map((t) => (
              <span
                key={t}
                className="rounded-full border border-sigmafyBlue-100 bg-sigmafyBlue-50 px-4 py-1.5 text-sm font-medium text-sigmafyBlue-700"
              >
                {t}
              </span>
            ))}
          </div>
          <p className="mx-auto mt-5 max-w-xl text-sm text-muted-foreground">
            Every analysis is signed, audited, and stored against the
            delegate&apos;s project. Gateway-allowlisted &mdash; no rogue calls.
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Ready to run a cohort?
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          Sign up free. Invite delegates by email or CSV. Start a class today.
        </p>
        <div className="mt-8">
          <Link href="/sign-up">
            <Button size="lg">Get started</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} 2KO Pty Ltd</span>
          <span className="font-bold tracking-[0.2em] text-sigmafyBlue-600">
            SIGMAFY
          </span>
        </div>
      </footer>
    </main>
  );
}
