"use client";

import { useState, useTransition } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Label } from "@sigmafy/ui";
import type { TemplateTopic } from "@sigmafy/db";
import { runXbarR, type XbarRTopicContent } from "../_actions/run-xbar-r";

const FMT = new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 });

/**
 * X-bar / R chart input parser.
 *
 * Format: one subgroup per line. Within a line, comma- or space-separate
 * the observations. Every subgroup must have the same number of obs.
 *
 *   10.1, 10.3, 9.8
 *   10.2, 10.4, 9.9
 *   10.1, 10.0, 10.5
 */
function parseSubgroups(text: string): { subgroups: number[][]; error: string | null } {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    return { subgroups: [], error: "Enter at least two subgroups (lines)." };
  }
  const subgroups: number[][] = [];
  let size = 0;
  for (let i = 0; i < lines.length; i++) {
    const cells = lines[i]!.split(/[\s,;]+/).filter(Boolean).map(Number);
    if (cells.some((c) => !Number.isFinite(c))) {
      return { subgroups: [], error: `Line ${i + 1}: all values must be numbers.` };
    }
    if (cells.length < 2) {
      return { subgroups: [], error: `Line ${i + 1}: need at least 2 observations per subgroup.` };
    }
    if (i === 0) size = cells.length;
    else if (cells.length !== size) {
      return {
        subgroups: [],
        error: `Line ${i + 1} has ${cells.length} observations; the first subgroup has ${size}. All subgroups must be the same size.`,
      };
    }
    subgroups.push(cells);
  }
  return { subgroups, error: null };
}

export function XbarRTopic(props: {
  projectId: string;
  phaseSlug: string;
  sectionSlug: string;
  topic: TemplateTopic;
  existingSolution: null | { content: unknown; submittedAt: Date };
}) {
  const initial = (props.existingSolution?.content as XbarRTopicContent | undefined) ?? null;
  const [text, setText] = useState<string>(() =>
    initial ? initial.input.subgroups.map((sg) => sg.join(", ")).join("\n") : "",
  );
  const [result, setResult] = useState<XbarRTopicContent["result"] | null>(initial?.result ?? null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onRun = () => {
    setError(null);
    const parsed = parseSubgroups(text);
    if (parsed.error) {
      setError(parsed.error);
      return;
    }
    startTransition(async () => {
      try {
        const r = await runXbarR({
          projectId: props.projectId,
          phaseSlug: props.phaseSlug,
          sectionSlug: props.sectionSlug,
          topicSlug: props.topic.slug,
          request: { subgroups: parsed.subgroups },
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
            <Label htmlFor="xbar-data">Subgroups (one per line, equal size)</Label>
            <textarea
              id="xbar-data"
              rows={6}
              value={text}
              onChange={(e) => setText(e.currentTarget.value)}
              placeholder={"10.1, 10.3, 9.8\n10.2, 10.4, 9.9\n10.1, 10.0, 10.5\n9.7, 9.9, 10.2"}
              className="w-full rounded-md border border-border bg-background p-3 font-mono text-sm focus:border-sigmafyBlue-400 focus:outline-none focus:ring-2 focus:ring-sigmafyBlue-100"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={onRun} disabled={pending}>
              {pending ? "Computing…" : "Run X-bar / R"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      {result && (
        <div className="grid gap-4 sm:grid-cols-2">
          <ChartCard title="X-bar" chart={result.x_bar} />
          <ChartCard title="R chart" chart={result.r_chart} />
        </div>
      )}
      {result && (
        <p className="text-xs text-muted-foreground">
          {result.n_subgroups} subgroups · subgroup size {result.subgroup_size}.
        </p>
      )}
    </div>
  );
}

function ChartCard(props: { title: string; chart: { center_line: number; ucl: number; lcl: number; data: number[] } }) {
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
        <p className="mt-3 text-xs text-muted-foreground">
          n = {props.chart.data.length} subgroups. Chart UI ships in a follow-up.
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
