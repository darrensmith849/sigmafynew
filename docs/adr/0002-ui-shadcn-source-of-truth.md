# ADR 0002 — UI source-of-truth: shadcn into `packages/ui`

**Status**: Accepted
**Date**: 2026-05-04

## Context

The brief mandates that **all reusable UI lives in `packages/ui`** and that the
visual direction matches `dev-portal.sigmafy.co` — Apple-style, light mode
first, Sigmafy blue accent, generous whitespace. The product needs a consistent
component surface across `apps/web` and `apps/admin` from day one.

## Decision

- Use the **shadcn/ui CLI** to install primitives directly into
  `packages/ui/src/primitives/`. The components become source code we own and
  restyle, not a vendored dependency.
- `packages/ui/components.json` configures the CLI for our monorepo:
  `aliases.components: "@sigmafy/ui/primitives"`, `aliases.utils: "@sigmafy/ui/lib/cn"`.
- Design tokens (Sigmafy blue, neutrals, radii, spacing, type scale) live as
  CSS variables in `packages/ui/src/tokens/*.css`. The shared Tailwind preset
  in `packages/config/tailwind/preset.ts` exposes them as Tailwind utilities.
- Apps must not write reusable UI ad hoc. New primitives go through `packages/ui`.

## Alternatives considered

- **A vendored UI library (Mantine, Chakra, Radix Themes)** — fast to start but
  hard to make match a custom Apple-style aesthetic; theming becomes a
  full-time fight.
- **Build everything from scratch on top of Radix Primitives** — more control,
  but most of what we'd write is exactly what shadcn already gives us. We'd
  reinvent variants, focus rings, and the dozens of small decisions shadcn
  encodes for free.

## Consequences

- We own the source of every primitive. Customisation is just editing the file.
- Apple-style polish lives in tokens + restyling, not in fighting a dependency.
- Adding a new primitive is a single CLI command followed by a re-export from
  `src/primitives/index.ts`.
- We must keep `components.json` aliases stable; the shadcn CLI uses them on
  every install.
