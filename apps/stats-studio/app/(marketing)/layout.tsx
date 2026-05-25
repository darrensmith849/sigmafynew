import Link from "next/link";
import type { ReactNode } from "react";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Logo } from "@sigmafy/ui";

/**
 * Marketing shell — also wraps the catalogue and tool runner pages so they
 * stay reachable without a Clerk session. The 2026-05-24 product decision
 * is "open browse, gate at run": anyone can land on /catalog or /t/[slug]
 * and explore; gating only kicks in when they hit "Run analysis" (handled
 * inside the form via the `activation_required` result code).
 *
 * The header therefore needs two states:
 *   - signed out → catalogue / pricing / sign in / get started
 *   - signed in  → catalogue / my runs / user menu
 */
export default async function MarketingLayout({ children }: { children: ReactNode }) {
  // Clerk v7 removed the <SignedIn /> / <SignedOut /> components — do the
  // branch server-side via auth() and render the two header variants directly.
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);

  return (
    <main className="min-h-screen bg-bg text-fg">
      <header className="border-b border-border-subtle bg-bg">
        <div className="mx-auto flex h-14 max-w-shell items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-6">
            <Link href="/" aria-label="Sigmafy Statistics home" className="flex items-center gap-2">
              <Logo />
              <span className="text-sm font-medium text-muted">Statistics</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/catalog" className="text-muted hover:text-fg">
                Catalogue
              </Link>
              {isSignedIn ? (
                <>
                  <Link href="/assistants" className="text-muted hover:text-fg">
                    Assistants
                  </Link>
                  <Link href="/runs" className="text-muted hover:text-fg">
                    My runs
                  </Link>
                </>
              ) : (
                <Link href="/pricing" className="text-muted hover:text-fg">
                  Pricing
                </Link>
              )}
            </nav>
          </div>

          <nav className="flex items-center gap-3 text-sm">
            {isSignedIn ? (
              <UserButton />
            ) : (
              <>
                <Link href="/sign-in" className="text-muted hover:text-fg">
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg hover:bg-accent/90"
                >
                  Activate — free
                </Link>
              </>
            )}
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
