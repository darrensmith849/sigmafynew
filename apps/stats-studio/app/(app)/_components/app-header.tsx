import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Logo, ThemeToggle } from "@sigmafy/ui";

export function AppHeader({ workspaceName }: { workspaceName: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-border-subtle bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-shell items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex items-center gap-6">
          <Link href="/catalog" aria-label="Stats Studio home" className="flex items-center gap-2">
            <Logo />
            <span className="text-sm font-medium text-muted">Studio</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/catalog" className="text-muted hover:text-fg">
              Catalogue
            </Link>
            <Link href="/assistants" className="text-muted hover:text-fg">
              Assistants
            </Link>
            <Link href="/runs" className="text-muted hover:text-fg">
              My runs
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-xs text-muted sm:inline">{workspaceName}</span>
          <ThemeToggle className="hidden sm:inline-flex" />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
