import type { ChipTint } from "@sigmafy/ui";

const TINT_VAR: Record<ChipTint, string> = {
  projects: "var(--tint-projects)",
  spc: "var(--tint-spc)",
  training: "var(--tint-training)",
  ai: "var(--tint-ai)",
  admin: "var(--tint-admin)",
};

interface GaugeRingProps {
  /** 0–100. */
  value: number;
  size?: number;
  thickness?: number;
  tint?: ChipTint;
  label?: string;
  unit?: string;
  className?: string;
}

/**
 * Circular SVG progress ring. Pure SVG. Used for funnel health gauges and
 * lead-score visualisation.
 */
export function GaugeRing({
  value,
  size = 96,
  thickness = 8,
  tint,
  label,
  unit,
  className,
}: GaugeRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const color = tint ? TINT_VAR[tint] : "var(--color-accent)";
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;
  return (
    <div
      role="img"
      aria-label={
        label ? `${label} ${Math.round(clamped)}${unit ?? "%"}` : undefined
      }
      className={`relative inline-flex items-center justify-center ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-surface-3)"
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="t-num text-[18px] font-semibold text-fg">
          {Math.round(clamped)}
          <span className="text-[12px] text-muted-foreground">
            {unit ?? "%"}
          </span>
        </span>
      </div>
    </div>
  );
}
