import Link from "next/link";
import { redirect } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@sigmafy/ui";
import { acceptInvitation } from "@/lib/invitations";

export const dynamic = "force-dynamic";

const REASON_COPY: Record<string, { title: string; body: string; signinHref?: string }> = {
  not_signed_in: {
    title: "Sign in to accept",
    body: "Use the same email address the invitation was sent to.",
    signinHref: "/sign-in",
  },
  not_found: {
    title: "Invitation not found",
    body: "The link is malformed or the invitation has been deleted.",
  },
  expired: {
    title: "Invitation expired",
    body: "Ask whoever invited you to send a new invitation.",
  },
  wrong_email: {
    title: "Wrong account",
    body: "This invitation was sent to a different email address. Sign out and sign in again with the email that received the invitation.",
  },
  already_member: {
    title: "Already a member",
    body: "You're already in this workspace.",
  },
};

export default async function AcceptInvitePage(props: {
  params: Promise<{ token: string }>;
}) {
  const params = await props.params;
  const result = await acceptInvitation(params.token);

  if (result.ok) {
    redirect("/dashboard");
  }

  const copy = REASON_COPY[result.reason] ?? REASON_COPY.not_found!;
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg p-6">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm text-muted-foreground">{copy.body}</p>
          {copy.signinHref && (
            <Link
              href={`${copy.signinHref}?redirect_url=${encodeURIComponent(`/accept-invite/${params.token}`)}` as never}
            >
              <Button>Sign in</Button>
            </Link>
          )}
          {!copy.signinHref && (
            <Link href="/dashboard">
              <Button variant="ghost">Back to dashboard</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
