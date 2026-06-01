import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Chip } from "@sigmafy/ui";
import { mockCertificate } from "../_data/certificate";
import { mockLearner } from "../_data/learner";
import { SectionHeader } from "./shell";

const ROUTE = "/white-belt-funnel-preview";

export function CertificateTab() {
  return (
    <div className="flex flex-col gap-10">
      <SectionHeader
        eyebrow="Step 2 — Certificate"
        title="The dopamine page"
        description="A short, polished win. The certificate is the artefact; the page itself is what converts. Conversion CTAs sit immediately below."
      />
      <CertificatePage />
      <WhatsNext />
    </div>
  );
}

function CertificatePage() {
  const c = mockCertificate;
  return (
    <Card>
      <CardHeader>
        <Chip tint="training">Certificate · ID {c.certificateId}</Chip>
        <CardTitle>Congratulations, {mockLearner.fullName.split(" ")[0]}</CardTitle>
        <p className="text-[14px] text-muted-foreground">
          You&apos;ve completed {c.courseTitle}. This is the moment most learners
          tell us they realised they could keep going.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <CertificateCard />
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
          <p className="text-[12px] text-muted-foreground">
            PDF download and share actions are placeholders in this prototype.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" size="md">Download PDF</Button>
            <Button variant="outline" size="md">Share certificate</Button>
            <Button variant="ghost" size="md">Add to LinkedIn</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CertificateCard() {
  const c = mockCertificate;
  return (
    <div
      className="relative overflow-hidden rounded-card border p-10"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--tint-training) 4%, var(--color-surface))",
        borderColor:
          "color-mix(in srgb, var(--tint-training) 22%, transparent)",
      }}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {c.issuedBy}
        </p>
        <h3 className="text-[28px] font-semibold tracking-tight text-fg">
          Certificate of Completion
        </h3>
        <p className="text-[13px] text-muted-foreground">
          This is to certify that
        </p>
        <p className="text-[24px] font-semibold text-fg">{c.learnerName}</p>
        <p className="text-[13px] text-muted-foreground">
          has successfully completed
        </p>
        <p className="text-[18px] font-medium text-fg">{c.courseTitle}</p>
        <p className="mt-4 text-[12px] text-muted-foreground">
          {c.completionDate} · Verify at {c.verificationUrl}
        </p>
      </div>
    </div>
  );
}

function WhatsNext() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>What&apos;s next?</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          Pick your direction. Most graduates choose Yellow Belt within a week.
        </p>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <NextStep
          eyebrow="Next belt"
          title="Yellow Belt"
          description="Apply DMAIC to a real problem under a coach."
          ctaLabel="View Yellow Belt"
          href={`${ROUTE}?tab=upgrade`}
          primary
        />
        <NextStep
          eyebrow="For your company"
          title="Bring Six Sigma in-house"
          description="Custom 2KO training cohort + Sigmafy for project tracking."
          ctaLabel="Request a proposal"
          href={`${ROUTE}?tab=referral`}
        />
        <NextStep
          eyebrow="Your portal"
          title="Post-course portal"
          description="All next-best actions in one place."
          ctaLabel="Open portal"
          href={`${ROUTE}?tab=portal`}
        />
      </CardContent>
    </Card>
  );
}

function NextStep({
  eyebrow,
  title,
  description,
  ctaLabel,
  href,
  primary,
}: {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  primary?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-card border border-border-subtle bg-surface p-4">
      <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        {eyebrow}
      </p>
      <p className="text-base font-medium text-fg">{title}</p>
      <p className="text-[13px] text-muted-foreground">{description}</p>
      <Button
        variant={primary ? "primary" : "outline"}
        size="sm"
        className="mt-auto self-start"
        asChild
      >
        <Link href={href}>{ctaLabel}</Link>
      </Button>
    </div>
  );
}
