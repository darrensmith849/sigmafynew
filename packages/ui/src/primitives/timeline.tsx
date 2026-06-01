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

export const Timeline = React.forwardRef<
  HTMLOListElement,
  React.HTMLAttributes<HTMLOListElement>
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "relative ml-3 flex flex-col gap-5 border-l border-border-subtle pl-6",
      className,
    )}
    {...props}
  />
));
Timeline.displayName = "Timeline";

export interface TimelineItemProps
  extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title"> {
  /** Timestamp / metadata shown above the title. */
  timestamp?: React.ReactNode;
  /** Title of the event. */
  title?: React.ReactNode;
  /** Optional sub-description. */
  description?: React.ReactNode;
  /** Dot tint. Defaults to accent. */
  tint?: ChipTint;
  /** Override the dot entirely. */
  dot?: React.ReactNode;
}

/**
 * One event on a vertical timeline. The dot sits in the gutter to the left
 * of the content; absolute positioning is tuned to align with the parent
 * border-l line at `pl-6`.
 */
export const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  (
    { className, timestamp, title, description, tint, dot, children, ...props },
    ref,
  ) => {
    const dotColor = tint ? TINT_VAR[tint] : "var(--color-accent)";
    return (
      <li ref={ref} className={cn("relative", className)} {...props}>
        <span
          aria-hidden
          className="absolute -left-[31px] top-1.5 inline-flex h-3 w-3 items-center justify-center rounded-full border-2"
          style={{
            backgroundColor: "var(--color-bg)",
            borderColor: dotColor,
          }}
        >
          {dot}
        </span>
        {timestamp && (
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            {timestamp}
          </p>
        )}
        {title && (
          <p className="mt-0.5 text-sm font-medium text-fg">{title}</p>
        )}
        {description && (
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
        {children}
      </li>
    );
  },
);
TimelineItem.displayName = "TimelineItem";
