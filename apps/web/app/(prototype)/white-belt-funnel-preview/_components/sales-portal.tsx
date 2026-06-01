import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Chip } from "@sigmafy/ui";
import {
  funnelStageLabels,
  mockLeadScoringRules,
  mockSalesLeads,
  type FunnelStage,
  type SalesLead,
} from "../_data/sales-funnel";
import { SectionHeader } from "./shell";
import { GaugeRing } from "./gauge-ring";
import { Sparkline } from "./sparkline";
import { mockMicroSeries } from "../_data/sparkline-data";

const ROUTE = "/white-belt-funnel-preview";

const CHANNEL_LABEL: Record<string, string> = {
  email: "Email",
  google_ads: "Google",
  meta_ads: "Meta",
  linkedin: "LinkedIn",
  sales_team: "Sales",
};

function leadLink(leadId: string) {
  return `${ROUTE}?tab=sales&lead=${leadId}`;
}

export function SalesPortalTab({ leadId }: { leadId?: string }) {
  const selected =
    mockSalesLeads.find((l) => l.id === leadId) ?? mockSalesLeads[0]!;
  return (
    <div className="flex flex-col gap-10">
      <SectionHeader
        eyebrow="Step 12 — Sales portal"
        title="What 2KO sees"
        description="A sales-side view of every White Belt graduate, funnel stage, channels active, and the recommended next action."
      />
      <FunnelStageDistribution leads={mockSalesLeads} />
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <LeadListTable leads={mockSalesLeads} selectedLeadId={selected.id} />
        <LeadDetailPanel lead={selected} />
      </div>
      <LeadScoringRulesCard />
    </div>
  );
}

