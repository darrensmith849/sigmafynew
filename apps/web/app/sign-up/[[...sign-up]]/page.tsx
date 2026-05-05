import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { Eyebrow, Logo, ThemeToggle } from "@sigmafy/ui";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-bg text-fg">
      <header className="border-b border-border-subtle bg-bg">
        <div className="mx-auto flex h-14 max-w-shell items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" aria-label="Sigmafy home">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm text-muted hover:text-fg"
            >
              Already have an account? Sign in
            </Link>
            <ThemeToggle className="hidden sm:inline-flex" />
          </div>
        </div>
      </header>
      <section className="mx-auto grid max-w-shell gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:items-center">
        <div>
          <Eyebrow>Create your workspace</Eyebrow>
          <h1 className="h-display-lg mt-3 text-fg">
            Start running Six Sigma projects in minutes.
          </h1>
          <p className="t-lede mt-4 max-w-md">
            Sign up and we&apos;ll spin up your workspace, drop in a starter
            Green Belt project, and you&apos;ll be on the dashboard ready to
            invite your delegates.
          </p>
          <ul className="mt-8 grid gap-3 text-sm text-muted">
            <li className="flex items-start gap-3">
              <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-fg" />
              <span>Free to start. No credit card.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-fg" />
              <span>7 statistical tools live from day one.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-fg" />
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
