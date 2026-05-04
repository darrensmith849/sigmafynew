# RLS Policies

Phase 0A drops raw SQL files (`packages/db/migrations/0001_rls_policies.sql`,
etc.) here that:

1. `ALTER TABLE … ENABLE ROW LEVEL SECURITY;` on every tenant-owned table.
2. Define policies of the form
   `USING (workspace_id = current_setting('app.current_workspace')::uuid)`.
3. Grant a bypass-free `workspace` Postgres role and a separate `service` role.

`drizzle-kit` does not model policies, so they live as raw SQL migrations.

In Phase -1 this directory is intentionally empty — there are no tenant tables
yet beyond the `_phase_minus_one_probe` placeholder.
