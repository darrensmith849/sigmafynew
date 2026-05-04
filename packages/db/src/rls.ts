import type { SigmafyDb } from "./client";

/**
 * Run a unit of work scoped to a single workspace.
 *
 * Phase 0A: opens a transaction and runs `SET LOCAL app.current_workspace = $1`
 * so RLS policies (`workspace_id = current_setting('app.current_workspace')::uuid`)
 * filter every read/write. The callback receives the tx-bound db.
 *
 * Phase -1: signature only. Throws "not implemented" so app code that forgets
 * to wrap a query fails loudly during the Phase 0A migration.
 */
export async function withWorkspace<T>(
  _db: SigmafyDb,
  _workspaceId: string,
  _fn: (tx: SigmafyDb) => Promise<T>,
): Promise<T> {
  throw new Error(
    "withWorkspace not implemented in Phase -1 — Phase 0A wires the SET LOCAL transaction",
  );
}
