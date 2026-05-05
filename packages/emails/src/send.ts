import { render } from "@react-email/render";
import * as Brevo from "@getbrevo/brevo";
import type { SendEmailInput, SendEmailResult } from "./types";

export interface EmailClientEnv {
  BREVO_API_KEY?: string;
  EMAIL_FROM?: string;
  /** Optional sender display name. Defaults to "Sigmafy". */
  EMAIL_FROM_NAME?: string;
}

/**
 * Send a transactional email via Brevo.
 *
 * Renders the React Email component to HTML, then calls Brevo's
 * /v3/smtp/email endpoint. Caller-side ergonomics: `sendEmail(env, { to,
 * subject, react, workspaceId })` — no Brevo SDK leaks into app code.
 *
 * Phase 0B: workspaceId is captured for future audit-log writes; not yet
 * persisted. Phase 1 will write a row per send.
 */
export async function sendEmail(
  env: EmailClientEnv,
  input: SendEmailInput,
): Promise<SendEmailResult> {
  if (!env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY missing — cannot send email");
  }
  if (!env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM missing — cannot send email");
  }

  const html = await render(input.react);
  const text = input.text ?? (await render(input.react, { plainText: true }));

  const api = new Brevo.TransactionalEmailsApi();
  api.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, env.BREVO_API_KEY);

  const msg = new Brevo.SendSmtpEmail();
  msg.subject = input.subject;
  msg.htmlContent = html;
  msg.textContent = text;
  msg.sender = {
    email: env.EMAIL_FROM,
    name: env.EMAIL_FROM_NAME ?? "Sigmafy",
  };
  msg.to = [{ email: input.to, ...(input.toName ? { name: input.toName } : {}) }];

  const result = await api.sendTransacEmail(msg);
  // Brevo SDK returns { body: { messageId: '...' }, response: ... }
  // Defensive — shape varies slightly across SDK versions.
  const body = (result as unknown as { body?: { messageId?: string } }).body;
  const messageId = body?.messageId ?? "unknown";
  return { id: messageId, status: "sent" };
}
