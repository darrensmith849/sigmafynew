import Link from "next/link";
import { Chip, Eyebrow, Logo } from "@sigmafy/ui";
import { tabs, type TabKey } from "../_data/tabs";
import {
  tabCategoryLabel,
  tabsByCategory,
  type TabCategory,
} from "../_data/visual-categories";
import { ReviewerStatusPanel } from "./reviewer-status-panel";
import { RevealMounter } from "./reveal-mounter";

const ROUTE = "/white-belt-funnel-preview";

const TINT_CSS: Record<TabCategory, string> = {
  learner: "var(--tint-training)",
  intelligence: "var(--tint-ai)",
  ops: "var(--tint-admin)",
};

export function PrototypeShell({
  activeTab,
  children,
}: {
  activeTab: TabKey;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <RevealMounter />
      <PrototypeBanner />
      <header className="sticky top-0 z-20 border-b border-border-subtle glass">
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
          className="mx-auto px-6 pb-3"
          style={{ maxWidth: "var(--max-w)" }}
        >
          <CategorizedTabBar activeTab={activeTab} />
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
            Sigmafy · 2KO Pty Ltd · Six Sigma South Africa ·{" "}
            {new Date().getFullYear()}
          </span>
        </div>
      </footer>

      <ReviewerStatusPanel />
    </div>
  );
}

function CategorizedTabBar({ activeTab }: { activeTab: TabKey }) {
  const categories: TabCategory[] = ["learner", "intelligence", "ops"];
  return (
    <div
      role="tablist"
      aria-label="White Belt funnel preview tabs"
      className="flex flex-wrap items-center gap-x-4 gap-y-2 overflow-x-auto"
    >
      {categories.map((cat, i) => (
        <div key={cat} className="flex items-center gap-2">
          {i > 0 && (
            <span
              aria-hidden
              className="hidden h-4 w-px bg-border-subtle md:inline-block"
            />
          )}
          <span
            className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] md:inline"
            style={{ color: TINT_CSS[cat] }}
          >
            {tabCategoryLabel[cat]}
          </span>
          <div className="flex items-center gap-1">
            {tabsByCategory[cat].map((key) => {
              const t = tabs.find((tb) => tb.key === key)!;
              const active = key === activeTab;
              return (
                <Link
                  key={key}
                  href={`${ROUTE}?tab=${key}` as never}
                  prefetch={false}
                  role="tab"
                  aria-selected={active}
                  title={t.hint}
                  className={
                    "relative inline-flex h-9 items-center rounded-pill px-3 text-[13px] font-medium transition-colors " +
                    (active
                      ? "bg-surface-2 text-fg"
                      : "text-muted-foreground hover:bg-surface-2 hover:text-fg")
                  }
                  style={
                    active
                      ? {
                          boxShadow: `inset 0 -2px 0 ${TINT_CSS[tabCategoryForKey(key)]}`,
                        }
                      : undefined
                  }
                >
                  {t.shortLabel}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function tabCategoryForKey(key: TabKey): TabCategory {
  if (tabsByCategory.learner.includes(key)) return "learner";
  if (tabsByCategory.intelligence.includes(key)) return "intelligence";
  return "ops";
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
  tint,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  tint?: string;
}) {
  return (
    <header className="flex flex-col gap-2" data-reveal>
      <Eyebrow style={tint ? { color: tint } : undefined}>{eyebrow}</Eyebrow>
      <h2 className="h-display-md text-fg">{title}</h2>
      {description && <p className="t-lede max-w-3xl">{description}</p>}
    </header>
  );
}

export function tintForCategory(c: TabCategory): string {
  return TINT_CSS[c];
}
