"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Logo, ThemeToggle } from "@sigmafy/ui";

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
 * Adopts the dev-portal chrome: translucent + blurred background using
 * --color-nav-bg, the Sigmafy logo + lowercase wordmark, and subtle
 * weight-contrast active state (no off-brand blue accent). Mobile
 * collapses to a hamburger drawer.
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
    <header
      className="sticky top-0 z-30 border-b border-border-subtle backdrop-blur"
      style={{ background: "var(--color-nav-bg)" }}
    >
      <div className="mx-auto flex h-14 max-w-shell items-center gap-4 px-5 sm:gap-6 sm:px-8">
        <Link href="/dashboard" className="flex items-baseline gap-3" onClick={closeMenu}>
          <Logo />
          <span className="hidden text-sm text-muted sm:inline">{props.workspaceName}</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-5 text-[13px] md:flex" aria-label="Primary">
          {NAV.map((item) => {
            const active = item.match === activeMatch;
            return (
              <Link
                key={item.href}
                href={item.href as never}
                className={`tracking-tightish transition-colors ${
                  active ? "font-medium text-fg" : "text-muted hover:text-fg"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
          <UserButton />
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-pill text-muted hover:bg-surface-2 hover:text-fg md:hidden"
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

      {open && (
        <nav id="app-mobile-nav" className="border-t border-border-subtle bg-bg md:hidden">
          <div className="mx-auto grid max-w-shell gap-1 px-5 py-3 text-sm sm:px-8">
            <p className="px-3 pb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-2">
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
                    active ? "font-medium text-fg" : "text-muted hover:bg-surface-2 hover:text-fg"
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
