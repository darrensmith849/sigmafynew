import { Button, Card, CardContent, CardHeader, CardTitle } from "@sigmafy/ui";

export default function MarketingHome() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-sigmafyBlue-500">
          Sigmafy
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
          The operating system for Six Sigma and Lean improvement work.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Train. Do. Prove.
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Phase -1 placeholder</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Real marketing copy and signup flow land later. This page exists to
          prove the monorepo, design tokens, and packages/ui wiring all work.
        </CardContent>
      </Card>

      <Button>Sign up (coming soon)</Button>
    </main>
  );
}
