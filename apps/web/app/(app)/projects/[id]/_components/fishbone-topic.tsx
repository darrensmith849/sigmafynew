"use client";

import { useState, useTransition } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@sigmafy/ui";
import type { TemplateTopic } from "@sigmafy/db";
import {
  saveFishbone,
  type FishboneContent,
  type FishboneCategoryContent,
} from "../_actions/save-fishbone";
import { OverrideCard, type OverrideDisplay } from "./override-card";
import { GradingCard, type GenericGradingDisplay } from "./grading-card";

const SECTION_LABEL: Record<string, string> = {
  problem: "Problem",
  people: "People",
  machines: "Machines",
  methods: "Methods",
  materials: "Materials",
  measurement: "Measurement",
  environment: "Environment",
  coverage: "Coverage",
  overall: "Overall",
};

const DEFAULT_CATEGORIES: FishboneCategoryContent[] = [
  { name: "People", causes: [""] },
  { name: "Machines", causes: [""] },
  { name: "Methods", causes: [""] },
  { name: "Materials", causes: [""] },
  { name: "Measurement", causes: [""] },
  { name: "Environment", causes: [""] },
];

export function FishboneTopic(props: {
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
  const initial = (props.existingSolution?.content as FishboneContent | undefined) ?? {
    problem: "",
    categories: DEFAULT_CATEGORIES.map((c) => ({ name: c.name, causes: [...c.causes] })),
  };
  const grading = (props.existingSolution?.grading as GenericGradingDisplay | null) ?? null;
  const override = (props.existingSolution?.gradingOverride as OverrideDisplay | null) ?? null;

  const [problem, setProblem] = useState<string>(initial.problem ?? "");
  const [categories, setCategories] = useState<FishboneCategoryContent[]>(() =>
    initial.categories.length === 6
      ? initial.categories
      : padCategories(initial.categories),
  );
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(
    props.existingSolution ? formatTime(props.existingSolution.submittedAt) : null,
  );
  const [error, setError] = useState<string | null>(null);

  const updateCause = (catIdx: number, causeIdx: number, value: string) => {
    setCategories((prev) => {
      const next = prev.map((c) => ({ name: c.name, causes: [...c.causes] }));
      next[catIdx]!.causes[causeIdx] = value;
      return next;
    });
  };

  const addCause = (catIdx: number) => {
    setCategories((prev) => {
      const next = prev.map((c) => ({ name: c.name, causes: [...c.causes] }));
      next[catIdx]!.causes.push("");
      return next;
    });
  };

  const removeCause = (catIdx: number, causeIdx: number) => {
    setCategories((prev) => {
      const next = prev.map((c) => ({ name: c.name, causes: [...c.causes] }));
      const causes = next[catIdx]!.causes;
      if (causes.length <= 1) {
        causes[causeIdx] = "";
      } else {
        causes.splice(causeIdx, 1);
      }
      return next;
    });
  };

  const onSubmit = () => {
    setError(null);
    if (!problem.trim()) {
      setError("Problem statement is required.");
      return;
    }
    const totalCauses = categories.reduce(
      (acc, c) => acc + c.causes.filter((x) => x.trim()).length,
      0,
    );
    if (totalCauses < 3) {
      setError("List at least three candidate causes across the categories.");
      return;
    }
    startTransition(async () => {
      await saveFishbone({
        projectId: props.projectId,
        phaseSlug: props.phaseSlug,
        sectionSlug: props.sectionSlug,
        topicSlug: props.topic.slug,
        content: { problem: problem.trim(), categories },
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
            <Label htmlFor="fishbone-problem">Problem (effect)</Label>
            <Input
              id="fishbone-problem"
              placeholder="What observable problem are you analysing?"
              value={problem}
              onChange={(e) => setProblem(e.currentTarget.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {categories.map((cat, catIdx) => (
              <div
                key={cat.name}
                className="grid gap-2 rounded-md border border-border/60 bg-neutral-50/40 p-3"
              >
                <h4 className="text-sm font-semibold text-foreground">{cat.name}</h4>
                <p className="-mt-1 text-xs text-muted-foreground">
                  {CATEGORY_HINT[cat.name] ?? "Candidate causes from this category."}
                </p>
                <div className="grid gap-2">
                  {cat.causes.map((cause, causeIdx) => (
                    <div key={causeIdx} className="flex items-center gap-2">
                      <Input
                        placeholder="Candidate cause"
                        value={cause}
                        onChange={(e) => updateCause(catIdx, causeIdx, e.currentTarget.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCause(catIdx, causeIdx)}
                        aria-label="Remove cause"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addCause(catIdx)}
                  >
                    + Add cause
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {savedAt ? `Last saved ${savedAt}` : "Not saved yet"}
            </span>
            <Button onClick={onSubmit} disabled={pending}>
              {pending ? "Saving & grading…" : "Save fishbone"}
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

const CATEGORY_HINT: Record<string, string> = {
  People: "Skill, training, fatigue, communication.",
  Machines: "Equipment, tooling, software, infrastructure.",
  Methods: "Procedures, policies, work instructions.",
  Materials: "Inputs, components, raw materials, suppliers.",
  Measurement: "Calibration, gauges, data quality.",
  Environment: "Workspace, ambient conditions, external factors.",
};

function padCategories(existing: FishboneCategoryContent[]): FishboneCategoryContent[] {
  const byName = new Map(existing.map((c) => [c.name, c]));
  return DEFAULT_CATEGORIES.map((d) => {
    const found = byName.get(d.name);
    if (found) return { name: found.name, causes: found.causes.length > 0 ? [...found.causes] : [""] };
    return { name: d.name, causes: [""] };
  });
}

function formatTime(d: Date): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "short", timeStyle: "short" }).format(d);
}
