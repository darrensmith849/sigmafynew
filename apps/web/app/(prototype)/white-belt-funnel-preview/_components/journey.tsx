import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Chip,
  ProgressBar,
} from "@sigmafy/ui";
import { mockWhiteBeltCourse, type Lesson, type Module } from "../_data/course";
import { SectionHeader } from "./shell";

const ROUTE = "/white-belt-funnel-preview";

function linkTo(params: Record<string, string>) {
  const q = new URLSearchParams({ tab: "journey", ...params });
  return `${ROUTE}?${q.toString()}` as const;
}

export function JourneyTab({
  moduleId,
  lessonId,
}: {
  moduleId?: string;
  lessonId?: string;
}) {
  const course = mockWhiteBeltCourse;
  const selectedModule =
    course.modules.find((m) => m.id === moduleId) ?? course.modules[0];
  const selectedLesson =
    selectedModule!.lessons.find((l) => l.id === lessonId) ??
    selectedModule!.lessons[0];

  return (
    <div className="flex flex-col gap-10">
      <SectionHeader
        eyebrow="Step 1 — Learner journey"
        title="White Belt course · landing → lessons → completion"
        description="The course surface a delegate sees from first visit through completion. Wired with mock content; structure mirrors what a real backend would expose."
      />

      <CourseLanding />
      <CourseDashboard />

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <LessonSidebar
          modules={course.modules}
          activeLessonId={selectedLesson!.id}
        />
        <LessonViewer
          module={selectedModule!}
          lesson={selectedLesson!}
        />
      </div>

      {selectedModule!.knowledgeCheck && (
        <KnowledgeCheckPanel
          module={selectedModule!}
          questions={selectedModule!.knowledgeCheck}
        />
      )}

      <ResourcesList />
      <CompletionBanner />
    </div>
  );
}

