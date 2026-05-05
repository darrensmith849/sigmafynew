"use client";

import { useState, useTransition } from "react";
import { Button, Input, Label } from "@sigmafy/ui";
import { inviteToWorkspace, type InviteRole } from "../_actions/invite";

const ROLES: Array<{ value: InviteRole; label: string; hint: string }> = [
  { value: "delegate", label: "Delegate", hint: "Works through a Green Belt project" },
  { value: "trainer", label: "Trainer", hint: "Reviews delegate submissions" },
  { value: "sponsor", label: "Sponsor", hint: "Approves phase sign-off" },
  { value: "admin", label: "Admin", hint: "Manages members and classes" },
  { value: "owner", label: "Owner", hint: "Full workspace control" },
];

export function InviteForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>("delegate");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);
    if (!email.trim()) {
      setError("Enter an email address.");
      return;
    }
    startTransition(async () => {
      try {
        const r = await inviteToWorkspace({ email: email.trim(), role });
        setFeedback(
          r.existed
            ? `An invitation was already pending — re-sent to ${email.trim()}.`
            : `Invitation sent to ${email.trim()}.`,
        );
        setEmail("");
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="invite-email">Email</Label>
        <Input
          id="invite-email"
          type="email"
          inputMode="email"
          placeholder="delegate@example.com"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label>Role</Label>
        <div className="grid gap-2 sm:grid-cols-3">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                role === r.value
                  ? "border-sigmafyBlue-300 bg-sigmafyBlue-50 text-sigmafyBlue-900"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              <div className="font-medium">{r.label}</div>
              <div className="text-xs text-muted-foreground">{r.hint}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {feedback && <p className="text-sm text-sigmafyBlue-700">{feedback}</p>}
        <div className="ml-auto">
          <Button type="submit" disabled={pending}>
            {pending ? "Sending…" : "Send invitation"}
          </Button>
        </div>
      </div>
    </form>
  );
}
