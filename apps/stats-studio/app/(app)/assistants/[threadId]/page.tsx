import Link from "next/link";
import { notFound } from "next/navigation";
import { inArray } from "drizzle-orm";
import { Card, Eyebrow } from "@sigmafy/ui";
import { withWorkspace, schema } from "@sigmafy/db";
import { getAppDb } from "@/lib/db";
import { requireAuthContext } from "@/lib/auth";
import { getThread, listMessages } from "@/lib/agent";
import { ChatForm } from "./_components/chat-form";
import { ToolRunReceipt } from "./_components/tool-run-receipt";

export const metadata = { title: "Conversation — Sigmafy Statistics Studio" };

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  const ctx = await requireAuthContext();
  const thread = await getThread(ctx.workspace.id, threadId);
  if (!thread) notFound();
  const messages = await listMessages(ctx.workspace.id, threadId);

  // Collect every tool_run_id referenced anywhere in this thread,
  // then fetch all of them in one query so the receipt cards can
  // render slug + status without N+1 lookups.
  const allRunIds = Array.from(
    new Set(
      messages
        .flatMap((m) => (m.toolRunIds as unknown[]) ?? [])
        .filter((id): id is string => typeof id === "string"),
    ),
  );
  const runsById = new Map<string, schema.StatsToolRun>();
  if (allRunIds.length > 0) {
    const runs = await withWorkspace(getAppDb(), ctx.workspace.id, async (tx) =>
      tx
        .select()
        .from(schema.statsToolRuns)
        .where(inArray(schema.statsToolRuns.id, allRunIds)),
    );
    for (const r of runs) runsById.set(r.id, r);
  }

  return (
    <section className="mx-auto max-w-shell px-5 py-8 sm:px-8 lg:py-10">
      <div className="flex items-center justify-between">
        <div>
          <Eyebrow>Conversation</Eyebrow>
          <h1 className="h-display-sm mt-2 text-fg">{thread.title}</h1>
        </div>
        <Link
          href="/assistants"
          className="text-sm text-muted hover:text-fg"
        >
          ← Back to assistants
        </Link>
      </div>

      <Card className="mt-6 flex h-[calc(100vh-15rem)] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <p className="text-sm text-muted">
              No messages yet. Type your question below to start.
            </p>
          ) : (
            messages.map((m) => {
              // Skip the tool_result turns — their content is already
              // surfaced via the receipt cards on the preceding
              // assistant turn. Persisting them is necessary for the
              // model's context replay, but rendering them as
              // separate bubbles is noisy.
              if (m.role === "tool") return null;

              const runIds = ((m.toolRunIds as unknown[]) ?? []).filter(
                (id): id is string => typeof id === "string",
              );

              return (
                <article
                  key={m.id}
                  className={
                    m.role === "user"
                      ? "rounded-md border border-border-subtle bg-bg-elev px-4 py-3"
                      : "rounded-md border border-accent/30 bg-accent/5 px-4 py-3"
                  }
                >
                  <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
                    {m.role === "user" ? "You" : "Stats Co-pilot"}
                  </div>
                  {m.text ? (
                    <div className="whitespace-pre-wrap text-sm text-fg">
                      {m.text}
                    </div>
                  ) : null}

                  {runIds.length > 0 && (
                    <div className="mt-3 flex flex-col gap-2">
                      {runIds.map((rid) => {
                        const run = runsById.get(rid);
                        if (!run) return null;
                        return <ToolRunReceipt key={rid} run={run} />;
                      })}
                    </div>
                  )}

                  {m.role === "assistant" && (m.inputTokens || m.outputTokens) ? (
                    <div className="mt-2 text-xs text-muted">
                      {m.model ?? "model"} ·{" "}
                      {(m.inputTokens ?? 0) + (m.outputTokens ?? 0)} tokens
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
        <div className="border-t border-border-subtle p-4">
          <ChatForm threadId={threadId} />
        </div>
      </Card>
    </section>
  );
}