function CourseLanding() {
  const c = mockWhiteBeltCourse;
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>{c.title}</CardTitle>
          <Chip tint="training">{c.level}</Chip>
        </div>
        <p className="text-[14px] text-muted-foreground">{c.description}</p>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-4">
        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-[13px]">
          <div>
            <dt className="text-muted-foreground">Duration</dt>
            <dd className="font-medium text-fg">{c.estimatedDuration}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Modules</dt>
            <dd className="font-medium text-fg">{c.modules.length}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Format</dt>
            <dd className="font-medium text-fg">Self-paced · video + reading</dd>
          </div>
        </dl>
        <Button variant="primary" size="md" asChild>
          <Link href={linkTo({ module: c.modules[0]!.id, lesson: c.modules[0]!.lessons[0]!.id })}>
            Resume course
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function CourseDashboard() {
  const c = mockWhiteBeltCourse;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your progress</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          A snapshot of where you are in the course.
        </p>
      </CardHeader>
      <CardContent>
        <ProgressBar
          value={c.progressPercentage}
          label={`${c.modules.length} of ${c.modules.length} modules complete`}
          valueLabel={`${c.progressPercentage}%`}
          tint="training"
          size={8}
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {c.modules.slice(0, 4).map((m) => (
            <ModuleCard key={m.id} module={m} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ModuleCard({ module: m }: { module: Module }) {
  return (
    <Link
      href={linkTo({ module: m.id, lesson: m.lessons[0]!.id })}
      className="group block"
      prefetch={false}
    >
      <div className="rounded-card border border-border-subtle bg-surface p-4 transition-shadow hover:shadow-card">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          <span>{m.lessons.length} lessons</span>
          {m.lessons.every((l) => l.completed) && (
            <Chip className="!py-0.5 !text-[10px]">Complete</Chip>
          )}
        </div>
        <p className="mt-2 text-sm font-medium text-fg group-hover:underline">
          {m.title}
        </p>
        <p className="mt-1 line-clamp-2 text-[12px] text-muted-foreground">
          {m.description}
        </p>
      </div>
    </Link>
  );
}

function LessonSidebar({
  modules,
  activeLessonId,
}: {
  modules: Module[];
  activeLessonId: string;
}) {
  return (
    <nav className="rounded-card border border-border-subtle bg-surface p-3 text-sm">
      <p className="px-2 pb-2 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        Course outline
      </p>
      <ul className="flex flex-col gap-3">
        {modules.map((m) => (
          <li key={m.id}>
            <p className="px-2 text-[12px] font-medium text-fg">{m.title}</p>
            <ul className="mt-1 flex flex-col gap-px">
              {m.lessons.map((l) => {
                const active = l.id === activeLessonId;
                return (
                  <li key={l.id}>
                    <Link
                      href={linkTo({ module: m.id, lesson: l.id })}
                      prefetch={false}
                      className={`block rounded-md px-2 py-1.5 text-[13px] transition-colors ${
                        active
                          ? "bg-surface-2 font-medium text-fg"
                          : "text-muted-foreground hover:bg-surface-2 hover:text-fg"
                      }`}
                    >
                      {l.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function LessonViewer({ module: m, lesson }: { module: Module; lesson: Lesson }) {
  const idx = m.lessons.findIndex((l) => l.id === lesson.id);
  const prev = m.lessons[idx - 1];
  const next = m.lessons[idx + 1];
  return (
    <Card>
      <CardHeader>
        <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          {m.title}
        </p>
        <CardTitle>{lesson.title}</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          {lesson.learningObjective}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {lesson.hasVideo && (
          <div
            className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-border text-[13px] text-muted-foreground"
            style={{ backgroundColor: "var(--color-surface-3)" }}
          >
            Video placeholder · {lesson.estimatedMinutes} min
          </div>
        )}
        <p className="text-[15px] leading-relaxed text-fg">
          {lesson.contentHtmlMock}
        </p>
        <aside
          className="rounded-card border p-4 text-[13px]"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--tint-training) 8%, var(--color-bg))",
            borderColor:
              "color-mix(in srgb, var(--tint-training) 20%, transparent)",
          }}
        >
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            Key takeaway
          </p>
          <p className="mt-1 font-medium text-fg">{lesson.keyTakeaway}</p>
        </aside>
        {lesson.activity && (
          <aside className="rounded-card border border-border-subtle p-4 text-[13px]">
            <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              Activity · {lesson.activity.title}
            </p>
            <p className="mt-1 text-fg">{lesson.activity.prompt}</p>
          </aside>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
          <div className="flex gap-2">
            {prev && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={linkTo({ module: m.id, lesson: prev.id })}>
                  ← Previous
                </Link>
              </Button>
            )}
            {next && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={linkTo({ module: m.id, lesson: next.id })}>
                  Next →
                </Link>
              </Button>
            )}
          </div>
          <Button variant="primary" size="sm">
            {lesson.completed ? "✓ Marked complete" : "Mark complete"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function KnowledgeCheckPanel({
  module: m,
  questions,
}: {
  module: Module;
  questions: NonNullable<Module["knowledgeCheck"]>;
}) {
  return (
    <Card>
      <CardHeader>
        <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          {m.title}
        </p>
        <CardTitle>Knowledge check</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          Six questions. Correct answers shown for review.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {questions.map((q, i) => (
          <div key={q.id} className="flex flex-col gap-2">
            <p className="text-sm font-medium text-fg">
              {i + 1}. {q.prompt}
            </p>
            <ul className="flex flex-col gap-1.5">
              {q.options.map((opt) => {
                const correct = opt.id === q.correctOptionId;
                return (
                  <li
                    key={opt.id}
                    className={`flex items-center gap-2 rounded-md border px-3 py-2 text-[13px] ${
                      correct
                        ? "border-border bg-surface-2 font-medium text-fg"
                        : "border-border-subtle text-muted-foreground"
                    }`}
                  >
                    <span className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                      {opt.id}.
                    </span>
                    <span>{opt.label}</span>
                    {correct && (
                      <Chip className="ml-auto !py-0.5 !text-[10px]">
                        Correct
                      </Chip>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="text-[12px] italic text-muted-foreground">
              {q.explanation}
            </p>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-border-subtle pt-4 text-[13px]">
          <span className="text-muted-foreground">Mock score: 6 / 6</span>
          <Button variant="primary" size="sm">
            Continue to certificate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ResourcesList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resources</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          Reference material — downloads are placeholders in this prototype.
        </p>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {mockWhiteBeltCourse.resources.map((r) => (
          <a
            key={r.id}
            href={r.placeholderHref}
            className="rounded-card border border-border-subtle bg-surface p-4 text-[13px] transition-shadow hover:shadow-card"
          >
            <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              {r.kind}
            </p>
            <p className="mt-1 font-medium text-fg">{r.title}</p>
            <p className="mt-1 text-muted-foreground">{r.description}</p>
          </a>
        ))}
      </CardContent>
    </Card>
  );
}

function CompletionBanner() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>You&apos;ve completed the course</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          Your certificate is ready and the post-course portal is unlocked.
        </p>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[15px] text-fg">
          Six Sigma is on the menu — now what comes next.
        </p>
        <div className="flex gap-2">
          <Button variant="primary" size="md" asChild>
            <Link href={`${ROUTE}?tab=certificate`}>View certificate</Link>
          </Button>
          <Button variant="outline" size="md" asChild>
            <Link href={`${ROUTE}?tab=portal`}>Open portal</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
