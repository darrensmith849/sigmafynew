"use client";

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
 * Workspace name on the left, primary nav in the centre, UserButton on the
 * right. Active nav link gets the Sigmafy-blue accent. Pages keep their own
 * page-level "← back to X" breadcrumb separately when a back link is useful.
 */
export function AppHeader(props: { workspaceName: string }) {
  const pathname = usePathname() ?? "";

  // Resolve the active link by longest-match — Projects is the catch-all so
  // sub-pages of /dashboard/<other> don't accidentally also light it.
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
  // Special case: Projects (no /dashboard/sub-path) is the default for
  // /dashboard exactly + any /projects/[id] page.
  if (!activeMatch && (pathname === "/dashboard" || pathname.startsWith("/projects/"))) {
    activeMatch = "/dashboard";
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6">
        <Link href="/dashboard" className="flex items-baseline gap-3">
          <span className="text-sm font-bold tracking-[0.2em] text-sigmafyBlue-600">
            SIGMAFY
          </span>
          <span className="text-sm text-muted-foreground">{props.workspaceName}</span>
        </Link>
        <nav className="ml-4 flex items-center gap-1 text-sm">
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
        <div className="ml-auto">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
