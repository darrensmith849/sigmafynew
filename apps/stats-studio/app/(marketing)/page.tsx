import Link from "next/link";
import { Card, Chip, Eyebrow, IconTile } from "@sigmafy/ui";

const CATEGORIES = [
  { title: "Control Charts", desc: "I-MR, X-bar R/S, P, NP, C, U, EWMA, CUSUM, multivariate — all 8 Nelson rules." },
  { title: "Process Capability", desc: "Cp, Cpk, Pp, Ppk for normal and non-normal processes. Sixpack dashboards." },
  { title: "Hypothesis Testing", desc: "t-tests, proportions, variances, chi-square, Poisson, equivalence." },
  { title: "ANOVA", desc: "One-way, two-way, GLM, mixed effects, MANOVA, ANOM, main-effects + interaction plots." },
  { title: "Regression", desc: "Linear, multinomial, ordinal, nonlinear, orthogonal, PLS, Poisson, stepwise." },
  { title: "Reliability", desc: "Weibull, accelerated life, Kaplan-Meier, probit, warranty, regression life." },
  { title: "Multivariate", desc: "PCA, factor analysis, discriminant, item analysis, k-means, cluster, correspondence." },
  { title: "Time Series", desc: "ARIMA, ACF/PACF, decomposition, exponential smoothing, Winters, trend." },
  { title: "MSA / Gauge R&R", desc: "Crossed, nested, expanded, linearity/bias, attribute agreement, Type 1." },
];

export default function HomePage() {
  return (
    <section className="mx-auto max-w-shell px-5 py-20 sm:px-8 lg:py-28">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <Chip>Now in beta · Free for Sigmafy members</Chip>
          <h1 className="h-display-lg mt-4 text-fg">
            <span className="block">Six Sigma statistics</span>
            <span className="block text-accent">for every analysis.</span>
          </h1>
          <p className="t-lede mt-6 max-w-lg text-muted">
            Capability, Gauge R&amp;R, control charts, ANOVA, regression, DOE — 288 distinct
            tools, every one driven by validated scipy / statsmodels code.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="rounded-md bg-accent px-5 py-3 text-sm font-semibold text-accent-fg hover:bg-accent/90"
            >
              Get started
            </Link>
            <Link
              href="/sign-in"
              className="rounded-md border border-border-subtle bg-bg px-5 py-3 text-sm font-semibold text-fg hover:bg-surface-2"
            >
              Sign in
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted">
            No statistical wrappers, no closed-source approximations — the same engine that
            powers SSA cohorts on Sigmafy.
          </p>
        </div>

        <div className="grid gap-3">
          <Eyebrow>The catalogue</Eyebrow>
          <h2 className="h-display-md text-fg">Every analysis you&apos;ll ever need.</h2>
          <p className="text-muted">
            28 categories · 288 distinct tools · audited audit-logged calls
          </p>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => (
          <Card key={c.title} className="p-5">
            <IconTile className="mb-4">σ</IconTile>
            <h3 className="h-headline mb-2 text-fg">{c.title}</h3>
            <p className="text-sm text-muted">{c.desc}</p>
          </Card>
        ))}
      </div>

      <div className="mt-20 rounded-card border border-border-subtle bg-surface-1 p-8">
        <Eyebrow>Why Sigmafy</Eyebrow>
        <h3 className="h-display-md mt-2 text-fg">Validated math. Real audit trail.</h3>
        <p className="mt-3 max-w-2xl text-muted">
          Every run is computed against scipy/statsmodels reference implementations and
          covered by a 1,338-case audit suite. Results are stored against your workspace
          with full input/output lineage and a request ID you can trace back to the
          stats engine.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/sign-up"
            className="rounded-md bg-accent px-5 py-3 text-sm font-semibold text-accent-fg hover:bg-accent/90"
          >
            Try the catalogue
          </Link>
          <a
            href="https://sigmafy-tools.fly.dev/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-border-subtle bg-bg px-5 py-3 text-sm font-semibold text-fg hover:bg-surface-2"
          >
            Read the API docs ↗
          </a>
        </div>
      </div>
    </section>
  );
}
