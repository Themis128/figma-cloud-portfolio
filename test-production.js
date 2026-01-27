import { expect, test } from "@playwright/test";

test("should load home page successfully on production server", async ({ page }) => {
  // Navigate to the production server
  await page.goto("http://localhost:8083/");

  // Wait for the page to load
  await page.waitForLoadState("networkidle");

  // Check that the body is visible (React app loaded)
  await expect(page.locator("body")).toBeVisible();

  // Check for the main heading
  await expect(page.locator("h1")).toBeVisible();

  // Check for the name in the heading
  await expect(page.locator("h1")).toContainText("Themistoklis");
});
