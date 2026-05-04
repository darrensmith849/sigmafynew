/**
 * Idempotent seed for Phase 0A.
 *
 * Run via: pnpm --filter @sigmafy/db seed
 *
 * Operates as the service role (bypasses RLS) — this is the only sanctioned
 * place to mutate system templates. App code never touches this script.
 */
import { sql } from "drizzle-orm";
import { config } from "dotenv";
import { createDb } from "../src/client";
import { GREEN_BELT_SLUG, GREEN_BELT_TEMPLATE, GREEN_BELT_VERSION } from "../src/templates/green-belt";

config({ path: ".env" });

const url = process.env.DATABASE_URL_SERVICE;
if (!url) {
  console.error("DATABASE_URL_SERVICE missing — refuse to seed without service role.");
  process.exit(1);
}

async function main(): Promise<void> {
  const db = createDb(url!, { role: "service" });

  console.log("[seed] upserting system Green Belt template …");
  // Manual upsert: the unique index uses (workspace_id, slug, version) but NULLs are
  // distinct by default in Postgres, so ON CONFLICT can't match the system row.
  const existing = await db.execute<{ id: string }>(sql`
    SELECT id FROM project_templates
    WHERE workspace_id IS NULL AND slug = ${GREEN_BELT_SLUG} AND version = ${GREEN_BELT_VERSION}
  `);
  if (existing.rows.length > 0) {
    await db.execute(sql`
      UPDATE project_templates
      SET name = 'Green Belt', definition = ${JSON.stringify(GREEN_BELT_TEMPLATE)}::jsonb
      WHERE id = ${existing.rows[0]!.id}
    `);
    console.log(`[seed]   updated existing template ${existing.rows[0]!.id}`);
  } else {
    const inserted = await db.execute<{ id: string }>(sql`
      INSERT INTO project_templates (workspace_id, slug, name, version, definition)
      VALUES (NULL, ${GREEN_BELT_SLUG}, 'Green Belt', ${GREEN_BELT_VERSION}, ${JSON.stringify(GREEN_BELT_TEMPLATE)}::jsonb)
      RETURNING id
    `);
    console.log(`[seed]   inserted new template ${inserted.rows[0]!.id}`);
  }

  console.log("[seed] done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
