import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle, type NeonDatabase } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema/index";

// Neon's serverless Pool uses WebSockets to talk to the Neon proxy. In
// browser/edge runtimes a global WebSocket exists; in Node we provide ws.
if (typeof WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

export type DbRole = "workspace" | "service";

export type SigmafyDb = NeonDatabase<typeof schema>;

export interface CreateDbOptions {
  /**
   * Distinguishes connections in Neon's logs and rate-limit accounting.
   * Also drives `application_name` on the connection.
   */
  role: DbRole;
}

/**
 * Create a Drizzle/Neon client backed by the WebSocket-Pool driver.
 *
 * We use `neon-serverless` (Pool/Client) rather than `neon-http` because the
 * RLS pattern requires real transactions: `withWorkspace()` opens a tx, runs
 * `SET LOCAL app.current_workspace = $1`, and the GUC must persist across the
 * statements that follow inside the same connection.
 *
 * `role: "workspace"` is the default for app code — every read/write must
 * funnel through `withWorkspace()` (see `./rls.ts`) so RLS holds.
 *
 * `role: "service"` is reserved for the audited bypass paths in
 * `./service-role.ts`. Importing service-role from app code is a review block.
 */
export function createDb(connectionString: string, opts: CreateDbOptions): SigmafyDb {
  const pool = new Pool({
    connectionString,
    application_name: `sigmafy-${opts.role}`,
  });
  return drizzle(pool, { schema });
}
