import type { ChipTint } from "@sigmafy/ui";

/**
 * Tiny SVG line+area sparkline. Pure SVG, no JS, no library. Uses
 * `currentColor` for the stroke so the caller controls colour via
 * inline `style` or by setting a tint.
 */

const TINT_VAR: Record<ChipTint, string> = {
  projects: "var(--tint-projects)",
  spc: "var(--tint-spc)",
  training: "var(--tint-training)",
  ai: "var(--tint-ai)",
  admin: "var(--tint-admin)",
};

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  tint?: ChipTint;
  className?: string;
  /** When true, render the filled area beneath the line. Default true. */
  withArea?: boolean;
}

export function Sparkline({
  values,
  width = 96,
  height = 24,
  tint,
  className,
  withArea = true,
}: SparklineProps) {
  if (!values.length) return null;
  const color = tint ? TINT_VAR[tint] : "var(--color-accent)";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 1;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const step = innerW / (values.length - 1 || 1);
  const points = values.map((v, i) => {
    const x = pad + i * step;
    const y = pad + innerH - ((v - min) / range) * innerH;
    return [x, y] as const;
  });
  const line = points
    .map(([x, y], i) => (i === 0 ? `M${x} ${y}` : `L${x} ${y}`))
    .join(" ");
  const area =
    line + ` L${pad + innerW} ${pad + innerH} L${pad} ${pad + innerH} Z`;
  return (
    <svg
      role="img"
      aria-hidden
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
    >
      {withArea && (
        <path
          d={area}
          fill={color}
          opacity={0.12}
        />
      )}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
