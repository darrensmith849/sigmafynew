import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Chip,
} from "@sigmafy/ui";
import { mockDiscountConcepts, mockUpgradeOffers, type Offer } from "../_data/offers";
import { SectionHeader } from "./shell";

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
      <BookACallCta />
    </div>
  );
}

function DiscountBanner() {
  return (
    <Card
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--tint-training) 6%, var(--color-surface))",
        borderColor:
          "color-mix(in srgb, var(--tint-training) 22%, transparent)",
      }}
    >
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>White Belt graduate discount</CardTitle>
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
          <Chip tint="training">{offer.title}</Chip>
          {offer.recommended && <Chip>Recommended next step</Chip>}
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
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-3">
          <p className="text-[12px] text-muted-foreground">
            {offer.primaryCtaHint}
          </p>
          <Button
            variant={offer.recommended ? "primary" : "outline"}
            size="sm"
          >
            {offer.primaryCtaLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BookACallCta() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Not sure which belt?</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          A 20-minute call with an advisor maps a personalised pathway.
        </p>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px] text-fg">
          No pitch — just figure out the right next step.
        </p>
        <Button variant="primary" size="md">Book a call (mock)</Button>
      </CardContent>
    </Card>
  );
}
