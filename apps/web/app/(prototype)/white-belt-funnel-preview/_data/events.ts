/**
 * Funnel event taxonomy. Every event the mock backend would emit lives here
 * so future backend wiring can reuse the same keys verbatim.
 */
export type FunnelEventType =
  | "certificate_viewed"
  | "certificate_downloaded"
  | "certificate_shared"
  | "next_belt_cta_viewed"
  | "yellow_belt_clicked"
  | "yellow_belt_page_viewed"
  | "yellow_belt_interest_not_submitted"
  | "green_belt_clicked"
  | "black_belt_clicked"
  | "referral_cta_clicked"
  | "company_invite_started"
  | "company_invite_abandoned"
  | "company_invite_submitted"
  | "sigmafy_stats_viewed"
  | "reseller_interest_clicked"
  | "email_sequence_started"
  | "email_opened"
  | "email_clicked"
  | "reply_received"
  | "sales_follow_up_required"
  | "call_booked"
  | "converted_to_yellow_belt"
  | "converted_to_company_lead";

export interface FunnelEvent {
  id: string;
  type: FunnelEventType;
  occurredAt: string;
  learnerId: string;
  channel?: "in_app" | "email" | "ads" | "sales" | "system";
  metadata?: Record<string, string | number | boolean>;
}

export const mockEventTaxonomy: {
  type: FunnelEventType;
  label: string;
  description: string;
  category: "engagement" | "intent" | "conversion" | "email" | "sales";
}[] = [
  { type: "certificate_viewed", label: "Certificate viewed", description: "Learner reached the certificate page.", category: "engagement" },
  { type: "certificate_downloaded", label: "Certificate downloaded", description: "Learner downloaded the certificate PDF.", category: "engagement" },
  { type: "certificate_shared", label: "Certificate shared", description: "Learner used a share action.", category: "engagement" },
  { type: "next_belt_cta_viewed", label: "Next-belt CTA viewed", description: "Upgrade CTA rendered on the portal.", category: "engagement" },
  { type: "yellow_belt_clicked", label: "Yellow Belt clicked", description: "Learner clicked into Yellow Belt details.", category: "intent" },
  { type: "yellow_belt_page_viewed", label: "Yellow Belt page viewed", description: "Yellow Belt page rendered for the learner.", category: "intent" },
  { type: "yellow_belt_interest_not_submitted", label: "Yellow Belt — no enquiry", description: "Viewed YB but didn't enquire.", category: "intent" },
  { type: "green_belt_clicked", label: "Green Belt clicked", description: "Learner clicked into Green Belt details.", category: "intent" },
  { type: "black_belt_clicked", label: "Black Belt clicked", description: "Learner clicked into Black Belt details.", category: "intent" },
  { type: "referral_cta_clicked", label: "Referral CTA clicked", description: "Learner opened the referral panel.", category: "intent" },
  { type: "company_invite_started", label: "Company invite started", description: "Learner opened the company-invite form.", category: "intent" },
  { type: "company_invite_abandoned", label: "Company invite abandoned", description: "Started but did not submit.", category: "intent" },
  { type: "company_invite_submitted", label: "Company invite submitted", description: "Mock form submitted.", category: "conversion" },
  { type: "sigmafy_stats_viewed", label: "Sigmafy stats viewed", description: "Stats preview opened.", category: "intent" },
  { type: "reseller_interest_clicked", label: "Reseller interest clicked", description: "Partner CTA opened.", category: "intent" },
  { type: "email_sequence_started", label: "Email sequence started", description: "Sequence triggered.", category: "email" },
  { type: "email_opened", label: "Email opened", description: "Sequence email opened.", category: "email" },
  { type: "email_clicked", label: "Email clicked", description: "Sequence email click-through.", category: "email" },
  { type: "reply_received", label: "Email reply received", description: "Learner replied to a sequence email.", category: "email" },
  { type: "sales_follow_up_required", label: "Sales follow-up required", description: "Lead surfaced to a salesperson.", category: "sales" },
  { type: "call_booked", label: "Call booked", description: "Discovery call booked.", category: "sales" },
  { type: "converted_to_yellow_belt", label: "Converted to Yellow Belt", description: "Learner enrolled in Yellow Belt.", category: "conversion" },
  { type: "converted_to_company_lead", label: "Converted to company lead", description: "Lead progressed to a corporate opportunity.", category: "conversion" },
];

export const mockEventLog: FunnelEvent[] = [
  { id: "e1", type: "certificate_viewed", occurredAt: "2026-05-26T08:14:00Z", learnerId: "lrnr_mock_001", channel: "in_app" },
  { id: "e2", type: "certificate_downloaded", occurredAt: "2026-05-26T08:16:21Z", learnerId: "lrnr_mock_001", channel: "in_app" },
  { id: "e3", type: "next_belt_cta_viewed", occurredAt: "2026-05-26T08:17:02Z", learnerId: "lrnr_mock_001", channel: "in_app" },
  { id: "e4", type: "yellow_belt_clicked", occurredAt: "2026-05-26T08:17:48Z", learnerId: "lrnr_mock_001", channel: "in_app" },
  { id: "e5", type: "yellow_belt_page_viewed", occurredAt: "2026-05-26T08:17:55Z", learnerId: "lrnr_mock_001", channel: "in_app" },
  { id: "e6", type: "sigmafy_stats_viewed", occurredAt: "2026-05-26T08:21:12Z", learnerId: "lrnr_mock_001", channel: "in_app" },
  { id: "e7", type: "email_sequence_started", occurredAt: "2026-05-27T09:00:00Z", learnerId: "lrnr_mock_001", channel: "email", metadata: { sequence: "post_white_belt" } },
  { id: "e8", type: "email_opened", occurredAt: "2026-05-27T11:42:03Z", learnerId: "lrnr_mock_001", channel: "email", metadata: { template: "yellow_belt_upgrade" } },
  { id: "e9", type: "email_clicked", occurredAt: "2026-05-27T11:42:48Z", learnerId: "lrnr_mock_001", channel: "email", metadata: { template: "yellow_belt_upgrade" } },
  { id: "e10", type: "company_invite_started", occurredAt: "2026-05-28T13:05:11Z", learnerId: "lrnr_mock_001", channel: "in_app" },
  { id: "e11", type: "company_invite_abandoned", occurredAt: "2026-05-28T13:08:44Z", learnerId: "lrnr_mock_001", channel: "in_app" },
  { id: "e12", type: "sales_follow_up_required", occurredAt: "2026-05-29T07:30:00Z", learnerId: "lrnr_mock_001", channel: "system" },
];
