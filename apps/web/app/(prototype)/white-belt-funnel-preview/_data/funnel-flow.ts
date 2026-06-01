import type { ChipTint } from "@sigmafy/ui";
import type { FunnelEventType } from "./events";

export interface FlowStage {
  id: string;
  label: string;
  caption: string;
  emitsEvents: FunnelEventType[];
  tint?: ChipTint;
}

export interface PathwaySplit {
  id: string;
  label: string;
  caption: string;
  emitsEvent: FunnelEventType;
  tint?: ChipTint;
}

export const mockFunnelStages: FlowStage[] = [
  {
    id: "s1",
    label: "Complete course",
    caption: "Eight modules + knowledge check",
    emitsEvents: [],
    tint: "training",
  },
  {
    id: "s2",
    label: "View certificate",
    caption: "Dopamine page renders",
    emitsEvents: ["certificate_viewed"],
    tint: "training",
  },
  {
    id: "s3",
    label: "Download / share certificate",
    caption: "Win is shared; momentum captured",
    emitsEvents: ["certificate_downloaded", "certificate_shared"],
    tint: "projects",
  },
  {
    id: "s4",
    label: "Choose next pathway",
    caption: "Post-course portal surfaces 12 CTAs",
    emitsEvents: ["next_belt_cta_viewed"],
    tint: "training",
  },
  {
    id: "s5",
    label: "Tracked event",
    caption: "Every click feeds the event taxonomy",
    emitsEvents: [
      "yellow_belt_clicked",
      "green_belt_clicked",
      "black_belt_clicked",
      "company_invite_started",
      "referral_cta_clicked",
      "sigmafy_stats_viewed",
      "reseller_interest_clicked",
    ],
    tint: "ai",
  },
  {
    id: "s6",
    label: "Remarketing sequence",
    caption: "Email + Google + Meta · consent-gated",
    emitsEvents: ["email_sequence_started", "email_opened", "email_clicked"],
    tint: "spc",
  },
  {
    id: "s7",
    label: "Sales action",
    caption: "High-intent leads routed to advisor",
    emitsEvents: ["sales_follow_up_required", "reply_received", "call_booked"],
    tint: "ai",
  },
  {
    id: "s8",
    label: "Conversion",
    caption: "Yellow Belt enrolment or company lead",
    emitsEvents: ["converted_to_yellow_belt", "converted_to_company_lead"],
    tint: "projects",
  },
];

export const mockPathwaySplits: PathwaySplit[] = [
  {
    id: "p_yb",
    label: "Upgrade to Yellow Belt",
    caption: "Primary upsell path",
    emitsEvent: "yellow_belt_clicked",
    tint: "training",
  },
  {
    id: "p_gb",
    label: "Enquire about Green Belt",
    caption: "Skip-ahead for committed learners",
    emitsEvent: "green_belt_clicked",
    tint: "training",
  },
  {
    id: "p_bb",
    label: "Enquire about Black Belt",
    caption: "Programme-lead pathway",
    emitsEvent: "black_belt_clicked",
    tint: "training",
  },
  {
    id: "p_company",
    label: "Refer your company",
    caption: "Custom 2KO cohort + Sigmafy",
    emitsEvent: "company_invite_started",
    tint: "projects",
  },
  {
    id: "p_invite",
    label: "Invite colleagues",
    caption: "Bring teammates to the same belt",
    emitsEvent: "referral_cta_clicked",
    tint: "ai",
  },
  {
    id: "p_stats",
    label: "Explore Sigmafy statistics",
    caption: "Platform value for decision-makers",
    emitsEvent: "sigmafy_stats_viewed",
    tint: "spc",
  },
  {
    id: "p_reseller",
    label: "Become reseller / partner",
    caption: "For Six Sigma practitioners",
    emitsEvent: "reseller_interest_clicked",
    tint: "admin",
  },
];
