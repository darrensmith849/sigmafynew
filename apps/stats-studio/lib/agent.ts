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
import OpenAI from "openai";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { withWorkspace, schema } from "@sigmafy/db";
import {
  createStatsGateway,
  StatsGatewayError,
  createDbStatsLogger,
  createDbQuotaChecker,
} from "@sigmafy/stats-gateway";
import {
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

/** Pick which provider drives the chat path. Honours an explicit
 *  AI_PROVIDER override; otherwise prefers Anthropic when its key is set,
 *  else OpenAI. Slice 4.5 added OpenAI support so 4o-mini / gpt-4o can
 *  drive the agentic loop too. */
type AgentProvider = "anthropic" | "openai";

function resolveAgentProvider(): AgentProvider {
  const explicit = process.env.AI_PROVIDER;
  if (explicit === "openai" || explicit === "anthropic") return explicit;
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  return "anthropic"; // will throw a clear "key missing" below
}

/** OpenAI model used when the assistant config doesn't specify one. */
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

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

// ---------------------------------------------------------------------------
// OpenAI ↔ Anthropic translation
// ---------------------------------------------------------------------------

/**
 * Storage convention: `agent_messages.contentBlocks` always holds the
 * Anthropic-shaped block array. OpenAI responses are translated to
 * Anthropic shape at write time; OpenAI replays translate back from
 * Anthropic shape at read time. Keeps the database provider-agnostic.
 */

/** Convert AGENT_TOOLS (Anthropic shape) to OpenAI's function-tool shape. */
function openAiTools(): OpenAI.Chat.Completions.ChatCompletionTool[] {
  return AGENT_TOOLS.map((t) => ({
    type: "function" as const,
    function: {
      name: t.name,
      description: t.description ?? "",
      parameters: t.input_schema as Record<string, unknown>,
    },
  }));
}

/**
 * Replay persisted Anthropic-shaped agent_messages into OpenAI Chat
 * Completions `messages[]`. Tool_use blocks become tool_calls on the
 * assistant message; tool_result blocks become one `role:"tool"` message
 * per block keyed on `tool_call_id`.
 */
function buildOpenAiMessages(
  rows: schema.AgentMessage[],
  systemPrompt: string,
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  const out: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
  ];
  for (const m of rows) {
    if (m.role === "user") {
      out.push({ role: "user", content: m.text ?? "" });
      continue;
    }
    if (m.role === "assistant") {
      const blocks = (m.contentBlocks as AnthropicContentBlock[] | null) ?? null;
      if (!blocks) {
        // Text-only assistant turn.
        out.push({ role: "assistant", content: m.text ?? "" });
        continue;
      }
      const textParts = blocks
        .filter((b): b is AnthropicTextBlock => b.type === "text")
        .map((b) => b.text);
      const toolUses = blocks.filter(
        (b): b is AnthropicToolUseBlock => b.type === "tool_use",
      );
      if (toolUses.length === 0) {
        out.push({ role: "assistant", content: textParts.join("\n\n") });
      } else {
        out.push({
          role: "assistant",
          content: textParts.length ? textParts.join("\n\n") : "",
          tool_calls: toolUses.map((tu) => ({
            id: tu.id,
            type: "function" as const,
            function: {
              name: tu.name,
              arguments: JSON.stringify(tu.input ?? {}),
            },
          })),
        });
      }
      continue;
    }
    if (m.role === "tool") {
      const blocks =
        (m.contentBlocks as Anthropic.ToolResultBlockParam[] | null) ?? null;
      if (!blocks) continue;
      for (const b of blocks) {
        const content =
          typeof b.content === "string"
            ? b.content
            : JSON.stringify(b.content ?? "");
        out.push({
          role: "tool",
          tool_call_id: b.tool_use_id,
          content,
        });
      }
    }
  }
  return out;
}

