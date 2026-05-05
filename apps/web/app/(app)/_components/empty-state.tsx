import Link from "next/link";
import type { ReactNode } from "react";
import { Button, Card, CardContent } from "@sigmafy/ui";

/**
 * Shared empty-state card.
 *
 * Master plan §4.2: "Empty states must explain the next action. Never show
 * dead blank pages." Use this anywhere a list could be empty.
 *
 * Pass either an `actionHref` + `actionLabel` for a link CTA, or `children`
 * for arbitrary content (e.g. a form), or both.
 */
export function EmptyState(props: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
  /** Optional subtle eyebrow above the title. */
  eyebrow?: string;
  children?: ReactNode;
}) {
  return (
    <Card className="border-border/60 bg-background">
      <CardContent className="grid gap-3 p-8 text-center">
        {props.eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sigmafyBlue-600">
            {props.eyebrow}
          </p>
        )}
        <h3 className="text-lg font-semibold text-foreground">{props.title}</h3>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">{props.body}</p>
        {props.actionHref && props.actionLabel && (
          <div className="mt-2">
            <Link href={props.actionHref as never}>
              <Button>{props.actionLabel}</Button>
            </Link>
          </div>
        )}
        {props.children}
      </CardContent>
    </Card>
  );
}
