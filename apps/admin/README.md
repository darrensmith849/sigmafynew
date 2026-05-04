# @sigmafy/admin

2KO platform admin app. Pinned to port 3001 so it can run alongside
`@sigmafy/web` (port 3000).

## Phase -1

Single placeholder page proves the app builds and shares `@sigmafy/ui` tokens.

## Local

```bash
pnpm --filter @sigmafy/admin dev
# http://localhost:3001
```

## Deployment

Vercel project: **sigmafy-admin**, Root Directory `apps/admin`. See
`docs/environment-setup.md`.
