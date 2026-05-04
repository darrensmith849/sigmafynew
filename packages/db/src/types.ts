/**
 * Shape of `project_templates.definition` JSON.
 *
 * Phase 0A keeps this minimal — three topic kinds: charter (read-only display),
 * sipoc (form), pareto (form + stats call). More kinds arrive in Phase 1.
 */
export type TopicKind = "charter" | "sipoc" | "pareto";

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
