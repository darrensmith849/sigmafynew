import { headers } from "next/headers";
import { schema } from "@sigmafy/db";
import { getServiceDb } from "./db";

export interface AuditEntry {
  /** Sigmafy user id of the admin (or service caller). */
  actorUserId: string;
  /** Dotted action identifier, e.g. "admin.view_workspace", "admin.view_topic". */
  action: string;
  /** Workspace this access relates to, if any. */
  targetWorkspaceId?: string;
  /** Resource address, e.g. "workspace:<id>", "topic:<path>", "project:<id>". */
  targetResource?: string;
  /** Free-text reason. Phase 0B doesn't enforce; Phase 1 prompts for one. */
  justification?: string;
}

/**
 * Write an audit_log row. Service-role only — this table is restricted
 * (REVOKE ALL ON audit_log FROM app_user in 0001_phase_0a_rls.sql).
 *
 * Captures IP + user-agent from the request headers. Best-effort; if those
 * are missing (e.g. server-side rendered without a request), we record
 * empty strings rather than failing the audit.
 *
 * Per master plan §8.1 — every admin cross-tenant view, every service-role
 * bypass, every impersonation must have a row here.
 */
export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  let ip: string | null = null;
  let userAgent: string | null = null;
  try {
    const h = await headers();
    ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      null;
    userAgent = h.get("user-agent");
  } catch {
    // No request context (e.g. background job) — record audit without IP/UA.
  }

  const svc = getServiceDb();
  await svc.insert(schema.auditLog).values({
    actorUserId: entry.actorUserId,
    action: entry.action,
    targetWorkspaceId: entry.targetWorkspaceId ?? null,
    targetResource: entry.targetResource ?? null,
    justification: entry.justification ?? null,
    ip,
    userAgent,
  });
}
