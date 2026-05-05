"use client";

import { useState, useTransition } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Label } from "@sigmafy/ui";
import type { TemplateTopic } from "@sigmafy/db";
import { saveCharter, type CharterContent } from "../_actions/save-charter";
import { OverrideCard, type OverrideDisplay } from "./override-card";
import { GradingCard, type GenericGradingDisplay } from "./grading-card";

const EMPTY: CharterContent = {
  problem: "",
  goal: "",
  scope: "",
  target: "",
};

const FIELDS: Array<{
  key: keyof CharterContent;
  label: string;
  hint: string;
  rows: number;
}> = [
  {
    key: "problem",
    label: "Problem statement",
    hint: "Specific, observable, with magnitude. Not a complaint, not a solution.",
    rows: 3,
  },
  {
    key: "goal",
    label: "Goal statement",
    hint: "SMART: Specific, Measurable, Achievable, Relevant, Time-bound.",
    rows: 3,
  },
  {
    key: "scope",
    label: "Scope (in / out)",
    hint: "Tight enough for a Green Belt project — finishable in 8–12 weeks.",
    rows: 3,
  },
  {
    key: "target",
    label: "Target",
    hint: "Baseline number → target number → deadline. e.g. \"reduce X from 12% to 5% by Q3\".",
    rows: 2,
  },
];

const SECTION_LABEL: Record<string, string> = {
  problem: "Problem",
  goal: "Goal",
  scope: "Scope",
  target: "Target",
  overall: "Overall",
};

export function CharterTopic(props: {
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
  const initial = (props.existingSolution?.content as CharterContent | undefined) ?? EMPTY;
  const grading = (props.existingSolution?.grading as GenericGradingDisplay | null) ?? null;
  const override = (props.existingSolution?.gradingOverride as OverrideDisplay | null) ?? null;

  const [content, setContent] = useState<CharterContent>(() => ({
    problem: initial.problem ?? "",
    goal: initial.goal ?? "",
    scope: initial.scope ?? "",
    target: initial.target ?? "",
  }));
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(
    props.existingSolution ? formatTime(props.existingSolution.submittedAt) : null,
  );

  const updateField = (key: keyof CharterContent, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = () => {
    startTransition(async () => {
      await saveCharter({
        projectId: props.projectId,
        phaseSlug: props.phaseSlug,
        sectionSlug: props.sectionSlug,
        topicSlug: props.topic.slug,
        content: {
          problem: content.problem.trim(),
          goal: content.goal.trim(),
          scope: content.scope.trim(),
          target: content.target.trim(),
        },
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
          <div className="grid gap-5">
            {FIELDS.map((f) => (
              <div key={f.key} className="grid gap-1.5">
                <Label htmlFor={`charter-${f.key}`}>{f.label}</Label>
                <p className="-mt-0.5 text-xs text-muted-foreground">{f.hint}</p>
                <textarea
                  id={`charter-${f.key}`}
                  rows={f.rows}
                  value={content[f.key]}
                  onChange={(e) => updateField(f.key, e.currentTarget.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background p-3 text-sm focus:border-sigmafyBlue-400 focus:outline-none focus:ring-2 focus:ring-sigmafyBlue-100"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {savedAt ? `Last saved ${savedAt}` : "Not saved yet"}
            </span>
            <Button onClick={onSubmit} disabled={pending}>
              {pending ? "Saving & grading…" : "Save Charter"}
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
