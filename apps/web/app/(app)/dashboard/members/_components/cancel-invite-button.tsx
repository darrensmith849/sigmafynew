"use client";

import { useTransition } from "react";
import { Button } from "@sigmafy/ui";
import { cancelInvitation } from "../_actions/invite";

export function CancelInviteButton({ invitationId }: { invitationId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Cancel this invitation?")) return;
        startTransition(async () => {
          await cancelInvitation(invitationId);
        });
      }}
    >
      {pending ? "Cancelling…" : "Cancel"}
    </Button>
  );
}
