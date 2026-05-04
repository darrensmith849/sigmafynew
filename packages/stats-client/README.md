# @sigmafy/stats-client

Auto-generated TypeScript client for the FastAPI stats service.

## Phase -1

Empty. The `generate` script is a no-op until the stats API is integrated.

## Phase 0A (next)

- `pnpm --filter @sigmafy/stats-client generate` fetches the FastAPI service's
  OpenAPI document and writes typed code to `src/generated/`.
- Re-export through `src/index.ts`.
- The only consumer is `@sigmafy/stats-gateway`. App code never imports
  this package directly.
