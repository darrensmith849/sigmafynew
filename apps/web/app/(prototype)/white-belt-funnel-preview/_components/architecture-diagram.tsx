import { Card, CardContent, CardHeader, CardTitle, Chip } from "@sigmafy/ui";
import {
  mockArchEdges,
  mockArchNodes,
  mockArchPhases,
  type ArchNode,
} from "../_data/architecture";

const STATUS_LABEL: Record<ArchNode["status"], string> = {
  exists: "Exists today",
  extends: "Extends existing",
  new: "New build",
};

const STATUS_TINT: Record<ArchNode["status"], "projects" | "spc" | "ai"> = {
  exists: "projects",
  extends: "spc",
  new: "ai",
};

export function ArchitectureDiagram() {
  const nodeById = new Map(mockArchNodes.map((n) => [n.id, n]));
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Backend architecture — once approved</CardTitle>
          <Chip>Documentation only · no implementation</Chip>
        </div>
        <p className="text-[13px] text-muted-foreground">
          Nodes describe what the future system would look like; the legend
          shows what already exists in the codebase vs what&apos;s new.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <Legend />
        <NodeGrid />
        <EdgeList nodeById={nodeById} />
        <PhasePlan />
      </CardContent>
    </Card>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[12px]">
      <span className="text-muted-foreground">Status:</span>
      {(["exists", "extends", "new"] as const).map((s) => (
        <Chip key={s} tint={STATUS_TINT[s]} className="!text-[10px]">
          {STATUS_LABEL[s]}
        </Chip>
      ))}
    </div>
  );
}

function NodeGrid() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {mockArchNodes.map((n) => (
        <li
          key={n.id}
          className="flex flex-col gap-2 rounded-card border border-border-subtle bg-surface p-4"
          style={{
            borderColor: n.tint
              ? `color-mix(in srgb, var(--tint-${n.tint}) 25%, var(--color-border-subtle))`
              : undefined,
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-fg">{n.label}</p>
            <Chip tint={STATUS_TINT[n.status]} className="!text-[10px]">
              {STATUS_LABEL[n.status]}
            </Chip>
          </div>
          <p className="text-[12px] text-muted-foreground">{n.caption}</p>
          {n.reusesFrom && (
            <p className="mt-auto text-[11px] italic text-muted-foreground">
              {n.reusesFrom}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

function EdgeList({ nodeById }: { nodeById: Map<string, ArchNode> }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        Data flow
      </p>
      <ol className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {mockArchEdges.map((e, i) => {
          const from = nodeById.get(e.from);
          const to = nodeById.get(e.to);
          if (!from || !to) return null;
          return (
            <li
              key={i}
              className="flex items-center gap-2 rounded-md border border-border-subtle bg-surface px-3 py-1.5 text-[12px]"
            >
              <span className="font-medium text-fg">{from.label}</span>
              <span aria-hidden className="text-muted-foreground">
                →
              </span>
              <span className="font-medium text-fg">{to.label}</span>
              {e.label && (
                <span className="ml-auto text-[11px] italic text-muted-foreground">
                  {e.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function PhasePlan() {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        Suggested build order
      </p>
      <ol className="mt-2 flex flex-col gap-2">
        {mockArchPhases.map((p) => (
          <li
            key={p.id}
            className="rounded-md border border-border-subtle bg-surface px-3 py-2 text-[12px]"
          >
            <p className="text-sm font-medium text-fg">{p.label}</p>
            <p className="text-muted-foreground">{p.description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
