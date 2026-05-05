"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, Card, CardContent } from "@sigmafy/ui";

export default function AppError(props: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app-error]", props.error);
  }, [props.error]);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-16">
      <Card className="border-red-100 bg-red-50/40">
        <CardContent className="grid gap-3 p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-700">
            Something went wrong
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            We hit an unexpected error.
          </h1>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            The error has been logged. You can try again, or jump back to the
            dashboard. If this keeps happening, paste the digest below into a
            support email.
          </p>
          {props.error.digest && (
            <p className="mt-2 text-xs text-muted-foreground">
              <code className="rounded bg-neutral-100 px-2 py-1 font-mono text-xs">
                {props.error.digest}
              </code>
            </p>
          )}
          <div className="mt-3 flex items-center justify-center gap-3">
            <Button onClick={props.reset}>Try again</Button>
            <Link href="/dashboard">
              <Button variant="ghost">Back to dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
