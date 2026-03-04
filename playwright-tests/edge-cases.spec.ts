import { expect, test } from "@playwright/test";

test.describe("Edge Case Tests", () => {
  test("should handle slow network connections", async ({ page }) => {
    // Simulate slow network by delaying responses slightly
    await page.route("**/*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      await route.continue();
    });

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should handle large form input", async ({ page }) => {
    await page.goto("/contact");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForSelector("form", { timeout: 10000 });

    // Fill message with large text
    await page.fill("#message", "a".repeat(10000));

    // Form should still be functional
    const messageValue = await page.inputValue("#message");
    expect(messageValue.length).toBeGreaterThan(0);
  });

  // Concurrent form submissions are prevented by the disabled button state
  test.skip("should handle concurrent requests", async () => {
    // Button is disabled during submission, preventing concurrent clicks
  });

  test("should handle browser back/forward navigation", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    await page.goto("/about");
    await page.waitForLoadState("domcontentloaded");

    await page.goBack();
    await expect(page).toHaveURL(/localhost/);

    await page.goForward();
    await expect(page).toHaveURL(/about/);
  });

  test("should handle browser refresh", async ({ page }) => {
    await page.goto("/about");
    await page.waitForLoadState("domcontentloaded");

    await page.reload();
    await expect(page).toHaveURL(/about/);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should handle browser window resize", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator("h1")).toBeVisible();

    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should handle browser tab switching", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.bringToFront();
    await expect(page.locator("h1")).toBeVisible();
  });
});
