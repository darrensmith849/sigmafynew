import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { eq, and, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@sigmafy/ui";
import {
  schema,
  withWorkspace,
  topicPath,
  type TemplateDefinition,
  type TemplateTopic,
} from "@sigmafy/db";
import { requireAuthContext } from "@/lib/auth";
import { getAppDb } from "@/lib/db";
import { CharterTopic } from "./_components/charter-topic";
import { SipocTopic } from "./_components/sipoc-topic";
import { ParetoTopic } from "./_components/pareto-topic";
import { RoiPanel } from "./_components/roi-panel";

export const dynamic = "force-dynamic";

export default async function ProjectPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ phase?: string; section?: string; topic?: string }>;
}) {
  const params = await props.params;
  const sp = await props.searchParams;

  let ctx;
  try {
    ctx = await requireAuthContext();
  } catch {
    redirect("/sign-in");
  }

  const db = getAppDb();
  const data = await withWorkspace(db, ctx.workspace.id, async (tx) => {
    const projectRows = await tx
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, params.id))
      .limit(1);
    const project = projectRows[0];
    if (!project) return null;

    const tplRows = await tx
      .select()
      .from(schema.projectTemplates)
      .where(eq(schema.projectTemplates.id, project.templateId))
      .limit(1);
    const template = tplRows[0];
    if (!template) return null;

    const definition = template.definition as TemplateDefinition;
    const phaseSlug = sp.phase ?? definition.phases[0]?.slug ?? "define";
    const phase = definition.phases.find((p) => p.slug === phaseSlug) ?? definition.phases[0]!;
    const sectionSlug = sp.section ?? phase.sections[0]?.slug;
    const section = phase.sections.find((s) => s.slug === sectionSlug) ?? phase.sections[0];
    const topicSlug = sp.topic ?? section?.topics[0]?.slug;
    const topic = section?.topics.find((t) => t.slug === topicSlug) ?? section?.topics[0];

    let solution = null as null | {
      id: string;
      content: unknown;
      grading: unknown;
      gradingOverride: unknown;
      submittedAt: Date;
    };
    if (section && topic) {
      const path = topicPath(phase.slug, section.slug, topic.slug);
      const sols = await tx
        .select()
        .from(schema.topicSolutions)
        .where(
          and(
            eq(schema.topicSolutions.projectId, project.id),
            eq(schema.topicSolutions.topicPath, path),
          ),
        )
        .orderBy(desc(schema.topicSolutions.submittedAt))
        .limit(1);
      const s = sols[0];
      if (s) {
        solution = {
          id: s.id,
          content: s.content,
          grading: s.grading,
          gradingOverride: s.gradingOverride,
          submittedAt: s.submittedAt,
        };
      }
    }

    return { project, definition, phase, section, topic, solution };
  });

  if (!data) notFound();
  const { project, definition, phase, section, topic, solution } = data;

  return (
    <main className="mx-auto grid min-h-screen max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[260px_1fr]">
      {/* Phase nav */}
      <aside>
        <Link
          href="/dashboard"
          className="text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-sigmafyBlue-600"
        >
          ← All projects
        </Link>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
          {project.name}
        </h2>
        <nav className="mt-6 grid gap-1">
          {definition.phases.map((p) => (
            <Link
              key={p.slug}
              href={`/projects/${project.id}?phase=${p.slug}` as never}
              className={`rounded-md px-3 py-2 text-sm transition-colors ${
                p.slug === phase.slug
                  ? "bg-sigmafyBlue-50 font-medium text-sigmafyBlue-600"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {p.name}
            </Link>
          ))}
        </nav>
        {section && (
          <div className="mt-6">
            <p className="px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {section.name}
            </p>
            <ul className="mt-2 grid gap-1">
              {section.topics.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={
                      `/projects/${project.id}?phase=${phase.slug}&section=${section.slug}&topic=${t.slug}` as never
                    }
                    className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                      topic && t.slug === topic.slug
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      {/* Topic content */}
      <div className="grid gap-6">
        <RoiPanel
          projectId={project.id}
          initialZarRands={
            project.roiEstimatedZarCents !== null && project.roiEstimatedZarCents !== undefined
              ? project.roiEstimatedZarCents / 100
              : null
          }
        />
        {!section || !topic ? (
          <Card>
            <CardHeader>
              <CardTitle>Phase {phase.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Topics for this phase land in Phase 1. Pick a different phase from the sidebar.
            </CardContent>
          </Card>
        ) : (
          <TopicContent
            projectId={project.id}
            phaseSlug={phase.slug}
            sectionSlug={section.slug}
            topic={topic}
            existingSolution={solution}
          />
        )}
      </div>
    </main>
  );
}

function TopicContent(props: {
  projectId: string;
  phaseSlug: string;
  sectionSlug: string;
  topic: TemplateTopic;
  existingSolution: null | {
    id: string;
    content: unknown;
    grading: unknown;
    gradingOverride: unknown;
    submittedAt: Date;
  };
}) {
  const { topic, existingSolution, ...rest } = props;
  switch (topic.kind) {
    case "charter":
      return <CharterTopic topic={topic} />;
    case "sipoc":
      return (
        <SipocTopic
          {...rest}
          topic={topic}
          existingSolution={existingSolution}
        />
      );
    case "pareto":
      return (
        <ParetoTopic
          {...rest}
          topic={topic}
          existingSolution={
            existingSolution
              ? { content: existingSolution.content, submittedAt: existingSolution.submittedAt }
              : null
          }
        />
      );
  }
}
