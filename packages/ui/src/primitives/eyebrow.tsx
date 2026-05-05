import * as React from "react";
import { cn } from "../lib/cn";

/**
 * Section eyebrow — small uppercase label that sits above a headline.
 * Uses the `.h-eyebrow` styles from typography.css (color, tracking,
 * weight). Mostly a `<p>` semantic but accepts any tag via `as`.
 */
export const Eyebrow = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("h-eyebrow", className)} {...props} />
  ),
);
Eyebrow.displayName = "Eyebrow";
