import type { ChipTint } from "@sigmafy/ui";
import type { FunnelEventType } from "./events";

export type CtaPriority = "best-next" | "high-value" | "company" | "standard";
export type CtaIntent = "upgrade" | "company" | "referral" | "reseller" | "stats" | "advisor" | "self-serve";
export type CtaStatus = "not_viewed" | "viewed" | "high_intent" | "sales_follow_up";

export interface PortalCtaEnriched {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  whyMatters: string;
  ctaLabel: string;
  href: string;
  priority: CtaPriority;
  intent: CtaIntent;
  status: CtaStatus;
  estimatedValue?: string;
  eventOnClick: FunnelEventType;
  futureAction?: string;
}

const ROUTE = "/white-belt-funnel-preview";

const priorityOrder: Record<CtaPriority, number> = {
  "best-next": 0,
  "high-value": 1,
  company: 2,
  standard: 3,
};

export const priorityLabel: Record<CtaPriority, string> = {
  "best-next": "Best next step",
  "high-value": "High value",
  company: "Company opportunity",
  standard: "Worth considering",
};

export const priorityTint: Record<CtaPriority, ChipTint | undefined> = {
  "best-next": "training",
  "high-value": "ai",
  company: "projects",
  standard: undefined,
};

export const intentLabel: Record<CtaIntent, string> = {
  upgrade: "Upgrade intent",
  company: "Company intent",
  referral: "Referral intent",
  reseller: "Partner intent",
  stats: "Platform interest",
  advisor: "Wants guidance",
  "self-serve": "Self-serve",
};

export const statusLabel: Record<CtaStatus, string> = {
  not_viewed: "Not viewed",
  viewed: "Viewed",
  high_intent: "High intent",
  sales_follow_up: "Sales follow-up",
};

export const statusTint: Record<CtaStatus, ChipTint | undefined> = {
  not_viewed: undefined,
  viewed: "spc",
  high_intent: "training",
  sales_follow_up: "ai",
};

