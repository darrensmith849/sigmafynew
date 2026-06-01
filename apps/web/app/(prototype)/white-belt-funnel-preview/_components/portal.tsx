import Link from "next/link";
import { Button, Card, CardContent, CardHeader, Chip } from "@sigmafy/ui";
import { mockLearner } from "../_data/learner";
import { SectionHeader } from "./shell";

const ROUTE = "/white-belt-funnel-preview";

interface CtaCard {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  tone?: "recommended" | "primary" | "neutral";
}

const ctas: CtaCard[] = [
  {
    eyebrow: "Next belt",
    title: "Upgrade to Yellow Belt",
    description: "Apply DMAIC to a real problem under a coach. White Belt graduate discount available.",
    ctaLabel: "View Yellow Belt",
    href: `${ROUTE}?tab=upgrade`,
    tone: "recommended",
  },
  {
    eyebrow: "Skip ahead",
    title: "Enquire about Green Belt",
    description: "Run a full DMAIC project part-time, alongside your day job.",
    ctaLabel: "Enquire",
    href: `${ROUTE}?tab=upgrade`,
  },
  {
    eyebrow: "Skip ahead",
    title: "Enquire about Black Belt",
    description: "Become the programme lead. Full-time, statistical depth, change leadership.",
    ctaLabel: "Enquire",
    href: `${ROUTE}?tab=upgrade`,
  },
  {
    eyebrow: "Company",
    title: "Bring Six Sigma to your company",
    description: "Custom 2KO training cohort + Sigmafy for project tracking. Company rates apply.",
    ctaLabel: "Request a proposal",
    href: `${ROUTE}?tab=referral`,
    tone: "primary",
  },
  {
    eyebrow: "Invite",
    title: "Invite colleagues",
    description: "Get others on the same page. They take their own White Belt; you both stay in sync.",
    ctaLabel: "Invite colleagues",
    href: `${ROUTE}?tab=referral`,
  },
  {
    eyebrow: "Reward",
    title: "Referral programme",
    description: "Refer learners, teams, or whole companies. Reward concept under finalisation.",
    ctaLabel: "Express interest",
    href: `${ROUTE}?tab=referral`,
  },
  {
    eyebrow: "Partner",
    title: "Become a Sigmafy / 2KO partner",
    description: "If you work with companies on improvement, partner with us. Early-stage programme.",
    ctaLabel: "Request partner info",
    href: `${ROUTE}?tab=stats`,
  },
  {
    eyebrow: "Insights",
    title: "View Sigmafy statistics / ROI",
    description: "See what Sigmafy looks like for a company already running projects.",
    ctaLabel: "See sample stats",
    href: `${ROUTE}?tab=stats`,
  },
  {
    eyebrow: "Talk to us",
    title: "Book a call with 2KO",
    description: "20 minutes with an advisor. No pitch — just figure out the right next step.",
    ctaLabel: "Book a call",
    href: `${ROUTE}?tab=portal`,
  },
  {
    eyebrow: "Talk to us",
    title: "Speak to a course advisor",
    description: "Personalised pathway across Yellow, Green, Black, or company.",
    ctaLabel: "Speak to advisor",
    href: `${ROUTE}?tab=portal`,
  },
  {
    eyebrow: "Download",
    title: "Learning-pathway PDF",
    description: "A one-page summary of every belt — outcomes, audience, duration, price.",
    ctaLabel: "Download (mock)",
    href: "#mock-pathway-pdf",
  },
  {
    eyebrow: "Compare",
    title: "Compare belt options",
    description: "Side-by-side comparison of Yellow, Green, and Black Belt.",
    ctaLabel: "Open comparison",
    href: `${ROUTE}?tab=upgrade`,
  },
];

export function PortalTab() {
  const firstName = mockLearner.fullName.split(" ")[0];
  return (
    <div className="flex flex-col gap-10">
      <SectionHeader
        eyebrow="Step 3 — Post-course portal"
        title={`${firstName}, here's everything in one place`}
        description="The portal foregrounds the next best action without overwhelming the learner. CTAs are ordered by relevance; the visual hierarchy makes one obvious."
      />
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {ctas.map((c, i) => (
          <PortalCtaCard key={i} cta={c} />
        ))}
      </div>
    </div>
  );
}

function PortalCtaCard({ cta }: { cta: CtaCard }) {
  const isRecommended = cta.tone === "recommended";
  return (
    <Card
      className={isRecommended ? "" : ""}
      style={
        isRecommended
          ? {
              borderColor:
                "color-mix(in srgb, var(--tint-training) 35%, transparent)",
            }
          : undefined
      }
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            {cta.eyebrow}
          </p>
          {isRecommended && <Chip tint="training">Recommended</Chip>}
          {cta.tone === "primary" && <Chip>Popular for companies</Chip>}
        </div>
        <p className="text-base font-semibold text-fg">{cta.title}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-[13px] text-muted-foreground">{cta.description}</p>
        <Button
          variant={isRecommended ? "primary" : "outline"}
          size="sm"
          className="self-start"
          asChild
        >
          <Link href={cta.href}>{cta.ctaLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
