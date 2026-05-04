import baseConfig from "@sigmafy/config/eslint/base";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  {
    ignores: [
      "**/.next/**",
      "**/.turbo/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/node_modules/**",
      "packages/stats-client/src/generated/**",
      "packages/db/migrations/**",
    ],
  },
];
