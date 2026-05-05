"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo, ThemeToggle, Button } from "@sigmafy/ui";

const NAV = [
  { href: "/product", label: "Product" },
  { href: "/features/spc", label: "SPC" },
  { href: "/features/projects", label: "Projects" },
  { href: "/features/training", label: "Training" },
  { href: "/features/ai", label: "AI" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
] as const;

/**
 * Sticky translucent marketing nav. Matches dev-portal.sigmafy.co
 * structure: brand left, primary links centre, theme toggle + sign-in
 * + "Talk to us" right. Mobile collapses to a full-screen drawer.
 */
export function MarketingNav() {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 border-b border-transparent backdrop-blur transition-colors"
        style={{ background: "var(--color-nav-bg)", height: "var(--nav-h)" }}
      >
        <div className="mx-auto flex h-full max-w-shell items-center justify-between gap-6 px-5 sm:px-8">
          <Link href="/" aria-label="Sigmafy home" onClick={close}>
            <Logo />
          </Link>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href as never}
                  className={`text-[13px] font-medium tracking-tightish transition-colors ${
                    active ? "text-fg" : "text-muted hover:text-fg"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden sm:inline-flex" />
            <Link href="/sign-in" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="sm">Talk to us</Button>
            </Link>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="marketing-mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-pill border border-border text-fg md:hidden"
            >
              {open ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <nav
          id="marketing-mobile-menu"
          className="fixed inset-x-0 top-[var(--nav-h)] z-40 bg-bg md:hidden"
          aria-label="Mobile primary"
        >
          <div className="mx-auto flex max-w-shell flex-col gap-1 px-5 py-8 sm:px-8">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href as never}
                onClick={close}
                className="block border-b border-border-subtle py-3 text-lg font-medium text-fg"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 pt-6">
              <Link href="/sign-in" onClick={close}>
                <Button variant="secondary">Sign in</Button>
              </Link>
              <Link href="/contact" onClick={close}>
                <Button>Talk to us</Button>
              </Link>
              <ThemeToggle className="ml-auto" />
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
