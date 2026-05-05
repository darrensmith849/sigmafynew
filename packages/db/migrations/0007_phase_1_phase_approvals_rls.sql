-- Phase 1 Slice B.4 — RLS on phase_approvals.
--
-- Hand-written migration; applied idempotently after
-- 0006_phase_1_phase_approvals.sql.

GRANT SELECT, INSERT, UPDATE, DELETE ON phase_approvals TO app_user;

ALTER TABLE phase_approvals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS phase_approvals_workspace_isolation ON phase_approvals;
CREATE POLICY phase_approvals_workspace_isolation ON phase_approvals
  USING (workspace_id::text = current_setting('app.current_workspace', true))
  WITH CHECK (workspace_id::text = current_setting('app.current_workspace', true));
