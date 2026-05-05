import type { Config } from "tailwindcss";

/**
 * Shared Tailwind preset for Sigmafy apps and packages.
 *
 * Tokens live in `packages/ui/src/tokens/*.css`. This preset wires them into
 * Tailwind utilities. The dev-portal-aligned tokens (--color-*, --tint-*) are
 * exposed under their own utility names. The legacy shadcn-style aliases
 * (background / foreground / muted / primary / border) and the Sigmafy-blue
 * ramp are kept so UI Sprint code keeps working during the brand-sprint
 * migration.
 */
const preset: Config = {
  content: [],
  theme: {
    extend: {
      colors: {
        // Brand-spec canonical tokens
        bg: "var(--color-bg)",
        fg: "var(--color-fg)",
        surface: {
          DEFAULT: "var(--color-surface)",
          2: "var(--color-surface-2)",
          3: "var(--color-surface-3)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          fg: "var(--color-accent-fg)",
          2: "var(--color-accent-2)",
        },
        tint: {
          projects: "var(--tint-projects)",
          spc: "var(--tint-spc)",
          training: "var(--tint-training)",
          ai: "var(--tint-ai)",
          admin: "var(--tint-admin)",
        },

        // Legacy shadcn-style aliases — still used widely in the authed app
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
          2: "var(--color-muted-2)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        border: {
          DEFAULT: "var(--border)",
          subtle: "var(--color-border-subtle)",
        },
        ring: "var(--ring)",

        // Legacy Sigmafy-blue ramp — kept for backward compat
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
        card: "var(--radius-card)",
        device: "var(--radius-device)",
        pill: "var(--radius-pill)",
      },
      maxWidth: {
        shell: "var(--max-w)",
        narrow: "var(--max-w-narrow)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
      },
      letterSpacing: {
        display: "var(--tracking-display)",
        tightish: "var(--tracking-tight)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-lift": "var(--shadow-card-lift)",
        popover: "var(--shadow-popover)",
      },
    },
  },
};

export default preset;
