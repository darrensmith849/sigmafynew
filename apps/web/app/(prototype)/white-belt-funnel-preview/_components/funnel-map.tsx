import { Card, CardContent, CardHeader, CardTitle, Chip } from "@sigmafy/ui";
import {
  mockFunnelStages,
  mockPathwaySplits,
} from "../_data/funnel-flow";

export function FunnelMap() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Visual funnel map</CardTitle>
          <Chip>Visual only · no real tracking</Chip>
        </div>
        <p className="text-[13px] text-muted-foreground">
          The complete journey from course completion to conversion, with the
          mock events emitted at each step.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <FlowChain />
        <PathwaySplitGrid />
      </CardContent>
    </Card>
  );
}

function FlowChain() {
  return (
    <div className="relative">
      <ol className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
        {mockFunnelStages.map((s, idx) => (
          <li
            key={s.id}
            className="relative flex min-w-[200px] snap-start flex-col gap-2 rounded-card border border-border-subtle bg-surface p-4"
            style={{
              borderColor: s.tint
                ? `color-mix(in srgb, var(--tint-${s.tint}) 30%, var(--color-border-subtle))`
                : undefined,
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                Step {idx + 1}
              </span>
              <Chip tint={s.tint} className="!text-[10px]">
                {idx === mockFunnelStages.length - 1 ? "Conversion" : "Stage"}
              </Chip>
            </div>
            <p className="text-sm font-medium text-fg">{s.label}</p>
            <p className="text-[12px] text-muted-foreground">{s.caption}</p>
            {s.emitsEvents.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {s.emitsEvents.map((e) => (
                  <code
                    key={e}
                    className="rounded-md border border-border-subtle bg-bg px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
                  >
                    {e}
                  </code>
                ))}
              </div>
            )}
            {idx < mockFunnelStages.length - 1 && (
              <span
                aria-hidden
                className="absolute -right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                →
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function PathwaySplitGrid() {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        Pathway split at step 4 — “choose next pathway”
      </p>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {mockPathwaySplits.map((p) => (
          <li
            key={p.id}
            className="rounded-md border border-border-subtle bg-surface p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-fg">{p.label}</p>
              <Chip tint={p.tint} className="!text-[10px]">
                Path
              </Chip>
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">{p.caption}</p>
            <code className="mt-2 inline-block rounded-md border border-border-subtle bg-bg px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              {p.emitsEvent}
            </code>
          </li>
        ))}
      </ul>
    </div>
  );
}
