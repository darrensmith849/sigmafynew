"use client";

import { useState, useTransition } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Label } from "@sigmafy/ui";
import {
  overrideTopicGrading,
  type OverrideDecision,
} from "../_actions/override-grading";

export interface OverrideDisplay {
  decision: OverrideDecision;
  note: string;
  overriddenBy: { userId: string; email: string; role: string };
  overriddenAt: string;
}

const DECISION_LABEL: Record<OverrideDecision, string> = {
  approved: "Approved",
  approved_with_notes: "Approved with notes",
  needs_revision: "Needs revision",
};

const DECISION_STYLE: Record<OverrideDecision, string> = {
  approved: "bg-green-50 text-green-800 border-green-200",
  approved_with_notes: "bg-amber-50 text-amber-800 border-amber-200",
  needs_revision: "bg-red-50 text-red-800 border-red-200",
};

/**
 * Trainer/sponsor/admin override panel.
 *
 * Two states:
 *   - No override yet — shows a "Override AI feedback" expandable form.
 *   - Override set — shows the override prominently and an "Edit / Clear"
 *     button. The original AI grading remains rendered (collapsed) below.
 */
export function OverrideCard(props: {
  projectId: string;
  topicSolutionId: string;
  override: OverrideDisplay | null;
}) {
  const [open, setOpen] = useState(props.override !== null);
  const [decision, setDecision] = useState<OverrideDecision>(
    props.override?.decision ?? "approved_with_notes",
  );
  const [note, setNote] = useState(props.override?.note ?? "");
  const [pending, startTransition] = useTransition();

  const onSave = () => {
    startTransition(async () => {
      await overrideTopicGrading({
        projectId: props.projectId,
        topicSolutionId: props.topicSolutionId,
        decision,
        note,
      });
    });
  };

  const onClear = () => {
    if (!confirm("Clear this override? The AI grading will become the live decision again.")) {
      return;
    }
    startTransition(async () => {
      await overrideTopicGrading({
        projectId: props.projectId,
        topicSolutionId: props.topicSolutionId,
        decision: null,
        note: "",
      });
    });
  };

  // Rendered override (read-only summary)
  if (props.override && !open) {
    return (
      <Card className="border-sigmafyBlue-200 bg-sigmafyBlue-50/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Trainer override</CardTitle>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                DECISION_STYLE[props.override.decision]
              }`}
            >
              {DECISION_LABEL[props.override.decision]}
            </span>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3">
          {props.override.note && (
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {props.override.note}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            By {props.override.overriddenBy.email} ({props.override.overriddenBy.role}) ·
            {" "}
            {new Date(props.override.overriddenAt).toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setOpen(true)} disabled={pending}>
              Edit
            </Button>
            <Button size="sm" variant="ghost" onClick={onClear} disabled={pending}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Inline form (either editing existing or adding new)
  if (open) {
    return (
      <Card className="border-sigmafyBlue-200 bg-sigmafyBlue-50/30">
        <CardHeader>
          <CardTitle>
            {props.override ? "Edit trainer override" : "Override AI feedback"}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm text-muted-foreground">
            Your decision replaces the AI grading as the live verdict on this submission.
            The AI feedback stays visible below for reference.
          </p>
          <div className="grid gap-2">
            <Label>Decision</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(DECISION_LABEL) as OverrideDecision[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDecision(d)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    decision === d
                      ? DECISION_STYLE[d]
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {DECISION_LABEL[d]}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="override-note">Notes for the delegate</Label>
            <textarea
              id="override-note"
              value={note}
              onChange={(e) => setNote(e.currentTarget.value)}
              rows={4}
              className="w-full rounded-md border border-border bg-background p-3 text-sm focus:border-sigmafyBlue-400 focus:outline-none focus:ring-2 focus:ring-sigmafyBlue-100"
              placeholder="What's good. What needs revising. Be specific."
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={pending}>
              {pending ? "Saving…" : "Save override"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default: collapsed, no override yet
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="self-start rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-sigmafyBlue-300 hover:bg-sigmafyBlue-50 hover:text-sigmafyBlue-700"
    >
      Override AI feedback
    </button>
  );
}