export const mockPortalCtas: PortalCtaEnriched[] = [
  {
    id: "cta_yb",
    eyebrow: "Next belt",
    title: "Upgrade to Yellow Belt",
    description:
      "Apply DMAIC to a real problem under a coach. White Belt graduate discount available.",
    whyMatters:
      "Highest single-step lift on the funnel. Most graduates who upgrade do so within 14 days.",
    ctaLabel: "View Yellow Belt",
    href: `${ROUTE}?tab=upgrade`,
    priority: "best-next",
    intent: "upgrade",
    status: "viewed",
    estimatedValue: "R 2 400 placeholder",
    eventOnClick: "yellow_belt_clicked",
    futureAction: "Start Yellow Belt remarketing sequence if not enquired within 24h.",
  },
  {
    id: "cta_company",
    eyebrow: "Company",
    title: "Bring Six Sigma to your company",
    description:
      "Custom 2KO training cohort + Sigmafy for project tracking. Company rates apply.",
    whyMatters:
      "Largest deal size on the funnel — even a single corporate cohort outweighs dozens of individual upgrades.",
    ctaLabel: "Request a proposal",
    href: `${ROUTE}?tab=referral`,
    priority: "company",
    intent: "company",
    status: "high_intent",
    estimatedValue: "≈ R 180 000 placeholder cohort",
    eventOnClick: "company_invite_started",
    futureAction:
      "Notify sales + start company follow-up sequence if form abandoned.",
  },
  {
    id: "cta_stats",
    eyebrow: "Insights",
    title: "View Sigmafy statistics / ROI",
    description: "See what Sigmafy looks like for a company already running projects.",
    whyMatters:
      "Strong indicator of company intent. Often precedes a serious cohort conversation.",
    ctaLabel: "See sample stats",
    href: `${ROUTE}?tab=stats`,
    priority: "high-value",
    intent: "stats",
    status: "viewed",
    estimatedValue: "Up to corporate cohort value",
    eventOnClick: "sigmafy_stats_viewed",
    futureAction: "Send company-ROI email +24h.",
  },
  {
    id: "cta_gb",
    eyebrow: "Skip ahead",
    title: "Enquire about Green Belt",
    description: "Run a full DMAIC project part-time, alongside your day job.",
    whyMatters: "Larger ticket; smaller cohort but high commitment signal.",
    ctaLabel: "Enquire",
    href: `${ROUTE}?tab=upgrade`,
    priority: "high-value",
    intent: "upgrade",
    status: "not_viewed",
    estimatedValue: "R 18 500 placeholder",
    eventOnClick: "green_belt_clicked",
    futureAction: "Personal pathway email + advisor invite.",
  },
  {
    id: "cta_bb",
    eyebrow: "Skip ahead",
    title: "Enquire about Black Belt",
    description: "Become the programme lead. Full-time, statistical depth.",
    whyMatters:
      "Smallest volume but highest single-learner ACV; route directly to advisor.",
    ctaLabel: "Enquire",
    href: `${ROUTE}?tab=upgrade`,
    priority: "high-value",
    intent: "upgrade",
    status: "not_viewed",
    estimatedValue: "R 58 000 placeholder",
    eventOnClick: "black_belt_clicked",
    futureAction: "Route to advisor · cohort intake list.",
  },
  {
    id: "cta_referral",
    eyebrow: "Reward",
    title: "Referral programme",
    description:
      "Refer learners, teams, or whole companies. Reward concept under finalisation.",
    whyMatters:
      "Cheapest acquisition channel once live; multiplies the cohort with no ad spend.",
    ctaLabel: "Express interest",
    href: `${ROUTE}?tab=referral`,
    priority: "standard",
    intent: "referral",
    status: "viewed",
    eventOnClick: "referral_cta_clicked",
    futureAction: "Add to referral interest list · send programme update when live.",
  },
  {
    id: "cta_invite",
    eyebrow: "Invite",
    title: "Invite colleagues",
    description: "Get others on the same page. They take their own White Belt.",
    whyMatters: "Light, low-friction surface for organic team adoption.",
    ctaLabel: "Invite colleagues",
    href: `${ROUTE}?tab=referral`,
    priority: "standard",
    intent: "referral",
    status: "not_viewed",
    eventOnClick: "referral_cta_clicked",
    futureAction: "Add invitee to nurture sequence on signup.",
  },
  {
    id: "cta_reseller",
    eyebrow: "Partner",
    title: "Become a Sigmafy / 2KO partner",
    description:
      "If you work with companies on improvement, partner with us. Early-stage programme.",
    whyMatters:
      "Strategic channel — small number of partners can drive substantial pipeline.",
    ctaLabel: "Request partner info",
    href: `${ROUTE}?tab=stats`,
    priority: "high-value",
    intent: "reseller",
    status: "sales_follow_up",
    eventOnClick: "reseller_interest_clicked",
    futureAction: "Route to partnerships · send partner-info email +1h.",
  },
  {
    id: "cta_call",
    eyebrow: "Talk to us",
    title: "Book a call with 2KO",
    description: "20 minutes with an advisor. No pitch — just figure out the right next step.",
    whyMatters: "Direct human signal — almost always the highest-intent action.",
    ctaLabel: "Book a call",
    href: `${ROUTE}?tab=portal`,
    priority: "high-value",
    intent: "advisor",
    status: "not_viewed",
    eventOnClick: "call_booked",
    futureAction: "Assign to advisor immediately · pre-send one-pager.",
  },
  {
    id: "cta_advisor",
    eyebrow: "Talk to us",
    title: "Speak to a course advisor",
    description: "Personalised pathway across Yellow, Green, Black, or company.",
    whyMatters: "Lower commitment than a call · still high intent.",
    ctaLabel: "Speak to advisor",
    href: `${ROUTE}?tab=portal`,
    priority: "standard",
    intent: "advisor",
    status: "not_viewed",
    eventOnClick: "sales_follow_up_required",
    futureAction: "Route as warm lead · advisor responds within 1 business day.",
  },
  {
    id: "cta_pathway",
    eyebrow: "Download",
    title: "Learning-pathway PDF",
    description: "A one-page summary of every belt — outcomes, audience, duration, price.",
    whyMatters: "Self-serve research material · keeps the surface useful at any intent level.",
    ctaLabel: "Download (mock)",
    href: "#mock-pathway-pdf",
    priority: "standard",
    intent: "self-serve",
    status: "not_viewed",
    eventOnClick: "next_belt_cta_viewed",
    futureAction: "Add to nurture if downloaded but no upgrade click.",
  },
  {
    id: "cta_compare",
    eyebrow: "Compare",
    title: "Compare belt options",
    description: "Side-by-side comparison of Yellow, Green, and Black Belt.",
    whyMatters: "Decision-aid · reduces drop-off for learners unsure which belt fits.",
    ctaLabel: "Open comparison",
    href: `${ROUTE}?tab=upgrade`,
    priority: "standard",
    intent: "self-serve",
    status: "not_viewed",
    eventOnClick: "next_belt_cta_viewed",
    futureAction: "If multiple belts compared, surface advisor CTA.",
  },
];

export function sortByPriority(ctas: PortalCtaEnriched[]): PortalCtaEnriched[] {
  return [...ctas].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
  );
}
