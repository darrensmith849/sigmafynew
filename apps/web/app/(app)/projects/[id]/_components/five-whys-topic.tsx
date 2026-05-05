"use client";

import { useState, useTransition } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@sigmafy/ui";
import type { TemplateTopic } from "@sigmafy/db";
import { saveFiveWhys, type FiveWhysContent } from "../_actions/save-five-whys";
import { OverrideCard, type OverrideDisplay } from "./override-card";
import { GradingCard, type GenericGradingDisplay } from "./grading-card";

const EMPTY: FiveWhysContent = {
  problem: "",
  whys: ["", "", "", "", ""],
};

const SECTION_LABEL: Record<string, string> = {
  problem: "Problem statement",
  level_1: "Why #1",
  level_2: "Why #2",
  level_3: "Why #3",
  level_4: "Why #4",
  level_5: "Why #5",
  overall: "Overall",
};

export function FiveWhysTopic(props: {
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
  const initial = (props.existingSolution?.content as FiveWhysContent | undefined) ?? EMPTY;
  const grading = (props.existingSolution?.grading as GenericGradingDisplay | null) ?? null;
  const override = (props.existingSolution?.gradingOverride as OverrideDisplay | null) ?? null;

  const [problem, setProblem] = useState<string>(initial.problem ?? "");
  const [whys, setWhys] = useState<string[]>(() => padTo(initial.whys ?? [], 5));
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(
    props.existingSolution ? formatTime(props.existingSolution.submittedAt) : null,
  );
  const [error, setError] = useState<string | null>(null);

  const updateWhy = (idx: number, value: string) => {
    setWhys((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  };

  const onSubmit = () => {
    setError(null);
    if (!problem.trim()) {
      setError("Problem statement is required.");
      return;
    }
    if (whys.filter((w) => w.trim()).length < 3) {
      setError("Fill in at least three 'Why?' levels.");
      return;
    }
    startTransition(async () => {
      const cleaned: FiveWhysContent = {
        problem: problem.trim(),
        whys: whys.map((w) => w.trim()),
      };
      await saveFiveWhys({
        projectId: props.projectId,
        phaseSlug: props.phaseSlug,
        sectionSlug: props.sectionSlug,
        topicSlug: props.topic.slug,
        content: cleaned,
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
            <Label htmlFor="five-whys-problem">Problem statement</Label>
            <Input
              id="five-whys-problem"
              placeholder="What is the specific, observable problem?"
              value={problem}
              onChange={(e) => setProblem(e.currentTarget.value)}
            />
          </div>
          <div className="grid gap-3">
            <Label>The why-chain</Label>
            <p className="-mt-1 text-xs text-muted-foreground">
              Each level is the answer to “why does the previous level happen?”
            </p>
            {whys.map((value, idx) => (
              <div key={idx} className="grid gap-1">
                <Label htmlFor={`why-${idx}`} className="text-xs uppercase tracking-wide text-muted-foreground">
                  Why #{idx + 1}
                </Label>
                <Input
                  id={`why-${idx}`}
                  placeholder={idx === 0 ? "Why does the problem happen?" : "Why does the previous answer happen?"}
                  value={value}
                  onChange={(e) => updateWhy(idx, e.currentTarget.value)}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {savedAt ? `Last saved ${savedAt}` : "Not saved yet"}
            </span>
            <Button onClick={onSubmit} disabled={pending}>
              {pending ? "Saving & grading…" : "Save 5-Whys"}
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

function padTo<T>(arr: T[] | undefined, len: number): T[] {
  const a = (arr ?? []).slice();
  while (a.length < len) a.push("" as T);
  return a;
}

function formatTime(d: Date): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "short", timeStyle: "short" }).format(d);
}
