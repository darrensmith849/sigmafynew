/**
 * Server-side helpers for the AI Agent Platform (Phase 9A).
 *
 * Reads + writes the agent_assistants / agent_threads / agent_messages
 * tables behind workspace RLS. Composes the Claude conversation from
 * the persisted history before each turn so the user can pick up an
 * old thread on a different device.
 *
 * Slice 4 turns this agentic: Claude can call any tool defined in
 * agent-tools.ts. Each call goes through @sigmafy/stats-gateway, gets
 * persisted as a `stats_tool_runs` row, and is linked back from
 * `agent_messages.tool_run_ids` for audit-defensible receipts.
 */
import Anthropic from "@anthropic-ai/sdk";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { withWorkspace, schema } from "@sigmafy/db";
import {
  createStatsGateway,
  StatsGatewayError,
  createDbStatsLogger,
  createDbQuotaChecker,
} from "@sigmafy/stats-gateway";
import {
  createAiClient,
  type AiMessage,
  type AiResponse,
} from "@sigmafy/ai";
import { getAppDb } from "./db";
import { AGENT_TOOLS, AGENT_TOOLS_BY_NAME } from "./agent-tools";

export type { AiResponse };

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Hard cap on agentic-loop iterations per user turn. Each iteration is one
 *  Claude round trip. 5 is enough for "pick a test → run it → interpret →
 *  maybe correct course → final answer". */
const MAX_AGENTIC_ITERATIONS = 5;

/** Anthropic model used when the assistant config doesn't specify one. */
const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-5";

/** Soft cap on serialised tool-result size fed back to the model. Beyond
 *  this we truncate the JSON to keep the prompt within reasonable token
 *  budgets — the full result is still persisted in stats_tool_runs. */
const MAX_TOOL_RESULT_BYTES_FOR_MODEL = 8000;

const STATS_API_BASE_URL =
  process.env.STATS_API_BASE_URL ?? "https://sigmafy-tools.fly.dev";

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

// ---------------------------------------------------------------------------
// Agentic-loop helpers
// ---------------------------------------------------------------------------

type AnthropicMessageParam = Anthropic.MessageParam;
type AnthropicToolUseBlock = Anthropic.ToolUseBlock;
type AnthropicTextBlock = Anthropic.TextBlock;
type AnthropicContentBlock = Anthropic.ContentBlock;

/**
 * Replay persisted agent_messages into the Anthropic Messages-API
 * `messages[]` array. Each persisted row is one turn:
 *   - role='user'      → { role: 'user', content: text }
 *   - role='assistant' → { role: 'assistant', content: blocks ?? text }
 *   - role='tool'      → { role: 'user', content: blocks } (Anthropic
 *                        encodes tool_result turns under role='user')
 *   - role='system'    → injected as the top-level `system` param, not
 *                        in messages[].
 */
function buildAnthropicMessages(
  rows: schema.AgentMessage[],
): AnthropicMessageParam[] {
  const out: AnthropicMessageParam[] = [];
  for (const m of rows) {
    if (m.role === "user") {
      out.push({ role: "user", content: m.text ?? "" });
    } else if (m.role === "assistant") {
      const blocks = (m.contentBlocks as AnthropicContentBlock[] | null) ?? null;
      out.push({
        role: "assistant",
        content: blocks ?? (m.text ?? ""),
      });
    } else if (m.role === "tool") {
      const blocks = (m.contentBlocks as Anthropic.ToolResultBlockParam[] | null) ?? null;
      if (blocks && blocks.length > 0) {
        out.push({ role: "user", content: blocks });
      }
    }
    // role === 'system' is intentionally skipped — those go to the
    // top-level system param, not the messages array.
  }
  return out;
}

/**
 * Run one stats-engine call as part of an agentic turn. Persists a
 * stats_tool_runs row (success or failure), returns the runId + the
 * payload we'll feed back to Claude. Mirrors the catalogue runner's
 * persistence shape so /runs/[id] keeps working unchanged.
 */
