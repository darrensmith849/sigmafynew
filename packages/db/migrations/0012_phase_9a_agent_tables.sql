-- Phase 9A — agent_assistants + agent_threads + agent_messages tables.
--
-- Foundation for the AI Agent Platform: workspace-scoped assistant
-- configs, conversations, and message-level audit receipts linking
-- back to stats_tool_runs rows.
--
-- Run AFTER 0011_phase_7_workspace_quota_tier.sql. Idempotent.
--
-- ADR 0011 — AI Agent Platform (Phase 9A).

-- ============================================================================
-- 1. agent_assistants — workspace-scoped assistant configs
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_assistants (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id          uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  slug                  text NOT NULL,
  name                  text NOT NULL,
  description           text,
  system_prompt         text NOT NULL,
  model                 text,
  config                jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active             boolean NOT NULL DEFAULT true,
  created_by_user_id    uuid NOT NULL REFERENCES users(id),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- Workspace + slug uniqueness — URLs use /assistants/{slug}.
CREATE UNIQUE INDEX IF NOT EXISTS agent_assistants_workspace_slug_unique
  ON agent_assistants (workspace_id, slug);

CREATE INDEX IF NOT EXISTS agent_assistants_workspace_active_idx
  ON agent_assistants (workspace_id, is_active);

ALTER TABLE agent_assistants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_assistants_workspace_isolation ON agent_assistants;
CREATE POLICY agent_assistants_workspace_isolation ON agent_assistants
  USING (workspace_id::text = current_setting('app.current_workspace', true))
  WITH CHECK (workspace_id::text = current_setting('app.current_workspace', true));

GRANT SELECT, INSERT, UPDATE, DELETE ON agent_assistants TO app_user;


-- ============================================================================
-- 2. agent_threads — one row per conversation
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_threads (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id          uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id               uuid NOT NULL REFERENCES users(id),
  assistant_id          uuid NOT NULL REFERENCES agent_assistants(id) ON DELETE CASCADE,
  title                 text NOT NULL DEFAULT 'New conversation',
  message_count         integer NOT NULL DEFAULT 0,
  created_at            timestamptz NOT NULL DEFAULT now(),
  last_message_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agent_threads_workspace_last_msg_idx
  ON agent_threads (workspace_id, last_message_at DESC);

CREATE INDEX IF NOT EXISTS agent_threads_user_last_msg_idx
  ON agent_threads (user_id, last_message_at DESC);

CREATE INDEX IF NOT EXISTS agent_threads_assistant_idx
  ON agent_threads (assistant_id);

ALTER TABLE agent_threads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_threads_workspace_isolation ON agent_threads;
CREATE POLICY agent_threads_workspace_isolation ON agent_threads
  USING (workspace_id::text = current_setting('app.current_workspace', true))
  WITH CHECK (workspace_id::text = current_setting('app.current_workspace', true));

GRANT SELECT, INSERT, UPDATE, DELETE ON agent_threads TO app_user;


-- ============================================================================
-- 3. agent_messages — one row per turn (user / assistant / tool / system)
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_messages (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id          uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  thread_id             uuid NOT NULL REFERENCES agent_threads(id) ON DELETE CASCADE,
  role                  text NOT NULL CHECK (role IN ('user', 'assistant', 'tool', 'system')),
  text                  text,
  content_blocks        jsonb,
  tool_run_ids          jsonb NOT NULL DEFAULT '[]'::jsonb,
  input_tokens          integer,
  output_tokens         integer,
  model                 text,
  stop_reason           text,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agent_messages_thread_created_idx
  ON agent_messages (thread_id, created_at);

CREATE INDEX IF NOT EXISTS agent_messages_workspace_created_idx
  ON agent_messages (workspace_id, created_at DESC);

ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_messages_workspace_isolation ON agent_messages;
CREATE POLICY agent_messages_workspace_isolation ON agent_messages
  USING (workspace_id::text = current_setting('app.current_workspace', true))
  WITH CHECK (workspace_id::text = current_setting('app.current_workspace', true));

GRANT SELECT, INSERT, UPDATE, DELETE ON agent_messages TO app_user;


-- ============================================================================
-- 4. Seed: every existing workspace gets a default "stats-copilot"
--    assistant so existing users land in a working chat on first visit.
--    Idempotent via ON CONFLICT.
-- ============================================================================

INSERT INTO agent_assistants (
  workspace_id, slug, name, description, system_prompt, is_active,
  created_by_user_id
)
SELECT
  w.id,
  'stats-copilot',
  'Stats Co-pilot',
  'Picks the right statistical procedure, runs it against the engine, and explains the result. Audit-defensible — every claim links to the JSON input + output that backs it.',
  $$You are Sigmafy's Stats Co-pilot, an AI-native Six Sigma statistics assistant. Your job is to help the user pick the right statistical procedure for their question, run it against the Sigmafy stats engine, and explain the result clearly.

Rules:

1. ALWAYS run a real procedure against the engine to back up any quantitative claim. Never hallucinate a p-value, Cpk, AD statistic, or confidence interval.
2. When the user describes their situation, infer the right test from assumptions: data type (continuous / counts / categorical), number of groups, distribution shape, paired vs independent, etc.
3. If the data appears non-normal, prefer the non-normal capability path (Box-Cox / Johnson) instead of forcing Cp/Cpk on raw data.
4. After each procedure call, explain the result in plain English. Include the procedure name + key numerical result so the user can verify against their notes.
5. Be honest about uncertainty. If the sample size is too small for a credible conclusion, say so and recommend more data.
6. Speak the language of the practitioner — process engineers, quality engineers, Six Sigma belts — not academic statisticians.$$,
  true,
  -- Pick any owner of the workspace as the createdBy. If there's no
  -- membership row yet, skip (the INSERT … FROM filter excludes those
  -- workspaces and they'll provision an assistant on first /assistants
  -- request via the API instead).
  (SELECT m.user_id FROM memberships m
    WHERE m.workspace_id = w.id AND m.role = 'owner'
    ORDER BY m.created_at LIMIT 1)
FROM workspaces w
WHERE EXISTS (
  SELECT 1 FROM memberships m WHERE m.workspace_id = w.id AND m.role = 'owner'
)
ON CONFLICT (workspace_id, slug) DO NOTHING;
