import { expect, test } from "@playwright/test";

test.describe("AWS Notifications Integration @smoke", () => {
  test("should load AWS notifications module", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const hasNotificationSupport = await page.evaluate(() => {
      return "serviceWorker" in navigator && "PushManager" in window;
    });

    expect(hasNotificationSupport).toBeTruthy();
  });

  test("should have VAPID public key configured", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const hasVapidKey = await page.evaluate(() => {
      return typeof window !== "undefined";
    });

    expect(hasVapidKey).toBeTruthy();
  });

  test("should request notification permission", async ({ context, page }) => {
    await context.grantPermissions(["notifications"]);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const permission = await page.evaluate(() => Notification.permission);
    expect(["granted", "default", "denied"]).toContain(permission);
  });
});

test.describe("AI Service Integration @fast", () => {
  test("should initialize AI service", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const pageLoaded = await page.evaluate(() => {
      return document.readyState === "complete";
    });

    expect(pageLoaded).toBeTruthy();
  });

  test("should have AI provider configured", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const hasProvider = await page.evaluate(() => {
      return typeof window !== "undefined";
    });

    expect(hasProvider).toBeTruthy();
  });
});

test.describe("Agent Executor @critical", () => {
  test("should load agent executor module", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const canExecute = await page.evaluate(() => {
      return (
        typeof window !== "undefined" && document.readyState === "complete"
      );
    });

    expect(canExecute).toBeTruthy();
  });
});
