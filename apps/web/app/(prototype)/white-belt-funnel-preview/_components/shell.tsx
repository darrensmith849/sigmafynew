import Link from "next/link";
import { Chip, Eyebrow, Logo, TabsBar, TabLink } from "@sigmafy/ui";
import { tabs, type TabKey } from "../_data/tabs";
import { ReviewerStatusPanel } from "./reviewer-status-panel";

const ROUTE = "/white-belt-funnel-preview";

export function PrototypeShell({
  activeTab,
  children,
}: {
  activeTab: TabKey;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <PrototypeBanner />
      <header className="sticky top-0 z-20 border-b border-border-subtle bg-bg/85 backdrop-blur">
        <div
          className="mx-auto flex items-center justify-between gap-4 px-6 py-3"
          style={{ maxWidth: "var(--max-w)" }}
        >
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden text-sm text-muted-foreground sm:inline">
              · White Belt Funnel · Preview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Chip>Prototype</Chip>
            <Chip>Mock data</Chip>
          </div>
        </div>
        <div
          className="mx-auto px-6 pb-2"
          style={{ maxWidth: "var(--max-w)" }}
        >
          <TabsBar className="overflow-x-auto">
            {tabs.map((t) => (
              <TabLink
                key={t.key}
                asChild
                active={t.key === activeTab}
                title={t.hint}
              >
                <Link href={`${ROUTE}?tab=${t.key}` as never} prefetch={false}>
                  {t.shortLabel}
                </Link>
              </TabLink>
            ))}
          </TabsBar>
        </div>
      </header>

      <main
        className="mx-auto flex flex-col gap-10 px-6 py-10"
        style={{ maxWidth: "var(--max-w)" }}
      >
        {children}
      </main>

      <footer className="border-t border-border-subtle">
        <div
          className="mx-auto flex flex-wrap items-center justify-between gap-3 px-6 py-6 text-[12px] text-muted-foreground"
          style={{ maxWidth: "var(--max-w)" }}
        >
          <span>
            Surface-only prototype · No real backend, emails, ads, or payments.
          </span>
          <span>
            Sigmafy · 2KO Pty Ltd · Six Sigma South Africa · {new Date().getFullYear()}
          </span>
        </div>
      </footer>

      <ReviewerStatusPanel />
    </div>
  );
}

function PrototypeBanner() {
  return (
    <div
      className="w-full border-b text-[12px]"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--tint-training) 12%, var(--color-bg))",
        borderColor:
          "color-mix(in srgb, var(--tint-training) 22%, transparent)",
        color: "var(--color-fg)",
      }}
    >
      <div
        className="mx-auto flex flex-wrap items-center justify-between gap-2 px-6 py-2"
        style={{ maxWidth: "var(--max-w)" }}
      >
        <span className="font-medium">
          Prototype · Mock data · Not connected to live systems
        </span>
        <span className="text-muted-foreground">
          Review surface for sign-off · do not share externally
        </span>
      </div>
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="flex flex-col gap-2">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="text-[28px] font-semibold leading-tight tracking-tight text-fg">
        {title}
      </h2>
      {description && (
        <p className="max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </header>
  );
}
