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

export interface TopicGradedEmailProps {
  recipientName?: string;
  projectName: string;
  topicName: string;
  decision: "approved" | "approved_with_notes" | "needs_revision";
  score: number;
  summary: string;
  topicUrl: string;
}

const decisionLabel: Record<TopicGradedEmailProps["decision"], string> = {
  approved: "Approved",
  approved_with_notes: "Approved with notes",
  needs_revision: "Needs revision",
};

const decisionColor: Record<TopicGradedEmailProps["decision"], string> = {
  approved: "#15803d",
  approved_with_notes: "#b45309",
  needs_revision: "#b91c1c",
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
  meta: { color: "#6b7280", fontSize: 13, margin: "4px 0 24px 0" },
  pill: (decision: TopicGradedEmailProps["decision"]) => ({
    display: "inline-block",
    padding: "6px 14px",
    borderRadius: 999,
    backgroundColor: `${decisionColor[decision]}1a`,
    color: decisionColor[decision],
    fontWeight: 600,
    fontSize: 13,
  }),
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

export function TopicGradedEmail({
  recipientName = "there",
  projectName,
  topicName,
  decision,
  score,
  summary,
  topicUrl,
}: TopicGradedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {`AI feedback on your ${topicName} — ${decisionLabel[decision]} (${score}/100)`}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.brand}>SIGMAFY</Text>
          <Heading as="h1" style={styles.h1}>
            {recipientName}, your {topicName} has feedback.
          </Heading>
          <Text style={styles.meta}>{projectName}</Text>

          <Section style={{ marginBottom: 16 }}>
            <Text style={styles.pill(decision) as Record<string, string | number>}>
              {decisionLabel[decision]} · {score}/100
            </Text>
          </Section>

          <Text style={styles.body_text}>{summary}</Text>

          <Section style={{ margin: "24px 0" }}>
            <Button href={topicUrl} style={styles.button}>
              View full feedback
            </Button>
          </Section>

          <Hr style={styles.hr} />
          <Text style={styles.footer}>
            AI feedback is a starting point. Your trainer or sponsor can override
            it inside Sigmafy.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default TopicGradedEmail;
