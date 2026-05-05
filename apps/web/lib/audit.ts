import { headers } from "next/headers";
import { schema } from "@sigmafy/db";
import { getServiceDb } from "./db";

export interface AuditEntry {
  actorUserId: string | null;
  action: string;
  targetWorkspaceId?: string;
  targetResource?: string;
  justification?: string;
}

/**
 * Write an audit_log entry from the web app. Service-role only — the
 * audit_log table is REVOKE'd from app_user.
 *
 * Used at the bootstrap path (workspace creation) and any other web-side
 * service-role usage. Per master plan §8.1 / ADR 0003 every service-role
 * use must produce an audit row.
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
    // No request context — record without IP/UA.
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
