import { Card, CardContent, CardHeader, Chip, Eyebrow } from "@sigmafy/ui";
import {
  mockFunnelHealth,
  mockFunnelHealthHeadline,
  type HealthGauge,
} from "../_data/funnel-health";
import { GaugeRing } from "./gauge-ring";

const STATUS_LABEL: Record<HealthGauge["status"], string> = {
  healthy: "Healthy",
  watch: "Watch",
  below_target: "Below target",
};

const STATUS_TINT: Record<HealthGauge["status"], "projects" | "ai" | "spc"> = {
  healthy: "projects",
  watch: "spc",
  below_target: "ai",
};

export function FunnelHealth() {
  return (
    <Card data-reveal>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Eyebrow>{mockFunnelHealthHeadline.eyebrow}</Eyebrow>
            <h3 className="mt-1 h-headline text-fg">
              {mockFunnelHealthHeadline.title}
            </h3>
          </div>
          <Chip>Mock gauges · shape is real</Chip>
        </div>
        <p className="t-lede max-w-3xl">
          {mockFunnelHealthHeadline.description}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {mockFunnelHealth.map((g) => (
            <div
              key={g.id}
              className="flex items-center gap-4 rounded-card border border-border-subtle bg-surface p-4"
            >
              <GaugeRing
                value={g.percentage}
                tint={g.tint}
                size={88}
                thickness={8}
              />
              <div className="flex flex-col gap-1">
                <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  {g.label}
                </p>
                <p className="text-[12px] text-muted-foreground">{g.caption}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Chip tint={STATUS_TINT[g.status]} className="!text-[10px]">
                    {STATUS_LABEL[g.status]}
                  </Chip>
                  <span className="text-[11px] text-muted-foreground">
                    {g.target}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
