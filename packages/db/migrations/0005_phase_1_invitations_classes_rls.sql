-- Phase 1 Slice B.1 — RLS on invitations + classes + class_enrolments.
--
-- Hand-written migration (not in the Drizzle journal); applied
-- idempotently after 0004_phase_1_invitations_and_classes.sql.
--
-- Pattern matches 0001_phase_0a_rls.sql:
--   * Grant CRUD to app_user (the non-bypass role).
--   * ENABLE RLS (NOT FORCE) so neondb_owner / service-role still bypasses.
--   * Policies scope by current_setting('app.current_workspace', true).

-- ============================================================================
-- 1. Grants
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON workspace_invitations TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON classes               TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON class_enrolments      TO app_user;

-- ============================================================================
-- 2. Enable RLS
-- ============================================================================

ALTER TABLE workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrolments      ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. Policies
-- ============================================================================

-- workspace_invitations: workspace-scoped on every operation.
DROP POLICY IF EXISTS workspace_invitations_workspace_isolation ON workspace_invitations;
CREATE POLICY workspace_invitations_workspace_isolation ON workspace_invitations
  USING (workspace_id::text = current_setting('app.current_workspace', true))
  WITH CHECK (workspace_id::text = current_setting('app.current_workspace', true));

-- classes: workspace-scoped on every operation.
DROP POLICY IF EXISTS classes_workspace_isolation ON classes;
CREATE POLICY classes_workspace_isolation ON classes
  USING (workspace_id::text = current_setting('app.current_workspace', true))
  WITH CHECK (workspace_id::text = current_setting('app.current_workspace', true));

-- class_enrolments: scoped via the parent class's workspace_id.
DROP POLICY IF EXISTS class_enrolments_workspace_isolation ON class_enrolments;
CREATE POLICY class_enrolments_workspace_isolation ON class_enrolments
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = class_enrolments.class_id
        AND c.workspace_id::text = current_setting('app.current_workspace', true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = class_enrolments.class_id
        AND c.workspace_id::text = current_setting('app.current_workspace', true)
    )
  );
