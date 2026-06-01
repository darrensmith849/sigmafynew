import { Chip, type ChipTint } from "@sigmafy/ui";
import { iconMap, type IconKey } from "./icons";
import { Sparkline } from "./sparkline";

const TINT_VAR: Record<ChipTint, string> = {
  projects: "var(--tint-projects)",
  spc: "var(--tint-spc)",
  training: "var(--tint-training)",
  ai: "var(--tint-ai)",
  admin: "var(--tint-admin)",
};

export interface StatCardProps {
  label: string;
  value: string;
  caption?: string;
  delta?: string;
  tint?: ChipTint;
  icon?: IconKey;
  sparkline?: number[];
  className?: string;
}

/**
 * Unified KPI / stat tile. Icon tile + label + tabular numeric value +
 * caption + optional delta chip + optional sparkline. Replaces ad-hoc
 * tile markup across funnel-summary, commercial-lens, and stats.
 */
export function StatCard({
  label,
  value,
  caption,
  delta,
  tint,
  icon,
  sparkline,
  className,
}: StatCardProps) {
  const Icon = icon ? iconMap[icon] : null;
  const accent = tint ? TINT_VAR[tint] : "var(--color-accent)";
  return (
    <div
      className={`flex flex-col gap-2 rounded-card border border-border-subtle bg-surface p-4 transition-shadow hover:shadow-card ${className ?? ""}`}
      data-reveal
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </p>
        {Icon && (
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border"
            style={{
              color: accent,
              backgroundColor: `color-mix(in srgb, ${accent} 10%, var(--color-surface))`,
              borderColor: `color-mix(in srgb, ${accent} 22%, transparent)`,
            }}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="t-num text-[24px] font-semibold text-fg">{value}</p>
      {caption && (
        <p className="text-[12px] text-muted-foreground">{caption}</p>
      )}
      <div className="mt-auto flex items-end justify-between gap-2 pt-1">
        {delta ? (
          <Chip tint={tint} className="!text-[10px]">
            {delta}
          </Chip>
        ) : (
          <span aria-hidden />
        )}
        {sparkline && sparkline.length > 0 && (
          <Sparkline values={sparkline} tint={tint} width={80} height={20} />
        )}
      </div>
    </div>
  );
}
