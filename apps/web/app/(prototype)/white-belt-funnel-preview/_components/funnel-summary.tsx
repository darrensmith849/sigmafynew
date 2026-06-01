import { Card, CardContent, CardHeader, Chip, Eyebrow } from "@sigmafy/ui";
import { mockFunnelKpis, mockKpiHeadline } from "../_data/kpis";
import { mockSparklines } from "../_data/sparkline-data";
import { StatCard } from "./stat-card";
import type { IconKey } from "./icons";

const ICON_FOR_KPI: Record<string, IconKey> = {
  kpi_completions: "checkCircle",
  kpi_cert_downloads: "award",
  kpi_upgrade_clicks: "arrowUp",
  kpi_company_leads: "building",
  kpi_referral_interest: "gift",
  kpi_remarketing_active: "radio",
  kpi_sales_followups: "phone",
  kpi_yb_conversions: "target",
};

export function FunnelSummary() {
  return (
    <Card data-reveal>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Eyebrow>{mockKpiHeadline.eyebrow}</Eyebrow>
            <h3 className="mt-1 h-headline text-fg">
              {mockKpiHeadline.title}
            </h3>
          </div>
          <Chip>Mock data</Chip>
        </div>
        <p className="t-lede max-w-3xl">{mockKpiHeadline.description}</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {mockFunnelKpis.map((k) => (
            <StatCard
              key={k.id}
              label={k.label}
              value={k.value}
              caption={k.caption}
              delta={k.delta}
              tint={k.tint}
              icon={ICON_FOR_KPI[k.id]}
              sparkline={mockSparklines[k.id]}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
