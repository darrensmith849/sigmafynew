/**
 * "You vs cohort" mini-card data for the certificate tab. Mock only.
 */

export interface CohortStat {
  id: string;
  label: string;
  you: string;
  cohort: string;
  note: string;
}

export const mockCohortComparison: CohortStat[] = [
  {
    id: "days_to_next",
    label: "Days to your next belt",
    you: "Day 0",
    cohort: "7 days median",
    note: "Most graduates start Yellow Belt within a week.",
  },
  {
    id: "share_yb",
    label: "Chose Yellow Belt next",
    you: "Pending",
    cohort: "68%",
    note: "The most common next-step on the funnel.",
  },
  {
    id: "share_company",
    label: "Brought their company",
    you: "Pending",
    cohort: "6%",
    note: "Smaller volume — but the largest single deal.",
  },
];

export const mockCohortHeadline = {
  eyebrow: "You vs cohort",
  title: "How White Belt graduates usually move next",
};
