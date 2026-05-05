"use client";

import { useTransition } from "react";
import { Button } from "@sigmafy/ui";
import { removeEnrolment } from "../_actions/classes";

export function RemoveEnrolmentButton(props: { enrolmentId: string; classId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Remove this enrolment?")) return;
        startTransition(async () => {
          await removeEnrolment(props.enrolmentId, props.classId);
        });
      }}
    >
      {pending ? "Removing…" : "Remove"}
    </Button>
  );
}
