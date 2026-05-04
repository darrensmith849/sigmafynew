import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

export interface PlaceholderEmailProps {
  recipientName?: string;
}

export function PlaceholderEmail({ recipientName = "there" }: PlaceholderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Sigmafy email template placeholder</Preview>
      <Body style={{ fontFamily: "system-ui, sans-serif", backgroundColor: "#fafafb" }}>
        <Container style={{ padding: "32px", maxWidth: 560 }}>
          <Heading as="h1" style={{ color: "#0e1116" }}>
            Hello {recipientName}
          </Heading>
          <Text style={{ color: "#6b7280" }}>
            This is a Phase -1 placeholder template. Real templates land in
            Phase 0B.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default PlaceholderEmail;
