import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { bootstrapUserAndWorkspace } from "@/lib/auth";
import { AppHeader } from "./_components/app-header";

/**
 * Layout for every authenticated page in the (app) route group.
 *
 * Bootstraps the user's workspace on first visit (idempotent) and renders
 * the persistent top nav so every page below shares the same chrome.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  let workspaceName = "Sigmafy";
  try {
    const ctx = await bootstrapUserAndWorkspace();
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
