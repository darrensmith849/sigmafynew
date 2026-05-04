import { test, expect } from "@playwright/test";

test("admin home renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Platform Admin");
});
