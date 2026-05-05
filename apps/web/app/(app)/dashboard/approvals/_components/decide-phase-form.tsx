"use client";

import { useState, useTransition } from "react";
import { Button, Label } from "@sigmafy/ui";
import { decidePhaseApproval } from "@/app/(app)/projects/[id]/_actions/phase-approval";

export function DecidePhaseForm(props: { projectId: string; phaseSlug: string }) {
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const decide = (decision: "approved" | "rejected") => {
    if (decision === "rejected" && !note.trim()) {
      setError("A note is required when sending back for revision.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await decidePhaseApproval({
          projectId: props.projectId,
          phaseSlug: props.phaseSlug,
          decision,
          note,
        });
        setNote("");
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    });
  };

  return (
    <div className="grid gap-3">
      <div className="grid gap-1.5">
        <Label htmlFor={`note-${props.projectId}-${props.phaseSlug}`}>
          Notes (required to send back, optional to approve)
        </Label>
        <textarea
          id={`note-${props.projectId}-${props.phaseSlug}`}
          rows={2}
          value={note}
          onChange={(e) => setNote(e.currentTarget.value)}
          placeholder="What's strong, what needs revising."
          className="w-full rounded-md border border-border bg-background p-3 text-sm focus:border-sigmafyBlue-400 focus:outline-none focus:ring-2 focus:ring-sigmafyBlue-100"
        />
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {error && <p className="mr-auto text-sm text-red-600">{error}</p>}
        <Button variant="ghost" disabled={pending} onClick={() => decide("rejected")}>
          {pending ? "…" : "Send back"}
        </Button>
        <Button disabled={pending} onClick={() => decide("approved")}>
          {pending ? "…" : "Approve"}
        </Button>
      </div>
    </div>
  );
}
