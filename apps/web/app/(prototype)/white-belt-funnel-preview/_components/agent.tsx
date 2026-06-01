import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Chip, ProgressBar } from "@sigmafy/ui";
import {
  intentLabels,
  mockIncomingReplies,
  type IncomingReply,
  type IntentCategory,
} from "../_data/email-agent";
import { SectionHeader } from "./shell";

const ROUTE = "/white-belt-funnel-preview";

const SENTIMENT_TINT: Record<IncomingReply["sentiment"], string> = {
  positive: "projects",
  neutral: "spc",
  negative: "ai",
  mixed: "training",
};

export function AgentTab({ replyId }: { replyId?: string }) {
  const selected =
    mockIncomingReplies.find((r) => r.id === replyId) ?? mockIncomingReplies[0]!;
  return (
    <div className="flex flex-col gap-10">
      <SectionHeader
        eyebrow="Step 14 — Email agent concept"
        title="Reply → classify → suggest → human approves"
        description="An AI suggests a response; a human approves before anything sends. No auto-send. No Gmail or SMTP connection. The intent classification surface is the part we want to test first."
      />
      <IntentDistribution replies={mockIncomingReplies} />
      <div className="grid gap-6 lg:grid-cols-[3fr_4fr]">
        <ReplyInbox replies={mockIncomingReplies} selectedId={selected.id} />
        <ReplyDetail reply={selected} />
      </div>
      <SafetyGuardrails />
    </div>
  );
}

function IntentDistribution({ replies }: { replies: IncomingReply[] }) {
  const counts = new Map<IntentCategory, number>();
  for (const r of replies)
    counts.set(r.detectedIntent, (counts.get(r.detectedIntent) ?? 0) + 1);
  const ordered = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return (
    <Card data-reveal>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Intent distribution</CardTitle>
          <Chip>{replies.length} replies · mock</Chip>
        </div>
        <p className="text-[13px] text-muted-foreground">
          Classifier output across the mock inbox. Each row would feed
          routing + sequence-trigger rules.
        </p>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-2 sm:grid-cols-2">
          {ordered.map(([intent, count]) => {
            const pct = (count / Math.max(replies.length, 1)) * 100;
            return (
              <li
                key={intent}
                className="rounded-md border border-border-subtle bg-surface p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-medium text-fg">
                    {intentLabels[intent]}
                  </p>
                  <Chip className="!text-[10px]">{count}</Chip>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-pill bg-surface-3">
                  <span
                    className="block h-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: "var(--tint-ai)",
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function monogram(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function ReplyInbox({
  replies,
  selectedId,
}: {
  replies: IncomingReply[];
  selectedId: string;
}) {
  return (
    <Card data-reveal>
      <CardHeader>
        <CardTitle>Incoming replies</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          Mock inbox · click to inspect a reply.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border-subtle">
          {replies.map((r) => {
            const selected = r.id === selectedId;
            return (
              <li
                key={r.id}
                className={selected ? "bg-surface-2" : "hover:bg-surface-2"}
              >
                <Link
                  href={`${ROUTE}?tab=agent&reply=${r.id}`}
                  prefetch={false}
                  className="flex gap-3 px-4 py-3"
                >
                  <span
                    aria-hidden
                    className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-pill border text-[11px] font-semibold"
                    style={{
                      color: "var(--tint-ai)",
                      backgroundColor:
                        "color-mix(in srgb, var(--tint-ai) 10%, var(--color-surface))",
                      borderColor:
                        "color-mix(in srgb, var(--tint-ai) 22%, transparent)",
                    }}
                  >
                    {monogram(r.fromName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-fg">
                        {r.fromName}
                      </p>
                      <Chip
                        tint={
                          SENTIMENT_TINT[r.sentiment] as
                            | "projects"
                            | "spc"
                            | "training"
                            | "ai"
                            | "admin"
                            | undefined
                        }
                      >
                        {r.sentiment}
                      </Chip>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[12px] text-muted-foreground">
                      {r.body}
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                      {intentLabels[r.detectedIntent]} · {r.status.replace(/_/g, " ")}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function ReplyDetail({ reply }: { reply: IncomingReply }) {
  return (
    <Card data-reveal>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>{reply.fromName}</CardTitle>
          <Chip tint="ai">{intentLabels[reply.detectedIntent]}</Chip>
        </div>
        <p className="text-[13px] text-muted-foreground">
          {reply.fromEmail} · {new Date(reply.receivedAt).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short", hour12: false })}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <ProgressBar
          value={Math.round(reply.intentConfidence * 100)}
          label="Intent confidence"
          valueLabel={`${Math.round(reply.intentConfidence * 100)}%`}
          tint="ai"
        />

        <section>
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            Reply received
          </p>
          <div
            className="mt-2 max-w-[88%] rounded-card rounded-tl-sm border border-border-subtle bg-surface p-4 text-[14px] leading-relaxed text-fg"
          >
            {reply.body}
          </div>
        </section>

        <section className="self-end">
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            Suggested response · draft only · human approval required
          </p>
          <div
            className="ml-auto mt-2 max-w-[88%] rounded-card rounded-tr-sm border p-4 text-[14px] leading-relaxed text-fg"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--tint-ai) 5%, var(--color-surface))",
              borderColor:
                "color-mix(in srgb, var(--tint-ai) 22%, transparent)",
            }}
          >
            {reply.suggestedResponse}
          </div>
        </section>

        <section className="rounded-card border border-border-subtle bg-surface p-4 text-[13px]">
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            Suggested next action
          </p>
          <p className="mt-1 text-fg">{reply.suggestedNextAction}</p>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-3">
          <p className="text-[12px] text-muted-foreground">
            Approval is required before any draft is sent.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" size="sm">Approve & send (mock)</Button>
            <Button variant="outline" size="sm">Edit before send</Button>
            <Button variant="ghost" size="sm">Assign to sales</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SafetyGuardrails() {
  return (
    <Card data-reveal>
      <CardHeader>
        <CardTitle>Safety rules</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-2 text-[13px] sm:grid-cols-2">
          {[
            "No auto-send. Every outbound reply requires human approval.",
            "No Gmail or SMTP wired in this prototype.",
            "Sentiment + intent classification only — no decisions taken without review.",
            "Unsubscribe / not-interested replies route directly to suppress.",
            "Pricing and contractual questions auto-escalate to a salesperson.",
            "Every approval and assignment is audit-logged.",
          ].map((s) => (
            <li
              key={s}
              className="rounded-md border border-border-subtle bg-surface px-3 py-2 text-fg"
            >
              · {s}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
