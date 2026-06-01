import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Chip,
} from "@sigmafy/ui";
import { mockDiscountConcepts, mockUpgradeOffers } from "../_data/offers";
import type { Offer } from "../_data/offers";
import type { BeltLevel } from "../_data/course";
import type { FunnelEventType } from "../_data/events";
import { SectionHeader } from "./shell";
import { MockEventChip } from "./mock-event-chip";
import { IconCalendar } from "./icons";

const EVENT_FOR_BELT: Record<Offer["belt"], FunnelEventType> = {
  white: "next_belt_cta_viewed",
  yellow: "yellow_belt_clicked",
  green: "green_belt_clicked",
  black: "black_belt_clicked",
};

const BELT_COLOR: Record<BeltLevel, string> = {
  white: "#e8e8eb",
  yellow: "#e6c454",
  green: "#5fa779",
  black: "#1a1a1a",
};

export function UpgradeTab() {
  return (
    <div className="flex flex-col gap-10">
      <SectionHeader
        eyebrow="Step 4 — Upgrade funnel"
        title="Yellow · Green · Black"
        description="Primary path is White → Yellow. Green and Black are enquire-only so we can match cohort fit. Pricing shown is placeholder."
      />
      <DiscountBanner />
      <div className="grid gap-4 lg:grid-cols-3">
        {mockUpgradeOffers.map((o) => (
          <BeltComparisonCard key={o.id} offer={o} />
        ))}
      </div>
      <CompareAllBelts />
      <BookACallCta />
    </div>
  );
}

function BeltRibbon({ belt }: { belt: BeltLevel }) {
  return (
    <span
      aria-hidden
      className="inline-flex h-7 w-7 items-center justify-center rounded-md border"
      style={{
        backgroundColor: `color-mix(in srgb, ${BELT_COLOR[belt]} 18%, var(--color-surface))`,
        borderColor: `color-mix(in srgb, ${BELT_COLOR[belt]} 50%, transparent)`,
      }}
    >
      <span
        className="inline-block h-3 w-5 rounded-sm"
        style={{ backgroundColor: BELT_COLOR[belt] }}
      />
    </span>
  );
}

function CompareAllBelts() {
  const rows: { label: string; render: (o: Offer) => React.ReactNode }[] = [
    {
      label: "Tagline",
      render: (o) => (
        <span className="text-fg">{o.tagline}</span>
      ),
    },
    {
      label: "Duration",
      render: (o) => o.estimatedDuration,
    },
    {
      label: "Price (placeholder)",
      render: (o) => o.pricePlaceholder,
    },
    {
      label: "Outcomes",
      render: (o) => `${o.outcomes.length} listed`,
    },
    {
      label: "Audience",
      render: (o) => `${o.whoItIsFor.length} cohort fits`,
    },
    {
      label: "Recommended next",
      render: (o) => (o.recommended ? "Yes" : "—"),
    },
  ];
  return (
    <Card data-reveal>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Compare all belts</CardTitle>
          <Chip>At a glance · mock</Chip>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border-subtle text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                <th className="px-4 py-2 text-left font-medium">&nbsp;</th>
                {mockUpgradeOffers.map((o) => (
                  <th key={o.id} className="px-4 py-2 text-left font-medium">
                    <span className="flex items-center gap-2">
                      <BeltRibbon belt={o.belt} />
                      <span className="text-fg">{o.title}</span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.label}
                  className="border-b border-border-subtle last:border-b-0"
                >
                  <td className="px-4 py-2 text-muted-foreground">{r.label}</td>
                  {mockUpgradeOffers.map((o) => (
                    <td key={o.id} className="px-4 py-2 text-fg">
                      {r.render(o)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function DiscountBanner() {
  return (
    <Card
      data-reveal
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--tint-training) 6%, var(--color-surface))",
        borderColor:
          "color-mix(in srgb, var(--tint-training) 22%, transparent)",
      }}
    >
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border"
              style={{
                color: "var(--tint-training)",
                backgroundColor:
                  "color-mix(in srgb, var(--tint-training) 12%, var(--color-surface))",
                borderColor:
                  "color-mix(in srgb, var(--tint-training) 26%, transparent)",
              }}
            >
              <IconCalendar className="h-5 w-5" />
            </span>
            <CardTitle>White Belt graduate discount</CardTitle>
          </div>
          <Chip tint="training">Concept only · not live</Chip>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        {mockDiscountConcepts.map((d) => (
          <div key={d.id} className="flex flex-col gap-1">
            <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              {d.label}
            </p>
            <p className="text-sm text-fg">{d.detail}</p>
            <p className="text-[12px] text-muted-foreground">{d.validityNote}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function BeltComparisonCard({ offer }: { offer: Offer }) {
  return (
    <Card
      data-reveal
      style={
        offer.recommended
          ? {
              borderColor:
                "color-mix(in srgb, var(--tint-training) 35%, transparent)",
            }
          : undefined
      }
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <BeltRibbon belt={offer.belt} />
            <Chip tint="training">{offer.title}</Chip>
          </span>
          {offer.recommended && (
            <Chip className="pulse-soft">Recommended next step</Chip>
          )}
        </div>
        <CardTitle>{offer.tagline}</CardTitle>
        <p className="text-[13px] text-muted-foreground">{offer.description}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="grid gap-3 text-[13px] sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Duration</dt>
            <dd className="font-medium text-fg">{offer.estimatedDuration}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Price (placeholder)</dt>
            <dd className="font-medium text-fg">{offer.pricePlaceholder}</dd>
          </div>
        </dl>
        <div>
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            Outcomes
          </p>
          <ul className="mt-1 flex flex-col gap-1 text-[13px] text-fg">
            {offer.outcomes.map((o) => (
              <li key={o} className="flex items-start gap-2">
                <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            Who it&apos;s for
          </p>
          <ul className="mt-1 flex flex-col gap-1 text-[13px] text-muted-foreground">
            {offer.whoItIsFor.map((w) => (
              <li key={w}>· {w}</li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3 border-t border-border-subtle pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[12px] text-muted-foreground">
              {offer.primaryCtaHint}
            </p>
            <Button
              variant={offer.recommended ? "primary" : "outline"}
              size="sm"
              {...(offer.recommended ? { "data-magnetic": "5" } : {})}
            >
              {offer.primaryCtaLabel}
            </Button>
          </div>
          <MockEventChip
            event={EVENT_FOR_BELT[offer.belt]}
            futureAction={
              offer.belt === "yellow"
                ? "Add to Yellow Belt high-intent audience · graduate discount sequence."
                : "Route to advisor · personalised pathway email."
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

function BookACallCta() {
  return (
    <Card data-reveal>
      <CardHeader>
        <CardTitle>Not sure which belt?</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          A 20-minute call with an advisor maps a personalised pathway.
        </p>
      </CardHeader>
      <CardContent className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-[14px] text-fg">
          No pitch — just figure out the right next step.
        </p>
        <div className="flex flex-col items-end gap-2">
          <Button variant="primary" size="md">Book a call (mock)</Button>
          <MockEventChip
            event="call_booked"
            futureAction="Assign to advisor immediately · pre-send one-pager."
          />
        </div>
      </CardContent>
    </Card>
  );
}
