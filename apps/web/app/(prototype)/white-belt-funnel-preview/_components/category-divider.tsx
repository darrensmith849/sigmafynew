import type { ChipTint } from "@sigmafy/ui";
import type { IconKey } from "./icons";
import { iconMap } from "./icons";

const TINT_VAR: Record<ChipTint, string> = {
  projects: "var(--tint-projects)",
  spc: "var(--tint-spc)",
  training: "var(--tint-training)",
  ai: "var(--tint-ai)",
  admin: "var(--tint-admin)",
};

interface CategoryDividerProps {
  label: string;
  detail?: string;
  icon?: IconKey;
  tint?: ChipTint;
}

/**
 * Thin labelled divider used inside a tab to group related sections.
 * Sits as a horizontal strip with an icon-tile, the category label, and a
 * subtle rule that extends to the right.
 */
export function CategoryDivider({
  label,
  detail,
  icon,
  tint,
}: CategoryDividerProps) {
  const Icon = icon ? iconMap[icon] : null;
  const accent = tint ? TINT_VAR[tint] : "var(--color-accent)";
  return (
    <div className="flex items-center gap-3">
      {Icon && (
        <span
          aria-hidden
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border"
          style={{
            color: accent,
            backgroundColor: `color-mix(in srgb, ${accent} 10%, var(--color-surface))`,
            borderColor: `color-mix(in srgb, ${accent} 22%, transparent)`,
          }}
        >
          <Icon className="h-4 w-4" />
        </span>
      )}
      <div className="flex flex-col">
        <span
          className="text-[11px] uppercase tracking-[0.14em] font-semibold"
          style={{ color: accent }}
        >
          {label}
        </span>
        {detail && (
          <span className="text-[12px] text-muted-foreground">{detail}</span>
        )}
      </div>
      <span
        aria-hidden
        className="ml-2 h-px flex-1 bg-border-subtle"
      />
    </div>
  );
}
