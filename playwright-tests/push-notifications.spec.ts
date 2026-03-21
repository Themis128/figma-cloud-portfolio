import { expect, test } from "@playwright/test";

test.describe("Push Notifications @smoke", () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(["notifications"]);
  });

  test("should have service worker support", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const hasServiceWorker = await page.evaluate(() => {
      return "serviceWorker" in navigator;
    });

    expect(hasServiceWorker).toBeTruthy();
  });

  test("should have push manager support", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const hasPushManager = await page.evaluate(() => {
      return "PushManager" in window;
    });

    expect(hasPushManager).toBeTruthy();
  });

  test("should handle notification permission", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const permission = await page.evaluate(() => Notification.permission);
    expect(["granted", "default", "denied"]).toContain(permission);
  });

  test("should have sw.js available as static asset", async ({ page }) => {
    const response = await page.goto("/sw.js");
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
    const contentType = response!.headers()["content-type"] ?? "";
    expect(contentType).toContain("javascript");
  });

  test("should have Notification API available", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const hasNotification = await page.evaluate(() => "Notification" in window);
    expect(hasNotification).toBe(true);
  });
});

test.describe("Push Subscribe Button in Announcements", () => {
  test("should show subscribe button in announcements panel", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    // Open announcements panel via bell icon
    const bellButton = page.locator('button[aria-label*="nnouncement"]');
    await expect(bellButton).toBeVisible();
    await bellButton.click();
    await page.waitForTimeout(300);

    // Should see the push subscribe button
    const subscribeBtn = page.locator('button[aria-label*="push notification"]');
    await expect(subscribeBtn).toBeVisible();
    await expect(subscribeBtn).toContainText(/push notification/i);
  });

  test("should show announcements panel with correct structure", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    // Open panel
    const bellButton = page.locator('button[aria-label*="nnouncement"]');
    await bellButton.click();
    await page.waitForTimeout(300);

    // Panel should have Announcements heading
    const panel = page.locator('div[role="dialog"][aria-label="Announcements"]');
    await expect(panel).toBeVisible();
    await expect(panel.locator("h3", { hasText: "Announcements" })).toBeVisible();

    // Should have at least one announcement
    const announcements = panel.locator("li");
    const count = await announcements.count();
    expect(count).toBeGreaterThan(0);
  });
});
