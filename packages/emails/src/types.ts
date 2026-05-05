import type { ReactElement } from "react";

export interface SendEmailInput {
  to: string;
  /** Optional recipient display name. */
  toName?: string;
  subject: string;
  /** A React Email component. Rendered to HTML server-side via @react-email/render. */
  react: ReactElement;
  /** Workspace context for audit logging in Phase 0B+. */
  workspaceId: string;
  /** Optional plain-text fallback. If omitted, the rendered HTML is used as-is. */
  text?: string;
}

export interface SendEmailResult {
  /** Brevo's messageId, or "queued" when offline (Phase -1). */
  id: string;
  status: "queued" | "sent";
}
