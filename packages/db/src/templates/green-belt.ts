import type { TemplateDefinition } from "../types";

/**
 * Canonical Green Belt DMAIC template.
 *
 * Phase 0A: Define → Charter (read-only), SIPOC, Pareto.
 * Phase 1 Slice A.3: Charter becomes editable + AI-graded; 5-Whys lands
 *   under Analyse → Root cause analysis.
 * Phase 1 Slice A.4: long-form topic kind populates Measure / Improve /
 *   Control / Executive Summary phases. AI Copilot grades each.
 *
 * Process Map and Fishbone topic kinds (per master plan §5.1) land in
 * Slice A.5 — they need richer UI than long-form.
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
                "Define the problem, goal, scope and target for this Green Belt project. AI Copilot grades each field.",
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
    {
      slug: "measure",
      name: "Measure",
      sections: [
        {
          slug: "measurement-system",
          name: "Measurement system",
          topics: [
            {
              slug: "data-collection-plan",
              name: "Data Collection Plan",
              kind: "long-form",
              description:
                "What data, from where, by whom, how often, and how it will be analysed. Include sample size and any operational definitions.",
            },
            {
              slug: "operational-definitions",
              name: "Operational Definitions",
              kind: "long-form",
              description:
                "Precise definitions of every metric and category in your data — how each is measured and what counts as a defect.",
            },
          ],
        },
        {
          slug: "data",
          name: "Data analysis",
          topics: [
            {
              slug: "histogram",
              name: "Histogram",
              kind: "histogram",
              description:
                "Visualise the distribution of your measured variable. Useful for spotting skew, outliers, and whether the process output looks normal.",
            },
          ],
        },
      ],
    },
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
            {
              slug: "hypotheses",
              name: "Hypotheses",
              kind: "long-form",
              description:
                "List the candidate root causes you'll test, with the data or evidence that would confirm or rule each one out.",
            },
          ],
        },
      ],
    },
    {
      slug: "improve",
      name: "Improve",
      sections: [
        {
          slug: "solutions",
          name: "Solution selection",
          topics: [
            {
              slug: "solution-selection",
              name: "Solution Selection",
              kind: "long-form",
              description:
                "Candidate solutions, the trade-offs between them, the chosen solution, and why. Reference the root cause it addresses.",
            },
            {
              slug: "implementation-plan",
              name: "Implementation Plan",
              kind: "long-form",
              description:
                "Concrete steps to roll the solution out: owners, dates, dependencies, rollback plan if it doesn't work.",
            },
          ],
        },
      ],
    },
    {
      slug: "control",
      name: "Control",
      sections: [
        {
          slug: "control-plan",
          name: "Control plan",
          topics: [
            {
              slug: "control-plan",
              name: "Control Plan",
              kind: "long-form",
              description:
                "How the gain stays locked in: what's monitored, by whom, how often, and what triggers a corrective action.",
            },
            {
              slug: "sustain",
              name: "Sustain",
              kind: "long-form",
              description:
                "How the change is being sustained 30 / 60 / 90 days post-rollout. Evidence the metric has held vs. baseline.",
            },
          ],
        },
      ],
    },
    {
      slug: "executive-summary",
      name: "Executive Summary",
      sections: [
        {
          slug: "summary",
          name: "Project summary",
          topics: [
            {
              slug: "executive-summary",
              name: "Executive Summary",
              kind: "long-form",
              description:
                "One-page summary for sponsors: problem, root cause, solution, result vs. target, ROI. Concise — they read 50+ of these.",
            },
          ],
        },
      ],
    },
  ],
};

export const GREEN_BELT_SLUG = "green-belt";
export const GREEN_BELT_VERSION = 1;