/**
 * Translate an OpenAI assistant response into Anthropic-shape content
 * blocks for storage. Text content → `text` block; each tool_call →
 * `tool_use` block.
 */
function openAiResponseToBlocks(
  msg: OpenAI.Chat.Completions.ChatCompletionMessage,
): AnthropicContentBlock[] {
  const blocks: AnthropicContentBlock[] = [];
  if (msg.content) {
    blocks.push({
      type: "text",
      text: msg.content,
      citations: null,
    } as unknown as AnthropicContentBlock);
  }
  for (const tc of msg.tool_calls ?? []) {
    if (tc.type !== "function") continue;
    let input: unknown = {};
    try {
      input = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
    } catch {
      // Keep the raw string so it shows up in the receipt even if the
      // model produced malformed JSON.
      input = { _raw_arguments: tc.function.arguments };
    }
    blocks.push({
      type: "tool_use",
      id: tc.id,
      name: tc.function.name,
      input,
    } as unknown as AnthropicContentBlock);
  }
  return blocks;
}

// ---------------------------------------------------------------------------
// Provider-specific agentic loops
// ---------------------------------------------------------------------------

/** Shared shape returned by both provider loops. */
type LoopArgs = {
  workspaceId: string;
  userId: string;
  threadId: string;
  thread: schema.AgentThread;
  assistant: schema.AgentAssistant;
  firstUserText: string;
};

