import { defineConfig } from "vitest/config";
import { config } from "dotenv";

config({ path: ".env" });

export default defineConfig({
  test: {
    name: "@sigmafy/db",
    environment: "node",
    include: ["src/**/*.test.ts"],
    testTimeout: 30000,
  },
});
