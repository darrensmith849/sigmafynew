import { defineConfig } from "vitest/config";
import { config } from "dotenv";

config({ path: "../db/.env" });

export default defineConfig({
  test: {
    name: "@sigmafy/stats-gateway",
    environment: "node",
    include: ["src/**/*.test.ts"],
    testTimeout: 30000,
  },
});