async function runAnthropicLoop(args: LoopArgs): Promise<schema.AgentMessage[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");
  const anthropic = new Anthropic({ apiKey });
  const modelId =
    args.assistant.model ||
    process.env.ANTHROPIC_DEFAULT_MODEL_ID ||
    DEFAULT_ANTHROPIC_MODEL;
  const db = getAppDb();
  const persistedTurns: schema.AgentMessage[] = [];

  for (let iter = 0; iter < MAX_AGENTIC_ITERATIONS; iter++) {
    const history = await listMessages(args.workspaceId, args.threadId);
    const messages = buildAnthropicMessages(history);

    const response = await anthropic.messages.create({
      model: modelId,
      system: args.assistant.systemPrompt,
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
      persistedTurns.push(
        await persistFinalAssistantTurn(args, {
          text: narration || null,
          contentBlocks: response.content,
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          model: response.model,
          stopReason: response.stop_reason ?? "end_turn",
        }),
      );
      break;
    }

    const toolResults = await executeToolUseBlocks(args, toolUseBlocks);

    persistedTurns.push(
      await persistToolUseAssistantTurn(args, {
        text: narration || null,
        contentBlocks: response.content,
        toolRunIds: toolResults
          .map((tr) => tr.outcome.runId)
          .filter((id): id is string => !!id),
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        model: response.model,
        stopReason: response.stop_reason ?? "tool_use",
      }),
    );

    const toolResultBlocks: Anthropic.ToolResultBlockParam[] = toolResults.map(
      ({ block, outcome }) => ({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(outcome.resultForModel),
        is_error: outcome.status === "failed",
      }),
    );

    persistedTurns.push(
      await persistToolResultTurn(args, toolResultBlocks, toolResults),
    );

    if (response.stop_reason !== "tool_use") break;
  }

  return persistedTurns;
}

async function runOpenAiLoop(args: LoopArgs): Promise<schema.AgentMessage[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY missing");
  const client = new OpenAI({ apiKey });
  const modelId =
    args.assistant.model ||
    process.env.OPENAI_DEFAULT_MODEL_ID ||
    process.env.AI_DEFAULT_MODEL_ID ||
    DEFAULT_OPENAI_MODEL;
  const db = getAppDb();
  const persistedTurns: schema.AgentMessage[] = [];

  const tools = openAiTools();

  for (let iter = 0; iter < MAX_AGENTIC_ITERATIONS; iter++) {
    const history = await listMessages(args.workspaceId, args.threadId);
    const messages = buildOpenAiMessages(history, args.assistant.systemPrompt);

    const completion = await client.chat.completions.create({
      model: modelId,
      messages,
      tools,
      max_tokens: 4096,
    });

    const choice = completion.choices[0];
    if (!choice) {
      throw new Error("openai_returned_no_choices");
    }
    const msg = choice.message;
    const toolCalls = (msg.tool_calls ?? []).filter(
      (t): t is OpenAI.Chat.Completions.ChatCompletionMessageToolCall =>
        t.type === "function",
    );
    const narration = msg.content ?? "";
    const contentBlocks = openAiResponseToBlocks(msg);

    if (toolCalls.length === 0) {
      persistedTurns.push(
        await persistFinalAssistantTurn(args, {
          text: narration || null,
          contentBlocks,
          inputTokens: completion.usage?.prompt_tokens ?? null,
          outputTokens: completion.usage?.completion_tokens ?? null,
          model: completion.model,
          stopReason: choice.finish_reason ?? "end_turn",
        }),
      );
      break;
    }

    // Translate OpenAI tool_calls into Anthropic ToolUseBlock-shape for
    // executeToolUseBlocks(), which only cares about { id, name, input }.
    const pseudoBlocks: AnthropicToolUseBlock[] = toolCalls.map((tc) => {
      let input: unknown = {};
      try {
        input = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
      } catch {
        input = { _raw_arguments: tc.function.arguments };
      }
      return {
        type: "tool_use",
        id: tc.id,
        name: tc.function.name,
        input,
      } as AnthropicToolUseBlock;
    });

    const toolResults = await executeToolUseBlocks(args, pseudoBlocks);

    persistedTurns.push(
      await persistToolUseAssistantTurn(args, {
        text: narration || null,
        contentBlocks,
        toolRunIds: toolResults
          .map((tr) => tr.outcome.runId)
          .filter((id): id is string => !!id),
        inputTokens: completion.usage?.prompt_tokens ?? null,
        outputTokens: completion.usage?.completion_tokens ?? null,
        model: completion.model,
        stopReason: choice.finish_reason ?? "tool_calls",
      }),
    );

    const toolResultBlocks: Anthropic.ToolResultBlockParam[] = toolResults.map(
      ({ block, outcome }) => ({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(outcome.resultForModel),
        is_error: outcome.status === "failed",
      }),
    );

    persistedTurns.push(
      await persistToolResultTurn(args, toolResultBlocks, toolResults),
    );

    if (
      choice.finish_reason !== "tool_calls" &&
      choice.finish_reason !== null
    ) {
      break;
    }
  }

  // Silence unused-var warning when only one provider is active in a build.
  void db;
  return persistedTurns;
}

// ---------------------------------------------------------------------------
// Shared persistence + tool-execution helpers
// ---------------------------------------------------------------------------

async function executeToolUseBlocks(
  args: LoopArgs,
  toolUseBlocks: AnthropicToolUseBlock[],
): Promise<
  Array<{
    block: AnthropicToolUseBlock;
    outcome: Awaited<ReturnType<typeof executeAgentToolCall>>;
  }>
> {
  return Promise.all(
    toolUseBlocks.map(async (block) => {
      const def = AGENT_TOOLS_BY_NAME[block.name];
      if (!def) {
        return {
          block,
          outcome: {
            runId: null,
            status: "failed" as const,
            resultForModel: { error: "unknown_tool", tool: block.name },
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
}

async function persistFinalAssistantTurn(
  args: LoopArgs,
  v: {
    text: string | null;
    contentBlocks: unknown;
    inputTokens: number | null;
    outputTokens: number | null;
    model: string;
    stopReason: string;
  },
): Promise<schema.AgentMessage> {
  const db = getAppDb();
  return withWorkspace(db, args.workspaceId, async (tx) => {
    const inserted = await tx
      .insert(schema.agentMessages)
      .values({
        workspaceId: args.workspaceId,
        threadId: args.threadId,
        role: "assistant",
        text: v.text,
        contentBlocks: v.contentBlocks as Record<string, unknown>[],
        toolRunIds: [],
        inputTokens: v.inputTokens,
        outputTokens: v.outputTokens,
        model: v.model,
        stopReason: v.stopReason,
      })
      .returning();
    await tx
      .update(schema.agentThreads)
      .set({
        messageCount: sql`${schema.agentThreads.messageCount} + 1`,
        lastMessageAt: new Date(),
        ...(args.thread.title === "New conversation"
          ? { title: args.firstUserText.slice(0, 80) }
          : {}),
      })
      .where(eq(schema.agentThreads.id, args.threadId));
    return inserted[0]!;
  });
}

async function persistToolUseAssistantTurn(
  args: LoopArgs,
  v: {
    text: string | null;
    contentBlocks: unknown;
    toolRunIds: string[];
    inputTokens: number | null;
    outputTokens: number | null;
    model: string;
    stopReason: string;
  },
): Promise<schema.AgentMessage> {
  const db = getAppDb();
  return withWorkspace(db, args.workspaceId, async (tx) => {
    const inserted = await tx
      .insert(schema.agentMessages)
      .values({
        workspaceId: args.workspaceId,
        threadId: args.threadId,
        role: "assistant",
        text: v.text,
        contentBlocks: v.contentBlocks as Record<string, unknown>[],
        toolRunIds: v.toolRunIds,
        inputTokens: v.inputTokens,
        outputTokens: v.outputTokens,
        model: v.model,
        stopReason: v.stopReason,
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
}

async function persistToolResultTurn(
  args: LoopArgs,
  blocks: Anthropic.ToolResultBlockParam[],
  toolResults: Awaited<ReturnType<typeof executeToolUseBlocks>>,
): Promise<schema.AgentMessage> {
  const db = getAppDb();
  return withWorkspace(db, args.workspaceId, async (tx) => {
    const inserted = await tx
      .insert(schema.agentMessages)
      .values({
        workspaceId: args.workspaceId,
        threadId: args.threadId,
        role: "tool",
        text: null,
        contentBlocks: blocks as unknown as Record<string, unknown>[],
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
  });
}

// ---------------------------------------------------------------------------
// Top-level entry point
// ---------------------------------------------------------------------------

/**
 * Append one user message, then run the agentic loop:
 *   1. Persist user turn.
 *   2. Resolve provider (Anthropic or OpenAI) from env.
 *   3. Loop with the curated tool set; each tool_use/tool_call runs
 *      through stats-gateway and writes a stats_tool_runs row.
 *   4. Final assistant text is the answer to the user.
 *
 * Returns the new messages created in this turn (1 user + N assistant/
 * tool turns).
 */
export async function postUserMessageAndReply(args: {
  workspaceId: string;
  userId: string;
  threadId: string;
  text: string;
}): Promise<{
  userMessage: schema.AgentMessage;
  responseMessages: schema.AgentMessage[];
}> {
  const db = getAppDb();
  const text = args.text.trim();
  if (!text) throw new Error("empty_message");

  const provider = resolveAgentProvider();
  if (provider === "anthropic" && !process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY missing");
  }
  if (provider === "openai" && !process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY missing");
  }

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

  // 2. Load thread + assistant.
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

  const loopArgs: LoopArgs = {
    workspaceId: args.workspaceId,
    userId: args.userId,
    threadId: args.threadId,
    thread,
    assistant,
    firstUserText: text,
  };

  // 3. Dispatch to provider-specific loop.
  let persistedTurns: schema.AgentMessage[] = [];
  if (provider === "openai") {
    persistedTurns = await runOpenAiLoop(loopArgs);
  } else {
    persistedTurns = await runAnthropicLoop(loopArgs);
  }

  if (persistedTurns.length === 0) {
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