function FunnelStageDistribution({ leads }: { leads: SalesLead[] }) {
  const stageOrder: FunnelStage[] = [
    "completed_white_belt",
    "certificate_downloaded",
    "viewed_upgrade_offer",
    "interested_yellow_belt",
    "company_referral_potential",
    "remarketing_active",
    "sales_follow_up_needed",
    "converted",
    "dormant",
  ];
  const counts = new Map<FunnelStage, number>();
  for (const s of stageOrder) counts.set(s, 0);
  for (const l of leads)
    counts.set(l.funnelStage, (counts.get(l.funnelStage) ?? 0) + 1);
  const total = leads.length || 1;
  const tintFor = (s: FunnelStage) =>
    s === "converted"
      ? "var(--tint-projects)"
      : s === "dormant"
        ? "var(--color-surface-3)"
        : s === "sales_follow_up_needed"
          ? "var(--tint-ai)"
          : "var(--tint-training)";
  return (
    <Card data-reveal>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Funnel stage distribution</CardTitle>
          <Chip>{leads.length} leads · mock</Chip>
        </div>
        <p className="text-[13px] text-muted-foreground">
          How the mock cohort is spread across the nine funnel stages.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex h-3 w-full overflow-hidden rounded-pill bg-surface-3">
          {stageOrder.map((s) => {
            const c = counts.get(s) ?? 0;
            const w = (c / total) * 100;
            if (w === 0) return null;
            return (
              <span
                key={s}
                title={`${funnelStageLabels[s]} · ${c}`}
                style={{ width: `${w}%`, backgroundColor: tintFor(s) }}
              />
            );
          })}
        </div>
        <ul className="grid gap-1 sm:grid-cols-3">
          {stageOrder.map((s) => {
            const c = counts.get(s) ?? 0;
            return (
              <li
                key={s}
                className="flex items-center gap-2 text-[12px]"
              >
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: tintFor(s) }}
                />
                <span className="text-muted-foreground">
                  {funnelStageLabels[s]}
                </span>
                <span className="ml-auto t-num font-medium text-fg">{c}</span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function LeadListTable({
  leads,
  selectedLeadId,
}: {
  leads: SalesLead[];
  selectedLeadId: string;
}) {
  return (
    <Card data-reveal>
      <CardHeader>
        <CardTitle>Leads</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          {leads.length} mock leads · click a row to inspect.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border-subtle text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                <th className="px-4 py-2 text-left font-medium">Name</th>
                <th className="px-4 py-2 text-left font-medium">Stage</th>
                <th className="px-4 py-2 text-left font-medium">Score</th>
                <th className="px-4 py-2 text-left font-medium">Channels</th>
                <th className="px-4 py-2 text-left font-medium">Next action</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => {
                const selected = l.id === selectedLeadId;
                return (
                  <tr
                    key={l.id}
                    className={`border-b border-border-subtle align-top last:border-b-0 ${
                      selected ? "bg-surface-2" : "hover:bg-surface-2"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={leadLink(l.id)}
                        className="font-medium text-fg hover:underline"
                        prefetch={false}
                      >
                        {l.name}
                      </Link>
                      <p className="text-[11px] text-muted-foreground">
                        {l.course} · last {l.lastActionAt}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Chip
                        tint={
                          l.funnelStage === "converted"
                            ? "projects"
                            : l.funnelStage === "sales_follow_up_needed"
                              ? "ai"
                              : l.funnelStage === "dormant"
                                ? undefined
                                : "training"
                        }
                      >
                        {funnelStageLabels[l.funnelStage]}
                      </Chip>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <span className="t-num font-medium text-fg">
                          {l.interestScore}
                        </span>
                        <Sparkline
                          values={mockMicroSeries[l.id] ?? [10, 12, 14, 16, 18]}
                          tint={
                            l.interestScore >= 80
                              ? "ai"
                              : l.interestScore >= 40
                                ? "training"
                                : undefined
                          }
                          width={48}
                          height={16}
                          withArea={false}
                        />
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {l.activeChannels.length
                        ? l.activeChannels
                            .map((c) => CHANNEL_LABEL[c] ?? c)
                            .join(", ")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {l.nextRecommendedAction}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function LeadDetailPanel({ lead }: { lead: SalesLead }) {
  return (
    <Card data-reveal>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>{lead.name}</CardTitle>
          <Chip tint="training">{funnelStageLabels[lead.funnelStage]}</Chip>
        </div>
        <p className="text-[13px] text-muted-foreground">
          {lead.course} graduate · last action {lead.lastActionAt}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 text-[13px]">
        <LeadScoreCard score={lead.interestScore} />
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Certificate downloaded</dt>
            <dd className="font-medium text-fg">
              {lead.certificateDownloaded ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Last contacted</dt>
            <dd className="font-medium text-fg">
              {lead.lastContactedAt ?? "Never"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Assigned salesperson</dt>
            <dd className="font-medium text-fg">
              {lead.assignedSalesperson ?? "Unassigned"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Active channels</dt>
            <dd className="font-medium text-fg">
              {lead.activeChannels.length
                ? lead.activeChannels.map((c) => CHANNEL_LABEL[c] ?? c).join(", ")
                : "—"}
            </dd>
          </div>
        </dl>
        <div className="grid gap-3 sm:grid-cols-2">
          <InterestRow label="Upgrade interest" value={lead.upgradeInterest} />
          <InterestRow label="Referral interest" value={lead.referralInterest} />
          <InterestRow
            label="Company lead potential"
            value={lead.companyLeadPotential}
          />
          <InterestRow label="Reseller interest" value={lead.resellerInterest} />
        </div>
        <aside
          className="rounded-card border p-3"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--tint-training) 6%, var(--color-bg))",
            borderColor:
              "color-mix(in srgb, var(--tint-training) 22%, transparent)",
          }}
        >
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            Next recommended action
          </p>
          <p className="mt-1 font-medium text-fg">{lead.nextRecommendedAction}</p>
        </aside>
        <p className="text-[11px] text-muted-foreground">
          Lead actions in this prototype are non-functional.
        </p>
      </CardContent>
    </Card>
  );
}

function InterestRow({
  label,
  value,
}: {
  label: string;
  value: "high" | "medium" | "low" | "none";
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border-subtle bg-surface p-2 text-[12px]">
      <span className="text-muted-foreground">{label}</span>
      <Chip
        tint={
          value === "high" ? "training" : value === "medium" ? "spc" : undefined
        }
      >
        {value}
      </Chip>
    </div>
  );
}

function LeadScoreCard({ score }: { score: number }) {
  const tint = score >= 80 ? "ai" : score >= 40 ? "training" : undefined;
  return (
    <div className="flex items-center justify-between rounded-card border border-border-subtle bg-surface p-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          Interest score
        </p>
        <Chip tint={tint} className="mt-1">
          {score >= 80 ? "Hot" : score >= 40 ? "Warm" : "Cold"}
        </Chip>
      </div>
      <GaugeRing value={score} tint={tint} size={72} thickness={6} unit="" />
    </div>
  );
}

function LeadScoringRulesCard() {
  return (
    <Card data-reveal>
      <CardHeader>
        <CardTitle>Lead scoring rules</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          Mock weights — for review only.
        </p>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-2 sm:grid-cols-2">
          {mockLeadScoringRules.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-md border border-border-subtle bg-surface px-3 py-2 text-[13px]"
            >
              <span className="text-fg">{r.trigger}</span>
              <span className="t-num font-medium text-fg">+{r.delta}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
