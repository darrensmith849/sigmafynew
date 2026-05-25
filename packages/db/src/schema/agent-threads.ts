import { pgTable, uuid, text, timestamp, index, integer } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";
import { users } from "./users";
import { agentAssistants } from "./agent-assistants";

/**
 * One conversation thread. Belongs to a single assistant config (so the
 * system prompt + model + config snapshot is stable across the thread's
 * lifetime — switching assistants starts a new thread). The
 * `messages` live in `agent_messages` keyed on `thread_id`.
 *
 * `title` is auto-derived from the first user message after the first
 * exchange (handler updates it; user can override). Threads stay
 * workspace-scoped via RLS so org-1 can't read org-2's conversations
 * even if a Clerk session is hijacked.
 *
 * `message_count` is denormalised for cheap list rendering — the chat
 * handler increments it on each insert. If it drifts, the
 * `repairAgentThreadCounts()` repository helper recomputes from the
 * truth table.
 */
export const agentThreads = pgTable(
  "agent_threads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    assistantId: uuid("assistant_id")
      .notNull()
      .references(() => agentAssistants.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("New conversation"),
    // Denormalised counter; the canonical truth lives in agent_messages.
    messageCount: integer("message_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    // Touched whenever a message is appended, so thread lists can sort
    // by recency without a sub-query over agent_messages.
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    workspaceLastMsgIdx: index("agent_threads_workspace_last_msg_idx").on(
      t.workspaceId,
      t.lastMessageAt,
    ),
    userLastMsgIdx: index("agent_threads_user_last_msg_idx").on(
      t.userId,
      t.lastMessageAt,
    ),
    assistantIdx: index("agent_threads_assistant_idx").on(t.assistantId),
  }),
);

export type AgentThread = typeof agentThreads.$inferSelect;
export type NewAgentThread = typeof agentThreads.$inferInsert;
