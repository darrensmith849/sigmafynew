-- Phase 0A — Row Level Security + non-bypass app role.
--
-- Run AFTER 0000_phase_0a_init.sql. Idempotent: safe to re-run.
--
-- Architecture (per ADR 0003):
--   * neondb_owner owns all tables and BYPASSRLS at the role level (Neon default).
--     This is the audited service-role bypass (DATABASE_URL_SERVICE).
--   * app_user is created without BYPASSRLS and is granted SELECT/INSERT/UPDATE/DELETE.
--     This is what app code connects as (DATABASE_URL).
--   * Tenant tables ENABLE RLS (NOT FORCE) so the service-role bypass works by design,
--     while app_user is filtered by policy on every query.
--   * Policy reads `current_setting('app.current_workspace', true)`. The `true` arg makes
--     a missing setting return NULL ⇒ the comparison fails ⇒ zero rows. App must call
--     withWorkspace() to set the GUC inside a transaction.

-- ============================================================================
-- 1. app_user role
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user LOGIN PASSWORD 'PHASE_0A_TEMP_PASSWORD_REPLACE_VIA_NEON_API';
  END IF;
END $$;

GRANT CONNECT ON DATABASE neondb TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO app_user;

-- ============================================================================
-- 2. Enable RLS on tenant-owned tables
-- ============================================================================

ALTER TABLE memberships         ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_templates   ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects            ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_solutions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats_call_log      ENABLE ROW LEVEL SECURITY;

-- workspaces, users, audit_log are NOT RLS-scoped at the row level:
--   * workspaces: visibility is governed by membership (a member of W sees W).
--                 Bootstrapping requires service-role to create the workspace + initial membership.
--   * users:      not tenant data. Access flows through memberships.
--   * audit_log:  service-role only — app_user is never granted access.
REVOKE ALL ON audit_log FROM app_user;

-- ============================================================================
-- 3. Policies
-- ============================================================================

-- Helper: read the current workspace from session GUC (NULL if unset → policy fails closed).
-- Inlined into each policy for portability — Postgres doesn't allow STABLE function calls
-- in some policy positions across all versions.

-- memberships: visible only when the row's workspace matches the active session workspace.
DROP POLICY IF EXISTS memberships_workspace_isolation ON memberships;
CREATE POLICY memberships_workspace_isolation ON memberships
  USING (workspace_id::text = current_setting('app.current_workspace', true))
  WITH CHECK (workspace_id::text = current_setting('app.current_workspace', true));

-- project_templates: workspace can read system templates (workspace_id IS NULL) plus its own.
-- Writes are restricted to the active workspace.
DROP POLICY IF EXISTS project_templates_read ON project_templates;
CREATE POLICY project_templates_read ON project_templates
  FOR SELECT
  USING (
    workspace_id IS NULL
    OR workspace_id::text = current_setting('app.current_workspace', true)
  );

DROP POLICY IF EXISTS project_templates_write ON project_templates;
CREATE POLICY project_templates_write ON project_templates
  FOR INSERT
  WITH CHECK (workspace_id::text = current_setting('app.current_workspace', true));

DROP POLICY IF EXISTS project_templates_update ON project_templates;
CREATE POLICY project_templates_update ON project_templates
  FOR UPDATE
  USING (workspace_id::text = current_setting('app.current_workspace', true))
  WITH CHECK (workspace_id::text = current_setting('app.current_workspace', true));

DROP POLICY IF EXISTS project_templates_delete ON project_templates;
CREATE POLICY project_templates_delete ON project_templates
  FOR DELETE
  USING (workspace_id::text = current_setting('app.current_workspace', true));

-- projects, topic_solutions, stats_call_log: same pattern, all-CRUD bounded by current workspace.
DROP POLICY IF EXISTS projects_workspace_isolation ON projects;
CREATE POLICY projects_workspace_isolation ON projects
  USING (workspace_id::text = current_setting('app.current_workspace', true))
  WITH CHECK (workspace_id::text = current_setting('app.current_workspace', true));

DROP POLICY IF EXISTS topic_solutions_workspace_isolation ON topic_solutions;
CREATE POLICY topic_solutions_workspace_isolation ON topic_solutions
  USING (workspace_id::text = current_setting('app.current_workspace', true))
  WITH CHECK (workspace_id::text = current_setting('app.current_workspace', true));

DROP POLICY IF EXISTS stats_call_log_workspace_isolation ON stats_call_log;
CREATE POLICY stats_call_log_workspace_isolation ON stats_call_log
  USING (workspace_id::text = current_setting('app.current_workspace', true))
  WITH CHECK (workspace_id::text = current_setting('app.current_workspace', true));

-- ============================================================================
-- 4. Sanity check
-- ============================================================================

-- Confirm app_user does NOT have BYPASSRLS (verify in app deploys).
DO $$
DECLARE
  has_bypass boolean;
BEGIN
  SELECT rolbypassrls INTO has_bypass FROM pg_roles WHERE rolname = 'app_user';
  IF has_bypass THEN
    RAISE EXCEPTION 'app_user has BYPASSRLS — RLS would not apply. Aborting.';
  END IF;
END $$;
