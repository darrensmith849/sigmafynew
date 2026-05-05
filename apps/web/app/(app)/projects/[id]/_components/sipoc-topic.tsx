"use client";

import { useState, useTransition } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@sigmafy/ui";
import type { TemplateTopic } from "@sigmafy/db";
import { saveSipoc, type SipocContent } from "../_actions/save-sipoc";
import { OverrideCard, type OverrideDisplay } from "./override-card";

const COLUMNS: Array<{ key: keyof SipocContent; label: string; placeholder: string }> = [
  { key: "suppliers", label: "Suppliers", placeholder: "e.g. Steel mill" },
  { key: "inputs", label: "Inputs", placeholder: "e.g. Raw steel coil" },
  { key: "process", label: "Process", placeholder: "e.g. Cut to length" },
  { key: "outputs", label: "Outputs", placeholder: "e.g. Finished panels" },
  { key: "customers", label: "Customers", placeholder: "e.g. Assembly plant" },
];

const EMPTY: SipocContent = {
  suppliers: [""],
  inputs: [""],
  process: [""],
  outputs: [""],
  customers: [""],
};

export interface SipocGradingDisplay {
  score: number;
  decision: "approved" | "approved_with_notes" | "needs_revision";
  summary: string;
  feedback: Array<{ column: string; note: string }>;
  modelId: string;
  promptVersion: string;
  gradedAt: string;
}

export function SipocTopic(props: {
  projectId: string;
  phaseSlug: string;
  sectionSlug: string;
  topic: TemplateTopic;
  existingSolution: null | {
    id: string;
    content: unknown;
    grading: unknown;
    gradingOverride: unknown;
    submittedAt: Date;
  };
}) {
  const initial = (props.existingSolution?.content as SipocContent | undefined) ?? EMPTY;
  const initialGrading = (props.existingSolution?.grading as SipocGradingDisplay | null) ?? null;
  const override = (props.existingSolution?.gradingOverride as OverrideDisplay | null) ?? null;
  const [content, setContent] = useState<SipocContent>(() => ({
    suppliers: padTo(initial.suppliers, 3),
    inputs: padTo(initial.inputs, 3),
    process: padTo(initial.process, 3),
    outputs: padTo(initial.outputs, 3),
    customers: padTo(initial.customers, 3),
  }));
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(
    props.existingSolution ? formatTime(props.existingSolution.submittedAt) : null,
  );
  const grading = initialGrading;
  const [gradingError, setGradingError] = useState<string | null>(null);

  const updateCell = (col: keyof SipocContent, idx: number, value: string) => {
    setContent((prev) => {
      const next = { ...prev, [col]: [...prev[col]] };
      next[col][idx] = value;
      return next;
    });
  };

  const [queuedMsg, setQueuedMsg] = useState<string | null>(null);

  const onSubmit = () => {
    setGradingError(null);
    setQueuedMsg(null);
    startTransition(async () => {
      const cleaned: SipocContent = {
        suppliers: content.suppliers.filter(Boolean),
        inputs: content.inputs.filter(Boolean),
        process: content.process.filter(Boolean),
        outputs: content.outputs.filter(Boolean),
        customers: content.customers.filter(Boolean),
      };
      const result = await saveSipoc({
        projectId: props.projectId,
        phaseSlug: props.phaseSlug,
        sectionSlug: props.sectionSlug,
        topicSlug: props.topic.slug,
        content: cleaned,
      });
      setSavedAt(formatTime(new Date()));
      if (result.async) {
        setQueuedMsg(
          "Saved. AI grading is running in the background — refresh in ~10 seconds, or watch your email.",
        );
      } else if (!result.graded) {
        setGradingError(
          "Saved, but AI grading failed. Try again — grading runs each submit.",
        );
      }
      // Grading is server-rendered after revalidatePath; the page reload will
      // surface the new grading via initialGrading on the next render.
    });
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{props.topic.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <p className="text-sm text-muted-foreground">{props.topic.description}</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {COLUMNS.map((col) => (
              <div key={col.key} className="grid gap-2">
                <Label>{col.label}</Label>
                {content[col.key].map((value, idx) => (
                  <Input
                    key={idx}
                    value={value}
                    placeholder={col.placeholder}
                    onChange={(e) => updateCell(col.key, idx, e.currentTarget.value)}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {savedAt ? `Last saved ${savedAt}` : "Not saved yet"}
            </span>
            <Button onClick={onSubmit} disabled={pending}>
              {pending ? "Saving & grading…" : "Save SIPOC"}
            </Button>
          </div>
          {gradingError && (
            <p className="text-sm text-red-600">{gradingError}</p>
          )}
          {queuedMsg && (
            <p className="text-sm text-fg">{queuedMsg}</p>
          )}
        </CardContent>
      </Card>

      {grading && (
        <>
          {/* Override card always renders when there's any grading at all —
              either the existing override (read-only) or the "Override AI feedback"
              button. Master plan §10/§15: override is the default UX. */}
          {props.existingSolution && (
            <OverrideCard
              projectId={props.projectId}
              topicSolutionId={props.existingSolution.id}
              override={override}
            />
          )}
          <GradingCard grading={grading} dimmed={override !== null} />
        </>
      )}
    </div>
  );
}

function GradingCard({
  grading,
  dimmed,
}: {
  grading: SipocGradingDisplay;
  dimmed: boolean;
}) {
  const decisionStyle = {
    approved: "bg-green-50 text-green-800 border-green-200",
    approved_with_notes: "bg-amber-50 text-amber-800 border-amber-200",
    needs_revision: "bg-red-50 text-red-800 border-red-200",
  }[grading.decision];

  const decisionLabel = {
    approved: "Approved",
    approved_with_notes: "Approved with notes",
    needs_revision: "Needs revision",
  }[grading.decision];

  return (
    <Card className={dimmed ? "opacity-70" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            AI feedback{" "}
            {dimmed && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                (overridden — for reference)
              </span>
            )}
          </CardTitle>
          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${decisionStyle}`}>
            {decisionLabel} · {grading.score}/100
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p className="text-sm text-foreground">{grading.summary}</p>
        {grading.feedback.length > 0 && (
          <ul className="grid gap-2">
            {grading.feedback.map((f, i) => (
              <li key={i} className="rounded-md border border-border p-3 text-sm">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {f.column}
                </span>
                <p className="mt-1 text-foreground">{f.note}</p>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-muted-foreground">
          Graded by {grading.modelId} · prompt v{grading.promptVersion} ·
          {" "}
          {new Date(grading.gradedAt).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}

function padTo<T>(arr: T[] | undefined, len: number): T[] {
  const a = (arr ?? []).slice();
  while (a.length < len) a.push("" as T);
  return a;
}

function formatTime(d: Date): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "short", timeStyle: "short" }).format(d);
}
