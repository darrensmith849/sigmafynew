export interface SigmafyStatTile {
  id: string;
  label: string;
  value: string;
  caption: string;
  delta?: string;
  tone?: "neutral" | "positive" | "warning";
}

export interface SigmafyStatsPreview {
  headline: string;
  summary: string;
  tiles: SigmafyStatTile[];
  ctaLabel: string;
  ctaSecondaryLabel: string;
}

export const mockSigmafyStats: SigmafyStatsPreview = {
  headline: "See what Sigmafy looks like inside your company",
  summary:
    "Once your team starts running projects, Sigmafy turns the work into evidence — savings, completion rates, belt progression, ROI per cohort. Numbers below are illustrative.",
  tiles: [
    {
      id: "active",
      label: "Active improvement projects",
      value: "42",
      caption: "Sample tenant · all phases",
      delta: "+6 this quarter",
      tone: "positive",
    },
    {
      id: "savings",
      label: "Estimated annual savings",
      value: "R 12.4 m",
      caption: "Aggregated across projects · ZAR",
      delta: "+18% YoY",
      tone: "positive",
    },
    {
      id: "completion",
      label: "Delegate completion rate",
      value: "87%",
      caption: "White Belt → Yellow Belt cohorts",
      delta: "+4 pts",
      tone: "positive",
    },
    {
      id: "progression",
      label: "Belt progression",
      value: "34%",
      caption: "White Belt graduates who book a next belt within 60 days",
      delta: "Benchmark target 50%",
      tone: "warning",
    },
    {
      id: "company",
      label: "Company performance overview",
      value: "4 / 5",
      caption: "Sites tracking above target on at least one KPI",
      tone: "neutral",
    },
    {
      id: "roi",
      label: "Estimated training ROI",
      value: "6.8 ×",
      caption: "Savings vs cost of training cohorts",
      delta: "Illustrative",
      tone: "neutral",
    },
  ],
  ctaLabel: "Explore Sigmafy for your organisation",
  ctaSecondaryLabel: "Become a Sigmafy reseller / partner",
};
