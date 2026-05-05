"use client";

import { useState, useTransition } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@sigmafy/ui";
import { submitPhaseForApproval } from "../_actions/phase-approval";

export interface PhaseApprovalSummary {
  phaseSlug: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: Date;
  decidedAt: Date | null;
  note: string | null;
}

const STATUS_STYLE = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  approved: "border-green-200 bg-green-50 text-green-800",
  rejected: "border-red-200 bg-red-50 text-red-800",
} as const;

const STATUS_LABEL = {
  pending: "Pending sponsor review",
  approved: "Approved",
  rejected: "Needs revision",
} as const;

export function PhaseApprovalPanel(props: {
  projectId: string;
  phaseSlug: string;
  phaseName: string;
  approval: PhaseApprovalSummary | null;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = () => {
    setError(null);
    startTransition(async () => {
      try {
        await submitPhaseForApproval({
          projectId: props.projectId,
          phaseSlug: props.phaseSlug,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    });
  };

  if (props.approval) {
    return (
      <Card className={STATUS_STYLE[props.approval.status]}>
        <CardHeader>
          <CardTitle>{props.phaseName} — {STATUS_LABEL[props.approval.status]}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <p className="text-foreground">
            Submitted {new Date(props.approval.submittedAt).toLocaleString()}
            {props.approval.decidedAt && (
              <>
                {" · decided "}
                {new Date(props.approval.decidedAt).toLocaleString()}
              </>
            )}
          </p>
          {props.approval.note && (
            <p className="rounded-md bg-white/40 p-3 italic">“{props.approval.note}”</p>
          )}
          {props.approval.status === "rejected" && (
            <div>
              <Button onClick={onSubmit} disabled={pending}>
                {pending ? "Re-submitting…" : "Re-submit for review"}
              </Button>
            </div>
          )}
          {error && <p className="text-red-700">{error}</p>}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phase sign-off</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <p className="text-muted-foreground">
          When you&apos;ve completed the {props.phaseName} topics, submit the
          phase for your sponsor to review and approve.
        </p>
        <div className="flex justify-end">
          <Button onClick={onSubmit} disabled={pending}>
            {pending ? "Submitting…" : `Submit ${props.phaseName} for review`}
          </Button>
        </div>
        {error && <p className="text-red-600">{error}</p>}
      </CardContent>
    </Card>
  );
}
