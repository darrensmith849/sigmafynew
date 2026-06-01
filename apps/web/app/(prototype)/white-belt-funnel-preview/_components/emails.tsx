import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Chip } from "@sigmafy/ui";
import { mockEmailTemplates, type EmailTemplate } from "../_data/email-templates";
import { SectionHeader } from "./shell";
import { SequenceBars } from "./sequence-bars";
import { IconMail } from "./icons";

const ROUTE = "/white-belt-funnel-preview";

const CATEGORY_TINT: Record<EmailTemplate["category"], string> = {
  transactional: "spc",
  upgrade: "training",
  referral: "ai",
  company: "projects",
  reseller: "admin",
  stats: "spc",
  reminder: "admin",
  sales: "ai",
  reengagement: "training",
};

export function EmailsTab({ templateId }: { templateId?: string }) {
  const selected =
    mockEmailTemplates.find((t) => t.id === templateId) ?? mockEmailTemplates[0]!;
  return (
    <div className="flex flex-col gap-10">
      <SectionHeader
        eyebrow="Step 13 — Email templates"
        title="11 funnel emails"
        description="Subject, preview text, body, CTA, trigger, audience, and delay timing for every email in the post–White Belt sequence. No real send."
      />
      <SequenceTimeline templates={mockEmailTemplates} />
      <div className="grid gap-6 lg:grid-cols-[3fr_4fr]">
        <EmailTemplateLibrary
          templates={mockEmailTemplates}
          selectedId={selected.id}
        />
        <EmailTemplatePreview template={selected} />
      </div>
    </div>
  );
}

function SequenceTimeline({ templates }: { templates: EmailTemplate[] }) {
  const events = templates.map((t) => ({
    id: t.id,
    label: t.name,
    day: Math.max(0, Math.min(21, Math.round(t.delayHours / 24))),
    tint: (CATEGORY_TINT[t.category] as
      | "projects"
      | "spc"
      | "training"
      | "ai"
      | "admin"
      | undefined) ?? undefined,
  }));
  return (
    <Card data-reveal>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Sequence timeline · 21-day window</CardTitle>
          <Chip>Mock cadence</Chip>
        </div>
        <p className="text-[13px] text-muted-foreground">
          When each template would fire from completion. Dots are tinted by
          category. Hover for the template name.
        </p>
      </CardHeader>
      <CardContent>
        <SequenceBars events={events} totalDays={21} />
      </CardContent>
    </Card>
  );
}

function EmailTemplateLibrary({
  templates,
  selectedId,
}: {
  templates: EmailTemplate[];
  selectedId: string;
}) {
  return (
    <Card data-reveal>
      <CardHeader>
        <CardTitle>Template library</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          {templates.length} templates · click to preview.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border-subtle">
          {templates.map((t) => {
            const selected = t.id === selectedId;
            return (
              <li
                key={t.id}
                className={selected ? "bg-surface-2" : "hover:bg-surface-2"}
              >
                <Link
                  href={`${ROUTE}?tab=emails&template=${t.id}`}
                  prefetch={false}
                  className="block px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-fg">{t.name}</p>
                    <Chip
                      tint={
                        CATEGORY_TINT[t.category] as
                          | "projects"
                          | "spc"
                          | "training"
                          | "ai"
                          | "admin"
                          | undefined
                      }
                    >
                      {t.category}
                    </Chip>
                  </div>
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    {t.subject}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function EmailTemplatePreview({ template }: { template: EmailTemplate }) {
  return (
    <Card data-reveal>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>{template.name}</CardTitle>
          <Chip
            tint={
              CATEGORY_TINT[template.category] as
                | "projects"
                | "spc"
                | "training"
                | "ai"
                | "admin"
                | undefined
            }
          >
            {template.category}
          </Chip>
        </div>
        <dl className="grid gap-3 text-[12px] sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">Trigger</dt>
            <dd className="font-medium text-fg">
              <code className="text-[11px]">{template.triggerEvent}</code>
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Audience</dt>
            <dd className="font-medium text-fg">{template.targetAudience}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Delay</dt>
            <dd className="font-medium text-fg">
              {template.delayHours === 0
                ? "Immediate"
                : `${template.delayHours}h`}
            </dd>
          </div>
          <div className="sm:col-span-3">
            <dt className="text-muted-foreground">Trigger detail</dt>
            <dd className="text-[12px] text-fg">{template.triggerNote}</dd>
          </div>
        </dl>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-card border border-border bg-surface">
          <div
            className="flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-3 text-[11px]"
            style={{
              backgroundColor: "var(--color-surface-2)",
            }}
          >
            <div className="flex items-center gap-2">
              <IconMail
                className="h-4 w-4"
                style={{ color: "var(--color-muted)" }}
              />
              <span className="font-medium text-fg">From:</span>
              <span className="text-muted-foreground">
                Six Sigma South Africa &lt;hello@six-sigma.example&gt;
              </span>
            </div>
            <span className="text-muted-foreground">To: you@example.com</span>
          </div>
          <div className="px-5 pb-5 pt-4">
            <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              Subject
            </p>
            <p className="mt-1 text-base font-medium text-fg">
              {template.subject}
            </p>
            <p className="mt-2 text-[12px] italic text-muted-foreground">
              {template.previewText}
            </p>
            <hr className="my-4 border-border-subtle" />
            <div className="flex flex-col gap-3 text-[14px] leading-relaxed text-fg">
              {template.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          <div className="mt-5 flex justify-start">
            <span
              className="inline-flex items-center rounded-pill border px-4 py-2 text-[13px] font-medium"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "var(--color-accent-fg)",
                borderColor: "var(--color-accent)",
              }}
            >
              {template.ctaLabel}
            </span>
          </div>
            <p className="mt-4 text-[11px] text-muted-foreground">
              CTA href (mock): <code>{template.ctaHrefMock}</code>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
