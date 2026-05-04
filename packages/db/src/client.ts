import { neon, neonConfig, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema/index";

export type DbRole = "workspace" | "service";

export type SigmafyDb = NeonHttpDatabase<typeof schema>;

export interface CreateDbOptions {
  /** Distinguishes connections in Neon's logs and rate-limit accounting. */
  role: DbRole;
}

/**
 * Create a Drizzle/Neon client.
 *
 * `role: "workspace"` is the default for app code — every read/write must
 * funnel through `withWorkspace()` (see `./rls.ts`) so RLS holds.
 *
 * `role: "service"` is reserved for the audited bypass paths in
 * `./service-role.ts`. Importing service-role from app code is a review block.
 */
export function createDb(connectionString: string, opts: CreateDbOptions): SigmafyDb {
  neonConfig.fetchConnectionCache = true;
  const sql: NeonQueryFunction<false, false> = neon(connectionString, {
    fetchOptions: {
      headers: { "X-Sigmafy-Role": opts.role },
    },
  });
  return drizzle(sql, { schema });
}
