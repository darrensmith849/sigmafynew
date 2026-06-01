import { Button, Card, CardContent, CardHeader, CardTitle, Chip } from "@sigmafy/ui";
import { mockResellerOpportunity } from "../_data/referrals";
import { mockSigmafyStats, type SigmafyStatTile } from "../_data/sigmafy-stats";
import { mockSparklines } from "../_data/sparkline-data";
import { SectionHeader } from "./shell";
import { MockEventChip } from "./mock-event-chip";
import { StatCard } from "./stat-card";
import { IconHandshake, type IconKey } from "./icons";

const ICON_FOR_STAT: Record<string, IconKey> = {
  active: "flag",
  savings: "coins",
  completion: "checkDouble",
  progression: "ladder",
  company: "building",
  roi: "pulse",
};

const SPARK_FOR_STAT: Record<string, string> = {
  active: "stat_active",
  savings: "stat_savings",
  completion: "stat_completion",
  progression: "stat_progression",
  company: "stat_company",
  roi: "stat_roi",
};

const STAT_TINT: Record<NonNullable<SigmafyStatTile["tone"]>, "projects" | "training" | "ai" | undefined> = {
  positive: "projects",
  warning: "ai",
  neutral: undefined,
};

export function StatsTab() {
  return (
    <div className="flex flex-col gap-10">
      <SectionHeader
        eyebrow="Steps 8 + 9 — Sigmafy stats & reseller"
        title="The platform value — and the partner path"
        description="Same surface, two audiences: company decision-makers and Six Sigma practitioners who could partner with us."
      />
      <SigmafyStatsPreviewPanel />
      <ResellerOpportunityPanel />
    </div>
  );
}

function SigmafyStatsPreviewPanel() {
  const s = mockSigmafyStats;
  return (
    <Card data-reveal>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>{s.headline}</CardTitle>
          <Chip>Illustrative · sample tenant</Chip>
        </div>
        <p className="text-[13px] text-muted-foreground">{s.summary}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {s.tiles.map((t) => (
            <StatCard
              key={t.id}
              label={t.label}
              value={t.value}
              caption={t.caption}
              delta={t.delta}
              tint={STAT_TINT[t.tone ?? "neutral"]}
              icon={ICON_FOR_STAT[t.id]}
              sparkline={mockSparklines[SPARK_FOR_STAT[t.id] ?? ""]}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-2 border-t border-border-subtle pt-3">
          <p className="text-[12px] text-muted-foreground">
            Numbers above are mock. Real Sigmafy tenants see their own data via
            the stats-gateway and project records.
          </p>
          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" size="md">{s.ctaLabel}</Button>
              <Button variant="outline" size="md">{s.ctaSecondaryLabel}</Button>
            </div>
            <MockEventChip
              event="sigmafy_stats_viewed"
              futureAction="Send company-ROI email +24h · flag for sales."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ResellerOpportunityPanel() {
  const r = mockResellerOpportunity;
  return (
    <Card data-reveal>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-3">
            <span
              aria-hidden
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border"
              style={{
                color: "var(--tint-admin)",
                backgroundColor:
                  "color-mix(in srgb, var(--tint-admin) 10%, var(--color-surface))",
                borderColor:
                  "color-mix(in srgb, var(--tint-admin) 22%, transparent)",
              }}
            >
              <IconHandshake className="h-5 w-5" />
            </span>
            <CardTitle>{r.headline}</CardTitle>
          </span>
          <Chip>Concept · partner terms TBC</Chip>
        </div>
        <p className="text-[13px] text-muted-foreground">{r.summary}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {r.pathways.map((p) => (
            <div
              key={p.label}
              className="rounded-card border border-border-subtle bg-surface p-3"
            >
              <p className="text-[13px] font-medium text-fg">{p.label}</p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {p.description}
              </p>
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
        <div className="flex flex-col items-end gap-2">
          <Button variant="primary" size="md">{r.ctaLabel}</Button>
          <MockEventChip
            event="reseller_interest_clicked"
            futureAction="Route to partnerships · send partner-info email +1h."
          />
        </div>
      </CardContent>
    </Card>
  );
}
