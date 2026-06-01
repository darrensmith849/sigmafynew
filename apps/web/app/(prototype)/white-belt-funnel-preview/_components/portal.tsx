import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Chip,
  Eyebrow,
} from "@sigmafy/ui";
import { mockLearner } from "../_data/learner";
import {
  intentLabel,
  mockPortalCtas,
  priorityLabel,
  priorityTint,
  sortByPriority,
  statusLabel,
  statusTint,
  type PortalCtaEnriched,
} from "../_data/portal-priorities";
import { mockNextBestActionRules } from "../_data/remarketing";
import { SectionHeader } from "./shell";
import { MockEventChip } from "./mock-event-chip";

export function PortalTab() {
  const firstName = mockLearner.fullName.split(" ")[0];
  const sorted = sortByPriority(mockPortalCtas);
  return (
    <div className="flex flex-col gap-10">
      <SectionHeader
        eyebrow="Step 3 — Post-course portal"
        title={`${firstName}, here is the next best action`}
        description="The portal is not a menu — it's a recommendation engine. CTAs are ordered by priority. Status, intent, and event chips show what Sigmafy would know about each card behind the scenes."
      />

      <NextBestActionRecommendation />

      <div className="flex flex-col gap-4">
        <PriorityGroup
          label="Best next steps"
          ctas={sorted.filter((c) => c.priority === "best-next")}
        />
        <PriorityGroup
          label="High-value opportunities"
          ctas={sorted.filter((c) => c.priority === "high-value")}
        />
        <PriorityGroup
          label="Company opportunities"
          ctas={sorted.filter((c) => c.priority === "company")}
        />
        <PriorityGroup
          label="Worth considering"
          ctas={sorted.filter((c) => c.priority === "standard")}
        />
      </div>

      <NextBestActionRules />
    </div>
  );
}

function NextBestActionRecommendation() {
  return (
    <Card
      style={{
        borderColor:
          "color-mix(in srgb, var(--tint-training) 35%, transparent)",
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--tint-training) 6%, var(--color-surface)) 0%, var(--color-surface) 70%)",
      }}
    >
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Eyebrow>Sigmafy recommends</Eyebrow>
            <CardTitle>Upgrade to Yellow Belt next</CardTitle>
          </div>
          <Chip tint="training">Best next step</Chip>
        </div>
        <p className="text-[13px] text-muted-foreground">
          Based on your activity so far — certificate downloaded, Yellow Belt
          page viewed — this is the highest-fit next action.
        </p>
      </CardHeader>
      <CardContent className="flex flex-wrap items-end justify-between gap-3 border-t border-border-subtle pt-4">
        <p className="text-[14px] text-fg">
          A 15% graduate discount is available for 7 days · subject to approval.
        </p>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <Button variant="primary" size="md" asChild>
              <Link href="/white-belt-funnel-preview?tab=upgrade">
                View Yellow Belt
              </Link>
            </Button>
            <Button variant="ghost" size="md" asChild>
              <Link href="/white-belt-funnel-preview?tab=remarketing">
                Why this recommendation?
              </Link>
            </Button>
          </div>
          <MockEventChip
            event="yellow_belt_clicked"
            futureAction="Move to Yellow Belt high-intent segment."
          />
        </div>
      </CardContent>
    </Card>
  );
}

function PriorityGroup({
  label,
  ctas,
}: {
  label: string;
  ctas: PortalCtaEnriched[];
}) {
  if (!ctas.length) return null;
  return (
    <section>
      <header className="mb-3 flex items-baseline justify-between">
        <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </p>
        <p className="text-[11px] text-muted-foreground">{ctas.length} cards</p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {ctas.map((c) => (
          <PortalCtaCard key={c.id} cta={c} />
        ))}
      </div>
    </section>
  );
}

function PortalCtaCard({ cta }: { cta: PortalCtaEnriched }) {
  const isBestNext = cta.priority === "best-next";
  return (
    <Card
      style={
        isBestNext
          ? {
              borderColor:
                "color-mix(in srgb, var(--tint-training) 35%, transparent)",
            }
          : undefined
      }
    >
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Chip tint={priorityTint[cta.priority]} className="!text-[10px]">
            {priorityLabel[cta.priority]}
          </Chip>
          <Chip className="!text-[10px]">{intentLabel[cta.intent]}</Chip>
          <Chip tint={statusTint[cta.status]} className="!text-[10px]">
            {statusLabel[cta.status]}
          </Chip>
        </div>
        <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          {cta.eyebrow}
        </p>
        <p className="text-base font-semibold text-fg">{cta.title}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-[13px] text-muted-foreground">{cta.description}</p>
        <aside
          className="rounded-md border border-border-subtle bg-surface p-2 text-[12px]"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--color-muted) 4%, var(--color-bg))",
          }}
        >
          <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            Why this matters
          </p>
          <p className="mt-1 text-fg">{cta.whyMatters}</p>
        </aside>
        {cta.estimatedValue && (
          <p className="text-[12px] text-muted-foreground">
            Est. value:{" "}
            <span className="font-medium text-fg">{cta.estimatedValue}</span>
          </p>
        )}
        <div className="flex flex-wrap items-end justify-between gap-2 border-t border-border-subtle pt-3">
          <Button
            variant={isBestNext ? "primary" : "outline"}
            size="sm"
            asChild
          >
            <Link href={cta.href}>{cta.ctaLabel}</Link>
          </Button>
          <MockEventChip
            event={cta.eventOnClick}
            futureAction={cta.futureAction}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function NextBestActionRules() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Next-best-action logic</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          What Sigmafy would recommend after each behaviour. Rules-based today;
          a model can replace the rules later without changing the UI.
        </p>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-2 sm:grid-cols-2">
          {mockNextBestActionRules.map((r) => (
            <li
              key={r.id}
              className="rounded-md border border-border-subtle bg-surface p-3 text-[13px]"
            >
              <p className="font-medium text-fg">{r.recommendedAction}</p>
              <p className="mt-1 text-muted-foreground">
                If {r.ifAllEventsHappened.map((e) => `\`${e}\``).join(" + ")}
                {r.butNotEvent ? ` and NOT \`${r.butNotEvent}\`` : ""} within{" "}
                {r.withinHours}h
              </p>
              <p className="mt-1 italic text-muted-foreground">
                Rationale: {r.rationale}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