async function executeAgentToolCall(args: {
  workspaceId: string;
  userId: string;
  toolSlug: string;
  toolCategory: string;
  toolName: string;
  input: unknown;
}): Promise<{
  runId: string | null;
  status: "completed" | "failed";
  resultForModel: unknown;
  requestId: string | null;
}> {
  const db = getAppDb();
  const gateway = createStatsGateway({
    baseUrl: STATS_API_BASE_URL,
    auth: { workspaceId: args.workspaceId, userId: args.userId },
    logger: createDbStatsLogger(db),
    quotaChecker: createDbQuotaChecker(db),
    signingSecret: process.env.STATS_API_SIGNING_SECRET,
  });

  try {
    const { result, requestId } = await gateway.run(args.toolSlug, args.input);

    // Persist the full result. The catalogue runner's 256KB truncation
    // logic isn't applied here — agent payloads tend to be smaller,
    // and we want the full result available for replay.
    const runId = await withWorkspace(db, args.workspaceId, async (tx) => {
      const inserted = await tx
        .insert(schema.statsToolRuns)
        .values({
          workspaceId: args.workspaceId,
          userId: args.userId,
          toolSlug: args.toolSlug,
          toolCategory: args.toolCategory,
          inputJson: args.input as Record<string, unknown>,
          outputJson: result as Record<string, unknown>,
          status: "completed",
          requestId,
        })
        .returning({ id: schema.statsToolRuns.id });
      return inserted[0]!.id;
    });

    return {
      runId,
      status: "completed",
      resultForModel: shrinkForModel(result),
      requestId,
    };
  } catch (exc) {
    const isGatewayErr = exc instanceof StatsGatewayError;
    const code = isGatewayErr ? exc.code : "unknown_error";
    const message = exc instanceof Error ? exc.message : String(exc);
    const requestId = isGatewayErr ? exc.requestId : null;

    let runId: string | null = null;
    try {
      runId = await withWorkspace(db, args.workspaceId, async (tx) => {
        const inserted = await tx
          .insert(schema.statsToolRuns)
          .values({
            workspaceId: args.workspaceId,
            userId: args.userId,
            toolSlug: args.toolSlug,
            toolCategory: args.toolCategory,
            inputJson: args.input as Record<string, unknown>,
            outputJson: null,
            status: "failed",
            errorCode: code,
            errorMessage: message,
            requestId,
          })
          .returning({ id: schema.statsToolRuns.id });
        return inserted[0]!.id;
      });
    } catch {
      // best-effort
    }

    return {
      runId,
      status: "failed",
      resultForModel: {
        error: code,
        message,
        tool: args.toolName,
      },
      requestId,
    };
  }
}

/** Trim huge results before feeding them back to the model. */
function shrinkForModel(result: unknown): unknown {
  try {
    const serialised = JSON.stringify(result);
    if (serialised.length <= MAX_TOOL_RESULT_BYTES_FOR_MODEL) return result;
    // Heuristic: strip the heaviest field if it's an array.
    if (result && typeof result === "object" && !Array.isArray(result)) {
      const obj = result as Record<string, unknown>;
      const arrayKeys = Object.entries(obj)
        .filter(([, v]) => Array.isArray(v) && (v as unknown[]).length > 100)
        .sort(
          (a, b) =>
            (b[1] as unknown[]).length - (a[1] as unknown[]).length,
        );
      const stripped = { ...obj };
      for (const [k, v] of arrayKeys) {
        stripped[k] = `[truncated — ${(v as unknown[]).length} items]`;
      }
      const reSer = JSON.stringify(stripped);
      if (reSer.length <= MAX_TOOL_RESULT_BYTES_FOR_MODEL) return stripped;
    }
    return {
      truncated: true,
      preview: serialised.slice(0, MAX_TOOL_RESULT_BYTES_FOR_MODEL),
    };
  } catch {
    return { error: "result_not_json_serialisable" };
  }
}

/**
 * Append one user message, then run the Claude agentic loop:
 *   1. Persist user turn.
 *   2. Replay history + system prompt.
 *   3. Call Claude with the curated tool set.
 *   4. If Claude returns tool_use, run each call through stats-gateway,
 *      persist as stats_tool_runs rows, feed tool_result blocks back.
 *   5. Repeat up to MAX_AGENTIC_ITERATIONS; final assistant text is the
 *      answer to the user.
 *
 * Returns the new messages created in this turn (1 user + N assistant/
 * tool turns) so the API route can return them to the client.
 */
