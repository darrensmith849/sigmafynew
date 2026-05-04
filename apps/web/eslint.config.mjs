import nextConfig from "@sigmafy/config/eslint/next";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextConfig,
  {
    ignores: [".next/**", "node_modules/**", ".turbo/**", "next-env.d.ts"],
  },
];
