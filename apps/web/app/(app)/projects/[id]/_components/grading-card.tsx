import { Card, CardContent, CardHeader, CardTitle } from "@sigmafy/ui";

export interface GenericGradingDisplay {
  score: number;
  decision: "approved" | "approved_with_notes" | "needs_revision";
  summary: string;
  feedback: Array<{ section: string; note: string }>;
  modelId: string;
  promptVersion: string;
  gradedAt: string;
}

const DECISION_STYLE = {
  approved: "bg-green-50 text-green-800 border-green-200",
  approved_with_notes: "bg-amber-50 text-amber-800 border-amber-200",
  needs_revision: "bg-red-50 text-red-800 border-red-200",
} as const;

const DECISION_LABEL = {
  approved: "Approved",
  approved_with_notes: "Approved with notes",
  needs_revision: "Needs revision",
} as const;

/**
 * Renders any CommonGrading shape. Pass a `sectionLabel` to humanise the
 * topic-kind-specific section identifiers — e.g. "level_1" → "Why #1",
 * "suppliers" → "Suppliers".
 */
export function GradingCard(props: {
  grading: GenericGradingDisplay;
  /** When true, the AI grading is shown dimmed because an override sits above it. */
  dimmed?: boolean;
  /** Map a section identifier to a human-readable label. Defaults to identity. */
  sectionLabel?: (section: string) => string;
}) {
  const decisionStyle = DECISION_STYLE[props.grading.decision];
  const decisionLabel = DECISION_LABEL[props.grading.decision];
  const labelOf = props.sectionLabel ?? ((s) => s.replace(/_/g, " "));

  return (
    <Card className={props.dimmed ? "opacity-70" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            AI feedback{" "}
            {props.dimmed && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                (overridden — for reference)
              </span>
            )}
          </CardTitle>
          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${decisionStyle}`}>
            {decisionLabel} · {props.grading.score}/100
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p className="text-sm text-foreground">{props.grading.summary}</p>
        {props.grading.feedback.length > 0 && (
          <ul className="grid gap-2">
            {props.grading.feedback.map((f, i) => (
              <li key={i} className="rounded-md border border-border p-3 text-sm">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {labelOf(f.section)}
                </span>
                <p className="mt-1 text-foreground">{f.note}</p>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-muted-foreground">
          Graded by {props.grading.modelId} · prompt v{props.grading.promptVersion} ·
          {" "}
          {new Date(props.grading.gradedAt).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
