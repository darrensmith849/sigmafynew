"use client";

import { useState, useTransition } from "react";
import { Button, Label } from "@sigmafy/ui";
import { enrolMember, type EnrolRole } from "../_actions/classes";

const ROLES: Array<{ value: EnrolRole; label: string }> = [
  { value: "delegate", label: "Delegate" },
  { value: "trainer", label: "Trainer" },
  { value: "sponsor", label: "Sponsor" },
];

export function EnrolMemberForm(props: {
  classId: string;
  eligible: Array<{ userId: string; email: string; fullName: string | null; role: string }>;
}) {
  const [userId, setUserId] = useState<string>(props.eligible[0]?.userId ?? "");
  const [role, setRole] = useState<EnrolRole>("delegate");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!userId) {
      setError("Pick a member to enrol.");
      return;
    }
    startTransition(async () => {
      try {
        await enrolMember({ classId: props.classId, userId, role });
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="enrol-user">Workspace member</Label>
        <select
          id="enrol-user"
          value={userId}
          onChange={(e) => setUserId(e.currentTarget.value)}
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
        >
          {props.eligible.map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.fullName ?? m.email} ({m.email}) — {m.role}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label>Role in this class</Label>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                role === r.value
                  ? "border-sigmafyBlue-300 bg-sigmafyBlue-50 text-sigmafyBlue-900"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        {role === "delegate" && (
          <p className="text-xs text-muted-foreground">
            A Green Belt project will be auto-created for them on enrolment.
          </p>
        )}
      </div>
      <div className="flex items-center justify-end gap-3">
        {error && <p className="mr-auto text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? "Enrolling…" : "Enrol"}
        </Button>
      </div>
    </form>
  );
}
