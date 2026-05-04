import { sql } from "drizzle-orm";
import type { SigmafyDb } from "./client";

/**
 * Run a unit of work scoped to a single workspace.
 *
 * Opens a transaction, sets `app.current_workspace` to the given UUID, then
 * invokes the callback with the transaction-bound db. RLS policies on tenant
 * tables read this GUC and filter every read/write to the active workspace.
 *
 * If the workspace ID is malformed (not a UUID), Postgres rejects the SET
 * before the callback runs — so misuse is loud, not silent.
 *
 * The transaction commits if the callback returns; rolls back on throw.
 */
export async function withWorkspace<T>(
  db: SigmafyDb,
  workspaceId: string,
  fn: (tx: SigmafyDb) => Promise<T>,
): Promise<T> {
  if (!isUuid(workspaceId)) {
    throw new Error(`withWorkspace: invalid workspace id "${workspaceId}"`);
  }
  return db.transaction(async (tx) => {
    // SET LOCAL ... binds the GUC to the current transaction.
    // Parameterised through Drizzle's sql tag so it's safe.
    await tx.execute(sql`SELECT set_config('app.current_workspace', ${workspaceId}, true)`);
    return fn(tx as unknown as SigmafyDb);
  });
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(s: string): boolean {
  return UUID_RE.test(s);
}
