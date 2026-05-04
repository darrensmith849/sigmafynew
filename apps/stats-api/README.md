# sigmafy-stats-api

**Phase -1 placeholder.** The Sigmafy stats engine is an existing FastAPI
service that will be folded in here when integrated. Until then this
directory is a placeholder.

## Why a placeholder?

So the monorepo layout matches the brief. CI ignores this directory — no
Python is run. Vercel does not deploy this app (the FastAPI service goes to
Fly.io per the brief).

## Phase 0A integration

1. Drop the existing FastAPI service source under this directory.
2. Add a `Dockerfile` and Fly.io config.
3. Generate the OpenAPI doc and run
   `pnpm --filter @sigmafy/stats-client generate` to produce the typed client.
4. The only sanctioned consumer is `@sigmafy/stats-gateway`.

## Hard rule

The statistical logic of the existing FastAPI service must NOT be rewritten
during the migration. Wrap it; don't reimplement it.
