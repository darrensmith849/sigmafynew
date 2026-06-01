import type { RemarketingChannel } from "./remarketing";

export type FunnelStage =
  | "completed_white_belt"
  | "certificate_downloaded"
  | "viewed_upgrade_offer"
  | "interested_yellow_belt"
  | "company_referral_potential"
  | "remarketing_active"
  | "sales_follow_up_needed"
  | "converted"
  | "dormant";

export interface LeadScoringRule {
  id: string;
  trigger: string;
  delta: number;
}

export interface SalesLead {
  id: string;
  name: string;
  course: string;
  certificateDownloaded: boolean;
  lastAction: string;
  lastActionAt: string;
  funnelStage: FunnelStage;
  interestScore: number;
  upgradeInterest: "high" | "medium" | "low" | "none";
  referralInterest: "high" | "medium" | "low" | "none";
  companyLeadPotential: "high" | "medium" | "low" | "none";
  resellerInterest: "high" | "medium" | "low" | "none";
  activeChannels: RemarketingChannel[];
  assignedSalesperson: string | null;
  lastContactedAt: string | null;
  nextRecommendedAction: string;
}

export const mockLeadScoringRules: LeadScoringRule[] = [
  { id: "ls_cert", trigger: "Certificate downloaded", delta: 10 },
  { id: "ls_yb_view", trigger: "Viewed Yellow Belt", delta: 20 },
  { id: "ls_company_click", trigger: "Clicked company invite", delta: 30 },
  { id: "ls_stats", trigger: "Viewed Sigmafy statistics", delta: 25 },
  { id: "ls_submit", trigger: "Submitted interest form", delta: 40 },
  { id: "ls_reply", trigger: "Replied to email", delta: 50 },
  { id: "ls_call", trigger: "Requested a call", delta: 60 },
];

export const funnelStageLabels: Record<FunnelStage, string> = {
  completed_white_belt: "Completed White Belt",
  certificate_downloaded: "Certificate downloaded",
  viewed_upgrade_offer: "Viewed upgrade offer",
  interested_yellow_belt: "Interested in Yellow Belt",
  company_referral_potential: "Company referral potential",
  remarketing_active: "Remarketing active",
  sales_follow_up_needed: "Sales follow-up needed",
  converted: "Converted",
  dormant: "Dormant",
};

