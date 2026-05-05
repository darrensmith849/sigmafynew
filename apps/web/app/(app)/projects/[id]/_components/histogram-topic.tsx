"use client";

import { useState, useTransition } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Label } from "@sigmafy/ui";
import type { TemplateTopic } from "@sigmafy/db";
import { runHistogram, type HistogramTopicContent } from "../_actions/run-histogram";

const NUMBER_FORMAT = new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 });

export function HistogramTopic(props: {
  projectId: string;
  phaseSlug: string;
  sectionSlug: string;
  topic: TemplateTopic;
  existingSolution: null | { content: unknown; submittedAt: Date };
}) {
  const initial = (props.existingSolution?.content as HistogramTopicContent | undefined) ?? null;
  const [text, setText] = useState<string>(() =>
    initial ? initial.input.data.join(", ") : "",
  );
  const [title, setTitle] = useState<string>(initial?.input.title ?? "");
  const [xLabel, setXLabel] = useState<string>(initial?.input.x_label ?? "");
  const [result, setResult] = useState<HistogramTopicContent["result"] | null>(initial?.result ?? null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onRun = () => {
    setError(null);
    const data = text
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => Number(s));
    if (data.some((d) => !Number.isFinite(d))) {
      setError("All values must be numbers. Separate with commas, spaces or new lines.");
      return;
    }
    if (data.length < 2) {
      setError("Enter at least two values.");
      return;
    }
    startTransition(async () => {
      try {
        const r = await runHistogram({
          projectId: props.projectId,
          phaseSlug: props.phaseSlug,
          sectionSlug: props.sectionSlug,
          topicSlug: props.topic.slug,
          request: {
            data,
            title: title.trim() || null,
            x_label: xLabel.trim() || null,
          },
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
            <Label htmlFor="histo-data">Data (numbers, comma- or space-separated)</Label>
            <textarea
              id="histo-data"
              rows={5}
              value={text}
              onChange={(e) => setText(e.currentTarget.value)}
              placeholder="e.g. 4.2, 4.5, 4.1, 4.7, 4.3, 4.6, 4.4, 4.8, 4.2, 4.5"
              className="w-full rounded-md border border-border bg-background p-3 font-mono text-sm focus:border-sigmafyBlue-400 focus:outline-none focus:ring-2 focus:ring-sigmafyBlue-100"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="histo-title">Title (optional)</Label>
              <input
                id="histo-title"
                value={title}
                onChange={(e) => setTitle(e.currentTarget.value)}
                placeholder="e.g. Cycle time distribution"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="histo-x-label">X-axis label (optional)</Label>
              <input
                id="histo-x-label"
                value={xLabel}
                onChange={(e) => setXLabel(e.currentTarget.value)}
                placeholder="e.g. seconds"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {props.existingSolution
                ? `Last run ${new Intl.DateTimeFormat(undefined, {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(props.existingSolution.submittedAt)}`
                : "Not run yet"}
            </span>
            <Button onClick={onRun} disabled={pending}>
              {pending ? "Computing…" : "Run Histogram"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-5">
              <Stat label="N" value={result.summary.n} />
              <Stat label="Mean" value={result.summary.mean} />
              <Stat label="Std dev" value={result.summary.stdev} />
              <Stat label="Min" value={result.summary.min} />
              <Stat label="Max" value={result.summary.max} />
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">
              Plotly figure persisted with the submission. Chart rendering UI
              ships in a follow-up; the data is in
              <code className="ml-1 rounded bg-neutral-100 px-1 py-0.5 text-xs">topic_solutions.content.result.figure</code>.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-lg font-semibold">{NUMBER_FORMAT.format(value)}</dd>
    </div>
  );
}
