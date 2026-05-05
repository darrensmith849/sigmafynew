"use client";

import { useState, useTransition } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@sigmafy/ui";
import { setProjectStatus } from "../_actions/complete-project";

export function CompletionPanel(props: {
  projectId: string;
  status: "draft" | "active" | "completed" | "archived";
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onComplete = () => {
    if (!confirm("Mark this project complete? You can reopen it later if needed.")) return;
    setError(null);
    startTransition(async () => {
      try {
        await setProjectStatus({ projectId: props.projectId, status: "completed" });
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    });
  };

  const onReopen = () => {
    setError(null);
    startTransition(async () => {
      try {
        await setProjectStatus({ projectId: props.projectId, status: "active" });
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    });
  };

  if (props.status === "completed") {
    return (
      <Card className="border-green-200 bg-green-50/40">
        <CardHeader>
          <CardTitle>Project completed 🎉</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <p className="text-foreground">
            Download the SSA-style PDF certificate for this project. Sponsors and
            admins can re-issue it any time.
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={`/api/certificates/${props.projectId}`}
              className="inline-flex items-center justify-center rounded-full bg-sigmafyBlue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sigmafyBlue-700"
            >
              Download certificate
            </a>
            <Button variant="ghost" onClick={onReopen} disabled={pending}>
              {pending ? "Reopening…" : "Reopen project"}
            </Button>
          </div>
          {error && <p className="text-red-700">{error}</p>}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wrap up</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <p className="text-muted-foreground">
          When the project is done — phases approved, ROI captured —
          mark it complete to unlock the certificate PDF.
        </p>
        <div className="flex justify-end">
          <Button onClick={onComplete} disabled={pending}>
            {pending ? "Saving…" : "Mark project complete"}
          </Button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </CardContent>
    </Card>
  );
}
