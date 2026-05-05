import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { Eyebrow, Logo, ThemeToggle } from "@sigmafy/ui";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-bg text-fg">
      <header className="border-b border-border-subtle bg-bg">
        <div className="mx-auto flex h-14 max-w-shell items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" aria-label="Sigmafy home">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/sign-up" className="text-sm text-muted hover:text-fg">
              Don&apos;t have an account? Sign up
            </Link>
            <ThemeToggle className="hidden sm:inline-flex" />
          </div>
        </div>
      </header>
      <section className="mx-auto grid max-w-shell gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:items-center">
        <div>
          <Eyebrow>Welcome back</Eyebrow>
          <h1 className="h-display-lg mt-3 text-fg">
            Pick up where you left off.
          </h1>
          <p className="t-lede mt-4 max-w-md">
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
