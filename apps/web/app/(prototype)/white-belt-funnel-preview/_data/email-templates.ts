import type { FunnelEventType } from "./events";

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  previewText: string;
  body: string[];
  ctaLabel: string;
  ctaHrefMock: string;
  triggerEvent: FunnelEventType;
  triggerNote: string;
  targetAudience: string;
  delayHours: number;
  category:
    | "transactional"
    | "upgrade"
    | "referral"
    | "company"
    | "reseller"
    | "stats"
    | "reminder"
    | "sales"
    | "reengagement";
}

export const mockEmailTemplates: EmailTemplate[] = [
  {
    id: "tpl_cert_delivery",
    name: "Certificate delivery",
    subject: "Your Six Sigma White Belt certificate",
    previewText: "Well done — your certificate is attached.",
    body: [
      "Hi {{firstName}},",
      "Congratulations on completing Six Sigma White Belt. Your certificate is attached, and a copy is permanently stored in your Sigmafy portal.",
      "If you'd like to share it on LinkedIn, the post text and a graphic are ready to go in the portal.",
      "Onwards,",
      "The Six Sigma South Africa team",
    ],
    ctaLabel: "Open your portal",
    ctaHrefMock: "#mock-portal",
    triggerEvent: "certificate_viewed",
    triggerNote: "On certificate first view (or fallback at +1h)",
    targetAudience: "All White Belt graduates",
    delayHours: 0,
    category: "transactional",
  },
  {
    id: "tpl_congrats",
    name: "Congratulations + reflect",
    subject: "You did it, {{firstName}}",
    previewText: "Here's the moment to put it into practice.",
    body: [
      "Hi {{firstName}},",
      "White Belt is the first rung. Most graduates tell us the real win was naming the wastes they were already seeing.",
      "Here's a one-question reflection: which process at your work has more variation than it should?",
      "Reply with one line — we read every response.",
    ],
    ctaLabel: "Reflect in your portal",
    ctaHrefMock: "#mock-portal",
    triggerEvent: "certificate_downloaded",
    triggerNote: "+4h after certificate download",
    targetAudience: "All White Belt graduates",
    delayHours: 4,
    category: "transactional",
  },
  {
    id: "tpl_yb_upgrade",
    name: "Yellow Belt upgrade",
    subject: "Your White Belt graduate discount — Yellow Belt",
    previewText: "Save on the next step. Valid 7 days.",
    body: [
      "Hi {{firstName}},",
      "Yellow Belt is where it gets practical — you'll run your first DMAIC under a coach and walk away with a measurable saving.",
      "As a White Belt graduate, you've got a 15% saving on Yellow Belt for the next 7 days (subject to approval).",
      "Take a look — no commitment.",
    ],
    ctaLabel: "View Yellow Belt",
    ctaHrefMock: "#mock-yellow-belt",
    triggerEvent: "certificate_downloaded",
    triggerNote:
      "+24h after certificate download AND no yellow_belt_clicked event",
    targetAudience: "Graduates without next-belt interaction",
    delayHours: 24,
    category: "upgrade",
  },
  {
    id: "tpl_gb_bb_pathway",
    name: "Green / Black Belt pathway",
    subject: "Beyond Yellow — your full learning pathway",
    previewText: "Green Belt and Black Belt in plain English.",
    body: [
      "Hi {{firstName}},",
      "If you already see your future as a project lead or quality programme owner, you might want to skip ahead.",
      "Green Belt: part-time, runs a real DMAIC project.",
      "Black Belt: full-time programme leader.",
      "We can put together a personalised pathway — reply and we'll set up a 15-minute call.",
    ],
    ctaLabel: "See the full pathway",
    ctaHrefMock: "#mock-pathway",
    triggerEvent: "yellow_belt_page_viewed",
    triggerNote: "Sent if learner views YB but is a high-intent segment",
    targetAudience: "Graduates with high engagement",
    delayHours: 72,
    category: "upgrade",
  },
  {
    id: "tpl_referral",
    name: "Referral programme",
    subject: "Help someone else get the same head-start",
    previewText: "Concept stage — your reward, our thank-you.",
    body: [
      "Hi {{firstName}},",
      "We're putting the finishing touches to a referral programme — for individuals, teams, and whole companies.",
      "If you'd like to be the first to know how it works (and earn a thank-you when you refer someone), let us know.",
      "Wording above is illustrative; final terms will be issued before any reward is paid.",
    ],
    ctaLabel: "Express interest",
    ctaHrefMock: "#mock-referral",
    triggerEvent: "next_belt_cta_viewed",
    triggerNote: "+5 days after certificate, if no conversion",
    targetAudience: "Engaged graduates without conversion",
    delayHours: 120,
    category: "referral",
  },
  {
    id: "tpl_company",
    name: "Bring your company",
    subject: "Bring Six Sigma to your team",
    previewText: "Custom 2KO training plan for your company.",
    body: [
      "Hi {{firstName}},",
      "If Six Sigma would land well with your team, we put together company training plans built around your real processes.",
      "Tell us a little about your team and we'll come back with a proposal — no obligation, no canned pitch.",
    ],
    ctaLabel: "Request a company proposal",
    ctaHrefMock: "#mock-company",
    triggerEvent: "company_invite_started",
    triggerNote: "+12h after company invite started, if not submitted",
    targetAudience: "Learners who engaged with the company-invite panel",
    delayHours: 12,
    category: "company",
  },
  {
    id: "tpl_stats",
    name: "Sigmafy stats / company ROI",
    subject: "What Sigmafy looks like inside a company",
    previewText: "A picture of the ROI Six Sigma teams report.",
    body: [
      "Hi {{firstName}},",
      "When teams run Six Sigma projects inside Sigmafy, every project leaves a footprint — savings, completion rates, belt progression, ROI per cohort.",
      "If you'd like to see how that would look for your company, reply and we'll set up a 20-minute walkthrough.",
    ],
    ctaLabel: "See sample stats",
    ctaHrefMock: "#mock-stats",
    triggerEvent: "sigmafy_stats_viewed",
    triggerNote: "+24h after Sigmafy stats viewed",
    targetAudience: "Learners interested in company-scale Sigmafy",
    delayHours: 24,
    category: "stats",
  },
  {
    id: "tpl_reseller",
    name: "Reseller / partner opportunity",
    subject: "Partner with Sigmafy / 2KO",
    previewText: "If you work with companies on improvement, let's talk.",
    body: [
      "Hi {{firstName}},",
      "We're putting together a small partner programme — for consultants and Six Sigma practitioners who already work with companies on improvement.",
      "If that sounds like you, we'd love to chat. Final partner terms aren't issued yet — this is an early invitation to shape the programme.",
    ],
    ctaLabel: "Request partner info",
    ctaHrefMock: "#mock-reseller",
    triggerEvent: "reseller_interest_clicked",
    triggerNote: "+1h after reseller CTA click",
    targetAudience: "Learners who clicked partner / reseller CTA",
    delayHours: 1,
    category: "reseller",
  },
  {
    id: "tpl_reminder",
    name: "No-action reminder",
    subject: "Don't forget your White Belt certificate",
    previewText: "It's waiting for you in your portal.",
    body: [
      "Hi {{firstName}},",
      "Your certificate is sitting in your portal — one click to download.",
      "When you're ready, the post-course portal has the next step laid out.",
    ],
    ctaLabel: "Open your portal",
    ctaHrefMock: "#mock-portal",
    triggerEvent: "certificate_viewed",
    triggerNote: "+72h after certificate viewed, if not downloaded",
    targetAudience: "Graduates who haven't downloaded",
    delayHours: 72,
    category: "reminder",
  },
  {
    id: "tpl_sales_followup",
    name: "Sales follow-up after high-intent action",
    subject: "A quick note from {{salespersonName}}",
    previewText: "We noticed you were looking at company training.",
    body: [
      "Hi {{firstName}},",
      "I'm {{salespersonName}} at 2KO — I help companies put Six Sigma in place.",
      "I saw you were looking at our company training option. If it'd help to talk through what a programme might look like for your team, here's my calendar — pick any 20-minute slot.",
      "No pressure, no canned pitch.",
    ],
    ctaLabel: "Book a 20-minute call",
    ctaHrefMock: "#mock-call",
    triggerEvent: "company_invite_started",
    triggerNote: "Triggered by sales_follow_up_required event",
    targetAudience: "High-intent leads handed to sales",
    delayHours: 4,
    category: "sales",
  },
  {
    id: "tpl_reengage",
    name: "Re-engagement after inactivity",
    subject: "Still on your list?",
    previewText: "A nudge for your next belt.",
    body: [
      "Hi {{firstName}},",
      "We haven't seen you in your portal for a couple of weeks. No worries — life is full.",
      "If Yellow Belt is still on your list, here's a short note on what it covers and how learners typically fit it around their day job.",
    ],
    ctaLabel: "See Yellow Belt at a glance",
    ctaHrefMock: "#mock-yellow-belt",
    triggerEvent: "next_belt_cta_viewed",
    triggerNote: "+21 days after last activity",
    targetAudience: "Dormant graduates",
    delayHours: 504,
    category: "reengagement",
  },
];
