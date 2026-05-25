import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, Eyebrow, Chip } from "@sigmafy/ui";
import { requireAuthContext } from "@/lib/auth";
import {
  ensureDefaultAssistant,
  listAssistants,
  listThreads,
  createThread,
} from "@/lib/agent";

export const metadata = { title: "Assistants — Sigmafy Statistics Studio" };

/**
 * Server-action: start a new thread with the workspace's default
 * assistant and redirect to it. Wired to the "Start a new conversation"
 * button below.
 */
async function startNewThread() {
  "use server";
  const ctx = await requireAuthContext();
  const assistant = await ensureDefaultAssistant(ctx.workspace.id, ctx.user.id);
  const thread = await createThread({
    workspaceId: ctx.workspace.id,
    userId: ctx.user.id,
    assistantId: assistant.id,
  });
  redirect(`/assistants/${thread.id}`);
}

export default async function AssistantsPage() {
  const ctx = await requireAuthContext();
  // Auto-provision the default assistant for workspaces created after
  // the seed-INSERT in 0012 ran.
  await ensureDefaultAssistant(ctx.workspace.id, ctx.user.id);

  const [assistants, threads] = await Promise.all([
    listAssistants(ctx.workspace.id),
    listThreads(ctx.workspace.id, ctx.user.id),
  ]);

  return (
    <section className="mx-auto max-w-shell px-5 py-10 sm:px-8 lg:py-14">
      <Eyebrow>Assistants</Eyebrow>
      <h1 className="h-display-md mt-2 text-fg">AI-native Six Sigma statistics</h1>
      <p className="t-lede mt-3 max-w-2xl text-muted">
        Describe what you have and what you need to know. The Stats Co-pilot
        picks the right procedure, runs it through the catalogue, and
        explains the result — with the JSON input + output preserved as an
        audit receipt.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="t-heading-sm text-fg">Recent conversations</h2>
            <form action={startNewThread}>
              <button
                type="submit"
                className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg hover:bg-accent/90"
              >
                New conversation
              </button>
            </form>
          </div>

          {threads.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              No conversations yet — start one to ask the Co-pilot a question.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {threads.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/assistants/${t.id}`}
                    className="block rounded-md border border-border-subtle bg-bg px-4 py-3 hover:border-border"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm font-medium text-fg">{t.title}</span>
                      <span className="shrink-0 text-xs text-muted">
                        {new Date(t.lastMessageAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted">
                      {t.messageCount} {t.messageCount === 1 ? "message" : "messages"}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="t-heading-sm text-fg">Available assistants</h2>
          <p className="mt-1 text-sm text-muted">
            Workspace owners can add more in Phase 9B (Enterprise — uploaded
            playbooks, spec library, org terminology).
          </p>
          <ul className="mt-4 space-y-3">
            {assistants.map((a) => (
              <li
                key={a.id}
                className="rounded-md border border-border-subtle bg-bg p-4"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-fg">{a.name}</span>
                  {a.isActive ? null : <Chip>inactive</Chip>}
                </div>
                {a.description && (
                  <p className="mt-1 text-sm text-muted">{a.description}</p>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}
