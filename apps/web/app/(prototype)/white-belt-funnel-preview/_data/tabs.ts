export type TabKey =
  | "journey"
  | "certificate"
  | "portal"
  | "upgrade"
  | "referral"
  | "stats"
  | "remarketing"
  | "sales"
  | "emails"
  | "agent"
  | "endpoints"
  | "integration";

export interface TabDef {
  key: TabKey;
  label: string;
  shortLabel: string;
  hint: string;
}

export const tabs: TabDef[] = [
  { key: "journey", label: "Learner Journey", shortLabel: "Journey", hint: "Course landing → modules → completion" },
  { key: "certificate", label: "Certificate Page", shortLabel: "Certificate", hint: "Dopamine page after completion" },
  { key: "portal", label: "Post-Course Portal", shortLabel: "Portal", hint: "Next-best-action CTAs" },
  { key: "upgrade", label: "Upgrade Offers", shortLabel: "Upgrade", hint: "Yellow · Green · Black pathways" },
  { key: "referral", label: "Referral & Company Invite", shortLabel: "Referral", hint: "Reward concept + corporate enquiry" },
  { key: "stats", label: "Sigmafy Statistics", shortLabel: "Stats", hint: "Platform value + reseller CTA" },
  { key: "remarketing", label: "Remarketing Map", shortLabel: "Remarketing", hint: "Channels + events + next-best actions" },
  { key: "sales", label: "Sales Portal", shortLabel: "Sales", hint: "Lead view + scoring rules" },
  { key: "emails", label: "Email Templates", shortLabel: "Emails", hint: "11 sequence templates" },
  { key: "agent", label: "Email Agent Concept", shortLabel: "Agent", hint: "Replies → suggested response (review-required)" },
  { key: "endpoints", label: "Mock Endpoint Contracts", shortLabel: "Endpoints", hint: "Future API surface (docs only)" },
  { key: "integration", label: "Future Integration & Compliance", shortLabel: "Integration", hint: "Backend notes + sign-off gate" },
];

export const defaultTab: TabKey = "journey";

export function isTabKey(value: string | null | undefined): value is TabKey {
  return !!value && tabs.some((t) => t.key === value);
}
