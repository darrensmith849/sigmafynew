import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <header className="border-b border-border/60 bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-sm font-bold tracking-[0.2em] text-sigmafyBlue-600"
          >
            SIGMAFY
          </Link>
          <Link
            href="/sign-up"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Don&apos;t have an account? Sign up
          </Link>
        </div>
      </header>
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-sigmafyBlue-600">
            Welcome back
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-foreground">
            Pick up where you left off.
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            Sign in to continue your Green Belt project, review delegate
            submissions, or check the workspace ROI.
          </p>
        </div>
        <div className="flex justify-center lg:justify-end">
          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            forceRedirectUrl="/dashboard"
          />
        </div>
      </section>
    </main>
  );
}
