import type { SendEmailInput, SendEmailResult } from "./types";

const PHASE_MINUS_ONE = "email send not implemented in Phase -1 — see docs/phase-log.md";

export interface EmailClientEnv {
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
}

/**
 * Send a transactional email through Resend.
 *
 * Phase -1: signature only. Throws "not implemented" so callers fail loudly
 * rather than silently dropping mail.
 */
export async function sendEmail(_env: EmailClientEnv, _input: SendEmailInput): Promise<SendEmailResult> {
  throw new Error(PHASE_MINUS_ONE);
}
