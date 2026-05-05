"use client";

import { useState, useTransition } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@sigmafy/ui";
import type { TemplateTopic } from "@sigmafy/db";
import { runOneSampleT, type OneSampleTContent } from "../_actions/run-t-test";

const FMT = new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 });

const ALTERNATIVES = [
  { v: "two-sided", l: "Two-sided (≠)" },
  { v: "less", l: "Less than (<)" },
  { v: "greater", l: "Greater than (>)" },
] as const;

export function OneSampleTTopic(props: {
  projectId: string;
  phaseSlug: string;
  sectionSlug: string;
  topic: TemplateTopic;
  existingSolution: null | { content: unknown; submittedAt: Date };
}) {
  const initial = (props.existingSolution?.content as OneSampleTContent | undefined) ?? null;
  const [text, setText] = useState<string>(() => (initial ? initial.input.data.join(", ") : ""));
  const [hypothesizedMean, setHypothesizedMean] = useState<string>(
    initial?.input.hypothesized_mean != null ? String(initial.input.hypothesized_mean) : "",
  );
  const [alternative, setAlternative] = useState<"two-sided" | "less" | "greater">(
    (initial?.input.alternative as "two-sided" | "less" | "greater") ?? "two-sided",
  );
  const [result, setResult] = useState(initial?.result ?? null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onRun = () => {
    setError(null);
    const data = text.split(/[\s,;]+/).filter(Boolean).map(Number);
    if (data.some((d) => !Number.isFinite(d))) return setError("All values must be numbers.");
    if (data.length < 2) return setError("Enter at least two values.");
    const mu = Number(hypothesizedMean);
    if (!Number.isFinite(mu)) return setError("Hypothesised mean must be a number.");
    startTransition(async () => {
      try {
        const r = await runOneSampleT({
          projectId: props.projectId,
          phaseSlug: props.phaseSlug,
          sectionSlug: props.sectionSlug,
          topicSlug: props.topic.slug,
          request: { data, hypothesized_mean: mu, alternative },
        });
        setResult(r.result);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    });
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{props.topic.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {props.topic.description && (
            <p className="text-sm text-muted-foreground">{props.topic.description}</p>
          )}
          <div className="grid gap-2">
            <Label htmlFor="t1-data">Sample data</Label>
            <textarea
              id="t1-data"
              rows={4}
              value={text}
              onChange={(e) => setText(e.currentTarget.value)}
              placeholder="e.g. 10.1, 10.3, 9.8, 10.2, 10.4, 9.9, 10.1, 10.0"
              className="w-full rounded-md border border-border bg-background p-3 font-mono text-sm focus:border-sigmafyBlue-400 focus:outline-none focus:ring-2 focus:ring-sigmafyBlue-100"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="t1-mu">Hypothesised mean (μ₀)</Label>
              <Input
                id="t1-mu"
                inputMode="decimal"
                value={hypothesizedMean}
                onChange={(e) => setHypothesizedMean(e.currentTarget.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Alternative hypothesis</Label>
              <div className="flex flex-wrap gap-2">
                {ALTERNATIVES.map((a) => (
                  <button
                    key={a.v}
                    type="button"
                    onClick={() => setAlternative(a.v)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      alternative === a.v
                        ? "border-sigmafyBlue-300 bg-sigmafyBlue-50 text-sigmafyBlue-900"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {a.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={onRun} disabled={pending}>
              {pending ? "Computing…" : "Run 1-sample t-test"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
              <Stat label="t" value={result.t_statistic} />
              <Stat label="p-value" value={result.p_value} highlight={result.p_value < 0.05} />
              <Stat label="df" value={result.df} />
              <Stat label="N" value={result.n} />
              <Stat label="Sample mean" value={result.mean} />
              <Stat label="Std dev" value={result.std_dev} />
              <Stat label="SE mean" value={result.se_mean} />
              <Stat label="μ₀" value={result.hypothesized_mean} />
            </dl>
            <p className="mt-4 text-sm">
              95% CI: [{FMT.format(result.ci_95[0])}, {FMT.format(result.ci_95[1])}]
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {result.p_value < 0.05
                ? "Reject H₀ at α = 0.05."
                : "Fail to reject H₀ at α = 0.05."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={`text-base font-semibold ${highlight ? "text-amber-700" : ""}`}>
        {FMT.format(value)}
      </dd>
    </div>
  );
}
