import type { ReactElement } from "react";

export interface SendEmailInput {
  to: string;
  subject: string;
  react: ReactElement;
  /** Workspace context for audit logging in Phase 0B+. */
  workspaceId: string;
}

export interface SendEmailResult {
  id: string;
  status: "queued" | "sent";
}
