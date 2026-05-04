import type { Config } from "tailwindcss";

/**
 * Shared Tailwind preset for Sigmafy apps and packages.
 *
 * Apps extend this so they all stay token-driven. The actual design tokens live
 * as CSS variables in `packages/ui/src/tokens/colors.css` and friends; this
 * preset only wires them into Tailwind's theme so utilities like `bg-primary`
 * resolve to `var(--primary)` etc.
 */
const preset: Config = {
  content: [],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        border: "var(--border)",
        ring: "var(--ring)",
        sigmafyBlue: {
          50: "var(--sigmafy-blue-50)",
          500: "var(--sigmafy-blue-500)",
          600: "var(--sigmafy-blue-600)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
    },
  },
};

export default preset;
