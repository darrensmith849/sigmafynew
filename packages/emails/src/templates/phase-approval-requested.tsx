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

export interface PhaseApprovalRequestedEmailProps {
  recipientName?: string;
  workspaceName: string;
  projectName: string;
  phaseLabel: string;
  approvalsUrl: string;
}

const styles = {
  body: { fontFamily: "-apple-system, system-ui, sans-serif", backgroundColor: "#fafafb", margin: 0 },
  container: { padding: "32px 24px", maxWidth: 560, margin: "0 auto" },
  brand: { color: "#1d6dd6", fontSize: 12, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase" as const },
  h1: { color: "#0e1116", fontSize: 22, lineHeight: 1.3, margin: "12px 0 0 0" },
  body_text: { color: "#374151", fontSize: 15, lineHeight: 1.6 },
  hr: { borderColor: "#e5e7eb", margin: "32px 0" },
  button: { backgroundColor: "#1d6dd6", color: "#ffffff", padding: "12px 24px", borderRadius: 999, textDecoration: "none", fontWeight: 600, display: "inline-block" },
  footer: { color: "#9ca3af", fontSize: 12, marginTop: 32 },
};

export function PhaseApprovalRequestedEmail({
  recipientName = "there",
  workspaceName,
  projectName,
  phaseLabel,
  approvalsUrl,
}: PhaseApprovalRequestedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`${projectName} — ${phaseLabel} ready for review`}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.brand}>SIGMAFY</Text>
          <Heading as="h1" style={styles.h1}>
            {recipientName}, a phase is ready to review.
          </Heading>
          <Section>
            <Text style={styles.body_text}>
              In <strong>{workspaceName}</strong>, the <strong>{phaseLabel}</strong> phase
              of <strong>{projectName}</strong> has been submitted for sign-off.
            </Text>
            <Section style={{ margin: "24px 0" }}>
              <Button href={approvalsUrl} style={styles.button}>
                Open approvals queue
              </Button>
            </Section>
          </Section>
          <Hr style={styles.hr} />
          <Text style={styles.footer}>
            You&apos;re receiving this because you&apos;re a sponsor, admin, or owner of
            this workspace.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default PhaseApprovalRequestedEmail;
