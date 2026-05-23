import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { bootstrapStudioUser } from "@/lib/auth";
import { AppHeader } from "./_components/app-header";

/**
 * Auth-gated shell for catalog, tool runner, and runs history.
 *
 * Bootstraps a workspace on first visit (idempotent). Unlike apps/web's
 * helper, stats-studio's bootstrapStudioUser skips the starter Green Belt
 * project + welcome email — Studio users want the catalogue, not a DMAIC
 * template.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  let workspaceName = "Personal Studio";
  try {
    const ctx = await bootstrapStudioUser();
    workspaceName = ctx.workspace.name;
  } catch (err) {
    if (err instanceof Error && err.message === "not_signed_in") {
      redirect("/sign-in");
    }
    throw err;
  }

  return (
    <>
      <AppHeader workspaceName={workspaceName} />
      <div className="bg-bg min-h-[calc(100vh-3.5rem)] text-fg">{children}</div>
    </>
  );
}
