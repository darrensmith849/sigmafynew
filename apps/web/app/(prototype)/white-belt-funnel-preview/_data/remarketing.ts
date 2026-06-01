import type { FunnelEventType } from "./events";

export type RemarketingChannel =
  | "email"
  | "google_ads"
  | "meta_ads"
  | "linkedin"
  | "sales_team";

export type ChannelStatus =
  | "eligible"
  | "active"
  | "suppressed"
  | "converted"
  | "not_applicable";

export type LeadTemperature = "cold" | "warm" | "hot" | "converted";

export interface ChannelStatusRow {
  channel: RemarketingChannel;
  label: string;
  status: ChannelStatus;
  detail: string;
  consentNote: string;
}

export interface NextBestActionRule {
  id: string;
  ifAllEventsHappened: FunnelEventType[];
  butNotEvent?: FunnelEventType;
  withinHours: number;
  recommendedAction: string;
  rationale: string;
}

export const mockChannelStatuses: ChannelStatusRow[] = [
  {
    channel: "email",
    label: "Email sequence",
    status: "active",
    detail: "Day-2 of a 6-step post–White Belt sequence.",
    consentNote: "Marketing consent on file (mock).",
  },
  {
    channel: "google_ads",
    label: "Google remarketing",
    status: "eligible",
    detail:
      "Would be added to a 30-day audience after certificate download. No real pixel installed in this prototype.",
    consentNote: "Subject to cookie consent.",
  },
  {
    channel: "meta_ads",
    label: "Meta remarketing",
    status: "eligible",
    detail:
      "Would be added to a Facebook/Instagram custom audience. No real pixel installed in this prototype.",
    consentNote: "Subject to cookie consent.",
  },
  {
    channel: "linkedin",
    label: "LinkedIn / manual B2B",
    status: "not_applicable",
    detail:
      "Activated only when company-invite or reseller intent is detected.",
    consentNote: "Manual outreach — no automated sending.",
  },
  {
    channel: "sales_team",
    label: "Sales team follow-up",
    status: "active",
    detail: "Flagged after company-invite started + abandoned.",
    consentNote:
      "Sales contact permission not yet granted — call would be advisory only.",
  },
];

export const mockTemperature: LeadTemperature = "warm";

export const mockNextBestActionRules: NextBestActionRule[] = [
  {
    id: "nba_cert_no_click",
    ifAllEventsHappened: ["certificate_downloaded"],
    butNotEvent: "yellow_belt_clicked",
    withinHours: 24,
    recommendedAction: "Send Yellow Belt upgrade email",
    rationale:
      "Cert downloaded but no next-belt click — strongest moment to nudge.",
  },
  {
    id: "nba_yb_view_no_enq",
    ifAllEventsHappened: ["yellow_belt_page_viewed"],
    butNotEvent: "converted_to_yellow_belt",
    withinHours: 48,
    recommendedAction: "Show graduate-discount reminder + offer a call",
    rationale: "Intent signal without conversion — apply a soft discount.",
  },
  {
    id: "nba_company_click",
    ifAllEventsHappened: ["company_invite_started"],
    butNotEvent: "company_invite_submitted",
    withinHours: 24,
    recommendedAction: "Sales follow-up · advisor call",
    rationale:
      "Company intent without submission — talk to a human is the right next step.",
  },
  {
    id: "nba_stats_view",
    ifAllEventsHappened: ["sigmafy_stats_viewed"],
    withinHours: 24,
    recommendedAction: "Send company-ROI email",
    rationale: "Stats interest suggests they're evaluating Sigmafy for a team.",
  },
  {
    id: "nba_reseller",
    ifAllEventsHappened: ["reseller_interest_clicked"],
    withinHours: 12,
    recommendedAction: "Send partner-info email + assign to partnerships",
    rationale: "Reseller intent is rare — route quickly.",
  },
  {
    id: "nba_dormant",
    ifAllEventsHappened: ["certificate_viewed"],
    butNotEvent: "yellow_belt_clicked",
    withinHours: 72,
    recommendedAction: "Enter remarketing sequence (email + ads audience)",
    rationale: "No activity after 3 days — keep the touch warm.",
  },
  {
    id: "nba_reply",
    ifAllEventsHappened: ["reply_received"],
    withinHours: 1,
    recommendedAction: "Email agent drafts reply, human approves before send",
    rationale:
      "Replies are the hottest signal — never let them sit, never auto-send.",
  },
];
