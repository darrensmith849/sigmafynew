import type { BeltLevel } from "./course";

export interface Offer {
  id: string;
  belt: BeltLevel;
  title: string;
  tagline: string;
  description: string;
  outcomes: string[];
  whoItIsFor: string[];
  estimatedDuration: string;
  pricePlaceholder: string;
  recommended: boolean;
  primaryCtaLabel: string;
  primaryCtaHint: string;
  enquireOnly: boolean;
}

export interface DiscountConcept {
  id: string;
  label: string;
  detail: string;
  validityNote: string;
}

export const mockUpgradeOffers: Offer[] = [
  {
    id: "off_yellow",
    belt: "yellow",
    title: "Yellow Belt",
    tagline: "Contribute to projects",
    description:
      "Build on the White Belt with hands-on practice — Pareto analysis, basic SPC, fishbone, and a small guided improvement.",
    outcomes: [
      "Apply DMAIC to a low-risk problem",
      "Build a process map and a SIPOC",
      "Use Pareto and 5 Whys to find a real root cause",
      "Communicate improvements to a sponsor",
    ],
    whoItIsFor: [
      "Team members who join improvement projects",
      "Supervisors and team leads",
      "Anyone ready to move from awareness to action",
    ],
    estimatedDuration: "≈ 6 hours self-paced",
    pricePlaceholder: "R 2 400 placeholder",
    recommended: true,
    primaryCtaLabel: "View Yellow Belt",
    primaryCtaHint: "Most popular next step",
    enquireOnly: false,
  },
  {
    id: "off_green",
    belt: "green",
    title: "Green Belt",
    tagline: "Run improvement projects",
    description:
      "Lead a real DMAIC project part-time. Heavier on statistical tools — capability, MSA, hypothesis testing, control charts.",
    outcomes: [
      "Run a full DMAIC project under a coach",
      "Use statistical tools competently",
      "Drive a measurable saving for your sponsor",
    ],
    whoItIsFor: [
      "Project leads",
      "Engineers and analysts",
      "Anyone with a real problem and a sponsor",
    ],
    estimatedDuration: "8–12 weeks blended",
    pricePlaceholder: "R 18 500 placeholder",
    recommended: false,
    primaryCtaLabel: "Enquire about Green Belt",
    primaryCtaHint: "Sales advisor will be in touch",
    enquireOnly: true,
  },
  {
    id: "off_black",
    belt: "black",
    title: "Black Belt",
    tagline: "Lead the improvement programme",
    description:
      "Full-time programme leader — statistical depth, change leadership, mentoring of Green Belts, and portfolio management.",
    outcomes: [
      "Run a portfolio of DMAIC projects",
      "Mentor Green Belts and Yellow Belts",
      "Run designed experiments and complex SPC",
      "Lead organisational change",
    ],
    whoItIsFor: [
      "Future programme leads",
      "Senior engineers and managers",
      "Anyone responsible for a quality function",
    ],
    estimatedDuration: "16–20 weeks blended",
    pricePlaceholder: "R 58 000 placeholder",
    recommended: false,
    primaryCtaLabel: "Enquire about Black Belt",
    primaryCtaHint: "Cohort intakes are limited",
    enquireOnly: true,
  },
];

export const mockDiscountConcepts: DiscountConcept[] = [
  {
    id: "disc_grad",
    label: "White Belt graduate discount",
    detail: "Save 15% on Yellow Belt for graduates of the White Belt course.",
    validityNote: "Valid for 7 days from completion · subject to approval",
  },
  {
    id: "disc_team",
    label: "Bring your team",
    detail:
      "Three or more learners from the same company qualify for a team rate.",
    validityNote: "Indicative · final pricing per proposal",
  },
  {
    id: "disc_cohort",
    label: "Corporate cohort",
    detail:
      "Custom company cohorts attract a corporate rate and a dedicated coach.",
    validityNote: "Subject to scoping call · placeholder pricing",
  },
];
