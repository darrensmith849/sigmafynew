# Brand Spec — align Next.js portal to `dev-portal.sigmafy.co`

**Status:** draft, awaiting sign-off before implementation.
**Reference:** https://dev-portal.sigmafy.co/ (the existing 2KO Laravel marketing portal). Source of truth for brand, tokens, type, components, IA.
**Goal:** new Next.js app (this repo) presents one product. Marketing surface and authed app shell both consume the same design tokens; a delegate moving from `/` → `/sign-in` → `/dashboard` shouldn't notice a chrome change.

---

## 1. Design tokens

CSS custom properties, all defined on `:root` (light) and overridden under `[data-theme="dark"]`. To be exposed via `packages/ui/src/styles/tokens.css` and mirrored in the Tailwind theme.

### Surface + foreground (light / dark)

| Token | Light | Dark |
|---|---|---|
| `--color-bg` | `#ffffff` | `#0a0a0a` |
| `--color-fg` | `#0a0a0a` | `#f5f5f7` |
| `--color-muted` | `#6e6e73` | `#a1a1a6` |
| `--color-muted-2` | `#86868b` | (same) |
| `--color-surface` | `#ffffff` | `#111111` |
| `--color-surface-2` | `#fbfbfd` | `#161616` |
| `--color-surface-3` | `#f5f5f7` | `#1d1d1f` |
| `--color-border` | `rgba(0,0,0,.08)` | `rgba(255,255,255,.1)` |
| `--color-border-subtle` | `rgba(0,0,0,.05)` | `rgba(255,255,255,.06)` |

### Accent

| Token | Light | Dark | Use |
|---|---|---|---|
| `--color-accent` | `#0a0f18` | `#f5f5f7` | Primary button bg, link emphasis. Inverted across themes. |
| `--color-accent-fg` | `#ffffff` | `#0a0a0a` | Text on `--color-accent`. |
| `--color-accent-2` | `#a39081` | `#a39081` | Warm taupe; used only in glow / orb gradients, never as text. |

### Per-product tints

Used for icon tiles, chips, and feature-specific accents. Same hue, lightened for dark mode.

| Token | Light | Dark | Product area |
|---|---|---|---|
| `--tint-projects` | `#1a5d4a` | `#6ab089` | Project / DMAIC work |
| `--tint-spc` | `#0a4a78` | `#5bb8d4` | Stats, control charts, capability |
| `--tint-training` | `#5a3a8b` | `#a48bcc` | Classes, exams, learning |
| `--tint-ai` | `#8b4a1a` | `#d4a06a` | AI grading, copilot |
| `--tint-admin` | `#4a4a5a` | `#b1bac4` | Tenant admin, settings |

### Nav backgrounds (translucent + scrolled state)

- `--color-nav-bg`: `rgba(251,251,253,.72)` light · `rgba(10,10,10,.72)` dark
- `--color-nav-bg-scrolled`: `rgba(251,251,253,.92)` light · `rgba(10,10,10,.92)` dark
- Always paired with `backdrop-filter: saturate(180%) blur(18-20px)`.

### Shadows

- `--shadow-card`: `0 1px 3px rgba(0,0,0,.04), 0 8px 24px -8px rgba(0,0,0,.08)` (dark inverts to higher opacity)
- `--shadow-card-lift`: `0 1px 3px rgba(0,0,0,.05), 0 24px 48px -16px rgba(0,0,0,.16)`
- `--shadow-popover`: `0 12px 40px -8px rgba(0,0,0,.18)`

### Layout

- `--max-w`: `1200px` (default container)
- `--max-w-narrow`: `880px` (article / centered-form pages)
- `--nav-h`: `60px` (sticky top bar)

---

## 2. Typography

### Font stack

```
-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display",
Inter, system-ui, sans-serif
```

