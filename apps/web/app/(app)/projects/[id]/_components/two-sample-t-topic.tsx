"use client";

import { useState, useTransition } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Label } from "@sigmafy/ui";
import type { TemplateTopic } from "@sigmafy/db";
import { runTwoSampleT, type TwoSampleTContent } from "../_actions/run-t-test";

const FMT = new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 });

const ALTERNATIVES = [
  { v: "two-sided", l: "Two-sided (μ₁ ≠ μ₂)" },
  { v: "less", l: "Less than (μ₁ < μ₂)" },
  { v: "greater", l: "Greater than (μ₁ > μ₂)" },
] as const;

export function TwoSampleTTopic(props: {
  projectId: string;
  phaseSlug: string;
  sectionSlug: string;
  topic: TemplateTopic;
  existingSolution: null | { content: unknown; submittedAt: Date };
}) {
  const initial = (props.existingSolution?.content as TwoSampleTContent | undefined) ?? null;
  const [text1, setText1] = useState<string>(() => (initial ? initial.input.data1.join(", ") : ""));
  const [text2, setText2] = useState<string>(() => (initial ? initial.input.data2.join(", ") : ""));
  const [equalVar, setEqualVar] = useState<boolean>(initial?.input.equal_var ?? false);
  const [alternative, setAlternative] = useState<"two-sided" | "less" | "greater">(
    (initial?.input.alternative as "two-sided" | "less" | "greater") ?? "two-sided",
  );
  const [result, setResult] = useState(initial?.result ?? null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onRun = () => {
    setError(null);
    const parse = (t: string, label: string) => {
      const arr = t.split(/[\s,;]+/).filter(Boolean).map(Number);
      if (arr.some((d) => !Number.isFinite(d))) {
        setError(`${label}: all values must be numbers.`);
        return null;
      }
      if (arr.length < 2) {
        setError(`${label}: enter at least two values.`);
        return null;
      }
      return arr;
    };
    const data1 = parse(text1, "Sample 1");
    if (!data1) return;
    const data2 = parse(text2, "Sample 2");
    if (!data2) return;
    startTransition(async () => {
      try {
        const r = await runTwoSampleT({
          projectId: props.projectId,
          phaseSlug: props.phaseSlug,
          sectionSlug: props.sectionSlug,
          topicSlug: props.topic.slug,
          request: { data1, data2, equal_var: equalVar, alternative },
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="t2-data1">Sample 1</Label>
              <textarea
                id="t2-data1"
                rows={4}
                value={text1}
                onChange={(e) => setText1(e.currentTarget.value)}
                placeholder="e.g. 10.1, 10.3, 9.8"
                className="w-full rounded-md border border-border bg-background p-3 font-mono text-sm"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="t2-data2">Sample 2</Label>
              <textarea
                id="t2-data2"
                rows={4}
                value={text2}
                onChange={(e) => setText2(e.currentTarget.value)}
                placeholder="e.g. 11.1, 11.3, 10.8"
                className="w-full rounded-md border border-border bg-background p-3 font-mono text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Variances</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEqualVar(false)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    !equalVar
                      ? "border-border bg-surface-3 text-fg"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Welch (unequal)
                </button>
                <button
                  type="button"
                  onClick={() => setEqualVar(true)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    equalVar
                      ? "border-border bg-surface-3 text-fg"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Pooled (equal)
                </button>
              </div>
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
                        ? "border-border bg-surface-3 text-fg"
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
              {pending ? "Computing…" : "Run 2-sample t-test"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Result ({result.test})</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
              <Stat label="t" value={result.t_statistic} />
              <Stat label="p-value" value={result.p_value} highlight={result.p_value < 0.05} />
              <Stat label="μ₁" value={result.mean_1} />
              <Stat label="μ₂" value={result.mean_2} />
              <Stat label="Difference" value={result.difference} />
              <Stat label="σ₁" value={result.std_1} />
              <Stat label="σ₂" value={result.std_2} />
              <Stat label="N₁ / N₂" value={result.n_1} />
            </dl>
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
