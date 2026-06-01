import { Card, CardContent, CardHeader, Chip, Eyebrow } from "@sigmafy/ui";
import { mockFunnelKpis, mockKpiHeadline } from "../_data/kpis";

export function FunnelSummary() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Eyebrow>{mockKpiHeadline.eyebrow}</Eyebrow>
            <h3 className="mt-1 text-[22px] font-semibold tracking-tight text-fg">
              {mockKpiHeadline.title}
            </h3>
          </div>
          <Chip>Mock data</Chip>
        </div>
        <p className="max-w-3xl text-[13px] text-muted-foreground">
          {mockKpiHeadline.description}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {mockFunnelKpis.map((k) => (
            <div
              key={k.id}
              className="flex flex-col gap-1 rounded-card border border-border-subtle bg-surface p-4"
            >
              <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                {k.label}
              </p>
              <p className="t-num text-[24px] font-semibold text-fg">{k.value}</p>
              <p className="text-[12px] text-muted-foreground">{k.caption}</p>
              {k.delta && (
                <p className="mt-1 text-[12px]">
                  <Chip tint={k.tint} className="!text-[10px]">
                    {k.delta}
                  </Chip>
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
