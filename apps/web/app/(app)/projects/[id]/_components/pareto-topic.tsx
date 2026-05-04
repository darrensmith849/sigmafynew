"use client";

import { useState, useTransition } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@sigmafy/ui";
import type { TemplateTopic } from "@sigmafy/db";
import { runPareto, type ParetoTopicContent } from "../_actions/run-pareto";
import type { ParetoResponse } from "@sigmafy/stats-gateway";

export function ParetoTopic(props: {
  projectId: string;
  phaseSlug: string;
  sectionSlug: string;
  topic: TemplateTopic;
  existingSolution: null | { content: unknown; submittedAt: Date };
}) {
  const initial = (props.existingSolution?.content as ParetoTopicContent | undefined) ?? null;
  const [labels, setLabels] = useState<string[]>(
    initial?.input.labels.length ? padTo(initial.input.labels, 5) : ["", "", "", "", ""],
  );
  const [counts, setCounts] = useState<string[]>(
    initial?.input.counts.length
      ? padTo(initial.input.counts.map((n) => String(n)), 5)
      : ["", "", "", "", ""],
  );
  const [result, setResult] = useState<ParetoResponse | null>(initial?.result ?? null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onRun = () => {
    setError(null);
    const reqLabels: string[] = [];
    const reqCounts: number[] = [];
    for (let i = 0; i < labels.length; i++) {
      const l = labels[i]!.trim();
      const c = counts[i]!.trim();
      if (!l && !c) continue;
      if (!l || !c) {
        setError(`Row ${i + 1}: label and count must both be filled`);
        return;
      }
      const n = Number(c);
      if (!Number.isFinite(n) || n < 0) {
        setError(`Row ${i + 1}: count must be a non-negative number`);
        return;
      }
      reqLabels.push(l);
      reqCounts.push(n);
    }
    if (reqLabels.length === 0) {
      setError("Add at least one row with a label and a count.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await runPareto({
          projectId: props.projectId,
          phaseSlug: props.phaseSlug,
          sectionSlug: props.sectionSlug,
          topicSlug: props.topic.slug,
          request: { labels: reqLabels, counts: reqCounts },
        });
        setResult(res.result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Pareto call failed");
      }
    });
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{props.topic.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm text-muted-foreground">{props.topic.description}</p>
          <div className="grid grid-cols-[1fr_120px] gap-2">
            <Label className="self-end">Defect category</Label>
            <Label className="self-end">Count</Label>
            {labels.map((label, idx) => (
              <Row
                key={idx}
                label={label}
                count={counts[idx]!}
                onLabel={(v) => setLabels((p) => withAt(p, idx, v))}
                onCount={(v) => setCounts((p) => withAt(p, idx, v))}
              />
            ))}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end">
            <Button onClick={onRun} disabled={pending}>
              {pending ? "Running…" : "Run Pareto"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="pb-2">Category</th>
                  <th className="pb-2 text-right">Count</th>
                  <th className="pb-2 text-right">% cumulative</th>
                </tr>
              </thead>
              <tbody>
                {result.labels_sorted.map((label, idx) => (
                  <tr key={label} className="border-t border-border">
                    <td className="py-2">{label}</td>
                    <td className="py-2 text-right tabular-nums">{result.counts_sorted[idx]}</td>
                    <td className="py-2 text-right tabular-nums">
                      {result.cumulative_percent[idx]?.toFixed(1)}%
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-border font-medium">
                  <td className="py-2">Total</td>
                  <td className="py-2 text-right tabular-nums">{result.total}</td>
                  <td className="py-2 text-right tabular-nums">100.0%</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Row(props: {
  label: string;
  count: string;
  onLabel: (v: string) => void;
  onCount: (v: string) => void;
}) {
  return (
    <>
      <Input value={props.label} placeholder="e.g. Defect A" onChange={(e) => props.onLabel(e.currentTarget.value)} />
      <Input
        value={props.count}
        type="number"
        inputMode="numeric"
        onChange={(e) => props.onCount(e.currentTarget.value)}
      />
    </>
  );
}

function withAt<T>(arr: T[], i: number, v: T): T[] {
  const next = arr.slice();
  next[i] = v;
  return next;
}

function padTo<T>(arr: T[], len: number): T[] {
  const a = arr.slice();
  while (a.length < len) a.push("" as T);
  return a;
}
