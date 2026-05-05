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

export interface IconTileProps extends React.HTMLAttributes<HTMLSpanElement> {
  tint?: ChipTint;
  /** Tile size in pixels (square). Default 44. */
  size?: number;
  children: React.ReactNode;
}

/**
 * Square rounded tile housing a feature icon. Tinted with one of the
 * per-product hues, or accent if no tint is given.
 */
export const IconTile = React.forwardRef<HTMLSpanElement, IconTileProps>(
  ({ className, tint, size = 44, style, children, ...props }, ref) => {
    const tintCss = tint ? TINT_VAR[tint] : "var(--color-accent)";
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-[12px] border",
          className,
        )}
        style={{
          width: size,
          height: size,
          color: tintCss,
          backgroundColor: `color-mix(in srgb, ${tintCss} 12%, var(--color-surface))`,
          borderColor: `color-mix(in srgb, ${tintCss} 22%, transparent)`,
          ...style,
        }}
        {...props}
      >
        {children}
      </span>
    );
  },
);
IconTile.displayName = "IconTile";
