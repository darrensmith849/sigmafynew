import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Chip, ProgressBar } from "@sigmafy/ui";
import {
  intentLabels,
  mockIncomingReplies,
  type IncomingReply,
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
      <div className="grid gap-6 lg:grid-cols-[3fr_4fr]">
        <ReplyInbox replies={mockIncomingReplies} selectedId={selected.id} />
        <ReplyDetail reply={selected} />
      </div>
      <SafetyGuardrails />
    </div>
  );
}

function ReplyInbox({
  replies,
  selectedId,
}: {
  replies: IncomingReply[];
  selectedId: string;
}) {
  return (
    <Card>
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
                  className="block px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-fg">{r.fromName}</p>
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
                    {intentLabels[r.detectedIntent]} · status: {r.status.replace(/_/g, " ")}
                  </p>
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
    <Card>
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
          <div className="mt-2 rounded-card border border-border-subtle bg-surface p-4 text-[14px] leading-relaxed text-fg">
            {reply.body}
          </div>
        </section>

        <section>
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            Suggested response · draft only
          </p>
          <div
            className="mt-2 rounded-card border p-4 text-[14px] leading-relaxed text-fg"
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
    <Card>
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
