/**
 * Executive KPI tiles — surface-only mock numbers. Used by the funnel
 * summary block. Not connected to any data source.
 */

import type { ChipTint } from "@sigmafy/ui";

export interface FunnelKpi {
  id: string;
  label: string;
  value: string;
  caption: string;
  delta?: string;
  tint?: ChipTint;
}

export const mockFunnelKpis: FunnelKpi[] = [
  {
    id: "kpi_completions",
    label: "White Belt completions",
    value: "184",
    caption: "Last 30 days · sample tenant",
    delta: "+22% vs prev 30d",
    tint: "training",
  },
  {
    id: "kpi_cert_downloads",
    label: "Certificate downloads",
    value: "157",
    caption: "85% of completions",
    delta: "+3 pts vs benchmark",
    tint: "projects",
  },
  {
    id: "kpi_upgrade_clicks",
    label: "Upgrade clicks",
    value: "68",
    caption: "Yellow / Green / Black combined",
    delta: "+8% vs prev 30d",
    tint: "training",
  },
  {
    id: "kpi_company_leads",
    label: "Company leads",
    value: "12",
    caption: "Started company-invite form",
    delta: "5 in pipeline",
    tint: "spc",
  },
  {
    id: "kpi_referral_interest",
    label: "Referral interest",
    value: "9",
    caption: "Indicated interest in programme",
    delta: "Programme concept",
    tint: "ai",
  },
  {
    id: "kpi_remarketing_active",
    label: "Remarketing active",
    value: "112",
    caption: "Across email + Google + Meta",
    delta: "61% of cohort",
  },
  {
    id: "kpi_sales_followups",
    label: "Sales follow-ups required",
    value: "7",
    caption: "Triggered by high-intent events",
    delta: "Assigned to advisor",
    tint: "ai",
  },
  {
    id: "kpi_yb_conversions",
    label: "Yellow Belt conversions",
    value: "18",
    caption: "Within 14 days of White Belt completion",
    delta: "9.8% conversion rate",
    tint: "projects",
  },
];

export const mockKpiHeadline = {
  eyebrow: "Funnel summary · last 30 days",
  title: "White Belt → conversion at a glance",
  description:
    "One-screen view of how the cohort is moving through the funnel. All numbers below are illustrative — the prototype is not connected to live data.",
};
