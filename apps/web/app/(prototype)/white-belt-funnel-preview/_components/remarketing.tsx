import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Chip,
  Timeline,
  TimelineItem,
  type ChipTint,
} from "@sigmafy/ui";
import { mockEventLog, mockEventTaxonomy, type FunnelEvent } from "../_data/events";
import {
  mockChannelStatuses,
  mockNextBestActionRules,
  mockTemperature,
  type ChannelStatusRow,
} from "../_data/remarketing";
import { SectionHeader } from "./shell";

const STATUS_LABEL: Record<ChannelStatusRow["status"], string> = {
  eligible: "Eligible",
  active: "Active",
  suppressed: "Suppressed",
  converted: "Converted",
  not_applicable: "Not applicable",
};

const TEMP_TONE: Record<string, ChipTint | undefined> = {
  cold: undefined,
  warm: "training",
  hot: "ai",
  converted: "projects",
};

export function RemarketingTab() {
  return (
    <div className="flex flex-col gap-10">
      <SectionHeader
        eyebrow="Steps 10 + 11 — Remarketing"
        title="Channels, events, and next-best actions"
        description="A complete picture of how a learner is tracked, routed, and re-engaged after course completion. No real pixels or sends — surface only."
      />
      <LeadTemperatureCard />
      <RemarketingChannelStatusGrid rows={mockChannelStatuses} />
      <EventTimelinePanel events={mockEventLog} />
      <EventTaxonomyPanel />
      <NextBestActionPanel />
    </div>
  );
}

function LeadTemperatureCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Learner — Thandi Mokoena</CardTitle>
          <div className="flex items-center gap-2">
            <Chip tint={TEMP_TONE[mockTemperature]}>
              {mockTemperature.toUpperCase()} LEAD
            </Chip>
            <Chip>Interest score 65</Chip>
          </div>
        </div>
        <p className="text-[13px] text-muted-foreground">
          Stage: Sales follow-up needed · last action 2026-05-28
        </p>
      </CardHeader>
    </Card>
  );
}

function RemarketingChannelStatusGrid({ rows }: { rows: ChannelStatusRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Remarketing channels</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          Each channel has its own eligibility, consent rule, and status.
        </p>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <div
            key={r.channel}
            className="flex flex-col gap-2 rounded-card border border-border-subtle bg-surface p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-fg">{r.label}</p>
              <Chip
                tint={
                  r.status === "active"
                    ? "training"
                    : r.status === "converted"
                      ? "projects"
                      : undefined
                }
              >
                {STATUS_LABEL[r.status]}
              </Chip>
            </div>
            <p className="text-[12px] text-muted-foreground">{r.detail}</p>
            <p className="text-[11px] italic text-muted-foreground">
              {r.consentNote}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function EventTimelinePanel({ events }: { events: FunnelEvent[] }) {
  const sorted = [...events].sort((a, b) =>
    a.occurredAt < b.occurredAt ? -1 : 1,
  );
  const byType = new Map(mockEventTaxonomy.map((t) => [t.type, t]));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event timeline</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          Every event the funnel emits — mock log for one learner.
        </p>
      </CardHeader>
      <CardContent>
        <Timeline>
          {sorted.map((e) => {
            const t = byType.get(e.type);
            const tone: ChipTint | undefined =
              t?.category === "conversion"
                ? "projects"
                : t?.category === "intent"
                  ? "training"
                  : t?.category === "email"
                    ? "ai"
                    : t?.category === "sales"
                      ? "spc"
                      : undefined;
            return (
              <TimelineItem
                key={e.id}
                tint={tone}
                timestamp={new Date(e.occurredAt).toLocaleString("en-ZA", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  hour12: false,
                })}
                title={t?.label ?? e.type}
                description={`${t?.description ?? ""} · channel: ${e.channel ?? "—"}${
                  e.metadata
                    ? " · " +
                      Object.entries(e.metadata)
                        .map(([k, v]) => `${k}=${v}`)
                        .join(" · ")
                    : ""
                }`}
              />
            );
          })}
        </Timeline>
      </CardContent>
    </Card>
  );
}

function EventTaxonomyPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event taxonomy</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          The canonical event keys. Future backend should emit exactly these.
        </p>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-2 sm:grid-cols-2">
          {mockEventTaxonomy.map((t) => (
            <li
              key={t.type}
              className="rounded-md border border-border-subtle bg-surface p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <code className="text-[12px] font-medium text-fg">{t.type}</code>
                <Chip
                  tint={
                    t.category === "conversion"
                      ? "projects"
                      : t.category === "intent"
                        ? "training"
                        : t.category === "email"
                          ? "ai"
                          : t.category === "sales"
                            ? "spc"
                            : undefined
                  }
                >
                  {t.category}
                </Chip>
              </div>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {t.label} — {t.description}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function NextBestActionPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended next best actions</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          Rules-based today. Each rule reads from the event log and emits the
          recommended action.
        </p>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {mockNextBestActionRules.map((r) => (
            <li
              key={r.id}
              className="rounded-md border border-border-subtle bg-surface p-3 text-[13px]"
            >
              <p className="font-medium text-fg">{r.recommendedAction}</p>
              <p className="mt-1 text-muted-foreground">
                If {r.ifAllEventsHappened.map((e) => `\`${e}\``).join(" + ")}
                {r.butNotEvent ? ` and NOT \`${r.butNotEvent}\`` : ""} within{" "}
                {r.withinHours}h
              </p>
              <p className="mt-1 italic text-muted-foreground">
                Rationale: {r.rationale}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
