import { Card, CardContent, CardHeader, Chip, Eyebrow } from "@sigmafy/ui";
import {
  mockCommercialAssumptions,
  mockCommercialHeadline,
  mockCommercialMetrics,
  type CommercialMetric,
} from "../_data/commercial";
import { mockSparklines } from "../_data/sparkline-data";
import { StatCard } from "./stat-card";
import type { IconKey } from "./icons";

const TONE_COLOR: Record<CommercialMetric["tone"], string> = {
  opportunity: "var(--tint-projects)",
  risk: "var(--tint-ai)",
  neutral: "var(--color-muted)",
};

const ICON_FOR_REV: Record<string, IconKey> = {
  rev_yb: "arrowUp",
  rev_gb: "ladder",
  rev_bb: "flag",
  rev_company: "building",
  rev_reseller: "handshake",
  rev_conv: "target",
  rev_lost: "bolt",
  rev_remarketing: "radio",
};

export function CommercialLens() {
  return (
    <Card data-reveal>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Eyebrow>{mockCommercialHeadline.eyebrow}</Eyebrow>
            <h3 className="mt-1 h-headline text-fg">
              {mockCommercialHeadline.title}
            </h3>
          </div>
          <Chip>Mock numbers · subject to assumptions below</Chip>
        </div>
        <p className="t-lede max-w-3xl">
          {mockCommercialHeadline.description}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {mockCommercialMetrics.map((m) => (
            <ToneTile key={m.id} metric={m} />
          ))}
        </div>
        <aside className="rounded-card border border-border-subtle bg-surface p-4">
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            Assumptions used
          </p>
          <dl className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-[12px]">
            {mockCommercialAssumptions.map((a) => (
              <div key={a.id} className="flex flex-col">
                <dt className="text-muted-foreground">{a.label}</dt>
                <dd className="font-medium text-fg">{a.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </CardContent>
    </Card>
  );
}

function ToneTile({ metric: m }: { metric: CommercialMetric }) {
  const spark = mockSparklines[m.id];
  if (spark) {
    return (
      <StatCard
        label={m.label}
        value={m.value}
        caption={m.caption}
        delta={m.assumption}
        tint={m.tint}
        icon={ICON_FOR_REV[m.id]}
        sparkline={spark}
      />
    );
  }
  return (
    <div
      className="flex flex-col gap-1 rounded-card border border-border-subtle bg-surface p-4"
      data-reveal
    >
      <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        {m.label}
      </p>
      <p
        className="t-num text-[22px] font-semibold"
        style={{ color: TONE_COLOR[m.tone] }}
      >
        {m.value}
      </p>
      <p className="text-[12px] text-muted-foreground">{m.caption}</p>
      <p className="mt-1 text-[11px] italic text-muted-foreground">
        {m.assumption}
      </p>
    </div>
  );
}