export const mockSalesLeads: SalesLead[] = [
  {
    id: "lead_001",
    name: "Thandi Mokoena",
    course: "White Belt",
    certificateDownloaded: true,
    lastAction: "Started company invite, abandoned",
    lastActionAt: "2026-05-28",
    funnelStage: "sales_follow_up_needed",
    interestScore: 65,
    upgradeInterest: "medium",
    referralInterest: "low",
    companyLeadPotential: "high",
    resellerInterest: "none",
    activeChannels: ["email", "sales_team"],
    assignedSalesperson: "Lerato (placeholder)",
    lastContactedAt: null,
    nextRecommendedAction: "Advisor call within 24h · company proposal",
  },
  {
    id: "lead_002",
    name: "James Pillay",
    course: "White Belt",
    certificateDownloaded: true,
    lastAction: "Clicked Yellow Belt email",
    lastActionAt: "2026-05-29",
    funnelStage: "interested_yellow_belt",
    interestScore: 55,
    upgradeInterest: "high",
    referralInterest: "low",
    companyLeadPotential: "low",
    resellerInterest: "none",
    activeChannels: ["email", "google_ads"],
    assignedSalesperson: null,
    lastContactedAt: null,
    nextRecommendedAction: "Send graduate-discount reminder",
  },
  {
    id: "lead_003",
    name: "Nomvula Dlamini",
    course: "White Belt",
    certificateDownloaded: true,
    lastAction: "Viewed Sigmafy stats",
    lastActionAt: "2026-05-27",
    funnelStage: "viewed_upgrade_offer",
    interestScore: 45,
    upgradeInterest: "medium",
    referralInterest: "low",
    companyLeadPotential: "medium",
    resellerInterest: "low",
    activeChannels: ["email"],
    assignedSalesperson: null,
    lastContactedAt: null,
    nextRecommendedAction: "Send company-ROI email",
  },
  {
    id: "lead_004",
    name: "Sipho Khumalo",
    course: "White Belt",
    certificateDownloaded: false,
    lastAction: "Completed course, has not opened certificate",
    lastActionAt: "2026-05-30",
    funnelStage: "completed_white_belt",
    interestScore: 5,
    upgradeInterest: "low",
    referralInterest: "none",
    companyLeadPotential: "low",
    resellerInterest: "none",
    activeChannels: ["email"],
    assignedSalesperson: null,
    lastContactedAt: null,
    nextRecommendedAction: "Send certificate reminder email",
  },
  {
    id: "lead_005",
    name: "Aisha Patel",
    course: "White Belt",
    certificateDownloaded: true,
    lastAction: "Booked discovery call",
    lastActionAt: "2026-05-31",
    funnelStage: "sales_follow_up_needed",
    interestScore: 95,
    upgradeInterest: "high",
    referralInterest: "medium",
    companyLeadPotential: "high",
    resellerInterest: "low",
    activeChannels: ["email", "sales_team"],
    assignedSalesperson: "Lerato (placeholder)",
    lastContactedAt: "2026-05-31",
    nextRecommendedAction: "Run discovery call · share proposal",
  },
  {
    id: "lead_006",
    name: "Connor van Wyk",
    course: "White Belt",
    certificateDownloaded: true,
    lastAction: "Clicked reseller CTA",
    lastActionAt: "2026-05-26",
    funnelStage: "company_referral_potential",
    interestScore: 35,
    upgradeInterest: "low",
    referralInterest: "high",
    companyLeadPotential: "medium",
    resellerInterest: "high",
    activeChannels: ["email", "linkedin"],
    assignedSalesperson: null,
    lastContactedAt: null,
    nextRecommendedAction: "Send partner-info email · partnerships review",
  },
  {
    id: "lead_007",
    name: "Mpho Sithole",
    course: "White Belt",
    certificateDownloaded: true,
    lastAction: "No activity 11 days",
    lastActionAt: "2026-05-20",
    funnelStage: "dormant",
    interestScore: 12,
    upgradeInterest: "low",
    referralInterest: "none",
    companyLeadPotential: "low",
    resellerInterest: "none",
    activeChannels: ["google_ads", "meta_ads"],
    assignedSalesperson: null,
    lastContactedAt: null,
    nextRecommendedAction: "Hold in remarketing audience · re-engagement email at day 21",
  },
  {
    id: "lead_008",
    name: "Rashid Ebrahim",
    course: "White Belt",
    certificateDownloaded: true,
    lastAction: "Enrolled in Yellow Belt",
    lastActionAt: "2026-05-29",
    funnelStage: "converted",
    interestScore: 100,
    upgradeInterest: "high",
    referralInterest: "low",
    companyLeadPotential: "low",
    resellerInterest: "none",
    activeChannels: [],
    assignedSalesperson: "Lerato (placeholder)",
    lastContactedAt: "2026-05-28",
    nextRecommendedAction: "Yellow Belt onboarding · keep in nurture for Green Belt",
  },
  {
    id: "lead_009",
    name: "Beatrice Okeke",
    course: "White Belt",
    certificateDownloaded: false,
    lastAction: "Started knowledge check, abandoned",
    lastActionAt: "2026-05-24",
    funnelStage: "remarketing_active",
    interestScore: 8,
    upgradeInterest: "low",
    referralInterest: "none",
    companyLeadPotential: "none",
    resellerInterest: "none",
    activeChannels: ["email", "meta_ads"],
    assignedSalesperson: null,
    lastContactedAt: null,
    nextRecommendedAction: "Send completion-nudge email · ads audience",
  },
];
