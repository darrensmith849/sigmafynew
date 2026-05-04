import { test, expect } from "@playwright/test";

test("marketing home renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("operating system");
});

test("dashboard placeholder renders", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Dashboard");
});
