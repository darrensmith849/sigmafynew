import * as React from "react";
import { cn } from "../lib/cn";

export type ChipTint = "projects" | "spc" | "training" | "ai" | "admin";

const TINT_VAR: Record<ChipTint, string> = {
  projects: "var(--tint-projects)",
  spc: "var(--tint-spc)",
  training: "var(--tint-training)",
  ai: "var(--tint-ai)",
  admin: "var(--tint-admin)",
};

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Per-product tint. Omit for the default neutral chip. */
  tint?: ChipTint;
}

/**
 * Pill-shaped status / label chip. Default uses subtle fg/4% bg.
 * With a `tint`, foreground + bg + border all tint to that product hue.
 */
export const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  ({ className, tint, style, ...props }, ref) => {
    const tintStyle = tint
      ? {
          color: TINT_VAR[tint],
          backgroundColor: `color-mix(in srgb, ${TINT_VAR[tint]} 10%, transparent)`,
          borderColor: `color-mix(in srgb, ${TINT_VAR[tint]} 28%, transparent)`,
        }
      : undefined;
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-pill border border-border-subtle px-3 py-[0.32rem] text-[12px] font-medium tracking-tightish",
          !tint && "bg-[color-mix(in_srgb,var(--color-fg)_4%,transparent)] text-fg",
          className,
        )}
        style={{ ...tintStyle, ...style }}
        {...props}
      />
    );
  },
);
Chip.displayName = "Chip";