export async function postUserMessageAndReply(args: {
  workspaceId: string;
  userId: string;
  threadId: string;
  text: string;
}): Promise<{
  userMessage: schema.AgentMessage;
  /** All non-user turns generated by this round: assistant + tool. */
  responseMessages: schema.AgentMessage[];
}> {
  const db = getAppDb();
  const text = args.text.trim();
  if (!text) throw new Error("empty_message");

  // Anthropic-only for the agentic path: tool_use is the whole point.
  // If ANTHROPIC_API_KEY isn't set, fail loud so the operator wires it up.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");

  // 1. Persist user turn.
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

  // 2. Load thread + assistant + full history.
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

  const anthropic = new Anthropic({ apiKey });
  const modelId =
    assistant.model || process.env.ANTHROPIC_DEFAULT_MODEL_ID || DEFAULT_ANTHROPIC_MODEL;

  const persistedTurns: schema.AgentMessage[] = [];

  // 3. Agentic loop.
  for (let iter = 0; iter < MAX_AGENTIC_ITERATIONS; iter++) {
    // Re-read history every iteration so newly-persisted turns are
    // included in the next round trip.
    const history = await listMessages(args.workspaceId, args.threadId);
    const messages = buildAnthropicMessages(history);

    const response = await anthropic.messages.create({
      model: modelId,
      system: assistant.systemPrompt,
      messages,
      tools: AGENT_TOOLS.map(({ slug: _s, category: _c, ...rest }) => rest),
      max_tokens: 4096,
    });

    const toolUseBlocks = response.content.filter(
      (b): b is AnthropicToolUseBlock => b.type === "tool_use",
    );
    const textBlocks = response.content.filter(
      (b): b is AnthropicTextBlock => b.type === "text",
    );
    const narration = textBlocks.map((b) => b.text).join("\n\n");

    if (toolUseBlocks.length === 0) {
      // Final answer — persist and exit.
      const assistantMsg = await withWorkspace(
        db,
        args.workspaceId,
        async (tx) => {
          const inserted = await tx
            .insert(schema.agentMessages)
            .values({
              workspaceId: args.workspaceId,
              threadId: args.threadId,
              role: "assistant",
              text: narration || null,
              contentBlocks: response.content as unknown as Record<string, unknown>[],
              toolRunIds: [],
              inputTokens: response.usage.input_tokens,
              outputTokens: response.usage.output_tokens,
              model: response.model,
              stopReason: response.stop_reason ?? "end_turn",
            })
            .returning();
          await tx
            .update(schema.agentThreads)
            .set({
              messageCount: sql`${schema.agentThreads.messageCount} + 1`,
              lastMessageAt: new Date(),
              ...(thread.title === "New conversation"
                ? { title: text.slice(0, 80) }
                : {}),
            })
            .where(eq(schema.agentThreads.id, args.threadId));
          return inserted[0]!;
        },
      );
      persistedTurns.push(assistantMsg);
      break;
    }

    // 4a. Persist the assistant turn carrying tool_use blocks.
    const toolRunMap = new Map<string, string | null>(); // tool_use_id → runId
    for (const block of toolUseBlocks) {
      toolRunMap.set(block.id, null);
    }

    // Execute the tool calls (in parallel for speed) before we persist
    // — we want the assistant turn to already know its tool_run_ids
    // when written.
    const toolResults = await Promise.all(
      toolUseBlocks.map(async (block) => {
        const def = AGENT_TOOLS_BY_NAME[block.name];
        if (!def) {
          return {
            block,
            outcome: {
              runId: null,
              status: "failed" as const,
              resultForModel: {
                error: "unknown_tool",
                tool: block.name,
              },
              requestId: null,
            },
          };
        }
        const outcome = await executeAgentToolCall({
          workspaceId: args.workspaceId,
          userId: args.userId,
          toolSlug: def.slug,
          toolCategory: def.category,
          toolName: def.name,
          input: block.input,
        });
        return { block, outcome };
      }),
    );

    for (const { block, outcome } of toolResults) {
      toolRunMap.set(block.id, outcome.runId);
    }

    const assistantToolUseTurn = await withWorkspace(
      db,
      args.workspaceId,
      async (tx) => {
        const inserted = await tx
          .insert(schema.agentMessages)
          .values({
            workspaceId: args.workspaceId,
            threadId: args.threadId,
            role: "assistant",
            text: narration || null,
            contentBlocks: response.content as unknown as Record<string, unknown>[],
            toolRunIds: toolResults
              .map((tr) => tr.outcome.runId)
              .filter((id): id is string => !!id),
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens,
            model: response.model,
            stopReason: response.stop_reason ?? "tool_use",
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
      },
    );
    persistedTurns.push(assistantToolUseTurn);

    // 4b. Persist the bundled tool_result turn (role='tool' for us; on
    //     the wire to Anthropic it goes as role='user' with
    //     tool_result blocks — buildAnthropicMessages handles that).
    const toolResultBlocks: Anthropic.ToolResultBlockParam[] = toolResults.map(
      ({ block, outcome }) => ({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(outcome.resultForModel),
        is_error: outcome.status === "failed",
      }),
    );

    const toolResultTurn = await withWorkspace(
      db,
      args.workspaceId,
      async (tx) => {
        const inserted = await tx
          .insert(schema.agentMessages)
          .values({
            workspaceId: args.workspaceId,
            threadId: args.threadId,
            role: "tool",
            text: null,
            contentBlocks: toolResultBlocks as unknown as Record<string, unknown>[],
            toolRunIds: toolResults
              .map((tr) => tr.outcome.runId)
              .filter((id): id is string => !!id),
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
      },
    );
    persistedTurns.push(toolResultTurn);

    if (response.stop_reason !== "tool_use") {
      // Defensive — Anthropic always returns 'tool_use' when there are
      // tool_use blocks, but just in case the model bails early.
      break;
    }
    // Loop to next iteration so Claude can interpret the tool results.
  }

  if (persistedTurns.length === 0) {
    // Hit the iteration cap without a final answer. Surface a
    // graceful "I'm working on it" message so the UI has something
    // to render.
    const fallback = await withWorkspace(db, args.workspaceId, async (tx) => {
      const inserted = await tx
        .insert(schema.agentMessages)
        .values({
          workspaceId: args.workspaceId,
          threadId: args.threadId,
          role: "assistant",
          text:
            "I made several tool calls but didn't reach a final answer within the iteration limit. Try a more specific question, or ask me to summarise what I've learned so far.",
          stopReason: "max_iterations",
        })
        .returning();
      return inserted[0]!;
    });
    persistedTurns.push(fallback);
  }

  return { userMessage, responseMessages: persistedTurns };
}
