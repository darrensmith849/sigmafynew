/**
 * Applier for hand-written RLS migrations.
 *
 * Most schema migrations (CREATE TABLE, ADD COLUMN) ship via Drizzle Kit
 * and are tracked in `migrations/meta/_journal.json`. The RLS migrations
 * (ENABLE ROW LEVEL SECURITY, CREATE POLICY, GRANTs) are hand-written SQL
 * applied out-of-band — they don't fit Drizzle Kit's "from schema diff"
 * model and need to run as the service role.
 *
 * This script applies one such file by name. Idempotent if the SQL uses
 * `IF NOT EXISTS` / `DROP POLICY IF EXISTS` (the convention in this repo
 * — see 0001, 0005, 0007, 0009, 0010).
 *
 * Usage:
 *   cd packages/db
 *   export DATABASE_URL=<service-role connection string>
 *   pnpm exec tsx scripts/apply-migration.ts 0010_phase_7_stats_tool_runs.sql
 *
 * Or from any directory if DATABASE_URL is already set:
 *   pnpm --filter @sigmafy/db exec tsx scripts/apply-migration.ts <filename>
 *
 * The service-role URL is required because hand-written migrations need
 * to run DDL (CREATE TABLE, CREATE POLICY) and GRANT — operations the
 * non-bypass app_user can't perform.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";

const filename = process.argv[2];
if (!filename) {
  console.error("usage: tsx scripts/apply-migration.ts <filename.sql>");
  console.error("example: tsx scripts/apply-migration.ts 0010_phase_7_stats_tool_runs.sql");
  process.exit(2);
}

const url = process.env.DATABASE_URL ?? process.env.DATABASE_URL_SERVICE;
if (!url) {
  console.error("Set DATABASE_URL (or DATABASE_URL_SERVICE) to the service-role Neon connection string.");
  console.error("Hand-written migrations need DDL privileges that the non-bypass app_user does not have.");
  process.exit(1);
}

neonConfig.webSocketConstructor = ws;

async function main(): Promise<void> {
  const migrationPath = resolve(import.meta.dirname, "../migrations", filename);
  const sql = readFileSync(migrationPath, "utf8");
  console.log(`[apply-migration] ${filename}`);
  console.log(`[apply-migration]   file: ${migrationPath} (${sql.length} bytes)`);

  const pool = new Pool({ connectionString: url });
  try {
    console.log("[apply-migration]   applying …");
    await pool.query(sql);
    console.log("[apply-migration]   OK");

    // Heuristic verification: surface every table this migration touched
    // (anything matching `CREATE TABLE … <name>` or `ALTER TABLE <name>`)
    // so the operator sees what landed.
    const touched = new Set<string>();
    for (const m of sql.matchAll(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?([a-z_][a-z0-9_]*)/gi)) {
      touched.add(m[1]!);
    }
    for (const m of sql.matchAll(/ALTER TABLE\s+([a-z_][a-z0-9_]*)/gi)) {
      touched.add(m[1]!);
    }
    if (touched.size > 0) {
      const tables = [...touched];
      const rows = await pool.query<{ relname: string; relrowsecurity: boolean }>(
        `SELECT relname, relrowsecurity FROM pg_class WHERE relname = ANY ($1::text[]) ORDER BY relname`,
        [tables],
      );
      console.log("[apply-migration]   verified tables:");
      for (const row of rows.rows) {
        console.log(`     ${row.relname}  rls=${row.relrowsecurity}`);
      }
      const policies = await pool.query<{ tablename: string; policyname: string; cmd: string }>(
        `SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename = ANY ($1::text[]) ORDER BY tablename, policyname`,
        [tables],
      );
      if (policies.rowCount && policies.rowCount > 0) {
        console.log("[apply-migration]   policies:");
        for (const p of policies.rows) {
          console.log(`     ${p.tablename}: ${p.policyname} (${p.cmd})`);
        }
      }
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[apply-migration] error:", err);
  process.exit(1);
});
