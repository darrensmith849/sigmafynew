# @sigmafy/web

Sigmafy product app. One Next.js 15 App Router app serving both:

- **Marketing** at `/` (route group `(marketing)`).
- **Authed product** under `/dashboard`, `/projects`, etc. (route group `(app)`).

## Phase -1

Two placeholder pages prove the monorepo + Tailwind 4 + `@sigmafy/ui` wiring.
No auth, no real data, no API routes.

## Local

```bash
pnpm --filter @sigmafy/web dev
# http://localhost:3000
```

## Deployment

Single Vercel project: **sigmafy-web**. See `docs/environment-setup.md` for the
Vercel project configuration.
