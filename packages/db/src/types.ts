/**
 * Shape of `project_templates.definition` JSON.
 *
 * Phase 0A: charter (read-only), sipoc, pareto.
 * Phase 1 Slice A.3: five-whys + Charter editing.
 * Phase 1 Slice A.4: long-form (single-textarea topic with AI grading).
 * Phase 1 Slice C.2: histogram (numeric data → distribution).
 * Phase 1 Slice C.3: imr-chart, xbar-r-chart (control charts).
 */
export type TopicKind =
  | "charter"
  | "sipoc"
  | "pareto"
  | "five-whys"
  | "long-form"
  | "histogram"
  | "imr-chart"
  | "xbar-r-chart";

export interface TemplateTopic {
  slug: string;
  name: string;
  kind: TopicKind;
  description?: string;
  /** Static content rendered for read-only topics (e.g. Charter prompts in Phase 0A). */
  prompt?: string;
}

export interface TemplateSection {
  slug: string;
  name: string;
  topics: TemplateTopic[];
}

export interface TemplatePhase {
  slug: string;
  name: string;
  sections: TemplateSection[];
}

export interface TemplateDefinition {
  phases: TemplatePhase[];
}

/** Compute "phase.section.topic" path used in topic_solutions.topic_path. */
export function topicPath(phase: string, section: string, topic: string): string {
  return `${phase}.${section}.${topic}`;
}
