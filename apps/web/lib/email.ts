import {
  sendEmail,
  WelcomeEmail,
  TopicGradedEmail,
  WorkspaceInvitationEmail,
  type EmailClientEnv,
} from "@sigmafy/emails";

function env(): EmailClientEnv {
  return {
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME ?? "Sigmafy",
  };
}

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://web-seven-gold-84.vercel.app";
}

/**
 * Fire-and-forget welcome email at signup.
 *
 * Failures are logged but never thrown — a failed welcome email must not
 * break the bootstrap path. Phase 0B Slice 4 moves this to Inngest so it's
 * retried automatically.
 */
export async function sendWelcomeEmail(args: {
  to: string;
  toName?: string;
  workspaceName: string;
  workspaceId: string;
}): Promise<void> {
  try {
    await sendEmail(env(), {
      to: args.to,
      toName: args.toName,
      subject: `Welcome to Sigmafy — ${args.workspaceName} is ready`,
      react: WelcomeEmail({
        recipientName: args.toName?.split(" ")[0],
        workspaceName: args.workspaceName,
        dashboardUrl: `${appUrl()}/dashboard`,
      }),
      workspaceId: args.workspaceId,
    });
  } catch (err) {
    console.error("[email] welcome failed (non-blocking):", err);
  }
}

/**
 * Fire-and-forget workspace invitation email.
 *
 * Failure is logged but never throws — invitation row exists in the DB
 * regardless, and the inviter can copy the accept link manually if needed.
 */
export async function sendWorkspaceInvitationEmail(args: {
  to: string;
  inviterName: string;
  workspaceName: string;
  workspaceId: string;
  role: "owner" | "admin" | "sponsor" | "trainer" | "delegate";
  token: string;
}): Promise<void> {
  try {
    await sendEmail(env(), {
      to: args.to,
      subject: `${args.inviterName} invited you to ${args.workspaceName} on Sigmafy`,
      react: WorkspaceInvitationEmail({
        inviterName: args.inviterName,
        workspaceName: args.workspaceName,
        role: args.role,
        acceptUrl: `${appUrl()}/accept-invite/${args.token}`,
      }),
      workspaceId: args.workspaceId,
    });
  } catch (err) {
    console.error("[email] workspace-invitation failed (non-blocking):", err);
  }
}

/**
 * Fire-and-forget topic-graded email after AI grading completes.
 *
 * Failures are logged but never thrown — grading-result delivery is best
 * effort in 0B; the user can always see the grading inline on the project
 * page after refresh.
 */
export async function sendTopicGradedEmail(args: {
  to: string;
  toName?: string;
  workspaceId: string;
  projectId: string;
  projectName: string;
  topicName: string;
  decision: "approved" | "approved_with_notes" | "needs_revision";
  score: number;
  summary: string;
}): Promise<void> {
  try {
    await sendEmail(env(), {
      to: args.to,
      toName: args.toName,
      subject: `${args.topicName} feedback — ${args.score}/100`,
      react: TopicGradedEmail({
        recipientName: args.toName?.split(" ")[0],
        projectName: args.projectName,
        topicName: args.topicName,
        decision: args.decision,
        score: args.score,
        summary: args.summary,
        topicUrl: `${appUrl()}/projects/${args.projectId}`,
      }),
      workspaceId: args.workspaceId,
    });
  } catch (err) {
    console.error("[email] topic-graded failed (non-blocking):", err);
  }
}
