import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Chip,
  Input,
  Label,
} from "@sigmafy/ui";
import {
  mockCompanyInvite,
  mockReferralProgramme,
} from "../_data/referrals";
import { SectionHeader } from "./shell";
import { MockEventChip } from "./mock-event-chip";
import { IconBuilding, IconGift, IconRadio, IconTarget } from "./icons";

export function ReferralTab() {
  return (
    <div className="flex flex-col gap-10">
      <SectionHeader
        eyebrow="Steps 6 + 7 — Referral & company invite"
        title="Refer learners, refer teams, refer companies"
        description="Two CTAs — one for referrals (concept stage), one for bringing your company to Sigmafy / 2KO."
      />
      <HowItWouldWork />
      <ReferralProgrammePanel />
      <CompanyInvitePanel />
    </div>
  );
}

function HowItWouldWork() {
  const steps = [
    {
      label: "Refer",
      detail:
        "Send a learner, a team, or your company through your unique link.",
      Icon: IconRadio,
    },
    {
      label: "Track",
      detail: "Sigmafy attributes the signup and stage transitions to you.",
      Icon: IconTarget,
    },
    {
      label: "Reward",
      detail:
        "Approved rewards land in your account — final terms TBC before payout.",
      Icon: IconGift,
    },
  ];
  return (
    <Card data-reveal>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>How it would work</CardTitle>
          <Chip>Concept · subject to approval</Chip>
        </div>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-3 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li
              key={s.label}
              className="relative flex flex-col gap-2 rounded-card border border-border-subtle bg-surface p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  aria-hidden
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border"
                  style={{
                    color: "var(--tint-training)",
                    backgroundColor:
                      "color-mix(in srgb, var(--tint-training) 10%, var(--color-surface))",
                    borderColor:
                      "color-mix(in srgb, var(--tint-training) 22%, transparent)",
                  }}
                >
                  <s.Icon className="h-5 w-5" />
                </span>
                <span className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  Step {i + 1}
                </span>
              </div>
              <p className="text-base font-semibold text-fg">{s.label}</p>
              <p className="text-[13px] text-muted-foreground">{s.detail}</p>
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-muted-foreground sm:inline"
                >
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function ReferralProgrammePanel() {
  const r = mockReferralProgramme;
  return (
    <Card data-reveal>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-3">
            <span
              aria-hidden
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border"
              style={{
                color: "var(--tint-ai)",
                backgroundColor:
                  "color-mix(in srgb, var(--tint-ai) 10%, var(--color-surface))",
                borderColor:
                  "color-mix(in srgb, var(--tint-ai) 22%, transparent)",
              }}
            >
              <IconGift className="h-5 w-5" />
            </span>
            <CardTitle>{r.headline}</CardTitle>
          </span>
          <Chip>Concept · subject to approval</Chip>
        </div>
        <p className="text-[13px] text-muted-foreground">{r.summary}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {r.potentialRewards.map((p) => (
            <div
              key={p.label}
              className="rounded-card border border-border-subtle bg-surface p-3"
            >
              <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                {p.label}
              </p>
              <p className="mt-1 text-[13px] text-fg">{p.note}</p>
            </div>
          ))}
        </div>
        <aside
          className="rounded-card border p-3 text-[12px] text-muted-foreground"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--color-muted) 6%, var(--color-bg))",
            borderColor: "var(--color-border-subtle)",
          }}
        >
          {r.legalNotes.map((n, i) => (
            <p key={i} className={i === 0 ? "" : "mt-1"}>
              · {n}
            </p>
          ))}
        </aside>
        <div className="flex flex-wrap items-end justify-between gap-2 border-t border-border-subtle pt-3">
          <p className="text-[12px] text-muted-foreground">
            Submitting interest does not commit you to a final programme.
          </p>
          <div className="flex flex-col items-end gap-2">
            <Button variant="primary" size="md">{r.ctaLabel}</Button>
            <MockEventChip
              event="referral_cta_clicked"
              futureAction="Add to referral interest list · email when programme is live."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CompanyInvitePanel() {
  const c = mockCompanyInvite;
  return (
    <Card data-reveal>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-3">
            <span
              aria-hidden
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border"
              style={{
                color: "var(--tint-projects)",
                backgroundColor:
                  "color-mix(in srgb, var(--tint-projects) 10%, var(--color-surface))",
                borderColor:
                  "color-mix(in srgb, var(--tint-projects) 22%, transparent)",
              }}
            >
              <IconBuilding className="h-5 w-5" />
            </span>
            <CardTitle>{c.headline}</CardTitle>
          </span>
          <Chip tint="training">Lead capture · mock</Chip>
        </div>
        <p className="text-[13px] text-muted-foreground">{c.summary}</p>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            What you get
          </p>
          <ul className="mt-2 flex flex-col gap-2 text-[13px] text-fg">
            {c.benefits.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <form action="#mock-no-submit" className="grid gap-3 sm:grid-cols-2">
          {c.formFields.map((f) => (
            <div
              key={f.id}
              className={`flex flex-col gap-1.5 ${
                f.kind === "textarea" ? "sm:col-span-2" : ""
              }`}
            >
              <Label htmlFor={`fld-${f.id}`}>
                {f.label}
                {f.optional && (
                  <span className="ml-1 text-[11px] text-muted-foreground">
                    (optional)
                  </span>
                )}
              </Label>
              {f.kind === "textarea" ? (
                <textarea
                  id={`fld-${f.id}`}
                  name={f.id}
                  placeholder={f.placeholder}
                  rows={3}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                />
              ) : (
                <Input
                  id={`fld-${f.id}`}
                  name={f.id}
                  type={
                    f.kind === "email"
                      ? "email"
                      : f.kind === "number"
                        ? "number"
                        : "text"
                  }
                  placeholder={f.placeholder}
                />
              )}
            </div>
          ))}
          <div className="flex flex-wrap items-end justify-between gap-2 border-t border-border-subtle pt-3 sm:col-span-2">
            <p className="text-[12px] text-muted-foreground">
              {c.submissionDisclaimer}
            </p>
            <div className="flex flex-col items-end gap-2">
              <Button variant="primary" size="md" type="button">
                {c.submitLabel}
              </Button>
              <MockEventChip
                event="company_invite_submitted"
                futureAction="Notify sales · open lead in CRM · send proposal template."
              />
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