Inter is loaded from Google Fonts as the cross-platform fallback (weights 400/500/600/700). Mono stack: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`.

### Tracking tokens

- `--tracking-display`: `-0.022em` (display sizes)
- `--tracking-tight`: `-0.012em` (headlines, wordmark)

### Scale (`packages/ui/src/styles/typography.css`)

| Class | Size (clamp) | Line | Weight | Tracking |
|---|---|---|---|---|
| `.h-display-xl` | `clamp(40px, 6vw, 84px)` | 1.04 | 600 | display |
| `.h-display-lg` | `clamp(32px, 4.6vw, 60px)` | 1.06 | 600 | display |
| `.h-display-md` | `clamp(28px, 3.4vw, 44px)` | 1.1 | 600 | display |
| `.h-headline` | `clamp(22px, 2.6vw, 32px)` | 1.18 | 600 | tight |
| `.h-eyebrow` | `12px` uppercase | 1.4 | 600 | `0.14em` |
| `.t-lede` | `clamp(17px, 1.6vw, 21px)` muted | 1.55 | 400 | `-0.005em` |
| `.t-num` | tabular-nums | — | inherit | display |

(Renaming the reference's `mk-*` to `h-*`/`t-*` so it doesn't collide with anything app-specific.)

---

## 3. Components

All ship from `packages/ui`. Each replaces or wraps an existing primitive.

### `Button` (replaces current `Button`)

- Pill (`border-radius: 999px`), `font-weight: 500`, tracking `-0.005em`
- Variants: `primary` (accent bg + accent-fg), `secondary` (surface bg + fg, border), `ghost` (transparent + fg)
- Sizes: `sm` (px .85rem · 13px), `md` default (px 1.25rem · 14px), `lg` (px 1.6rem · 15px)
- Hover: subtle `transform: translateY(-1px)` + accent darken

### `Card` (replaces current `Card`)

- `border-radius: 18px`, `bg: surface`, `border: 1px subtle`, `shadow: card`
- Hover lift: `translateY(-2px)` + `shadow: card-lift`
- Variant `glass`: 88%-opacity surface + `backdrop-filter: saturate(180%) blur(20px)` + subtle border. Use for nav, hero cards.

### `Chip`

- Pill, padding `0.32rem 0.72rem`, 12px, weight 500
- Default: `fg/4%` bg, subtle border
- Tinted: pass `tint` prop → `bg: color-mix(tint 10%, transparent)`, `color: tint`, `border: color-mix(tint 28%, transparent)`

### `IconTile`

- 44×44, `border-radius: 12px`, inline-flex centered icon
- `bg: color-mix(tint 12%, surface)`, `color: tint`, `border: color-mix(tint 22%, transparent)`

### `Eyebrow`

- 12px uppercase, tracking `0.14em`, weight 600
- Color: `color-mix(accent 75%, muted)` — automatically themable

### `DeviceMockup` (new)

- Rounded `20px` outer, surface bg, lifted shadow, overflow hidden
- Window-bar header: 3 dots + optional title text
- Body slot for arbitrary content (progress lists, sparkline cards, stat tiles)
- Used for hero illustrations on marketing pages (Project DMAIC card, Capability stats card, Cohort progress card)

### Background utilities

- `.bg-grid` — 56px gridlines, masked to a radial fade
- `.bg-dots` — 22px dot grid, masked similarly
- `.bg-orb` — absolute-positioned 360–420px blurred circles in accent-2 / tint-spc, animated drift

### Logo

```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M19 5H7l5 7-5 7h12" />
</svg>
```

Pair with wordmark "Sigmafy" (mixed case, weight 600, tracking `-0.012em`, size 15px).
Replaces the current uppercase `SIGMAFY` lettermark.

---

## 4. Animation primitives

All opt-in via `data-*` attributes on the element; respect `prefers-reduced-motion`.

| Primitive | Purpose | Duration | Notes |
|---|---|---|---|
| `data-reveal` | Fade + slide up on scroll-into-view | 600ms ease-out | IntersectionObserver, one-shot |
| `data-words` | Cycle through phrases in headline | per-char 40ms | Used on hero h1 |
| `data-typewriter-cycle` | Pill text rotates through a list | 36ms type / 22ms erase / 2.2s hold | "AI evaluating · 3 of 5" pill |
| `data-magnetic="6"` | Cursor-pull on hover | spring | Primary buttons |
| `.float-a/b/c` | Subtle vertical bob, infinite | 7–11s ease-in-out | Hero device cards |
| `.pulse-soft` | Opacity 0.55 ↔ 0.85 | 8s | Status dots |
| `.orb-drift-a/b` | Background orbs translate + scale | 22–28s | Hero / section backgrounds |
| `.marquee-scroll` | Linear left scroll | 36s | Trusted-by logos strip |
| `.caret-blink` | Cursor for typewriter | 1s | Accompanies `data-typewriter-*` |

Single shared module `packages/ui/src/animations/` — small vanilla TS (no extra runtime). Marketing pages opt in; the authed app uses static versions only.

---

## 5. Information architecture

### Marketing nav (top of `(marketing)`)

Reference order, kept as-is:

1. Product → `/product`
2. SPC → `/features/spc`
3. Projects → `/features/projects`
4. Training → `/features/training`
5. AI → `/features/ai`
6. Pricing → `/pricing`
7. Contact → `/contact`

Right-side actions: theme toggle, **Sign in** (ghost), **Talk to us** (primary).
Mobile: collapses to full-screen drawer (already pattern in UI.7).

### Marketing pages to build

| Route | Title | Key sections |
|---|---|---|
| `/` | Run Six Sigma projects, train your people, prove the impact. | Hero with device mockups · trusted-by marquee · 4–5 feature blocks · CTA strip |
| `/product` | How Sigmafy fits together | Eyebrow "How it fits together" + "Who it's for" · pillar grid |
| `/features/spc` | Statistical Process Control | Eyebrow "Tools" + "Capabilities" · stat-tool list with sparkline cards |
| `/features/projects` | Project Management | Eyebrow "Hierarchy" · DMAIC walkthrough |
| `/features/training` | Training & Learning | Eyebrow "Capabilities" · cohort + exam flows |
| `/features/ai` | AI Evaluation | Eyebrow "What it does" + "Safeguards" · grading + override visualisations |
| `/pricing` | Pricing | 3 tiers (Starter / Growth / Enterprise) · compare table · FAQ |
| `/contact` | Talk to us | Form + 2KO contact details |

### Footer

Three columns + tagline (lifted from reference):

- **Product**: Overview · Pricing · Customers · About
- **Features**: Statistical Process Control · Project Management · Training & Exams · AI Evaluation · Admin & Multi-tenancy
- **Company**: Contact · Sign in · Privacy · Terms
- Tagline: *"Practical Six Sigma, AI-assisted. Built by 2KO."*
- Copyright row: © 2026 2KO Pty Ltd · All rights reserved.

### Authed app — minimum to feel consistent

The current `(app)/_components/app-header.tsx` keeps its function (Projects · Classes · Approvals · ROI · Members) but adopts:

- Logo SVG + lowercase wordmark
- Translucent + blurred background using `--color-nav-bg`
- Same pill button style for any in-header CTA
- Active link uses `--color-fg` weight 500 (no Sigmafy-blue chip — that was my UI.1 invention; reference uses subtle weight contrast)

The dashboard, classes, approvals, roi, members, and project pages adopt the new `Card`, `Button`, `Chip`, `Eyebrow` primitives. No layout changes — purely a token+primitive swap.

---

## 6. Implementation plan (Brand Sprint)

Each item lands as a separate commit on `dev` and is bundled into a single PR to `main`.

| # | Slice | Scope |
|---|---|---|
| BS.1 | Discovery | ✅ done — this doc |
| BS.2 | Spec sign-off | ⬜ awaiting confirmation |
| BS.3 | Tokens + Tailwind theme | Add `packages/ui/src/styles/tokens.css` (CSS vars for both themes) and extend `tailwind.config.ts` so `bg-fg`, `text-muted`, `border-border`, `bg-tint-spc` etc. all resolve. No visual changes yet. |
| BS.4 | Theme toggle infra | Tiny `<ThemeToggle/>` client component + `data-theme` attribute on `<html>` + localStorage key `sigmafy-theme`. Add to root layout. |
| BS.5 | Logo + wordmark | New `<Logo/>` component (SVG path). Replace `SIGMAFY` text in `app-header.tsx`, marketing header, sign-in/up. |
| BS.6 | Primitives | Update `packages/ui` `Button`, `Card`. Add `Chip`, `IconTile`, `Eyebrow`. Refactor `EmptyState` to use them. |
| BS.7 | Animation primitives | `packages/ui/src/animations/` — `reveal`, `words`, `typewriter`, `magnetic`. Marketing-only at first. |
| BS.8 | Marketing landing rewrite | Rebuild `(marketing)/page.tsx` to match `/` reference: hero with device mockups, trusted-by marquee, feature blocks, CTA, footer. |
| BS.9 | Marketing nav + footer shell | New `(marketing)/_components/{nav,footer}.tsx`. Wire the 7-link nav and 3-column footer. |
| BS.10 | Marketing inner pages | Stub pages for `/product`, `/features/{spc,projects,training,ai}`, `/pricing`, `/contact`. Real copy can iterate; layout matches. |
| BS.11 | Sign-in / sign-up shell | Re-skin to match marketing chrome (logo, theme toggle, pill buttons, surface tokens). |
| BS.12 | Authed app re-skin | Update `app-header.tsx`, page wrappers, dashboard cards, project page sidebar to consume the new tokens + primitives. No layout change. |

**Estimate**: BS.3–BS.7 = ~half a day (foundation). BS.8–BS.10 = ~full day (most of the visible deliverable). BS.11–BS.12 = ~half day.

### Out of scope for Brand Sprint

- New marketing copy (beyond what we can lift from the reference). Real copy is a stakeholder activity.
- Real device-mockup imagery — we replicate them in HTML/CSS as the reference does.
- Customer logos for the trusted-by marquee — use placeholder text labels until real partner logos are supplied.
- Any change to the master plan's current functional scope.

---

## 7. Open questions for sign-off

1. **Brand source confirmed?** This doc treats `dev-portal.sigmafy.co` as canonical. If 2KO has a separate brand-guidelines artefact (Figma, PDF) it should override anything here.
2. **Footer attribution.** Reference says *"Built by 2KO"*. OK to keep as-is on the new app, or do you want a different framing for SSA / future tenants?
3. **Product names in nav.** Reference uses *Product · SPC · Projects · Training · AI · Pricing · Contact*. Keep verbatim, or rename anything for V1?
4. **Inner marketing pages copy.** Lift from reference HTML, or stub each as "coming soon" with the new chrome and fill copy later?
5. **Authed-app re-skin scope.** Token-and-primitive swap only (recommended), or also rework page layouts to use the marketing-style hero/eyebrow patterns?
