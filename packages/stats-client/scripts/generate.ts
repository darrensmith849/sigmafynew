/**
 * Stats client codegen.
 *
 * Phase -1: no-op. Phase 0A wires this to fetch the FastAPI stats service's
 * OpenAPI document and run `openapi-typescript` (or similar) into
 * `src/generated/`. The generated client is the only sanctioned way to call
 * the stats API — and it is consumed exclusively by `@sigmafy/stats-gateway`.
 */
function main(): void {
  console.log("[stats-client] generate: nothing to do in Phase -1");
}

main();
