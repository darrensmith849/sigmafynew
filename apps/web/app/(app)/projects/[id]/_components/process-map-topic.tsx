"use client";

import { useState, useTransition } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@sigmafy/ui";
import type { TemplateTopic } from "@sigmafy/db";
import {
  saveProcessMap,
  type ProcessMapContent,
  type ProcessMapStepContent,
} from "../_actions/save-process-map";
import { OverrideCard, type OverrideDisplay } from "./override-card";
import { GradingCard, type GenericGradingDisplay } from "./grading-card";

const SECTION_LABEL: Record<string, string> = {
  description: "Description",
  steps: "Steps",
  ordering: "Ordering",
  granularity: "Granularity",
  actors: "Actors",
  overall: "Overall",
};

const EMPTY_STEP: ProcessMapStepContent = { label: "", detail: "", actor: "" };

export function ProcessMapTopic(props: {
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
  const initial = (props.existingSolution?.content as ProcessMapContent | undefined) ?? {
    description: "",
    steps: [{ ...EMPTY_STEP }, { ...EMPTY_STEP }, { ...EMPTY_STEP }],
  };
  const grading = (props.existingSolution?.grading as GenericGradingDisplay | null) ?? null;
  const override = (props.existingSolution?.gradingOverride as OverrideDisplay | null) ?? null;

  const [description, setDescription] = useState<string>(initial.description ?? "");
  const [steps, setSteps] = useState<ProcessMapStepContent[]>(
    initial.steps.length > 0 ? initial.steps : [{ ...EMPTY_STEP }],
  );
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(
    props.existingSolution ? formatTime(props.existingSolution.submittedAt) : null,
  );
  const [error, setError] = useState<string | null>(null);

  const updateStep = (idx: number, patch: Partial<ProcessMapStepContent>) => {
    setSteps((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx]!, ...patch };
      return next;
    });
  };

  const addStep = () => setSteps((prev) => [...prev, { ...EMPTY_STEP }]);
  const removeStep = (idx: number) =>
    setSteps((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));

  const onSubmit = () => {
    setError(null);
    if (!description.trim()) {
      setError("Process description is required.");
      return;
    }
    const populated = steps.filter((s) => s.label.trim());
    if (populated.length < 3) {
      setError("List at least three steps.");
      return;
    }
    startTransition(async () => {
      await saveProcessMap({
        projectId: props.projectId,
        phaseSlug: props.phaseSlug,
        sectionSlug: props.sectionSlug,
        topicSlug: props.topic.slug,
        content: { description: description.trim(), steps },
      });
      setSavedAt(formatTime(new Date()));
    });
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{props.topic.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          {props.topic.description && (
            <p className="text-sm text-muted-foreground">{props.topic.description}</p>
          )}

          <div className="grid gap-2">
            <Label htmlFor="process-map-description">Process description</Label>
            <Input
              id="process-map-description"
              placeholder="e.g. Customer order from web checkout to order-confirmed email"
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
            />
            <p className="text-xs text-muted-foreground">
              Name the process and where it starts and ends.
            </p>
          </div>

          <div className="grid gap-3">
            <Label>Steps (in execution order)</Label>
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="grid gap-2 rounded-md border border-border/60 bg-neutral-50/40 p-3"
              >
                <div className="flex items-start gap-2">
                  <span className="mt-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sigmafyBlue-100 text-xs font-semibold text-sigmafyBlue-700">
                    {idx + 1}
                  </span>
                  <div className="grid flex-1 gap-2">
                    <Input
                      placeholder={`Step ${idx + 1} (start with a verb — e.g. "Receive order")`}
                      value={step.label}
                      onChange={(e) => updateStep(idx, { label: e.currentTarget.value })}
                    />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        placeholder="Actor (optional) — who does this step"
                        value={step.actor ?? ""}
                        onChange={(e) => updateStep(idx, { actor: e.currentTarget.value })}
                      />
                      <Input
                        placeholder="Detail (optional)"
                        value={step.detail ?? ""}
                        onChange={(e) => updateStep(idx, { detail: e.currentTarget.value })}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStep(idx)}
                    disabled={steps.length <= 1}
                    aria-label={`Remove step ${idx + 1}`}
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
            <div>
              <Button type="button" variant="outline" size="sm" onClick={addStep}>
                + Add step
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {savedAt ? `Last saved ${savedAt}` : "Not saved yet"}
            </span>
            <Button onClick={onSubmit} disabled={pending}>
              {pending ? "Saving & grading…" : "Save process map"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      {grading && (
        <>
          {props.existingSolution && (
            <OverrideCard
              projectId={props.projectId}
              topicSolutionId={props.existingSolution.id}
              override={override}
            />
          )}
          <GradingCard
            grading={grading}
            dimmed={override !== null}
            sectionLabel={(s) => SECTION_LABEL[s] ?? s}
          />
        </>
      )}
    </div>
  );
}

function formatTime(d: Date): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "short", timeStyle: "short" }).format(d);
}
