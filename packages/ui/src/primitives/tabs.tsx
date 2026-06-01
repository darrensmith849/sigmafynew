import * as React from "react";
import { cn } from "../lib/cn";

/**
 * URL-driven tabs. Pages render `<TabsBar>` with a list of `<TabLink>` items
 * (typically `<Link>` from next/link passed as children) and a `<TabPanel>`
 * for the active content. State lives in the URL so reviewers can deep-link
 * a single tab.
 */
export const TabsBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="tablist"
    className={cn(
      "flex flex-wrap items-center gap-1 border-b border-border-subtle pb-px",
      className,
    )}
    {...props}
  />
));
TabsBar.displayName = "TabsBar";

export interface TabLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
  asChild?: boolean;
}

/**
 * Single tab. Renders an `<a>` by default; pass `asChild` to wrap a
 * `next/link` `<Link>` instead.
 */
export const TabLink = React.forwardRef<HTMLAnchorElement, TabLinkProps>(
  ({ className, active, asChild = false, children, ...props }, ref) => {
    const cls = cn(
      "relative inline-flex h-9 items-center rounded-pill px-3 text-[13px] font-medium text-muted-foreground transition-colors",
      "hover:text-fg hover:bg-surface-2",
      active &&
        "text-fg bg-surface-2 after:absolute after:inset-x-3 after:-bottom-px after:h-[2px] after:rounded-full after:bg-accent",
      className,
    );
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement<{
          className?: string;
          role?: string;
          ["aria-selected"]?: boolean;
        }>,
        {
          className: cn(
            (children as React.ReactElement<{ className?: string }>).props
              .className,
            cls,
          ),
          role: "tab",
          ["aria-selected"]: !!active,
        },
      );
    }
    return (
      <a
        ref={ref}
        role="tab"
        aria-selected={!!active}
        className={cls}
        {...props}
      >
        {children}
      </a>
    );
  },
);
TabLink.displayName = "TabLink";

export const TabPanel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="tabpanel"
    className={cn("focus-visible:outline-none", className)}
    tabIndex={0}
    {...props}
  />
));
TabPanel.displayName = "TabPanel";
