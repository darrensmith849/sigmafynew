export { sendEmail, type EmailClientEnv } from "./send";
export { WelcomeEmail, type WelcomeEmailProps } from "./templates/welcome";
export {
  TopicGradedEmail,
  type TopicGradedEmailProps,
} from "./templates/topic-graded";
export {
  WorkspaceInvitationEmail,
  type WorkspaceInvitationEmailProps,
} from "./templates/workspace-invitation";
export {
  PhaseApprovalRequestedEmail,
  type PhaseApprovalRequestedEmailProps,
} from "./templates/phase-approval-requested";
export {
  PhaseApprovalDecidedEmail,
  type PhaseApprovalDecidedEmailProps,
} from "./templates/phase-approval-decided";
export type { SendEmailInput, SendEmailResult } from "./types";
