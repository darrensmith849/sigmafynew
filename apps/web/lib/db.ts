import { createDb, type SigmafyDb } from "@sigmafy/db";
import { createServiceRoleDb } from "@sigmafy/db/service-role";

let _appDb: SigmafyDb | null = null;
let _serviceDb: SigmafyDb | null = null;

/** RLS-enforced connection. App code uses this inside withWorkspace(). */
export function getAppDb(): SigmafyDb {
  if (_appDb) return _appDb;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing");
  _appDb = createDb(url, { role: "workspace" });
  return _appDb;
}

/**
 * Service-role connection. RLS bypass — restricted to:
 *   - bootstrap paths (workspace creation on signup)
 *   - audited admin operations
 *   - background jobs
 *
 * Every call site needs a written justification per ADR 0003.
 */
export function getServiceDb(): SigmafyDb {
  if (_serviceDb) return _serviceDb;
  const url = process.env.DATABASE_URL_SERVICE;
  if (!url) throw new Error("DATABASE_URL_SERVICE missing");
  _serviceDb = createServiceRoleDb(url);
  return _serviceDb;
}
