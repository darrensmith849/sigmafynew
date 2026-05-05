-- Phase 1 Slice C.1 — RLS on topic_comments.

GRANT SELECT, INSERT, UPDATE, DELETE ON topic_comments TO app_user;

ALTER TABLE topic_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS topic_comments_workspace_isolation ON topic_comments;
CREATE POLICY topic_comments_workspace_isolation ON topic_comments
  USING (workspace_id::text = current_setting('app.current_workspace', true))
  WITH CHECK (workspace_id::text = current_setting('app.current_workspace', true));
