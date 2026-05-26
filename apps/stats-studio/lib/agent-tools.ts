/**
 * Curated tool definitions for the Stats Co-pilot agent (Phase 9A).
 *
 * Hand-picked subset of the 311-endpoint catalogue — chosen to cover the
 * highest-frequency Six Sigma questions without overwhelming Claude's
 * context window. Phase 9B will let workspaces enable/disable tools per
 * assistant; for Slice 4 we ship a single curated set.
 *
 * Each tool's `slug` is the dotted form used by `gateway.run()` (the
 * gateway expands `control-charts.imr` → `/api/v1/control-charts/imr`).
 *
 * Input schemas mirror the Pydantic models in the Python engine. They're
 * hand-written rather than auto-generated because Claude's tool-use is
 * very sensitive to schema clarity — `enum`, `description`, and tight
 * `items` types matter more than they would for a generic client.
 */
import type Anthropic from "@anthropic-ai/sdk";

export type AgentToolDef = Anthropic.Tool & {
  /** Dotted endpoint slug used by stats-gateway.run(). */
  slug: string;
  /** Catalogue category label, surfaced in receipt UI. */
  category: string;
};

const numberArray = {
  type: "array" as const,
  items: { type: "number" as const },
  description: "Array of numeric measurements.",
};

const stringArray = {
  type: "array" as const,
  items: { type: "string" as const },
  description: "Array of categorical labels.",
};

