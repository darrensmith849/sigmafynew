import * as React from "react";
import { cn } from "../lib/cn";
import type { ChipTint } from "./chip";

const TINT_VAR: Record<ChipTint, string> = {
  projects: "var(--tint-projects)",
  spc: "var(--tint-spc)",
  training: "var(--tint-training)",
  ai: "var(--tint-ai)",
  admin: "var(--tint-admin)",
};

export interface ProgressBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** 0-100. Values outside the range are clamped. */
  value: number;
  /** Optional inline label (left-aligned above the bar). */
  label?: React.ReactNode;
  /** Optional right-aligned value caption (e.g. "62%"). */
  valueLabel?: React.ReactNode;
  /** Tint for the fill bar. Defaults to accent. */
  tint?: ChipTint;
  /** Bar height in px. Default 6. */
  size?: number;
}

/**
 * Horizontal progress bar with optional label row. Token-driven fill;
 * accepts a per-product tint or falls back to accent.
 */
export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    { className, value, label, valueLabel, tint, size = 6, style, ...props },
    ref,
  ) => {
    const clamped = Math.max(0, Math.min(100, value));
    const fillColor = tint ? TINT_VAR[tint] : "var(--color-accent)";
    return (
      <div ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props}>
        {(label || valueLabel) && (
          <div className="flex items-baseline justify-between gap-3 text-[12px]">
            {label && <span className="text-muted-foreground">{label}</span>}
            {valueLabel && (
              <span className="font-medium text-fg tabular-nums">{valueLabel}</span>
            )}
          </div>
        )}
        <div
          role="progressbar"
          aria-valuenow={Math.round(clamped)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="w-full overflow-hidden rounded-pill bg-surface-3"
          style={{ height: size, ...style }}
        >
          <div
            className="h-full rounded-pill transition-[width] duration-300"
            style={{
              width: `${clamped}%`,
              backgroundColor: fillColor,
            }}
          />
        </div>
      </div>
    );
  },
);
ProgressBar.displayName = "ProgressBar";
