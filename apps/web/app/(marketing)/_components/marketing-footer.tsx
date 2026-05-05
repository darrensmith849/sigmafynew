import Link from "next/link";
import { Logo } from "@sigmafy/ui";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { href: "/product", label: "Overview" },
      { href: "/pricing", label: "Pricing" },
      { href: "/contact", label: "Customers" },
      { href: "/contact", label: "About" },
    ],
  },
  {
    heading: "Features",
    links: [
      { href: "/features/spc", label: "Statistical Process Control" },
      { href: "/features/projects", label: "Project Management" },
      { href: "/features/training", label: "Training & Exams" },
      { href: "/features/ai", label: "AI Evaluation" },
      { href: "/contact", label: "Admin & Multi-tenancy" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/sign-in", label: "Sign in" },
      { href: "/contact", label: "Privacy" },
      { href: "/contact", label: "Terms" },
    ],
  },
] as const;

export function MarketingFooter() {
  return (
    <footer className="border-t border-border-subtle bg-surface-2 text-fg">
      <div className="mx-auto grid max-w-shell gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="grid gap-3">
          <Logo />
          <p className="max-w-sm text-sm text-muted">
            Practical Six Sigma, AI-assisted. Built by 2KO.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.heading} className="grid gap-3 text-sm">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-2">
              {col.heading}
            </p>
            <ul className="grid gap-2">
              {col.links.map((l) => (
                <li key={`${col.heading}-${l.label}`}>
                  <Link
                    href={l.href as never}
                    className="text-fg/80 transition-colors hover:text-fg"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border-subtle">
        <div className="mx-auto flex max-w-shell items-center justify-between gap-4 px-5 py-6 text-xs text-muted sm:px-8">
          <p>© {new Date().getFullYear()} 2KO Pty Ltd. All rights reserved.</p>
          <p className="hidden sm:block">Sigmafy is built by 2KO.</p>
        </div>
      </div>
    </footer>
  );
}
