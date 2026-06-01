export interface ReferralProgrammeConcept {
  headline: string;
  summary: string;
  potentialRewards: { label: string; note: string }[];
  legalNotes: string[];
  ctaLabel: string;
}

export interface CompanyInviteConcept {
  headline: string;
  summary: string;
  benefits: string[];
  formFields: {
    id: string;
    label: string;
    placeholder: string;
    kind: "text" | "email" | "number" | "textarea";
    optional?: boolean;
  }[];
  submitLabel: string;
  submissionDisclaimer: string;
}

export interface ResellerOpportunity {
  headline: string;
  summary: string;
  pathways: { label: string; description: string }[];
  legalNotes: string[];
  ctaLabel: string;
}

export const mockReferralProgramme: ReferralProgrammeConcept = {
  headline: "Refer a learner, a team, or a company",
  summary:
    "Help others get the same head-start you just did. Concept only — the exact reward model is being finalised.",
  potentialRewards: [
    {
      label: "Refer a learner",
      note: "Potential discount on your next belt · example incentive",
    },
    {
      label: "Refer a team",
      note: "Potential reward for the referrer · subject to approval",
    },
    {
      label: "Refer your company",
      note: "Up to R 10 000 placeholder reward · programme details to be finalised",
    },
    {
      label: "Ongoing partner income",
      note: "Concept — potential recurring commission for active partners",
    },
  ],
  legalNotes: [
    "Wording is illustrative only. Final terms, eligibility and payout structure will be issued before any reward is paid.",
    "No payment is processed inside this prototype.",
  ],
  ctaLabel: "Express interest in referring",
};

export const mockCompanyInvite: CompanyInviteConcept = {
  headline: "Bring Six Sigma to your company",
  summary:
    "Tell us about your team and we'll come back with a proposal — company cohorts, blended training, and Sigmafy for project tracking.",
  benefits: [
    "Custom 2KO training plan",
    "Company-rate pricing",
    "Sigmafy workspace for tracking projects and ROI",
    "Dedicated coach for the cohort",
  ],
  formFields: [
    { id: "company", label: "Company name", placeholder: "Acme (Pty) Ltd", kind: "text" },
    {
      id: "contact",
      label: "Contact person",
      placeholder: "Your name",
      kind: "text",
    },
    {
      id: "email",
      label: "Contact email",
      placeholder: "you@company.co.za",
      kind: "email",
    },
    {
      id: "headcount",
      label: "Approx. number of learners",
      placeholder: "12",
      kind: "number",
    },
    {
      id: "industry",
      label: "Industry",
      placeholder: "Manufacturing",
      kind: "text",
    },
    {
      id: "message",
      label: "Anything else (optional)",
      placeholder: "Goals, timing, current pain points…",
      kind: "textarea",
      optional: true,
    },
  ],
  submitLabel: "Request a proposal (mock)",
  submissionDisclaimer:
    "Prototype only — this form does not submit anywhere and no email is sent.",
};

export const mockResellerOpportunity: ResellerOpportunity = {
  headline: "Become a Sigmafy / 2KO partner",
  summary:
    "Bring Six Sigma training and Sigmafy to your network — for individuals, teams, or whole companies. Concept stage; final partner terms will be issued before any agreement is signed.",
  pathways: [
    {
      label: "Refer companies",
      description:
        "Introduce a company and earn a reward on a successful engagement. Surface-only concept.",
    },
    {
      label: "Offer Sigmafy as part of your service",
      description:
        "Consultants and Six Sigma practitioners can package Sigmafy into client engagements.",
    },
    {
      label: "Reseller agreement",
      description:
        "Established partners can resell training cohorts and Sigmafy seats under a partner agreement.",
    },
    {
      label: "Co-marketing",
      description:
        "Joint webinars, case studies, and case-led campaigns with 2KO.",
    },
  ],
  legalNotes: [
    "Commission structure, eligibility, and any partner agreement are not finalised. Final terms will be issued in writing.",
    "Nothing on this surface constitutes an offer or a contract.",
  ],
  ctaLabel: "Request partner information",
};
