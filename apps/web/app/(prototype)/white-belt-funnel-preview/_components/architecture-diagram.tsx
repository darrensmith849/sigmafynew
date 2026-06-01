import { Card, CardContent, CardHeader, CardTitle, Chip } from "@sigmafy/ui";
import {
  mockArchEdges,
  mockArchNodes,
  mockArchPhases,
  type ArchNode,
} from "../_data/architecture";
import { iconMap, type IconKey } from "./icons";

const ICON_FOR_NODE: Record<string, IconKey> = {
  frontend: "terminal",
  events: "radio",
  db: "database",
  email: "mail",
  audiences: "bullhorn",
  sales: "phone",
  crm: "users",
  ai: "sparkle",
  admin: "cog",
};

const ICON_FOR_PHASE: Record<string, IconKey> = {
  p1: "database",
  p2: "mail",
  p3: "phone",
  p4: "shield",
  p5: "sparkle",
};

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
    <Card data-reveal>
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
        <PhaseRoadmap />
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
      {mockArchNodes.map((n) => {
        const iconKey = ICON_FOR_NODE[n.id];
        const Icon = iconKey ? iconMap[iconKey] : null;
        const tintCss = n.tint ? `var(--tint-${n.tint})` : "var(--color-accent)";
        return (
          <li
            key={n.id}
            className="flex flex-col gap-2 rounded-card border border-border-subtle bg-surface p-4"
            style={{
              borderColor: n.tint
                ? `color-mix(in srgb, ${tintCss} 25%, var(--color-border-subtle))`
                : undefined,
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="flex items-center gap-2">
                {Icon && (
                  <span
                    aria-hidden
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border"
                    style={{
                      color: tintCss,
                      backgroundColor: `color-mix(in srgb, ${tintCss} 10%, var(--color-surface))`,
                      borderColor: `color-mix(in srgb, ${tintCss} 22%, transparent)`,
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                )}
                <p className="text-sm font-semibold text-fg">{n.label}</p>
              </span>
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
        );
      })}
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

function PhaseRoadmap() {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        Suggested build order
      </p>
      <ol className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
        {mockArchPhases.map((p, i) => {
          const iconKey = ICON_FOR_PHASE[p.id];
          const Icon = iconKey ? iconMap[iconKey] : null;
          return (
            <li
              key={p.id}
              className="relative flex min-w-[220px] snap-start flex-col gap-2 rounded-card border border-border-subtle bg-surface p-4"
            >
              <div className="flex items-center justify-between gap-2">
                {Icon && (
                  <span
                    aria-hidden
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border"
                    style={{
                      color: "var(--tint-admin)",
                      backgroundColor:
                        "color-mix(in srgb, var(--tint-admin) 10%, var(--color-surface))",
                      borderColor:
                        "color-mix(in srgb, var(--tint-admin) 22%, transparent)",
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                )}
                <span className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  {i === 0 ? "First" : i === mockArchPhases.length - 1 ? "Last" : `Phase ${i + 1}`}
                </span>
              </div>
              <p className="text-sm font-medium text-fg">{p.label}</p>
              <p className="text-[12px] text-muted-foreground">{p.description}</p>
              {i < mockArchPhases.length - 1 && (
                <span
                  aria-hidden
                  className="absolute -right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  →
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
