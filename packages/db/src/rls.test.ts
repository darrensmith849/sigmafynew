import { describe, it, expect, beforeAll } from "vitest";
import { sql } from "drizzle-orm";
import { createDb } from "./client";
import { withWorkspace } from "./rls";
import { projects } from "./schema/projects";

const APP_URL = process.env.DATABASE_URL;
const SERVICE_URL = process.env.DATABASE_URL_SERVICE;

describe.skipIf(!APP_URL || !SERVICE_URL)("withWorkspace + RLS (integration)", () => {
  let acmeId: string;
  let zetaId: string;

  beforeAll(async () => {
    const svc = createDb(SERVICE_URL!, { role: "service" });
    const wRows = await svc.execute<{ id: string; slug: string }>(
      sql`SELECT id, slug FROM workspaces WHERE slug IN ('acme','zeta')`,
    );
    const map = new Map(wRows.rows.map((r) => [r.slug, r.id]));
    acmeId = map.get("acme")!;
    zetaId = map.get("zeta")!;
    expect(acmeId).toBeTruthy();
    expect(zetaId).toBeTruthy();
  });

  it("returns zero rows when no workspace context is set", async () => {
    const db = createDb(APP_URL!, { role: "workspace" });
    const rows = await db.select().from(projects);
    expect(rows).toHaveLength(0);
  });

  it("scopes reads to the active workspace", async () => {
    const db = createDb(APP_URL!, { role: "workspace" });
    const acmeRows = await withWorkspace(db, acmeId, async (tx) =>
      tx.select().from(projects),
    );
    expect(acmeRows.length).toBeGreaterThan(0);
    expect(acmeRows.every((r) => r.workspaceId === acmeId)).toBe(true);

    const zetaRows = await withWorkspace(db, zetaId, async (tx) =>
      tx.select().from(projects),
    );
    expect(zetaRows.length).toBeGreaterThan(0);
    expect(zetaRows.every((r) => r.workspaceId === zetaId)).toBe(true);
  });

  it("rejects cross-tenant inserts", async () => {
    const db = createDb(APP_URL!, { role: "workspace" });
    const svc = createDb(SERVICE_URL!, { role: "service" });
    const tpl = await svc.execute<{ id: string; version: number }>(
      sql`SELECT id, version FROM project_templates WHERE slug='green-belt' AND workspace_id IS NULL LIMIT 1`,
    );
    const acmeUser = await svc.execute<{ id: string }>(
      sql`SELECT id FROM users WHERE clerk_user_id='user_acme_test'`,
    );

    await expect(
      withWorkspace(db, acmeId, async (tx) =>
        tx.insert(projects).values({
          workspaceId: zetaId, // ⚠️ trying to write into another tenant
          templateId: tpl.rows[0]!.id,
          templateVersion: tpl.rows[0]!.version,
          ownerUserId: acmeUser.rows[0]!.id,
          name: "RLS attack",
        }),
      ),
    ).rejects.toThrow(/row-level security/i);
  });

  it("rejects malformed workspace ids before opening a tx", async () => {
    const db = createDb(APP_URL!, { role: "workspace" });
    await expect(
      withWorkspace(db, "not-a-uuid", async (tx) => tx.select().from(projects)),
    ).rejects.toThrow(/invalid workspace id/);
  });
});
