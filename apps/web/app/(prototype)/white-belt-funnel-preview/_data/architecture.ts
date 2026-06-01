import type { ChipTint } from "@sigmafy/ui";

export interface ArchNode {
  id: string;
  label: string;
  caption: string;
  status: "exists" | "extends" | "new";
  tint?: ChipTint;
  reusesFrom?: string;
}

export interface ArchEdge {
  from: string;
  to: string;
  label?: string;
}

/**
 * Documentation-only diagram. Nodes describe what the future backend would
 * look like; edges describe data flow. Not a build artifact.
 */
export const mockArchNodes: ArchNode[] = [
  {
    id: "frontend",
    label: "Prototype frontend",
    caption: "Today: surface-only UI. Future: same UI bound to real data.",
    status: "exists",
    reusesFrom: "apps/web · /white-belt-funnel-preview",
    tint: "training",
  },
  {
    id: "events",
    label: "Event tracking service",
    caption: "Every funnel event lands here · canonical taxonomy in _data/events.ts.",
    status: "new",
    reusesFrom: "Builds on @sigmafy/db audit-log infra",
    tint: "ai",
  },
  {
    id: "db",
    label: "Funnel database",
    caption: "courses · enrolments · lessons · progress · certificates · funnel_events · leads",
    status: "new",
    reusesFrom: "@sigmafy/db + workspace-scoped RLS",
    tint: "projects",
  },
  {
    id: "email",
    label: "Email engine",
    caption: "Trigger rules · template versioning · delivery + open/click.",
    status: "extends",
    reusesFrom: "@sigmafy/emails (Brevo adapter already shipped)",
    tint: "spc",
  },
  {
    id: "audiences",
    label: "Remarketing audiences",
    caption: "Consent-gated sync · Google Ads + Meta custom audiences.",
    status: "new",
    reusesFrom: "Needs cookie-consent infrastructure",
    tint: "ai",
  },
  {
    id: "sales",
    label: "Sales portal",
    caption: "Lead list · scoring · assignment · activity log.",
    status: "new",
    reusesFrom: "Shape defined in _data/sales-funnel.ts",
    tint: "training",
  },
  {
    id: "crm",
    label: "CRM / human follow-up",
    caption: "Outbound sync · sales pipeline · contact permission gate.",
    status: "new",
    reusesFrom: "CRM choice TBD",
    tint: "admin",
  },
  {
    id: "ai",
    label: "AI email agent",
    caption: "Classify replies · suggest responses · human approval required.",
    status: "extends",
    reusesFrom: "@sigmafy/ai (OpenAI adapter already shipped)",
    tint: "ai",
  },
  {
    id: "admin",
    label: "Admin config",
    caption: "Offers · discounts · email templates · trigger rules · lead scoring.",
    status: "new",
    reusesFrom: "apps/admin",
    tint: "admin",
  },
];

export const mockArchEdges: ArchEdge[] = [
  { from: "frontend", to: "events", label: "POST /event" },
  { from: "events", to: "db", label: "persist" },
  { from: "db", to: "email", label: "trigger rules" },
  { from: "email", to: "audiences", label: "consent-gated sync" },
  { from: "db", to: "audiences", label: "audience sync" },
  { from: "db", to: "sales", label: "lead view" },
  { from: "sales", to: "crm", label: "outbound sync" },
  { from: "email", to: "ai", label: "inbound parsing" },
  { from: "ai", to: "sales", label: "suggested response (approval-gated)" },
  { from: "admin", to: "db", label: "config writes" },
];

export const mockArchPhases = [
  {
    id: "p1",
    label: "Phase A · foundations",
    description:
      "Course content schema · funnel_events table · @sigmafy/events client.",
  },
  {
    id: "p2",
    label: "Phase B · email engine",
    description:
      "Trigger engine · template versioning · existing Brevo adapter wired to sequences.",
  },
  {
    id: "p3",
    label: "Phase C · sales portal",
    description: "Lead view in apps/admin · scoring rules · activity log.",
  },
  {
    id: "p4",
    label: "Phase D · remarketing + consent",
    description:
      "Cookie-consent infra · audience sync · POPIA / GDPR preference centre.",
  },
  {
    id: "p5",
    label: "Phase E · AI email agent",
    description: "Inbound parsing · classification via @sigmafy/ai · approval queue.",
  },
];
