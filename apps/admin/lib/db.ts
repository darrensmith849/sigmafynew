import { type SigmafyDb } from "@sigmafy/db";
import { createServiceRoleDb } from "@sigmafy/db/service-role";

let _serviceDb: SigmafyDb | null = null;

/**
 * Service-role connection. Required for the admin app — every admin read is
 * cross-tenant and must bypass RLS.
 *
 * Every call site that reads tenant data must also write an audit_log entry
 * via lib/audit.ts. This is a hard rule (master plan §8.1).
 */
export function getServiceDb(): SigmafyDb {
  if (_serviceDb) return _serviceDb;
  const url = process.env.DATABASE_URL_SERVICE;
  if (!url) throw new Error("DATABASE_URL_SERVICE missing");
  _serviceDb = createServiceRoleDb(url);
  return _serviceDb;
}
