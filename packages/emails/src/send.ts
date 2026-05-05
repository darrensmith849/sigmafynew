import type { SendEmailInput, SendEmailResult } from "./types";

const PHASE_0A_NOT_WIRED =
  "email send not wired yet — Brevo adapter lands in Phase 0B (see docs/master-build-plan.md §15).";

export interface EmailClientEnv {
  BREVO_API_KEY?: string;
  EMAIL_FROM?: string;
}

/**
 * Send a transactional email via Brevo.
 *
 * Phase 0A: signature only. Throws "not wired" so callers fail loudly rather
 * than silently dropping mail. Phase 0B renders the React Email component to
 * HTML and POSTs to Brevo's transactional endpoint.
 */
export async function sendEmail(_env: EmailClientEnv, _input: SendEmailInput): Promise<SendEmailResult> {
  throw new Error(PHASE_0A_NOT_WIRED);
}
