import { Card, CardContent, CardHeader } from "@sigmafy/ui";

export default function ProjectLoading() {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[14rem_1fr]">
      <aside className="hidden lg:block">
        <div className="grid gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-full animate-pulse rounded bg-neutral-100"
            />
          ))}
        </div>
      </aside>
      <div className="grid gap-6">
        <div>
          <div className="h-7 w-64 animate-pulse rounded bg-neutral-200" />
          <div className="mt-2 h-4 w-80 animate-pulse rounded bg-neutral-100" />
        </div>
        <Card>
          <CardHeader>
            <div className="h-5 w-40 animate-pulse rounded bg-neutral-200" />
          </CardHeader>
          <CardContent className="grid gap-3 p-6">
            <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-100" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-100" />
            <div className="h-32 w-full animate-pulse rounded bg-neutral-100" />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
