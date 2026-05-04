import { describe, it, expect, beforeAll } from "vitest";
import { sql } from "drizzle-orm";
import { createDb, withWorkspace, schema } from "@sigmafy/db";
import { createStatsGateway } from "./gateway";
import { createDbStatsLogger } from "./db-logger";

const APP_URL = process.env.DATABASE_URL;
const SERVICE_URL = process.env.DATABASE_URL_SERVICE;
const STATS_URL = process.env.STATS_API_BASE_URL ?? "https://sigmafy-tools.fly.dev";

describe.skipIf(!APP_URL || !SERVICE_URL)("stats-gateway pareto end-to-end", () => {
  let acmeWorkspaceId: string;
  let acmeUserId: string;

  beforeAll(async () => {
    const svc = createDb(SERVICE_URL!, { role: "service" });
    const w = await svc.execute<{ id: string }>(sql`SELECT id FROM workspaces WHERE slug='acme'`);
    acmeWorkspaceId = w.rows[0]!.id;
    const u = await svc.execute<{ id: string }>(
      sql`SELECT id FROM users WHERE clerk_user_id='user_acme_test'`,
    );
    acmeUserId = u.rows[0]!.id;
  });

  it("calls Pareto, returns sorted/cumulative, and logs to stats_call_log", async () => {
    const db = createDb(APP_URL!, { role: "workspace" });
    const gateway = createStatsGateway({
      baseUrl: STATS_URL,
      auth: { workspaceId: acmeWorkspaceId, userId: acmeUserId },
      logger: createDbStatsLogger(db),
    });

    const result = await gateway.pareto({
      labels: ["A", "B", "C", "D"],
      counts: [40, 25, 20, 15],
    });

    expect(result.total).toBe(100);
    expect(result.labels_sorted).toEqual(["A", "B", "C", "D"]);
    expect(result.cumulative_percent[0]).toBe(40);
    expect(result.cumulative_percent[3]).toBe(100);

    // Verify a stats_call_log row was written, and only Acme can see it
    const acmeLogs = await withWorkspace(db, acmeWorkspaceId, async (tx) =>
      tx.select().from(schema.statsCallLog),
    );
    const recent = acmeLogs.filter((r) => r.endpoint === "pareto" && r.status === "ok");
    expect(recent.length).toBeGreaterThan(0);
    expect(recent[recent.length - 1]!.userId).toBe(acmeUserId);
    expect(recent[recent.length - 1]!.latencyMs).toBeGreaterThan(0);
  }, 30_000);

  it("rejects non-allowlisted endpoints (no such method on the gateway)", () => {
    const db = createDb(APP_URL!, { role: "workspace" });
    const gateway = createStatsGateway({
      baseUrl: STATS_URL,
      auth: { workspaceId: acmeWorkspaceId, userId: acmeUserId },
      logger: createDbStatsLogger(db),
    });
    // The gateway only exposes typed methods for allowlisted endpoints.
    // There is no `gateway.histogram` etc. — this is enforced by the type system.
    // @ts-expect-error histogram is not in the Phase 0A allowlist
    expect(typeof gateway.histogram).toBe("undefined");
  });
});
