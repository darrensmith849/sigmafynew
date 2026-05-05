import { cn } from "../lib/cn";

/**
 * Sigmafy logo + wordmark.
 *
 * The glyph is the angular sigma path lifted from dev-portal.sigmafy.co.
 * Pair with the wordmark "Sigmafy" — mixed case, weight 600, tight tracking.
 *
 * Pass `glyphOnly` to render just the icon (e.g. mobile compact bar).
 */
export function Logo({
  className,
  glyphOnly = false,
}: {
  className?: string;
  glyphOnly?: boolean;
}) {
  return (
    <span className={cn("inline-flex select-none items-center gap-2 text-fg", className)}>
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-auto"
        aria-hidden={!glyphOnly}
        aria-label={glyphOnly ? "Sigmafy" : undefined}
      >
        <path d="M19 5H7l5 7-5 7h12" />
      </svg>
      {!glyphOnly && (
        <span className="text-[15px] font-semibold tracking-tightish">Sigmafy</span>
      )}
    </span>
  );
}
