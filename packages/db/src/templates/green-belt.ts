import type { TemplateDefinition } from "../types";

/**
 * Canonical Green Belt DMAIC template — Phase 0A scope.
 *
 * The full template (all five DMAIC phases × multiple sections × many topics)
 * lands in Phase 1. Phase 0A surfaces only the Define → Charter slice with
 * three topics: Charter (read-only display), SIPOC (form submission),
 * Pareto (form + stats call).
 */
export const GREEN_BELT_TEMPLATE: TemplateDefinition = {
  phases: [
    {
      slug: "define",
      name: "Define",
      sections: [
        {
          slug: "charter",
          name: "Project Charter",
          topics: [
            {
              slug: "charter",
              name: "Charter",
              kind: "charter",
              description:
                "Document the problem, the goal, the scope, the timeline and the team for this Green Belt project.",
              prompt:
                "Sigmafy will display the canonical Charter prompts here in Phase 1. For Phase 0A this topic is read-only.",
            },
            {
              slug: "sipoc",
              name: "SIPOC",
              kind: "sipoc",
              description:
                "Suppliers, Inputs, Process, Outputs, Customers — a high-level view of the process you're improving.",
            },
            {
              slug: "pareto",
              name: "Pareto",
              kind: "pareto",
              description:
                "Quantify defect categories so the vital few stand out from the trivial many.",
            },
          ],
        },
      ],
    },
    { slug: "measure", name: "Measure", sections: [] },
    {
      slug: "analyse",
      name: "Analyse",
      sections: [
        {
          slug: "root-cause",
          name: "Root cause analysis",
          topics: [
            {
              slug: "five-whys",
              name: "5-Whys",
              kind: "five-whys",
              description:
                "Drill from a specific problem down to a root cause by asking \"why?\" five times — each answer is the next \"why\".",
            },
          ],
        },
      ],
    },
    { slug: "improve", name: "Improve", sections: [] },
    { slug: "control", name: "Control", sections: [] },
    { slug: "executive-summary", name: "Executive Summary", sections: [] },
  ],
};

export const GREEN_BELT_SLUG = "green-belt";
export const GREEN_BELT_VERSION = 1;
