import { jsonb, pgTable, uuid, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";
import { users } from "./users";

/**
 * An AI assistant configured for a workspace. Carries the system prompt,
 * model selection, and any workspace-specific grounding (spec library
 * refs, playbook doc refs, terminology). The Phase 9A baseline ships
 * with one global "Stats Co-pilot" assistant per workspace; Phase 9B
 * (Enterprise moat) layers org-specific customisation on top of this
 * same row by populating the `config` jsonb (spec library, playbook
 * doc references, organisation terminology).
 *
 * Threads (`agent_threads`) belong to an assistant — switching
 * assistants starts a new thread; we don't replay history across
 * different system prompts.
 *
 * RLS: workspace-scoped via `current_setting('app.current_workspace', true)`.
 * Access only through `withWorkspace()` from `@sigmafy/db`.
 */
export const agentAssistants = pgTable(
  "agent_assistants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    // Short stable identifier within the workspace. Used in URLs:
    // /assistants/{slug}. Unique per workspace, enforced by index below.
    slug: text("slug").notNull(),
    // Human-readable name shown in lists + thread headers.
    name: text("name").notNull(),
    description: text("description"),
    // System prompt that frames the assistant. The Phase 9A baseline
    // pre-populates "stats-copilot" with the curated Sigmafy prompt; 9B
    // lets workspace owners override.
    systemPrompt: text("system_prompt").notNull(),
    // Anthropic model id (claude-opus-4-7, claude-sonnet-4-5, etc.).
    // Null = falls back to packages/ai default.
    model: text("model"),
    // Free-form workspace-specific config: spec library refs, playbook
    // document ids, custom terminology. Read by the chat handler when
    // composing the per-message system prompt addendum. Empty {} by
    // default.
    config: jsonb("config").notNull().default({}),
    isActive: boolean("is_active").notNull().default(true),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    workspaceSlugUnique: index("agent_assistants_workspace_slug_unique").on(
      t.workspaceId,
      t.slug,
    ),
    workspaceActiveIdx: index("agent_assistants_workspace_active_idx").on(
      t.workspaceId,
      t.isActive,
    ),
  }),
);

export type AgentAssistant = typeof agentAssistants.$inferSelect;
export type NewAgentAssistant = typeof agentAssistants.$inferInsert;
