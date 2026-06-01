import type { ChipTint } from "@sigmafy/ui";

const TINT_VAR: Record<ChipTint, string> = {
  projects: "var(--tint-projects)",
  spc: "var(--tint-spc)",
  training: "var(--tint-training)",
  ai: "var(--tint-ai)",
  admin: "var(--tint-admin)",
};

export interface SequenceBarEvent {
  id: string;
  label: string;
  /** 0-based day on the horizontal axis. */
  day: number;
  /** Optional pill tint. */
  tint?: ChipTint;
}

interface SequenceBarsProps {
  events: SequenceBarEvent[];
  /** Total number of days to render on the axis. */
  totalDays: number;
}

/**
 * Horizontal day-axis with dot markers — used for the email sequence
 * timeline and other "events across days" visuals. Pure CSS + tiny SVG.
 */
export function SequenceBars({ events, totalDays }: SequenceBarsProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-2 rounded-pill bg-surface-3">
        {events.map((e) => {
          const left = `${(e.day / Math.max(totalDays, 1)) * 100}%`;
          const color = e.tint ? TINT_VAR[e.tint] : "var(--color-accent)";
          return (
            <span
              key={e.id}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left }}
              title={`${e.label} · day ${e.day}`}
            >
              <span
                aria-hidden
                className="inline-block h-3 w-3 rounded-full border-2"
                style={{
                  borderColor: color,
                  backgroundColor: "var(--color-bg)",
                }}
              />
            </span>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Day 0</span>
        <span>Day {Math.round(totalDays / 2)}</span>
        <span>Day {totalDays}</span>
      </div>
    </div>
  );
}
