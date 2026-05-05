"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

interface NavLink {
  href: string;
  label: string;
  /** Active when the current path starts with this prefix. */
  match: string;
}

const NAV: NavLink[] = [
  { href: "/dashboard", label: "Projects", match: "/dashboard" },
  { href: "/dashboard/classes", label: "Classes", match: "/dashboard/classes" },
  { href: "/dashboard/approvals", label: "Approvals", match: "/dashboard/approvals" },
  { href: "/dashboard/roi", label: "ROI", match: "/dashboard/roi" },
  { href: "/dashboard/members", label: "Members", match: "/dashboard/members" },
];

/**
 * Sticky top bar shown on every authenticated page.
 *
 * Desktop (md+): brand + workspace name on the left, primary nav inline,
 * UserButton on the right.
 * Mobile: brand + UserButton stay visible; nav collapses into a hamburger
 * panel that drops below the bar when toggled.
 */
export function AppHeader(props: { workspaceName: string }) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);

  let activeMatch = "";
  for (const item of NAV) {
    const isMatch =
      item.href === "/dashboard"
        ? pathname === "/dashboard" || pathname.startsWith("/projects/")
        : pathname.startsWith(item.match);
    if (isMatch && item.match.length > activeMatch.length) {
      activeMatch = item.match;
    }
  }
  if (!activeMatch && (pathname === "/dashboard" || pathname.startsWith("/projects/"))) {
    activeMatch = "/dashboard";
  }

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:gap-6 sm:px-6">
        <Link href="/dashboard" className="flex items-baseline gap-3" onClick={closeMenu}>
          <span className="text-sm font-bold tracking-[0.2em] text-sigmafyBlue-600">
            SIGMAFY
          </span>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {props.workspaceName}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-4 hidden items-center gap-1 text-sm md:flex">
          {NAV.map((item) => {
            const active = item.match === activeMatch;
            return (
              <Link
                key={item.href}
                href={item.href as never}
                className={`rounded-md px-3 py-1.5 transition-colors ${
                  active
                    ? "bg-sigmafyBlue-50 font-medium text-sigmafyBlue-700"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <UserButton />
          {/* Hamburger toggle — mobile only */}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="app-mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {open && (
        <nav
          id="app-mobile-nav"
          className="border-t border-border/60 bg-background md:hidden"
        >
          <div className="mx-auto grid max-w-6xl gap-1 px-4 py-3 text-sm">
            <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {props.workspaceName}
            </p>
            {NAV.map((item) => {
              const active = item.match === activeMatch;
              return (
                <Link
                  key={item.href}
                  href={item.href as never}
                  onClick={closeMenu}
                  className={`rounded-md px-3 py-2 transition-colors ${
                    active
                      ? "bg-sigmafyBlue-50 font-medium text-sigmafyBlue-700"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
