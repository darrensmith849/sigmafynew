-- Phase 7 — stats_tool_runs table for the standalone Stats Studio surface.
--
-- Records every Studio invocation of @sigmafy/stats-gateway's generic
-- run() method: tool slug, input JSON, output JSON, error code, request
-- ID, duration. Extends (not duplicates) `stats_call_log` via the
-- stats_call_log_id FK — the audit row stays canonical for workspace/
-- user/endpoint/status/latency; this table adds the actual payloads so
-- users can replay or share a run.
--
-- Run AFTER 0009_phase_1_topic_comments_rls.sql. Idempotent: safe to re-run.
--
-- ADR 0010 — Stats Studio standalone surface.

-- ============================================================================
-- 1. Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS stats_tool_runs (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id         uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id              uuid NOT NULL REFERENCES users(id),
  tool_slug            text NOT NULL,
  tool_category        text,
  input_json           jsonb NOT NULL,
  output_json          jsonb,
  status               text NOT NULL CHECK (status IN ('completed', 'failed')),
  error_code           text,
  error_message        text,
  request_id           text,
  duration_ms          integer,
  stats_call_log_id    uuid REFERENCES stats_call_log(id) ON DELETE SET NULL,
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS stats_tool_runs_workspace_created_idx
  ON stats_tool_runs (workspace_id, created_at DESC);

CREATE INDEX IF NOT EXISTS stats_tool_runs_user_created_idx
  ON stats_tool_runs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS stats_tool_runs_tool_slug_idx
  ON stats_tool_runs (tool_slug);

CREATE INDEX IF NOT EXISTS stats_tool_runs_request_id_idx
  ON stats_tool_runs (request_id);

-- ============================================================================
-- 2. Row Level Security — workspace-scoped (matches existing migrations:
--    ::text cast on column, current_setting('...', true) so missing GUC
--    returns NULL and the policy fails closed).
-- ============================================================================

ALTER TABLE stats_tool_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS stats_tool_runs_workspace_isolation ON stats_tool_runs;
CREATE POLICY stats_tool_runs_workspace_isolation ON stats_tool_runs
  USING (workspace_id::text = current_setting('app.current_workspace', true))
  WITH CHECK (workspace_id::text = current_setting('app.current_workspace', true));

-- ============================================================================
-- 3. Grants — app_user can read/write its own workspace rows. The
--    service-role bypass (neondb_owner) implicitly has access for admin
--    paths and migration scripts.
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON stats_tool_runs TO app_user;
