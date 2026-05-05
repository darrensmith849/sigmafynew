import { Eyebrow } from "@sigmafy/ui";
import type { ReactNode } from "react";

/**
 * Section-page hero: subtle accent-2 glow + grid background, then
 * eyebrow / headline / lede / optional CTAs. Used by every inner
 * marketing page so they feel like one product.
 */
export function PageHero(props: {
  eyebrow: string;
  title: string;
  lede: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden pt-16 pb-10 md:pt-24 md:pb-14">
      <div className="absolute inset-x-0 -top-24 -z-10 h-[420px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(50% 60% at 50% 0%, color-mix(in srgb, var(--color-accent-2) 18%, transparent) 0%, transparent 70%)",
            filter: "blur(40px)",
            opacity: 0.85,
          }}
        />
        <div className="absolute inset-0 bg-grid opacity-40" />
      </div>
      <div className="mx-auto max-w-shell px-5 sm:px-8">
        <div data-reveal className="max-w-3xl">
          <Eyebrow>{props.eyebrow}</Eyebrow>
          <h1 className="h-display-lg mt-4 text-fg">{props.title}</h1>
          <p className="t-lede mt-6 max-w-2xl">{props.lede}</p>
          {props.children && <div className="mt-8 flex flex-wrap gap-3">{props.children}</div>}
        </div>
      </div>
    </section>
  );
}
