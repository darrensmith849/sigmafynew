"use client";

import { useState, useTransition } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Label } from "@sigmafy/ui";
import type { TemplateTopic } from "@sigmafy/db";
import { saveLongForm, type LongFormContent } from "../_actions/save-long-form";
import { OverrideCard, type OverrideDisplay } from "./override-card";
import { GradingCard, type GenericGradingDisplay } from "./grading-card";

const SECTION_LABEL: Record<string, string> = {
  specificity: "Specificity",
  actionability: "Actionability",
  completeness: "Completeness",
  scope: "Scope",
  overall: "Overall",
};

export function LongFormTopic(props: {
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
  const initial = (props.existingSolution?.content as LongFormContent | undefined) ?? { answer: "" };
  const grading = (props.existingSolution?.grading as GenericGradingDisplay | null) ?? null;
  const override = (props.existingSolution?.gradingOverride as OverrideDisplay | null) ?? null;

  const [answer, setAnswer] = useState<string>(initial.answer ?? "");
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(
    props.existingSolution ? formatTime(props.existingSolution.submittedAt) : null,
  );

  const onSubmit = () => {
    startTransition(async () => {
      await saveLongForm({
        projectId: props.projectId,
        phaseSlug: props.phaseSlug,
        sectionSlug: props.sectionSlug,
        topicSlug: props.topic.slug,
        topicName: props.topic.name,
        topicBrief: props.topic.description ?? props.topic.name,
        content: { answer: answer.trim() },
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
        <CardContent className="grid gap-4">
          {props.topic.description && (
            <p className="text-sm text-muted-foreground">{props.topic.description}</p>
          )}
          {props.topic.prompt && (
            <p className="rounded-md bg-muted p-4 text-sm text-foreground">{props.topic.prompt}</p>
          )}
          <div className="grid gap-2">
            <Label htmlFor="long-form-answer">Your answer</Label>
            <textarea
              id="long-form-answer"
              rows={8}
              value={answer}
              onChange={(e) => setAnswer(e.currentTarget.value)}
              placeholder="Be specific. Name systems, metrics, owners, dates."
              className="w-full rounded-md border border-border bg-background p-3 text-sm focus:border-fg focus:outline-none focus:ring-2 focus:ring-fg/10"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {savedAt ? `Last saved ${savedAt}` : "Not saved yet"}
            </span>
            <Button onClick={onSubmit} disabled={pending}>
              {pending ? "Saving & grading…" : "Save"}
            </Button>
          </div>
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
