import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted p-6">
      <SignIn signUpUrl="/sign-up" forceRedirectUrl="/dashboard" />
    </main>
  );
}
