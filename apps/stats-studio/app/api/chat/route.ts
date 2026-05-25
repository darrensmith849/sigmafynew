import { NextResponse } from "next/server";
import { requireAuthContext } from "@/lib/auth";
import { postUserMessageAndReply } from "@/lib/agent";

/**
 * POST /api/chat
 *
 * Body: { threadId: string; text: string }
 * Returns: { userMessage, assistantMessage }
 *
 * Auth-gated via Clerk session + workspace membership. RLS scopes the
 * underlying agent_messages / agent_threads writes to the caller's
 * workspace. Phase 9A slice 3 is non-streaming — see slice 4 for SSE.
 */
export async function POST(req: Request) {
  let body: { threadId?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", detail: "Request body must be JSON." },
      { status: 400 },
    );
  }

  const threadId = body?.threadId?.trim();
  const text = body?.text?.trim();
  if (!threadId) {
    return NextResponse.json(
      { error: "missing_thread", detail: "threadId is required." },
      { status: 400 },
    );
  }
  if (!text) {
    return NextResponse.json(
      { error: "missing_text", detail: "text is required." },
      { status: 400 },
    );
  }

  let ctx;
  try {
    ctx = await requireAuthContext();
  } catch (exc) {
    if (
      exc instanceof Error &&
      (exc.message === "not_signed_in" || exc.message === "no_workspace")
    ) {
      return NextResponse.json(
        { error: "not_authorised", detail: "Sign in to chat with the agent." },
        { status: 401 },
      );
    }
    throw exc;
  }

  try {
    const result = await postUserMessageAndReply({
      workspaceId: ctx.workspace.id,
      userId: ctx.user.id,
      threadId,
      text,
    });
    return NextResponse.json(result, { status: 200 });
  } catch (exc) {
    const message = exc instanceof Error ? exc.message : "unknown_error";
    if (message === "thread_not_found") {
      return NextResponse.json(
        { error: "thread_not_found", detail: "Unknown thread id." },
        { status: 404 },
      );
    }
    if (message === "assistant_not_found") {
      return NextResponse.json(
        { error: "assistant_not_found", detail: "Thread's assistant no longer exists." },
        { status: 410 },
      );
    }
    if (message === "empty_message") {
      return NextResponse.json(
        { error: "empty_message", detail: "Cannot send an empty message." },
        { status: 400 },
      );
    }
    if (message.includes("ANTHROPIC_API_KEY missing")) {
      return NextResponse.json(
        {
          error: "agent_not_configured",
          detail:
            "Set ANTHROPIC_API_KEY in the server environment to enable the Stats Co-pilot.",
        },
        { status: 503 },
      );
    }
    console.error("[/api/chat] failed", exc);
    return NextResponse.json(
      { error: "chat_failed", detail: message },
      { status: 500 },
    );
  }
}
