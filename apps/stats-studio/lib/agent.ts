/**
 * Server-side helpers for the AI Agent Platform (Phase 9A).
 *
 * Reads + writes the agent_assistants / agent_threads / agent_messages
 * tables behind workspace RLS. Composes the Claude conversation from
 * the persisted history before each turn so the user can pick up an
 * old thread on a different device.
 *
 * Tool-use / agentic-loop wiring lands in slice 4 — for now Claude
 * gets plain text in and produces plain text out. Stats tool calls
 * happen separately through the existing @sigmafy/stats-gateway flow
 * via the catalogue runner.
 */
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { withWorkspace, schema } from "@sigmafy/db";
import {
  createAiClient,
  type AiMessage,
  type AiResponse,
} from "@sigmafy/ai";
import { getAppDb } from "./db";

export type { AiResponse };

/** Default assistant slug. The migration seeds this for every workspace. */
export const DEFAULT_ASSISTANT_SLUG = "stats-copilot";

const FALLBACK_SYSTEM_PROMPT = `You are Sigmafy's Stats Co-pilot. Help the user pick the right statistical procedure for their question, recommend running it through the Sigmafy stats catalogue (browse + click "Run"), and explain results in plain English. Be honest about uncertainty. Speak like a process engineer's colleague.`;

/** AI client for the chat path. Picked from process.env at module load. */
function chatClient() {
  return createAiClient({
    AI_PROVIDER: process.env.AI_PROVIDER as "openai" | "anthropic" | undefined,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    AI_DEFAULT_MODEL_ID: process.env.AI_DEFAULT_MODEL_ID,
    ANTHROPIC_DEFAULT_MODEL_ID: process.env.ANTHROPIC_DEFAULT_MODEL_ID,
    OPENAI_DEFAULT_MODEL_ID: process.env.OPENAI_DEFAULT_MODEL_ID,
  });
}

/**
 * Ensure the workspace has a default assistant. Idempotent — safe to
 * call on every /assistants visit. Returns the resolved row.
 *
 * The Phase 9A migration seeds existing workspaces, but new workspaces
 * created after the migration's INSERT … FROM pass won't have a row
 * yet. This guard fills the gap.
 */
export async function ensureDefaultAssistant(
  workspaceId: string,
  createdByUserId: string,
): Promise<schema.AgentAssistant> {
  const db = getAppDb();
  return withWorkspace(db, workspaceId, async (tx) => {
    const existing = await tx
      .select()
      .from(schema.agentAssistants)
      .where(
        and(
          eq(schema.agentAssistants.workspaceId, workspaceId),
          eq(schema.agentAssistants.slug, DEFAULT_ASSISTANT_SLUG),
        ),
      )
      .limit(1);
    if (existing[0]) return existing[0];

    const inserted = await tx
      .insert(schema.agentAssistants)
      .values({
        workspaceId,
        slug: DEFAULT_ASSISTANT_SLUG,
        name: "Stats Co-pilot",
        description:
          "Picks the right statistical procedure, runs it against the engine, and explains the result.",
        systemPrompt: FALLBACK_SYSTEM_PROMPT,
        createdByUserId,
      })
      .returning();
    return inserted[0]!;
  });
}

/**
 * List the workspace's assistants, active ones first, oldest active
 * first within that. Phase 9A typically has one; 9B will have many.
 */
export async function listAssistants(
  workspaceId: string,
): Promise<schema.AgentAssistant[]> {
  const db = getAppDb();
  return withWorkspace(db, workspaceId, async (tx) =>
    tx
      .select()
      .from(schema.agentAssistants)
      .where(eq(schema.agentAssistants.workspaceId, workspaceId))
      .orderBy(desc(schema.agentAssistants.isActive), asc(schema.agentAssistants.createdAt)),
  );
}

export async function listThreads(
  workspaceId: string,
  userId: string,
  limit = 50,
): Promise<schema.AgentThread[]> {
  const db = getAppDb();
  return withWorkspace(db, workspaceId, async (tx) =>
    tx
      .select()
      .from(schema.agentThreads)
      .where(
        and(
          eq(schema.agentThreads.workspaceId, workspaceId),
          eq(schema.agentThreads.userId, userId),
        ),
      )
      .orderBy(desc(schema.agentThreads.lastMessageAt))
      .limit(limit),
  );
}

export async function getThread(
  workspaceId: string,
  threadId: string,
): Promise<schema.AgentThread | null> {
  const db = getAppDb();
  return withWorkspace(db, workspaceId, async (tx) => {
    const rows = await tx
      .select()
      .from(schema.agentThreads)
      .where(
        and(
          eq(schema.agentThreads.id, threadId),
          eq(schema.agentThreads.workspaceId, workspaceId),
        ),
      )
      .limit(1);
    return rows[0] ?? null;
  });
}

