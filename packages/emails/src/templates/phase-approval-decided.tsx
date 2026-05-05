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

export interface PhaseApprovalDecidedEmailProps {
  recipientName?: string;
  projectName: string;
  phaseLabel: string;
  decision: "approved" | "rejected";
  note: string;
  decidedByName: string;
  projectUrl: string;
}

const styles = {
  body: { fontFamily: "-apple-system, system-ui, sans-serif", backgroundColor: "#fafafb", margin: 0 },
  container: { padding: "32px 24px", maxWidth: 560, margin: "0 auto" },
  brand: { color: "#1d6dd6", fontSize: 12, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase" as const },
  h1: { color: "#0e1116", fontSize: 22, lineHeight: 1.3, margin: "12px 0 0 0" },
  body_text: { color: "#374151", fontSize: 15, lineHeight: 1.6 },
  hr: { borderColor: "#e5e7eb", margin: "32px 0" },
  button: { backgroundColor: "#1d6dd6", color: "#ffffff", padding: "12px 24px", borderRadius: 999, textDecoration: "none", fontWeight: 600, display: "inline-block" },
  pill: (decision: "approved" | "rejected") => ({
    display: "inline-block",
    padding: "6px 14px",
    borderRadius: 999,
    backgroundColor: decision === "approved" ? "#15803d1a" : "#b91c1c1a",
    color: decision === "approved" ? "#15803d" : "#b91c1c",
    fontWeight: 600,
    fontSize: 13,
  }),
  footer: { color: "#9ca3af", fontSize: 12, marginTop: 32 },
};

export function PhaseApprovalDecidedEmail({
  recipientName = "there",
  projectName,
  phaseLabel,
  decision,
  note,
  decidedByName,
  projectUrl,
}: PhaseApprovalDecidedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`${phaseLabel} ${decision === "approved" ? "approved" : "needs revision"}`}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.brand}>SIGMAFY</Text>
          <Heading as="h1" style={styles.h1}>
            {recipientName}, your {phaseLabel} phase has feedback.
          </Heading>
          <Section style={{ marginBottom: 16 }}>
            <Text style={styles.pill(decision) as Record<string, string | number>}>
              {decision === "approved" ? "Approved" : "Needs revision"}
            </Text>
          </Section>
          <Text style={styles.body_text}>
            <strong>{decidedByName}</strong> reviewed the {phaseLabel} phase of
            <strong> {projectName}</strong>{decision === "approved" ? " and approved it" : " and asked for revisions"}.
          </Text>
          {note && (
            <Text style={styles.body_text}>
              <em>“{note}”</em>
            </Text>
          )}
          <Section style={{ margin: "24px 0" }}>
            <Button href={projectUrl} style={styles.button}>
              Open the project
            </Button>
          </Section>
          <Hr style={styles.hr} />
          <Text style={styles.footer}>
            You can resubmit the phase after addressing the notes.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default PhaseApprovalDecidedEmail;
