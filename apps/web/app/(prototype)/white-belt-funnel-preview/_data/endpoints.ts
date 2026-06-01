export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export interface MockEndpointContract {
  id: string;
  method: HttpMethod;
  path: string;
  purpose: string;
  triggeredBy: string;
  requestShape: string;
  responseShape: string;
  notes: string;
}

/**
 * Documentation-only contracts. Not real route handlers; not connected to
 * a server. Future backend work should target these shapes.
 */
export const mockEndpointContracts: MockEndpointContract[] = [
  {
    id: "ep_learner",
    method: "GET",
    path: "/api/mock/white-belt-funnel/learner",
    purpose: "Return the current learner's funnel-relevant profile.",
    triggeredBy: "Portal load",
    requestShape: "(no body) — workspace context from session",
    responseShape:
      "{ id, fullName, email, currentBelt, completedAt, consentToMarketing, consentToSalesContact }",
    notes: "RLS-scoped to the learner. No cross-tenant access.",
  },
  {
    id: "ep_events_list",
    method: "GET",
    path: "/api/mock/white-belt-funnel/events",
    purpose: "List funnel events for the current learner.",
    triggeredBy: "Sales portal load · remarketing map load",
    requestShape: "?since=ISO-8601 (optional)",
    responseShape: "{ events: FunnelEvent[] }",
    notes: "Future: paginate; admin/sales role required for other learners.",
  },
  {
    id: "ep_events_post",
    method: "POST",
    path: "/api/mock/white-belt-funnel/event",
    purpose: "Record one funnel event.",
    triggeredBy: "Every tracked interaction in the funnel",
    requestShape:
      "{ type: FunnelEventType, channel?: string, metadata?: Record<string, any> }",
    responseShape: "{ id, occurredAt, accepted: true }",
    notes:
      "Idempotency key recommended. Future: writes to a real events table; also forwards to ads audiences if consent granted.",
  },
  {
    id: "ep_offers",
    method: "GET",
    path: "/api/mock/white-belt-funnel/offers",
    purpose: "Personalised upgrade offers for the current learner.",
    triggeredBy: "Post-course portal load · upgrade tab load",
    requestShape: "(no body)",
    responseShape:
      "{ offers: Offer[], discounts: DiscountConcept[], recommendedOfferId }",
    notes:
      "Recommendation logic to be designed (heuristics in v1, model later).",
  },
  {
    id: "ep_referral",
    method: "POST",
    path: "/api/mock/white-belt-funnel/referral-interest",
    purpose: "Capture interest in the referral programme.",
    triggeredBy: "Referral panel submit",
    requestShape: "{ note?: string, channel?: string }",
    responseShape: "{ id, accepted: true }",
    notes: "Final reward terms not finalised; this only registers interest.",
  },
  {
    id: "ep_company",
    method: "POST",
    path: "/api/mock/white-belt-funnel/company-interest",
    purpose: "Capture a company-cohort enquiry.",
    triggeredBy: "Company invite form submit",
    requestShape:
      "{ companyName, contactPerson, contactEmail, headcount, industry, message? }",
    responseShape: "{ id, accepted: true }",
    notes: "Future: routes to CRM and sales pipeline.",
  },
  {
    id: "ep_reseller",
    method: "POST",
    path: "/api/mock/white-belt-funnel/reseller-interest",
    purpose: "Capture interest in the reseller / partner programme.",
    triggeredBy: "Reseller CTA submit",
    requestShape: "{ note?: string, networkSize?: string }",
    responseShape: "{ id, accepted: true }",
    notes: "Routes to partnerships, not the standard sales pipeline.",
  },
  {
    id: "ep_email_templates",
    method: "GET",
    path: "/api/mock/white-belt-funnel/email-templates",
    purpose: "List available email templates for preview / admin.",
    triggeredBy: "Email templates tab · admin",
    requestShape: "(no body)",
    responseShape: "{ templates: EmailTemplate[] }",
    notes: "Future: templates managed in DB, versioned per environment.",
  },
  {
    id: "ep_simulate_reply",
    method: "POST",
    path: "/api/mock/white-belt-funnel/simulate-email-reply",
    purpose: "Push a synthetic reply into the email-agent queue for testing.",
    triggeredBy: "Manual QA / demo",
    requestShape: "{ fromEmail, body, inReplyToTemplate }",
    responseShape: "{ replyId, detectedIntent, suggestedResponse, sentiment }",
    notes:
      "Dev-only. Future: AI classification through @sigmafy/ai; never auto-sends.",
  },
  {
    id: "ep_sales_leads",
    method: "GET",
    path: "/api/mock/white-belt-funnel/sales-leads",
    purpose: "Lead list for the sales portal.",
    triggeredBy: "Sales portal load",
    requestShape: "?stage=...&sort=score:desc",
    responseShape: "{ leads: SalesLead[] }",
    notes:
      "Role-gated to sales/admin. Future: integrates with CRM via outbound sync.",
  },
];
