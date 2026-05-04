# @sigmafy/ui

Shared design-system primitives for the Sigmafy product. Per the brief, **all
reusable UI lives here** — apps must not style components ad hoc.

## Pattern

shadcn/ui primitives are copied directly into `src/primitives/` via the shadcn
CLI (configured in `components.json`). They become source code we own and
restyle, not a vendored dependency. Tokens live in `src/tokens/*.css` and feed
both the primitives and the shared Tailwind preset.

## Phase -1 surface

- `Button` (variants: primary, secondary, ghost, outline; sizes: sm, md, lg)
- `Input`
- `Label`
- `Card`, `CardHeader`, `CardTitle`, `CardContent`
- `cn()` and `cva()` helpers

Composite components (nav, dashboards, forms, AI panels, stat cards) arrive in
later phases.

## Usage

```tsx
import { Button, Card, cn } from "@sigmafy/ui";
import "@sigmafy/ui/styles.css"; // import once at the app root layout
```

## Adding a new primitive

```bash
cd packages/ui
pnpm dlx shadcn@latest add <component-name>
```

The CLI lands files in `src/primitives/` per the `components.json` aliases.
Re-export from `src/primitives/index.ts`.
