"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label } from "@sigmafy/ui";
import { createClass } from "../_actions/classes";

export function CreateClassForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Class name is required.");
      return;
    }
    startTransition(async () => {
      try {
        const r = await createClass({
          name: name.trim(),
          description: description.trim() || undefined,
          startsOn: startsOn || undefined,
          endsOn: endsOn || undefined,
        });
        router.push(`/dashboard/classes/${r.classId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="class-name">Name</Label>
        <Input
          id="class-name"
          placeholder="e.g. SSA Green Belt — 2026 Q3 Cohort"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="class-description">Description (optional)</Label>
        <textarea
          id="class-description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          placeholder="Anything trainers and delegates should know about this cohort."
          className="w-full rounded-md border border-border bg-background p-3 text-sm focus:border-sigmafyBlue-400 focus:outline-none focus:ring-2 focus:ring-sigmafyBlue-100"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="class-starts-on">Starts on (optional)</Label>
          <Input
            id="class-starts-on"
            type="date"
            value={startsOn}
            onChange={(e) => setStartsOn(e.currentTarget.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="class-ends-on">Ends on (optional)</Label>
          <Input
            id="class-ends-on"
            type="date"
            value={endsOn}
            onChange={(e) => setEndsOn(e.currentTarget.value)}
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3">
        {error && <p className="mr-auto text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create class"}
        </Button>
      </div>
    </form>
  );
}
