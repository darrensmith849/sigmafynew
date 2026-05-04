import Link from "next/link";
import { Button } from "@sigmafy/ui";

export default function MarketingHome() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-sigmafyBlue-500">Sigmafy</p>
      <h1 className="text-4xl font-semibold tracking-tight text-foreground">
        The operating system for Six Sigma and Lean improvement work.
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        Train. Do. Prove. Run real DMAIC projects with statistical tools and AI guidance, end to end.
      </p>
      <div className="flex gap-3">
        <Link href="/sign-up">
          <Button size="lg">Get started</Button>
        </Link>
        <Link href="/sign-in">
          <Button size="lg" variant="outline">
            Sign in
          </Button>
        </Link>
      </div>
    </main>
  );
}
