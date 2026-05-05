"use client";

import { useState, useTransition } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Label } from "@sigmafy/ui";
import { addTopicComment, deleteTopicComment } from "../_actions/comments";

export interface CommentDisplay {
  id: string;
  body: string;
  createdAt: Date;
  authorEmail: string;
  authorFullName: string | null;
  authorRole: string;
  isMine: boolean;
}

const ROLE_BADGE: Record<string, string> = {
  owner: "bg-sigmafyBlue-50 text-sigmafyBlue-700",
  admin: "bg-sigmafyBlue-50 text-sigmafyBlue-700",
  trainer: "bg-amber-50 text-amber-800",
  sponsor: "bg-purple-50 text-purple-800",
  delegate: "bg-neutral-100 text-neutral-700",
};

export function TopicComments(props: {
  projectId: string;
  topicPath: string;
  comments: CommentDisplay[];
}) {
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onPost = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!body.trim()) {
      setError("Comment can't be empty.");
      return;
    }
    startTransition(async () => {
      try {
        await addTopicComment({
          projectId: props.projectId,
          topicPath: props.topicPath,
          body,
        });
        setBody("");
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    });
  };

  const onDelete = (commentId: string) => {
    if (!confirm("Delete this comment?")) return;
    startTransition(async () => {
      await deleteTopicComment({ projectId: props.projectId, commentId });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Comments{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({props.comments.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {props.comments.length > 0 && (
          <ul className="grid gap-3">
            {props.comments.map((c) => (
              <li
                key={c.id}
                className="rounded-md border border-border bg-background p-3 text-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-medium">{c.authorFullName ?? c.authorEmail}</span>
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                        ROLE_BADGE[c.authorRole] ?? ROLE_BADGE.delegate
                      }`}
                    >
                      {c.authorRole}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {c.isMine && (
                    <button
                      type="button"
                      onClick={() => onDelete(c.id)}
                      className="text-xs text-muted-foreground hover:text-red-600"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-foreground">{c.body}</p>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={onPost} className="grid gap-2">
          <Label htmlFor="comment-body">New comment</Label>
          <textarea
            id="comment-body"
            value={body}
            onChange={(e) => setBody(e.currentTarget.value)}
            rows={3}
            placeholder="Ask a question. Leave guidance. Flag a concern."
            className="w-full rounded-md border border-border bg-background p-3 text-sm focus:border-sigmafyBlue-400 focus:outline-none focus:ring-2 focus:ring-sigmafyBlue-100"
          />
          <div className="flex items-center justify-between">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={pending} className="ml-auto">
              {pending ? "Posting…" : "Post comment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
