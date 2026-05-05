"use client";

import { useState, useTransition } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Label } from "@sigmafy/ui";
import type { TemplateTopic } from "@sigmafy/db";
import { runImr, type IMRTopicContent } from "../_actions/run-imr";

const FMT = new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 });

export function IMRTopic(props: {
  projectId: string;
  phaseSlug: string;
  sectionSlug: string;
  topic: TemplateTopic;
  existingSolution: null | { content: unknown; submittedAt: Date };
}) {
  const initial = (props.existingSolution?.content as IMRTopicContent | undefined) ?? null;
  const [text, setText] = useState<string>(() => (initial ? initial.input.data.join(", ") : ""));
  const [result, setResult] = useState<IMRTopicContent["result"] | null>(initial?.result ?? null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onRun = () => {
    setError(null);
    const data = text.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean).map((s) => Number(s));
    if (data.some((d) => !Number.isFinite(d))) {
      setError("All values must be numbers.");
      return;
    }
    if (data.length < 2) {
      setError("Enter at least two values.");
      return;
    }
    startTransition(async () => {
      try {
        const r = await runImr({
          projectId: props.projectId,
          phaseSlug: props.phaseSlug,
          sectionSlug: props.sectionSlug,
          topicSlug: props.topic.slug,
          request: { data },
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
            <Label htmlFor="imr-data">Individual measurements</Label>
            <textarea
              id="imr-data"
              rows={5}
              value={text}
              onChange={(e) => setText(e.currentTarget.value)}
              placeholder="e.g. 10.1, 10.3, 9.8, 10.2, 10.4, 9.9, 10.1, 10.0, 10.5, 9.7"
              className="w-full rounded-md border border-border bg-background p-3 font-mono text-sm focus:border-sigmafyBlue-400 focus:outline-none focus:ring-2 focus:ring-sigmafyBlue-100"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={onRun} disabled={pending}>
              {pending ? "Computing…" : "Run I-MR"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      {result && (
        <div className="grid gap-4 sm:grid-cols-2">
          <ChartCard title="Individuals" chart={result.individuals} />
          <ChartCard title="Moving Range" chart={result.moving_range} />
        </div>
      )}
    </div>
  );
}

function ChartCard(props: { title: string; chart: { center_line: number; ucl: number; lcl: number; sigma?: number; data: Array<number | null> } }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
          <Stat label="UCL" value={props.chart.ucl} />
          <Stat label="Center" value={props.chart.center_line} />
          <Stat label="LCL" value={props.chart.lcl} />
        </dl>
        {typeof props.chart.sigma === "number" && (
          <p className="mt-3 text-xs text-muted-foreground">σ = {FMT.format(props.chart.sigma)}</p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          n = {props.chart.data.filter((d) => d !== null).length} observations.
          Plotly chart persisted; chart UI ships in a follow-up.
        </p>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-base font-semibold">{FMT.format(value)}</dd>
    </div>
  );
}
