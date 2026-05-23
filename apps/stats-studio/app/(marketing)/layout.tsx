import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@sigmafy/ui";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-bg text-fg">
      <header className="border-b border-border-subtle bg-bg">
        <div className="mx-auto flex h-14 max-w-shell items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" aria-label="Sigmafy Statistics home" className="flex items-center gap-2">
            <Logo />
            <span className="text-sm font-medium text-muted">Statistics</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/sign-in" className="text-muted hover:text-fg">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg hover:bg-accent/90"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="mt-24 border-t border-border-subtle bg-bg">
        <div className="mx-auto flex max-w-shell flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-muted sm:px-8">
          <p>© {new Date().getFullYear()} Sigmafy — built by 2KO Pty Ltd</p>
          <Link href="/" className="hover:text-fg">
            stats.sigmafy.co
          </Link>
        </div>
      </footer>
    </main>
  );
}
