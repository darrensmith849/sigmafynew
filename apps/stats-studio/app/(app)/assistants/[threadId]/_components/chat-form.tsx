"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * Minimal chat input. Posts to /api/chat, refreshes the server-rendered
 * thread page on success so the new turn surfaces with the persisted
 * tokens / model fields. Phase 9A slice 4 will swap this for an SSE
 * stream that mounts an in-flight assistant message bubble before the
 * server response lands.
 */
export function ChatForm({ threadId }: { threadId: string }) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isPending) return;
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ threadId, text: trimmed }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { detail?: string; error?: string }
          | null;
        setError(body?.detail || body?.error || `HTTP ${res.status}`);
        return;
      }
      setText("");
      startTransition(() => router.refresh());
    } catch (exc) {
      setError(exc instanceof Error ? exc.message : "network_error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="e.g. I have two batches with unequal variance — are they different?"
        className="resize-y rounded-md border border-border-subtle bg-bg-elev px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
        disabled={isPending}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            (e.currentTarget.form as HTMLFormElement).requestSubmit();
          }
        }}
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted">
          ⌘/Ctrl + Enter to send
        </span>
        <button
          type="submit"
          disabled={!text.trim() || isPending}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Sending…" : "Send"}
        </button>
      </div>
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
