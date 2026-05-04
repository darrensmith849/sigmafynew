/**
 * ⚠️ SERVICE ROLE — RLS BYPASS ⚠️
 *
 * This module returns a Drizzle client that connects with a service-role
 * Postgres user, bypassing every Row Level Security policy. It is the ONLY
 * sanctioned RLS bypass path.
 *
 * Importing this file outside of:
 *   - background jobs in /apps/*\/jobs
 *   - the 2KO admin app (apps/admin)
 *   - migration scripts
 * is a code-review block. Every call site must have a written justification
 * and an audit-log entry per §8 of the master build plan.
 */

import { createDb, type SigmafyDb } from "./client";

export function createServiceRoleDb(connectionString: string): SigmafyDb {
  return createDb(connectionString, { role: "service" });
}
