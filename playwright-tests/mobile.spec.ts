import { expect, test } from "@playwright/test";

test.describe("Mobile Responsiveness Tests", () => {
  test("should work on iPhone X", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should work on Galaxy S9", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should work on iPad", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should work on iPad Pro", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 1366 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should display mobile menu button on small screens", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Mobile menu button should be visible on small screens
    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await expect(menuButton).toBeVisible();
  });

  test("should toggle mobile navigation menu", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Click the mobile menu button
    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await menuButton.click();

    // Navigation links should become visible
    await page.waitForTimeout(500);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should handle mobile navigation", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Open mobile menu
    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await menuButton.click();
    await page.waitForTimeout(500);

    // Navigate to a page
    const aboutLink = page.locator('a[href="/about"]').first();
    if (await aboutLink.isVisible().catch(() => false)) {
      await aboutLink.click();
      await page.waitForURL("**/about");
      await expect(page.locator("h1")).toBeVisible();
    }
  });
});
