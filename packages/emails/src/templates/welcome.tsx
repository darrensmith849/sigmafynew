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

export interface WelcomeEmailProps {
  recipientName?: string;
  workspaceName: string;
  dashboardUrl: string;
}

const styles = {
  body: { fontFamily: "-apple-system, system-ui, sans-serif", backgroundColor: "#fafafb", margin: 0 },
  container: { padding: "32px 24px", maxWidth: 560, margin: "0 auto" },
  brand: {
    color: "#1d6dd6", // Sigmafy blue
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 1.2,
    textTransform: "uppercase" as const,
  },
  h1: { color: "#0e1116", fontSize: 24, lineHeight: 1.3, margin: "12px 0 0 0" },
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

export function WelcomeEmail({
  recipientName = "there",
  workspaceName,
  dashboardUrl,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Sigmafy — your Green Belt workspace is ready.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.brand}>SIGMAFY</Text>
          <Heading as="h1" style={styles.h1}>
            Welcome, {recipientName}.
          </Heading>
          <Section>
            <Text style={styles.body_text}>
              Your workspace <strong>{workspaceName}</strong> is ready, and your
              starter Green Belt project is waiting for you.
            </Text>
            <Text style={styles.body_text}>
              Head into the project, fill out the SIPOC, and the AI Copilot
              will give you instant feedback. Try a Pareto run when you&apos;ve
              got data to look at.
            </Text>
            <Section style={{ margin: "24px 0" }}>
              <Button href={dashboardUrl} style={styles.button}>
                Open my workspace
              </Button>
            </Section>
          </Section>
          <Hr style={styles.hr} />
          <Text style={styles.footer}>
            You received this because someone signed up to Sigmafy with this
            email address. If that wasn&apos;t you, ignore this message.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default WelcomeEmail;
