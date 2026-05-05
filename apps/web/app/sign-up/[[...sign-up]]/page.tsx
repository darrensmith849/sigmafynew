import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
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
            href="/sign-in"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </header>
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-sigmafyBlue-600">
            Create your workspace
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-foreground">
            Start running Six Sigma projects in minutes.
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            Sign up and we&apos;ll spin up your workspace, drop in a starter
            Green Belt project, and you&apos;ll be on the dashboard ready to
            invite your delegates.
          </p>
          <ul className="mt-8 grid gap-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-sigmafyBlue-500" />
              <span>Free to start. No credit card.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-sigmafyBlue-500" />
              <span>7 statistical tools live from day one.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-sigmafyBlue-500" />
              <span>AI feedback on every submission.</span>
            </li>
          </ul>
        </div>
        <div className="flex justify-center lg:justify-end">
          <SignUp
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            forceRedirectUrl="/dashboard"
          />
        </div>
      </section>
    </main>
  );
}
