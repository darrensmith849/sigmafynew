import type { ReactNode } from "react";
import { MarketingNav } from "./_components/marketing-nav";
import { MarketingFooter } from "./_components/marketing-footer";
import { AnimationsMount } from "./_components/animations-mount";

/**
 * Shared chrome for every marketing route: sticky nav, animation
 * primitives bootstrap, and footer. Pages render between nav + footer.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <MarketingNav />
      <main className="flex-1" style={{ paddingTop: "var(--nav-h)" }}>
        {children}
      </main>
      <MarketingFooter />
      <AnimationsMount />
    </div>
  );
}
