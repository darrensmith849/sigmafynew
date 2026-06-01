import type { BeltLevel } from "./course";

export interface WhiteBeltLearner {
  id: string;
  fullName: string;
  email: string;
  workspaceName: string;
  jobTitle: string;
  industry: string;
  countryCode: string;
  enrolledAt: string;
  completedAt: string | null;
  currentBelt: BeltLevel;
  consentToMarketing: boolean;
  consentToSalesContact: boolean;
}

export const mockLearner: WhiteBeltLearner = {
  id: "lrnr_mock_001",
  fullName: "Thandi Mokoena",
  email: "thandi.mokoena@example.co.za",
  workspaceName: "Thandi's workspace",
  jobTitle: "Operations Supervisor",
  industry: "Manufacturing",
  countryCode: "ZA",
  enrolledAt: "2026-05-18",
  completedAt: "2026-05-26",
  currentBelt: "white",
  consentToMarketing: true,
  consentToSalesContact: false,
};
