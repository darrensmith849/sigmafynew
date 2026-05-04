import { Card, CardContent, CardHeader, CardTitle } from "@sigmafy/ui";

export default function DashboardPlaceholder() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-12">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-sigmafyBlue-500">
          Sigmafy
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Authed product shell — placeholder for Phase 0A.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Phase -1 placeholder</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Real workspace, project list and DMAIC navigation land in Phase 0A.
          This shell is here so Vercel can build the authed route group.
        </CardContent>
      </Card>
    </main>
  );
}
