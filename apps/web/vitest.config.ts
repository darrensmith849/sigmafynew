import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@sigmafy/web",
    environment: "node",
    include: ["app/**/*.test.{ts,tsx}", "lib/**/*.test.ts"],
  },
});
