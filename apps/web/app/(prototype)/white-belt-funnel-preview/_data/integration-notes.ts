export interface IntegrationNote {
  id: string;
  area: string;
  whatItNeeds: string;
  estimateNote: string;
  dependencies: string[];
}

export interface ComplianceNote {
  id: string;
  topic: string;
  what: string;
  why: string;
}

export interface SignOffItem {
  id: string;
  area: string;
  description: string;
}

export const mockIntegrationNotes: IntegrationNote[] = [
  {
    id: "int_courses",
    area: "Course content",
    whatItNeeds:
      "New tables: courses, modules, lessons, lesson_progress, certificates. Linked to belt level.",
    estimateNote: "Greenfield schema; reuse existing workspace scoping.",
    dependencies: ["@sigmafy/db", "RLS policies"],
  },
  {
    id: "int_enrolments",
    area: "Enrolments",
    whatItNeeds:
      "Extend the existing classes / classEnrolments tables with belt level and course progression.",
    estimateNote: "Build on already-shipped Slice B classes.",
    dependencies: ["@sigmafy/db"],
  },
  {
    id: "int_certificate",
    area: "Certificate",
    whatItNeeds:
      "Reuse existing /api/certificates/[projectId] PDF pipeline; add a course-completion variant.",
    estimateNote: "PDF renderer already exists for projects.",
    dependencies: ["@react-pdf/renderer", "apps/web/lib/certificate.tsx"],
  },
  {
    id: "int_events",
    area: "Event tracking",
    whatItNeeds:
      "New funnel_events table + a @sigmafy/events client. Event keys match the taxonomy in this prototype.",
    estimateNote: "Audit log infra already present; events would extend.",
    dependencies: ["@sigmafy/db", "@sigmafy/auth (workspace scope)"],
  },
  {
    id: "int_funnel_stages",
    area: "Funnel stages & lead scoring",
    whatItNeeds:
      "Stage transitions derived from events. Lead-score rules in a config table.",
    estimateNote: "Pure functions; no external integrations required.",
    dependencies: ["@sigmafy/db"],
  },
  {
    id: "int_offers",
    area: "Offers + discounts",
    whatItNeeds:
      "Offer catalog + per-belt discount rules. Personalisation hooks.",
    estimateNote: "Coupled to @sigmafy/billing for real promo codes.",
    dependencies: ["@sigmafy/billing"],
  },
  {
    id: "int_referral",
    area: "Referral records",
    whatItNeeds:
      "Referral codes, redemption tracking, reward ledger. Legal review of terms.",
    estimateNote: "Reward model not finalised; blocked on commercial sign-off.",
    dependencies: ["@sigmafy/db", "Legal review"],
  },
  {
    id: "int_company",
    area: "Company invite records",
    whatItNeeds:
      "Lead capture, routing to CRM, follow-up SLA tracking.",
    estimateNote: "Could feed into existing classes / sponsor model.",
    dependencies: ["CRM choice"],
  },
  {
    id: "int_reseller",
    area: "Reseller / partner records",
    whatItNeeds:
      "Partner agreement, commission tracking, partner portal scope decision.",
    estimateNote: "Distinct flow from sales — separate pipeline.",
    dependencies: ["Legal review", "Partnership terms"],
  },
  {
    id: "int_email_sequences",
    area: "Email sequences",
    whatItNeeds:
      "Trigger engine, template versioning, send-time personalisation, delivery + open/click tracking.",
    estimateNote: "Brevo adapter already exists for transactional sends.",
    dependencies: ["@sigmafy/emails (Brevo)", "Trigger engine choice"],
  },
  {
    id: "int_ads",
    area: "Remarketing audience sync",
    whatItNeeds:
      "Consent-gated outbound sync to Google Ads + Meta custom audiences.",
    estimateNote:
      "Pixel installation is a separate decision — needs DPIA / cookie banner.",
    dependencies: ["Cookie consent infra", "Ads accounts"],
  },
  {
    id: "int_crm",
    area: "CRM / sales pipeline",
    whatItNeeds:
      "Decide CRM (HubSpot? In-house?). Bidirectional sync of leads and stages.",
    estimateNote: "Today there is no CRM in the stack.",
    dependencies: ["CRM choice"],
  },
  {
    id: "int_email_reply",
    area: "Email reply handling",
    whatItNeeds:
      "Inbound parsing (Brevo Inbound or similar), classification, queue for the email agent.",
    estimateNote: "AI classification via @sigmafy/ai abstraction.",
    dependencies: ["@sigmafy/ai", "Inbound parser"],
  },
  {
    id: "int_email_agent",
    area: "Email agent approval workflow",
    whatItNeeds:
      "Approval queue UI, audit trail, hard rule: no auto-send without human approval.",
    estimateNote: "Maps neatly onto admin app pattern.",
    dependencies: ["apps/admin", "@sigmafy/ai"],
  },
  {
    id: "int_consent",
    area: "Unsubscribe & consent management",
    whatItNeeds:
      "Preference centre, unsubscribe handler, marketing/sales separation, POPIA alignment.",
    estimateNote: "Touched by every send and every audience sync.",
    dependencies: ["Legal review"],
  },
  {
    id: "int_admin",
    area: "Admin configuration panels",
    whatItNeeds:
      "Offers, discounts, email templates, trigger rules, lead scoring rules — all editable from apps/admin.",
    estimateNote: "Reuses Slice C topic-comment / audit-log patterns.",
    dependencies: ["apps/admin"],
  },
  {
    id: "int_audit",
    area: "Audit logs for funnel actions",
    whatItNeeds:
      "Sales actions, agent-approved sends, partner approvals — all audited.",
    estimateNote: "Reuse existing @sigmafy/db audit-log infra.",
    dependencies: ["@sigmafy/db audit-log"],
  },
];

