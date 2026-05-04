# @sigmafy/config

Shared developer-tooling configs for the Sigmafy monorepo.

## What's here

- `eslint/base.js` — JS/TS baseline (typescript-eslint + prettier compat).
- `eslint/react.js` — extends base, adds React + react-hooks.
- `eslint/next.js` — extends react, adds Next.js + core-web-vitals.
- `typescript/base.json` — extends the root `tsconfig.base.json`.
- `typescript/react-library.json` — for shared React libs (jsx: react-jsx).
- `typescript/nextjs.json` — for Next.js apps (jsx: preserve, next plugin).
- `tailwind/preset.ts` — token-bound Tailwind 4 preset; wires CSS variables.
- `prettier/index.mjs` — shared Prettier config (re-exported by root).

## Usage

```js
// app eslint.config.mjs
import nextConfig from "@sigmafy/config/eslint/next";
export default [...nextConfig];
```

```jsonc
// package tsconfig.json
{ "extends": "@sigmafy/config/typescript/react-library" }
```

```ts
// app tailwind.config.ts
import preset from "@sigmafy/config/tailwind/preset";
export default { presets: [preset], content: ["./app/**/*.{ts,tsx}"] };
```
