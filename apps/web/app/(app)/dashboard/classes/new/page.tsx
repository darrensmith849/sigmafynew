import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@sigmafy/ui";
import { bootstrapUserAndWorkspace } from "@/lib/auth";
import { CreateClassForm } from "../_components/create-class-form";

export const dynamic = "force-dynamic";

export default async function NewClassPage() {
  try {
    await bootstrapUserAndWorkspace();
  } catch (err) {
    if (err instanceof Error && err.message === "not_signed_in") {
      redirect("/sign-in");
    }
    throw err;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12">
      <Link
        href="/dashboard/classes"
        className="text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-sigmafyBlue-600"
      >
        ← Classes
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>New class</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateClassForm />
        </CardContent>
      </Card>
    </main>
  );
}
