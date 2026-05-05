import { Card, CardContent } from "@sigmafy/ui";

export default function AppLoading() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <div className="grid gap-2">
        <div className="h-8 w-48 animate-pulse rounded bg-surface-3" />
        <div className="h-4 w-72 animate-pulse rounded bg-surface-3" />
      </div>
      <Card>
        <CardContent className="grid gap-3 p-6">
          <div className="h-4 w-3/4 animate-pulse rounded bg-surface-3" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-surface-3" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-surface-3" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="grid gap-3 p-6">
          <div className="h-4 w-2/3 animate-pulse rounded bg-surface-3" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-surface-3" />
        </CardContent>
      </Card>
    </main>
  );
}