export async function listMessages(
  workspaceId: string,
  threadId: string,
): Promise<schema.AgentMessage[]> {
  const db = getAppDb();
  return withWorkspace(db, workspaceId, async (tx) =>
    tx
      .select()
      .from(schema.agentMessages)
      .where(
        and(
          eq(schema.agentMessages.threadId, threadId),
          eq(schema.agentMessages.workspaceId, workspaceId),
        ),
      )
      .orderBy(asc(schema.agentMessages.createdAt)),
  );
}

export async function createThread(args: {
  workspaceId: string;
  userId: string;
  assistantId: string;
  initialTitle?: string;
}): Promise<schema.AgentThread> {
  const db = getAppDb();
  return withWorkspace(db, args.workspaceId, async (tx) => {
    const inserted = await tx
      .insert(schema.agentThreads)
      .values({
        workspaceId: args.workspaceId,
        userId: args.userId,
        assistantId: args.assistantId,
        title: args.initialTitle ?? "New conversation",
      })
      .returning();
    return inserted[0]!;
  });
}

/**
 * Append one user message, call Claude to get an assistant reply,
 * persist it, return both messages. Single-shot — no streaming, no
 * tool-use, no thread title auto-derivation.
 *
 * History is replayed from the truth table on every call so the
 * client doesn't need to round-trip the conversation. That makes the
 * server stateless from the caller's perspective and means switching
 * devices mid-thread "just works".
 */
export async function postUserMessageAndReply(args: {
  workspaceId: string;
  userId: string;
  threadId: string;
  text: string;
}): Promise<{
  userMessage: schema.AgentMessage;
  assistantMessage: schema.AgentMessage;
}> {
  const db = getAppDb();
  const text = args.text.trim();
  if (!text) throw new Error("empty_message");

  // 1. Persist the user turn first so the conversation is intact even
  //    if Claude errors.
  const userMessage = await withWorkspace(db, args.workspaceId, async (tx) => {
    const inserted = await tx
      .insert(schema.agentMessages)
      .values({
        workspaceId: args.workspaceId,
        threadId: args.threadId,
        role: "user",
        text,
      })
      .returning();
    await tx
      .update(schema.agentThreads)
      .set({
        messageCount: sql`${schema.agentThreads.messageCount} + 1`,
        lastMessageAt: new Date(),
      })
      .where(eq(schema.agentThreads.id, args.threadId));
    return inserted[0]!;
  });

  // 2. Replay history (truth table) + assistant system prompt.
  const thread = await getThread(args.workspaceId, args.threadId);
  if (!thread) throw new Error("thread_not_found");
  const assistant = await withWorkspace(db, args.workspaceId, async (tx) => {
    const rows = await tx
      .select()
      .from(schema.agentAssistants)
      .where(eq(schema.agentAssistants.id, thread.assistantId))
      .limit(1);
    return rows[0] ?? null;
  });
  if (!assistant) throw new Error("assistant_not_found");
  const allMessages = await listMessages(args.workspaceId, args.threadId);

  // 3. Compose the AiRequest. System message goes first; subsequent
  //    rows skip 'tool' / 'system' roles since the bare AiProvider
  //    interface is text-only (tool turns become slice 4).
  const messages: AiMessage[] = [
    { role: "system", content: assistant.systemPrompt },
    ...allMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .filter((m): m is schema.AgentMessage & { text: string } => !!m.text)
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.text })),
  ];

  const client = chatClient();
  const response = await client.complete({
    workspaceId: args.workspaceId,
    userId: args.userId,
    promptId: assistant.slug,
    promptVersion: "phase-9a-slice-3",
    modelId: assistant.model ?? "",
    messages,
    maxTokens: 2048,
  });

  // 4. Persist the assistant turn + bump thread denormalised counters.
  const assistantMessage = await withWorkspace(db, args.workspaceId, async (tx) => {
    const inserted = await tx
      .insert(schema.agentMessages)
      .values({
        workspaceId: args.workspaceId,
        threadId: args.threadId,
        role: "assistant",
        text: response.text,
        model: response.modelId,
        inputTokens: response.tokensIn,
        outputTokens: response.tokensOut,
        stopReason: "end_turn",
      })
      .returning();
    await tx
      .update(schema.agentThreads)
      .set({
        messageCount: sql`${schema.agentThreads.messageCount} + 1`,
        lastMessageAt: new Date(),
        // Auto-title from the first user message after the first
        // exchange.
        ...(thread.title === "New conversation"
          ? { title: text.slice(0, 80) }
          : {}),
      })
      .where(eq(schema.agentThreads.id, args.threadId));
    return inserted[0]!;
  });

  return { userMessage, assistantMessage };
}
