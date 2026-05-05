import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export interface WorkspaceInvitationEmailProps {
  inviterName: string;
  workspaceName: string;
  role: "owner" | "admin" | "sponsor" | "trainer" | "delegate";
  acceptUrl: string;
}

const ROLE_DESC: Record<WorkspaceInvitationEmailProps["role"], string> = {
  owner: "as a workspace owner",
  admin: "as a workspace admin",
  sponsor: "as a project sponsor",
  trainer: "as a trainer",
  delegate: "as a delegate (you'll work through a Green Belt project)",
};

const styles = {
  body: { fontFamily: "-apple-system, system-ui, sans-serif", backgroundColor: "#fafafb", margin: 0 },
  container: { padding: "32px 24px", maxWidth: 560, margin: "0 auto" },
  brand: {
    color: "#1d6dd6",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 1.2,
    textTransform: "uppercase" as const,
  },
  h1: { color: "#0e1116", fontSize: 22, lineHeight: 1.3, margin: "12px 0 0 0" },
  body_text: { color: "#374151", fontSize: 15, lineHeight: 1.6 },
  hr: { borderColor: "#e5e7eb", margin: "32px 0" },
  button: {
    backgroundColor: "#1d6dd6",
    color: "#ffffff",
    padding: "12px 24px",
    borderRadius: 999,
    textDecoration: "none",
    fontWeight: 600,
    display: "inline-block",
  },
  footer: { color: "#9ca3af", fontSize: 12, marginTop: 32 },
};

export function WorkspaceInvitationEmail({
  inviterName,
  workspaceName,
  role,
  acceptUrl,
}: WorkspaceInvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {`${inviterName} invited you to ${workspaceName} on Sigmafy`}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.brand}>SIGMAFY</Text>
          <Heading as="h1" style={styles.h1}>
            You&apos;re invited to {workspaceName}.
          </Heading>
          <Section>
            <Text style={styles.body_text}>
              {inviterName} added you to the <strong>{workspaceName}</strong>{" "}
              workspace on Sigmafy {ROLE_DESC[role]}.
            </Text>
            <Text style={styles.body_text}>
              Accept the invite below — sign in (or sign up) with this email
              address and the workspace will be available right away.
            </Text>
            <Section style={{ margin: "24px 0" }}>
              <Button href={acceptUrl} style={styles.button}>
                Accept invitation
              </Button>
            </Section>
          </Section>
          <Hr style={styles.hr} />
          <Text style={styles.footer}>
            This invitation expires in 14 days. If you weren&apos;t expecting
            it, ignore the email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default WorkspaceInvitationEmail;
