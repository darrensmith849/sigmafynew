import { Card, CardContent, CardHeader, CardTitle, Chip } from "@sigmafy/ui";
import {
  mockComplianceNotes,
  mockIntegrationNotes,
  mockSignOffChecklist,
} from "../_data/integration-notes";
import { SectionHeader } from "./shell";
import { ArchitectureDiagram } from "./architecture-diagram";
import { CategoryDivider } from "./category-divider";

export function IntegrationTab() {
  return (
    <div className="flex flex-col gap-10">
      <SectionHeader
        eyebrow="Steps 16 + 17 + 20 — Integration · compliance · sign-off"
        title="Backend notes & sign-off gate"
        description="What the real backend would need to do, what compliance work has to land alongside it, and the explicit gate that has to be signed off before any of it is built."
      />
      <ArchitectureDiagram />
      <CategoryDivider
        label="Backend notes & compliance"
        detail="What gets built, what regulates it"
        icon="shield"
        tint="admin"
      />
      <FutureIntegrationNotesPanel />
      <ComplianceNotesPanel />
      <SignOffGate />
    </div>
  );
}

function FutureIntegrationNotesPanel() {
  return (
    <Card data-reveal>
      <CardHeader>
        <CardTitle>Future backend integration notes</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          {mockIntegrationNotes.length} integration areas · notes only.
        </p>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3 sm:grid-cols-2">
          {mockIntegrationNotes.map((n) => (
            <li
              key={n.id}
              className="rounded-card border border-border-subtle bg-surface p-3 text-[13px]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-fg">{n.area}</p>
                <Chip>Note</Chip>
              </div>
              <p className="mt-1 text-muted-foreground">{n.whatItNeeds}</p>
              <p className="mt-2 text-[12px] italic text-muted-foreground">
                {n.estimateNote}
              </p>
              {n.dependencies.length > 0 && (
                <p className="mt-2 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  Depends on: {n.dependencies.join(" · ")}
                </p>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ComplianceNotesPanel() {
  return (
    <Card data-reveal>
      <CardHeader>
        <CardTitle>Compliance & consent placeholders</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          POPIA / GDPR-shaped notes. Surface placeholders — no live compliance
          logic implemented in this prototype.
        </p>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3 sm:grid-cols-2">
          {mockComplianceNotes.map((c) => (
            <li
              key={c.id}
              className="rounded-card border border-border-subtle bg-surface p-3 text-[13px]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-fg">{c.topic}</p>
                <Chip tint="admin">Compliance</Chip>
              </div>
              <p className="mt-1 text-fg">{c.what}</p>
              <p className="mt-2 text-[12px] italic text-muted-foreground">
                Why: {c.why}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function SignOffGate() {
  return (
    <Card
      data-reveal
      style={{
        borderColor:
          "color-mix(in srgb, var(--tint-ai) 35%, transparent)",
        backgroundColor:
          "color-mix(in srgb, var(--tint-ai) 4%, var(--color-surface))",
      }}
    >
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Sign-off gate</CardTitle>
          <Chip tint="ai" className="pulse-soft">Required before backend work</Chip>
        </div>
        <p className="text-[13px] text-muted-foreground">
          No backend integration, no live emails, no real ads pixels, no
          payment links, no CRM connection, and no production data writes
          until every item below is signed off in writing.
        </p>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-2 sm:grid-cols-2">
          {mockSignOffChecklist.map((s) => (
            <li
              key={s.id}
              className="flex items-start gap-2 rounded-md border border-border-subtle bg-surface p-3 text-[13px]"
            >
              <span
                aria-hidden
                className="mt-1 inline-block h-4 w-4 flex-shrink-0 rounded-sm border border-border"
              />
              <div>
                <p className="font-medium text-fg">{s.area}</p>
                <p className="text-muted-foreground">{s.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