export const AGENT_TOOLS: AgentToolDef[] = [
  // -----------------------------------------------------------------
  // Hypothesis testing
  // -----------------------------------------------------------------
  {
    name: "t_test_one_sample",
    slug: "hypothesis.t-test.one-sample",
    category: "Hypothesis Testing",
    description:
      "One-sample t-test: is the sample mean different from a hypothesized target? Use when you have one continuous sample and a single benchmark/target value (e.g. spec midpoint, historical mean).",
    input_schema: {
      type: "object",
      properties: {
        data: numberArray,
        hypothesized_mean: {
          type: "number",
          description: "Target / hypothesized value to test the sample mean against.",
        },
        alternative: {
          type: "string",
          enum: ["two-sided", "less", "greater"],
          description: "Direction of the alternative hypothesis. Default 'two-sided'.",
        },
      },
      required: ["data", "hypothesized_mean"],
    },
  },
  {
    name: "t_test_two_sample",
    slug: "hypothesis.t-test.two-sample",
    category: "Hypothesis Testing",
    description:
      "Two-sample t-test (Welch by default): are two independent samples different in mean? Set equal_var=false (the default) when you can't assume equal variances — this is Welch's t-test.",
    input_schema: {
      type: "object",
      properties: {
        data1: numberArray,
        data2: numberArray,
        equal_var: {
          type: "boolean",
          description:
            "true = Student's pooled-variance t; false = Welch's. Default false. Pick Welch unless you've explicitly tested for equal variances and they're equal.",
        },
        alternative: {
          type: "string",
          enum: ["two-sided", "less", "greater"],
        },
      },
      required: ["data1", "data2"],
    },
  },
  {
    name: "t_test_paired",
    slug: "hypothesis.t-test.paired",
    category: "Hypothesis Testing",
    description:
      "Paired t-test: are two measurements from the same subjects/items different? Use for before/after on the same parts, or matched-pairs designs.",
    input_schema: {
      type: "object",
      properties: {
        data1: { ...numberArray, description: "First measurement of each pair (e.g. 'before')." },
        data2: { ...numberArray, description: "Second measurement of each pair (e.g. 'after'). Must be the same length as data1." },
        alternative: {
          type: "string",
          enum: ["two-sided", "less", "greater"],
        },
      },
      required: ["data1", "data2"],
    },
  },
  {
    name: "anova_one_way",
    slug: "hypothesis.anova",
    category: "Hypothesis Testing",
    description:
      "One-way ANOVA: are 3+ independent groups different in mean? Each group is an array of measurements.",
    input_schema: {
      type: "object",
      properties: {
        groups: {
          type: "array",
          items: numberArray,
          description: "Array of arrays — one inner array per group's measurements.",
          minItems: 2,
        },
      },
      required: ["groups"],
    },
  },

  // -----------------------------------------------------------------
  // Descriptive + Normality
  // -----------------------------------------------------------------
  {
    name: "descriptive_statistics",
    slug: "capability.descriptive",
    category: "Basic Statistics",
    description:
      "Descriptive stats: mean, std dev, quartiles, skewness, kurtosis, range. Call this first when the user describes data without specifying a test — it gives you the lay of the land.",
    input_schema: {
      type: "object",
      properties: { data: numberArray },
      required: ["data"],
    },
  },
  {
    name: "normality_test",
    slug: "capability.normality",
    category: "Basic Statistics",
    description:
      "Anderson-Darling + Shapiro-Wilk normality tests. Use to decide whether a continuous variable can be analysed with normal-theory methods (normal-Cpk, t-test) or needs a non-normal path (Box-Cox / Johnson / non-parametric).",
    input_schema: {
      type: "object",
      properties: { data: numberArray },
      required: ["data"],
    },
  },

  // -----------------------------------------------------------------
  // Capability
  // -----------------------------------------------------------------
  {
    name: "capability_normal",
    slug: "capability.analysis",
    category: "Process Capability",
    description:
      "Process capability for normally-distributed data: Cp, Cpk, Pp, Ppk, yield, PPM. Requires at least one of LSL/USL. If the data isn't normal, prefer capability_non_normal instead.",
    input_schema: {
      type: "object",
      properties: {
        data: numberArray,
        lsl: { type: "number", description: "Lower specification limit (optional)." },
        usl: { type: "number", description: "Upper specification limit (optional)." },
        subgroup_size: {
          type: "integer",
          description: "Rational-subgroup size. Default 1 (treats each measurement as its own subgroup).",
          minimum: 1,
        },
      },
      required: ["data"],
    },
  },
  {
    name: "capability_non_normal",
    slug: "capability.non-normal",
    category: "Process Capability",
    description:
      "Capability for non-normal data — auto Box-Cox or Johnson SU transform, then Cp/Cpk on the transformed scale. Use when normality_test reports a non-normal fit and the data are positive (Box-Cox) or arbitrary (Johnson).",
    input_schema: {
      type: "object",
      properties: {
        data: numberArray,
        lsl: { type: "number" },
        usl: { type: "number" },
        method: {
          type: "string",
          enum: ["auto", "box-cox", "johnson"],
          description:
            "'auto' picks Box-Cox when all data > 0 else Johnson. Force a specific transform with 'box-cox' or 'johnson'.",
        },
        subgroup_size: { type: "integer", minimum: 1 },
      },
      required: ["data"],
    },
  },

  // -----------------------------------------------------------------
  // Control Charts
  // -----------------------------------------------------------------
  {
    name: "control_chart_imr",
    slug: "control-charts.imr",
    category: "Control Charts",
    description:
      "Individuals + Moving Range chart. Use for individual (n=1) measurements over time to detect special-cause variation. Returns control limits, points, and Nelson-rule violations.",
    input_schema: {
      type: "object",
      properties: {
        data: { ...numberArray, description: "Time-ordered measurements (oldest first)." },
      },
      required: ["data"],
    },
  },
  {
    name: "control_chart_xbar_r",
    slug: "control-charts.xbar-r",
    category: "Control Charts",
    description:
      "X-bar R chart for rational subgroups of size 2-10. Each subgroup is one inner array. Returns subgroup means/ranges with control limits + Nelson-rule violations.",
    input_schema: {
      type: "object",
      properties: {
        subgroups: {
          type: "array",
          items: numberArray,
          description: "Array of arrays — each inner array is one subgroup (size 2–10).",
          minItems: 2,
        },
      },
      required: ["subgroups"],
    },
  },

  // -----------------------------------------------------------------
  // Tables
  // -----------------------------------------------------------------
  {
    name: "chi_square_association",
    slug: "tables.chi-square-association",
    category: "Tables",
    description:
      "Chi-square test of independence: are two categorical variables associated? Each variable is an array of labels of the same length (one row per observation).",
    input_schema: {
      type: "object",
      properties: {
        row_var: stringArray,
        col_var: stringArray,
      },
      required: ["row_var", "col_var"],
    },
  },
  {
    name: "cross_tabulation",
    slug: "tables.cross-tabulation",
    category: "Tables",
    description:
      "Full Minitab-style cross-tabulation: two-way frequency table with row/col/total percentages, expected counts under independence, standardized + adjusted (Haberman) residuals, chi-square contributions, and the chi-square test. Use when the user wants to know which cells drive a significant association.",
    input_schema: {
      type: "object",
      properties: {
        row_var: stringArray,
        col_var: stringArray,
      },
      required: ["row_var", "col_var"],
    },
  },

  // -----------------------------------------------------------------
  // Reliability
  // -----------------------------------------------------------------
  {
    name: "stress_strength_reliability",
    slug: "reliability.stress-strength",
    category: "Reliability",
    description:
      "Stress-Strength interference reliability. Reliability = P(Strength > Stress) for independent normal stress and strength populations. Returns reliability, Z-margin, and PPM failures.",
    input_schema: {
      type: "object",
      properties: {
        stress_mean: { type: "number" },
        stress_sd: { type: "number", description: "Stress standard deviation (positive)." },
        strength_mean: { type: "number" },
        strength_sd: { type: "number", description: "Strength standard deviation (positive)." },
      },
      required: ["stress_mean", "stress_sd", "strength_mean", "strength_sd"],
    },
  },
];

/** Index by Anthropic tool name for fast lookup in the agentic loop. */
export const AGENT_TOOLS_BY_NAME: Record<string, AgentToolDef> = Object.fromEntries(
  AGENT_TOOLS.map((t) => [t.name, t]),
);
