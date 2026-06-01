import type { ChipTint } from "@sigmafy/ui";

export interface CommercialMetric {
  id: string;
  label: string;
  value: string;
  caption: string;
  assumption: string;
  tone: "opportunity" | "neutral" | "risk";
  tint?: ChipTint;
}

export interface CommercialAssumption {
  id: string;
  label: string;
  value: string;
}

export const mockCommercialAssumptions: CommercialAssumption[] = [
  { id: "ca_cohort", label: "Cohort size assumed", value: "184 / 30d" },
  { id: "ca_yb_conv", label: "Yellow Belt conversion", value: "10% (illustrative)" },
  { id: "ca_gb_conv", label: "Green Belt conversion", value: "2% (illustrative)" },
  { id: "ca_company", label: "Company-lead conversion", value: "3% (illustrative)" },
  { id: "ca_yb_price", label: "Yellow Belt price", value: "R 2 400 placeholder" },
  { id: "ca_gb_price", label: "Green Belt price", value: "R 18 500 placeholder" },
  { id: "ca_bb_price", label: "Black Belt price", value: "R 58 000 placeholder" },
  { id: "ca_company_acv", label: "Company cohort ACV", value: "R 180 000 placeholder" },
];

export const mockCommercialMetrics: CommercialMetric[] = [
  {
    id: "rev_yb",
    label: "Potential Yellow Belt revenue",
    value: "R 44 160",
    caption: "184 × 10% × R 2 400",
    assumption: "Per 30-day cohort · illustrative",
    tone: "opportunity",
    tint: "training",
  },
  {
    id: "rev_gb",
    label: "Potential Green Belt revenue",
    value: "R 68 080",
    caption: "184 × 2% × R 18 500",
    assumption: "Per 30-day cohort · illustrative",
    tone: "opportunity",
    tint: "training",
  },
  {
    id: "rev_bb",
    label: "Potential Black Belt revenue",
    value: "R 53 360",
    caption: "184 × 0.5% × R 58 000",
    assumption: "Per 30-day cohort · illustrative",
    tone: "opportunity",
    tint: "training",
  },
  {
    id: "rev_company",
    label: "Potential company cohort value",
    value: "R 993 600",
    caption: "184 × 3% × R 180 000",
    assumption: "Per 30-day cohort · illustrative",
    tone: "opportunity",
    tint: "projects",
  },
  {
    id: "rev_reseller",
    label: "Reseller / referral upside",
    value: "R 25 000+",
    caption: "Indicative · final terms TBC",
    assumption: "Reward model not finalised",
    tone: "opportunity",
    tint: "ai",
  },
  {
    id: "rev_conv",
    label: "Estimated funnel conversion",
    value: "16.5%",
    caption: "White Belt → next belt or company lead",
    assumption: "Target · achievable with funnel running",
    tone: "neutral",
    tint: "spc",
  },
  {
    id: "rev_lost",
    label: "Lost opportunity (no follow-up)",
    value: "R 1.16 m",
    caption: "Sum of above if no funnel exists",
    assumption: "Counterfactual · illustrative",
    tone: "risk",
    tint: "ai",
  },
  {
    id: "rev_remarketing",
    label: "Remarketing recovery uplift",
    value: "+18%",
    caption: "Expected lift from email + ads sequence",
    assumption: "Benchmark from comparable B2B funnels",
    tone: "opportunity",
    tint: "spc",
  },
];

export const mockCommercialHeadline = {
  eyebrow: "Commercial lens · illustrative",
  title: "What this funnel is worth",
  description:
    "Surface-only mock numbers showing the order of magnitude. Real values land after the funnel runs for one cohort with consent and tracking in place.",
};
