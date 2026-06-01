import { Button, Card, CardContent, CardHeader, CardTitle, Chip } from "@sigmafy/ui";
import { mockResellerOpportunity } from "../_data/referrals";
import { mockSigmafyStats, type SigmafyStatTile } from "../_data/sigmafy-stats";
import { SectionHeader } from "./shell";

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
    <Card>
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
            <StatTile key={t.id} tile={t} />
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-3">
          <p className="text-[12px] text-muted-foreground">
            Numbers above are mock. Real Sigmafy tenants see their own data via
            the stats-gateway and project records.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" size="md">{s.ctaLabel}</Button>
            <Button variant="outline" size="md">{s.ctaSecondaryLabel}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatTile({ tile }: { tile: SigmafyStatTile }) {
  return (
    <div className="flex flex-col gap-1 rounded-card border border-border-subtle bg-surface p-4">
      <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        {tile.label}
      </p>
      <p className="t-num text-[26px] font-semibold text-fg">{tile.value}</p>
      <p className="text-[12px] text-muted-foreground">{tile.caption}</p>
      {tile.delta && (
        <p
          className="mt-1 text-[12px] font-medium"
          style={{
            color:
              tile.tone === "positive"
                ? "var(--tint-projects)"
                : tile.tone === "warning"
                  ? "var(--tint-ai)"
                  : "var(--color-muted)",
          }}
        >
          {tile.delta}
        </p>
      )}
    </div>
  );
}

function ResellerOpportunityPanel() {
  const r = mockResellerOpportunity;
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>{r.headline}</CardTitle>
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
        <div className="flex justify-end">
          <Button variant="primary" size="md">{r.ctaLabel}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
