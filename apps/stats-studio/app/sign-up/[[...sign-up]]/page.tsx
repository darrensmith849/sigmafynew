import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { Eyebrow, Logo, ThemeToggle } from "@sigmafy/ui";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-bg text-fg">
      <header className="border-b border-border-subtle bg-bg">
        <div className="mx-auto flex h-14 max-w-shell items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" aria-label="Sigmafy Statistics home">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm text-muted hover:text-fg">
              Already have an account? Sign in
            </Link>
            <ThemeToggle className="hidden sm:inline-flex" />
          </div>
        </div>
      </header>
      <section className="mx-auto grid max-w-shell gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:items-center">
        <div>
          <Eyebrow>Get started in 60 seconds</Eyebrow>
          <h1 className="h-display-lg mt-3 text-fg">Sigma quality. Plug and play.</h1>
          <p className="t-lede mt-4 max-w-md">
            Create an account and you&apos;ll land in your own workspace with all 288
            statistical tools at your fingertips. No credit card.
          </p>
        </div>
        <div className="flex justify-center lg:justify-end">
          <SignUp
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            forceRedirectUrl="/catalog"
          />
        </div>
      </section>
    </main>
  );
}
