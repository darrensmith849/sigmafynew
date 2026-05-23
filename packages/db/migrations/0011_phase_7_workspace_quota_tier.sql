-- Phase 7 — workspace.quota_tier column for the per-workspace daily quota
-- enforced by the stats gateway. Limits per tier are kept in TypeScript
-- (packages/stats-gateway/src/db-quota.ts) so they can be tuned without a
-- migration.
--
-- Default 'free' so existing rows fall into the most-restrictive tier on
-- rollout; the operator can promote known workspaces to 'pro' / 'internal'
-- via the admin app or a direct UPDATE.
--
-- Run AFTER 0010_phase_7_stats_tool_runs.sql.
-- Apply via:
--   cd packages/db
--   export DATABASE_URL=<service-role connection string>
--   pnpm exec tsx scripts/apply-migration.ts 0011_phase_7_workspace_quota_tier.sql

-- ============================================================================
-- 1. Column
-- ============================================================================

ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS quota_tier text NOT NULL DEFAULT 'free';

-- Enforce the known tier set so a typo can't put a row into an unknown
-- bucket that silently allows unlimited usage.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'workspaces_quota_tier_check'
  ) THEN
    ALTER TABLE workspaces
      ADD CONSTRAINT workspaces_quota_tier_check
      CHECK (quota_tier IN ('free', 'starter', 'pro', 'internal'));
  END IF;
END $$;

-- ============================================================================
-- 2. Index — quota lookups go: workspace_id → quota_tier → limit. Small
-- table; the PK suffices. No extra index needed.
-- ============================================================================
