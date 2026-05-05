import Link from "next/link";
import { Button, Card, Eyebrow } from "@sigmafy/ui";
import { PageHero } from "../_components/page-hero";

export const metadata = { title: "Contact — Sigmafy" };

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Talk to us"
        title="Tell us about your team."
        lede="Cohort size, training cadence, the quality outcomes you're chasing. We'll send a tailored proposal back the same day."
      />

      <section className="pb-24">
        <div data-reveal className="mx-auto max-w-narrow px-5 sm:px-8">
          <Card className="p-8">
            <Eyebrow>Direct contact</Eyebrow>
            <p className="mt-4 text-base text-fg">
              Email{" "}
              <a className="font-medium text-fg underline-offset-4 hover:underline" href="mailto:contact@2ko.co.za">
                contact@2ko.co.za
              </a>{" "}
              with a one-line description of your cohort and the volume you&apos;re
              planning. We respond within one business day.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="mailto:contact@2ko.co.za">
                <Button size="lg">Email contact@2ko.co.za</Button>
              </a>
              <Link href="/pricing">
                <Button size="lg" variant="secondary">
                  See pricing
                </Button>
              </Link>
            </div>
          </Card>
          <p className="mt-6 text-center text-sm text-muted">
            Sigmafy is built by 2KO Pty Ltd. Six Sigma South Africa is the first
            live tenant.
          </p>
        </div>
      </section>
    </>
  );
}
