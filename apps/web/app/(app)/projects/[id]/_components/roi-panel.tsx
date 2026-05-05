"use client";

import { useState, useTransition } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@sigmafy/ui";
import { saveProjectRoi } from "../_actions/save-roi";

export function RoiPanel(props: {
  projectId: string;
  initialZarRands: number | null;
}) {
  const [value, setValue] = useState<string>(
    props.initialZarRands !== null ? String(props.initialZarRands) : "",
  );
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSave = () => {
    setError(null);
    const trimmed = value.trim();
    let zarRands: number | null = null;
    if (trimmed !== "") {
      const parsed = Number(trimmed.replace(/[, ]/g, ""));
      if (!Number.isFinite(parsed) || parsed < 0) {
        setError("ROI must be a non-negative number in ZAR.");
        return;
      }
      zarRands = parsed;
    }
    startTransition(async () => {
      await saveProjectRoi({ projectId: props.projectId, zarRands });
      setSavedAt(new Date().toLocaleTimeString());
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimated annual ROI</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <p className="text-sm text-muted-foreground">
          Your best estimate of annual savings, in South African Rand. Visible
          to your sponsor and admins. Edit any time.
        </p>
        <div className="grid gap-2">
          <Label htmlFor="roi">ZAR per year</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">R</span>
            <Input
              id="roi"
              inputMode="decimal"
              placeholder="e.g. 250000"
              value={value}
              onChange={(e) => setValue(e.currentTarget.value)}
            />
            <Button onClick={onSave} disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {savedAt && !error && (
          <p className="text-xs text-muted-foreground">Saved {savedAt}.</p>
        )}
      </CardContent>
    </Card>
  );
}
