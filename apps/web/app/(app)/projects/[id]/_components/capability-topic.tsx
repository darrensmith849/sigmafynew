"use client";

import { useState, useTransition } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@sigmafy/ui";
import type { TemplateTopic } from "@sigmafy/db";
import { runCapability, type CapabilityTopicContent } from "../_actions/run-capability";

const FMT = new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 });

export function CapabilityTopic(props: {
  projectId: string;
  phaseSlug: string;
  sectionSlug: string;
  topic: TemplateTopic;
  existingSolution: null | { content: unknown; submittedAt: Date };
}) {
  const initial = (props.existingSolution?.content as CapabilityTopicContent | undefined) ?? null;
  const [text, setText] = useState<string>(() => (initial ? initial.input.data.join(", ") : ""));
  const [lsl, setLsl] = useState<string>(initial?.input.lsl != null ? String(initial.input.lsl) : "");
  const [usl, setUsl] = useState<string>(initial?.input.usl != null ? String(initial.input.usl) : "");
  const [subgroupSize, setSubgroupSize] = useState<string>(
    initial?.input.subgroup_size ? String(initial.input.subgroup_size) : "1",
  );
  const [result, setResult] = useState(initial?.result ?? null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onRun = () => {
    setError(null);
    const data = text.split(/[\s,;]+/).filter(Boolean).map(Number);
    if (data.some((d) => !Number.isFinite(d))) return setError("All values must be numbers.");
    if (data.length < 2) return setError("Enter at least two values.");
    const lslNum = lsl.trim() ? Number(lsl) : null;
    const uslNum = usl.trim() ? Number(usl) : null;
    if ((lsl.trim() && !Number.isFinite(lslNum)) || (usl.trim() && !Number.isFinite(uslNum))) {
      return setError("Spec limits must be numbers if provided.");
    }
    if (lslNum === null && uslNum === null) {
      return setError("At least one spec limit (LSL or USL) is required for capability indices.");
    }
    const sg = Number(subgroupSize) || 1;
    startTransition(async () => {
      try {
        const r = await runCapability({
          projectId: props.projectId,
          phaseSlug: props.phaseSlug,
          sectionSlug: props.sectionSlug,
          topicSlug: props.topic.slug,
          request: { data, lsl: lslNum, usl: uslNum, subgroup_size: sg },
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
            <Label htmlFor="cap-data">Measurements</Label>
            <textarea
              id="cap-data"
              rows={4}
              value={text}
              onChange={(e) => setText(e.currentTarget.value)}
              placeholder="e.g. 10.1, 10.3, 9.8, 10.2, 10.4, 9.9, 10.1, 10.0, 10.5, 9.7"
              className="w-full rounded-md border border-border bg-background p-3 font-mono text-sm focus:border-fg focus:outline-none focus:ring-2 focus:ring-fg/10"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="cap-lsl">Lower spec (LSL)</Label>
              <Input id="cap-lsl" inputMode="decimal" value={lsl} onChange={(e) => setLsl(e.currentTarget.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="cap-usl">Upper spec (USL)</Label>
              <Input id="cap-usl" inputMode="decimal" value={usl} onChange={(e) => setUsl(e.currentTarget.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="cap-subgroup">Subgroup size</Label>
              <Input id="cap-subgroup" inputMode="numeric" value={subgroupSize} onChange={(e) => setSubgroupSize(e.currentTarget.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={onRun} disabled={pending}>
              {pending ? "Computing…" : "Run capability analysis"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Capability indices</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
              <Stat label="N" value={result.n} />
              <Stat label="Mean" value={result.mean} />
              <Stat label="σ within" value={result.std_within} />
              <Stat label="σ overall" value={result.std_overall} />
              {result.cp != null && <Stat label="Cp" value={result.cp} highlight={result.cp >= 1.33} />}
              {result.cpk != null && <Stat label="Cpk" value={result.cpk} highlight={result.cpk >= 1.33} />}
              {result.pp != null && <Stat label="Pp" value={result.pp} />}
              {result.ppk != null && <Stat label="Ppk" value={result.ppk} />}
              <Stat label="Yield %" value={result.yield_percent} />
              <Stat label="ppm" value={result.ppm} />
            </dl>
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
      <dd className={`text-base font-semibold ${highlight ? "text-green-700" : ""}`}>
        {FMT.format(value)}
      </dd>
    </div>
  );
}
