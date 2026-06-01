import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Chip,
  Eyebrow,
  Logo,
} from "@sigmafy/ui";

interface AccessGateProps {
  /**
   * Whether the URL carried an `access` token that did not match. We use it
   * to switch the gate copy between "first visit" and "wrong token".
   */
  invalidAttempt?: boolean;
}

/**
 * Polished access screen rendered when the prototype is gated by a
 * `WHITE_BELT_FUNNEL_PREVIEW_TOKEN` env var and the request has no valid
 * token. Submits to `/white-belt-funnel-preview?access=<typed>` as a plain
 * GET form so the middleware can validate, set the cookie, and redirect to
 * a clean URL.
 */
export function AccessGate({ invalidAttempt = false }: AccessGateProps) {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <div
        aria-hidden
        className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[60vh] opacity-60"
      />
      <main
        className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-12"
      >
        <div className="mb-6 flex items-center gap-3">
          <Logo />
          <span className="text-sm text-muted-foreground">
            · White Belt Funnel · Preview
          </span>
        </div>

        <Card
          className="w-full"
          style={{
            borderColor:
              "color-mix(in srgb, var(--tint-training) 22%, var(--color-border))",
          }}
        >
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <Eyebrow>Private prototype</Eyebrow>
              <Chip tint="training">Surface only</Chip>
            </div>
            <CardTitle>Private prototype preview</CardTitle>
            <p className="t-lede">
              This is an internal review surface — mock data only, not
              connected to live systems. Enter your preview access token to
              continue.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form
              method="GET"
              action="/white-belt-funnel-preview"
              className="flex flex-col gap-3"
            >
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-fg">
                  Access token
                </span>
                <input
                  type="password"
                  name="access"
                  required
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="Paste your preview access token"
                  className="h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                  aria-invalid={invalidAttempt}
                />
              </label>
              {invalidAttempt && (
                <p
                  role="alert"
                  className="text-[12px]"
                  style={{ color: "var(--tint-ai)" }}
                >
                  That token isn&apos;t valid. Check it and try again — or
                  ask whoever shared the link.
                </p>
              )}
              <Button type="submit" variant="primary" size="md">
                Enter preview
              </Button>
            </form>

            <hr className="border-border-subtle" />

            <div className="flex flex-col gap-1 text-[12px] text-muted-foreground">
              <p>
                <span className="font-medium text-fg">Why a gate?</span> The
                preview is for internal stakeholders only. The token rotates
                — share it through a private channel, never publicly.
              </p>
              <p>
                <span className="font-medium text-fg">Not connected.</span>{" "}
                Nothing here is wired to live users, real emails, ads,
                payments, CRM, AI agents, or production data.
              </p>
            </div>
          </CardContent>
        </Card>

        <footer className="mt-6 text-center text-[11px] text-muted-foreground">
          Sigmafy · 2KO Pty Ltd · Six Sigma South Africa
        </footer>
      </main>
    </div>
  );
}
