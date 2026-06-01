import type { ChipTint } from "@sigmafy/ui";

/**
 * Three funnel-health gauges shown above the executive summary on the
 * journey tab. Mock numbers, illustrative shape.
 */

export interface HealthGauge {
  id: string;
  label: string;
  value: number;
  /** 0–100. */
  percentage: number;
  caption: string;
  status: "healthy" | "watch" | "below_target";
  target: string;
  tint: ChipTint;
}

export const mockFunnelHealth: HealthGauge[] = [
  {
    id: "completion_health",
    label: "Cohort completion",
    value: 87,
    percentage: 87,
    caption: "184 / 211 enrolled completed",
    status: "healthy",
    target: "Target ≥ 80%",
    tint: "training",
  },
  {
    id: "progression_health",
    label: "Belt progression",
    value: 34,
    percentage: 34,
    caption: "Graduates booking next belt within 60d",
    status: "watch",
    target: "Target 50%",
    tint: "ai",
  },
  {
    id: "followup_health",
    label: "Sales follow-up coverage",
    value: 71,
    percentage: 71,
    caption: "High-intent leads contacted within 24h",
    status: "watch",
    target: "Target 90%",
    tint: "spc",
  },
];

export const mockFunnelHealthHeadline = {
  eyebrow: "Funnel health · last 30 days",
  title: "Three gauges that tell you the funnel is working",
  description:
    "Cohort completion is healthy; progression and follow-up coverage are the two levers worth pulling. Numbers are mock; shape is real.",
};
