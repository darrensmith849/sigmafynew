export type IntentCategory =
  | "interested_yellow_belt"
  | "interested_company_training"
  | "asking_about_pricing"
  | "wants_discount"
  | "interested_in_referral"
  | "interested_in_reseller"
  | "not_interested"
  | "needs_human_followup";

export type Sentiment = "positive" | "neutral" | "negative" | "mixed";

export interface IncomingReply {
  id: string;
  fromName: string;
  fromEmail: string;
  receivedAt: string;
  inReplyToTemplate: string;
  body: string;
  detectedIntent: IntentCategory;
  intentConfidence: number;
  sentiment: Sentiment;
  suggestedResponse: string;
  suggestedNextAction: string;
  assignedSalesperson: string | null;
  status: "awaiting_review" | "approved" | "escalated";
}

export const intentLabels: Record<IntentCategory, string> = {
  interested_yellow_belt: "Interested in Yellow Belt",
  interested_company_training: "Interested in company training",
  asking_about_pricing: "Asking about pricing",
  wants_discount: "Wants a discount",
  interested_in_referral: "Interested in the referral programme",
  interested_in_reseller: "Interested in the reseller programme",
  not_interested: "Not interested",
  needs_human_followup: "Needs a human follow-up",
};

export const mockIncomingReplies: IncomingReply[] = [
  {
    id: "rpl_001",
    fromName: "Thandi Mokoena",
    fromEmail: "thandi.mokoena@example.co.za",
    receivedAt: "2026-05-28T09:21:00Z",
    inReplyToTemplate: "tpl_yb_upgrade",
    body:
      "Hi — Yellow Belt looks great. Is there a payment plan, and would my company qualify for a team discount? We're about 14 operations supervisors.",
    detectedIntent: "interested_company_training",
    intentConfidence: 0.84,
    sentiment: "positive",
    suggestedResponse:
      "Hi Thandi — great to hear it. A team of 14 absolutely qualifies for a company plan. I'll put together a short proposal with pricing options (including a payment plan) and a suggested timeline, and share it later today. Quick question: are all 14 in one site, or split across locations?",
    suggestedNextAction:
      "Route to sales (corporate) · attach proposal template · ask about geography",
    assignedSalesperson: null,
    status: "awaiting_review",
  },
  {
    id: "rpl_002",
    fromName: "James Pillay",
    fromEmail: "james.pillay@example.co.za",
    receivedAt: "2026-05-29T14:02:00Z",
    inReplyToTemplate: "tpl_yb_upgrade",
    body:
      "Thanks. What's the actual price for Yellow Belt without the discount? And is the discount really 15%?",
    detectedIntent: "asking_about_pricing",
    intentConfidence: 0.91,
    sentiment: "neutral",
    suggestedResponse:
      "Hi James — list price is R 2 400 for self-paced Yellow Belt. The 15% graduate discount brings it to R 2 040 for the next 7 days. If you'd prefer a payment plan or have your company cover it, both are easy — just say the word.",
    suggestedNextAction: "Send pricing reply · monitor for next reply",
    assignedSalesperson: null,
    status: "awaiting_review",
  },
  {
    id: "rpl_003",
    fromName: "Connor van Wyk",
    fromEmail: "connor@vanwyk-consulting.co.za",
    receivedAt: "2026-05-26T17:48:00Z",
    inReplyToTemplate: "tpl_reseller",
    body:
      "Hello — I run a small Lean / Six Sigma practice and would love to chat about partnering. Especially the Sigmafy side. Are you open to a call?",
    detectedIntent: "interested_in_reseller",
    intentConfidence: 0.88,
    sentiment: "positive",
    suggestedResponse:
      "Hi Connor — yes, very keen. We're shaping the partner programme now and would love to include practitioners like you in the early conversations. Here's a calendar link — pick any 20-minute slot in the next two weeks that works.",
    suggestedNextAction: "Route to partnerships · attach calendar link",
    assignedSalesperson: "Partnerships team (placeholder)",
    status: "escalated",
  },
  {
    id: "rpl_004",
    fromName: "Beatrice Okeke",
    fromEmail: "beatrice.okeke@example.co.za",
    receivedAt: "2026-05-30T08:11:00Z",
    inReplyToTemplate: "tpl_reminder",
    body:
      "Please remove me from this list. Not interested.",
    detectedIntent: "not_interested",
    intentConfidence: 0.97,
    sentiment: "negative",
    suggestedResponse:
      "Hi Beatrice — done. You've been removed from all marketing emails. If you ever change your mind, just reply to any previous note and we'll put you back on.",
    suggestedNextAction: "Suppress · update consent state · log unsubscribe",
    assignedSalesperson: null,
    status: "approved",
  },
  {
    id: "rpl_005",
    fromName: "Aisha Patel",
    fromEmail: "aisha.patel@example.co.za",
    receivedAt: "2026-05-31T11:33:00Z",
    inReplyToTemplate: "tpl_sales_followup",
    body:
      "I'd like to talk about getting our 40-person operations team trained — and possibly using Sigmafy for our project portfolio. Can we do a call this week?",
    detectedIntent: "needs_human_followup",
    intentConfidence: 0.95,
    sentiment: "positive",
    suggestedResponse:
      "Hi Aisha — absolutely. Sending you a calendar link now; pick anything that works this week. Before the call I'll send a one-pager covering company cohorts and how teams use Sigmafy for portfolio tracking.",
    suggestedNextAction:
      "Assign to Lerato · send calendar link · attach one-pager",
    assignedSalesperson: "Lerato (placeholder)",
    status: "awaiting_review",
  },
];