export const mockComplianceNotes: ComplianceNote[] = [
  {
    id: "cmp_consent",
    topic: "Consent capture",
    what: "Granular opt-in for marketing emails, sales contact, and ads tracking.",
    why: "POPIA s 11: lawful processing requires consent for direct marketing.",
  },
  {
    id: "cmp_unsubscribe",
    topic: "Unsubscribe",
    what:
      "Visible in every marketing email; one-click; state synchronised across email + ads audiences.",
    why: "POPIA s 69 + global standard.",
  },
  {
    id: "cmp_prefs",
    topic: "Marketing preferences",
    what:
      "Preference centre lets the learner choose which sequences they receive.",
    why: "Reduces unsubscribe churn; signals respectful collection.",
  },
  {
    id: "cmp_cookies",
    topic: "Cookie / pixel consent",
    what:
      "Cookie banner with granular categories; ads pixels load only after explicit consent.",
    why: "POPIA + GDPR cookie obligations.",
  },
  {
    id: "cmp_retention",
    topic: "Data retention",
    what: "Event log retention policy (e.g. 24 months) with automatic purge.",
    why: "POPIA principle of minimality; reduces breach blast-radius.",
  },
  {
    id: "cmp_sales",
    topic: "Sales contact permission",
    what:
      "Sales follow-up requires explicit permission; system flags leads where permission is absent.",
    why: "Distinguishes transactional comms from outbound sales.",
  },
];

export const mockSignOffChecklist: SignOffItem[] = [
  { id: "so_audit", area: "Audit", description: "Audit summary read and confirmed accurate." },
  { id: "so_journey", area: "Learner journey", description: "Course + completion flow reviewed." },
  { id: "so_cert", area: "Certificate", description: "Certificate dopamine page reviewed." },
  { id: "so_portal", area: "Post-course portal", description: "CTA priorities reviewed." },
  { id: "so_offers", area: "Upgrade offers", description: "Yellow / Green / Black pathways reviewed." },
  { id: "so_discount", area: "Discount concepts", description: "Wording reviewed; not committing to terms." },
  { id: "so_referral", area: "Referral programme", description: "Reward concept reviewed (not final)." },
  { id: "so_company", area: "Company invite", description: "Form and flow reviewed." },
  { id: "so_stats", area: "Sigmafy stats CTA", description: "Stats sample tiles reviewed." },
  { id: "so_reseller", area: "Reseller opportunity", description: "Partner concept reviewed (not final)." },
  { id: "so_remarketing", area: "Remarketing map", description: "Channels, statuses, and NBA rules reviewed." },
  { id: "so_events", area: "Event taxonomy", description: "Event keys reviewed and approved." },
  { id: "so_sales_portal", area: "Sales portal", description: "Lead view + scoring rules reviewed." },
  { id: "so_emails", area: "Email templates", description: "All 11 templates reviewed." },
  { id: "so_agent", area: "Email agent concept", description: "Approval-required pattern reviewed." },
  { id: "so_endpoints", area: "Mock endpoint contracts", description: "Contracts reviewed before backend build." },
  { id: "so_integration", area: "Future integration notes", description: "Notes reviewed for completeness." },
  { id: "so_compliance", area: "Compliance placeholders", description: "POPIA / GDPR considerations noted." },
];
