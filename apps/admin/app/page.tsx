import { Card, CardContent, CardHeader, CardTitle } from "@sigmafy/ui";

export default function AdminHome() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-12">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-sigmafyBlue-500">
          Sigmafy Admin
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          2KO Platform Admin
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tenant directory, audited impersonation, platform metrics.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Phase -1 placeholder</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Real admin features (tenant list, impersonation with audit log,
          platform metrics) land in Phase 0B.
        </CardContent>
      </Card>
    </main>
  );
}
