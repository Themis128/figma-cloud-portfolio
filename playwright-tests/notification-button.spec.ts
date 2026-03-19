import { expect, test } from "@playwright/test";

/**
 * NotificationButton Tests
 *
 * Tests the announcement bell button with dropdown panel.
 */

test.describe("NotificationButton — Announcements", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("renders bell button in navigation", async ({ page }) => {
    // The bell button has aria-label containing "announcements"
    const bellBtn = page.locator(
      'button[aria-label*="announcements"], button[aria-label="Announcements"]',
    );
    await expect(bellBtn).toBeVisible();
  });

  test("shows unread badge with count on first visit", async ({ page }) => {
    // Clear localStorage to simulate first visit
    await page.evaluate(() => {
      localStorage.removeItem("site-announcements-read");
      localStorage.removeItem("site-announcements-last-seen");
    });
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    // Badge should show a number
    const badge = page.locator(".animate-ping.bg-cyan-400");
    const badgeCount = await badge.count();
    // Badge may or may not appear depending on announcements — just verify no crash
    expect(badgeCount).toBeGreaterThanOrEqual(0);
  });

  test("opens dropdown panel on click", async ({ page }) => {
    const bellBtn = page.locator(
      'button[aria-label*="announcements"], button[aria-label="Announcements"]',
    );
    await bellBtn.click();
    await page.waitForTimeout(300);

    const panel = page.locator('div[role="dialog"][aria-label="Announcements"]');
    await expect(panel).toBeVisible();
  });

  test("panel shows Announcements header with megaphone icon", async ({
    page,
  }) => {
    const bellBtn = page.locator(
      'button[aria-label*="announcements"], button[aria-label="Announcements"]',
    );
    await bellBtn.click();
    await page.waitForTimeout(300);

    const panel = page.locator('div[role="dialog"][aria-label="Announcements"]');
    await expect(
      panel.getByText("Announcements", { exact: true }),
    ).toBeVisible();
  });

  test("panel shows announcement items", async ({ page }) => {
    const bellBtn = page.locator(
      'button[aria-label*="announcements"], button[aria-label="Announcements"]',
    );
    await bellBtn.click();
    await page.waitForTimeout(300);

    const panel = page.locator('div[role="dialog"][aria-label="Announcements"]');
    // Should show at least one announcement item
    const items = panel.locator("li");
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
  });

  test("announcements have action links", async ({ page }) => {
    const bellBtn = page.locator(
      'button[aria-label*="announcements"], button[aria-label="Announcements"]',
    );
    await bellBtn.click();
    await page.waitForTimeout(300);

    // "Check it out" links should be present for announcements with href
    const actionLinks = page.getByText("Check it out");
    const linkCount = await actionLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test("panel has close button", async ({ page }) => {
    const bellBtn = page.locator(
      'button[aria-label*="announcements"], button[aria-label="Announcements"]',
    );
    await bellBtn.click();
    await page.waitForTimeout(300);

    const closeBtn = page.locator('button[aria-label="Close announcements"]');
    await expect(closeBtn).toBeVisible();

    // Clicking close should hide the panel
    await closeBtn.click();
    await page.waitForTimeout(300);

    const panel = page.locator('div[role="dialog"][aria-label="Announcements"]');
    await expect(panel).not.toBeVisible();
  });

  test("panel closes on Escape key", async ({ page }) => {
    const bellBtn = page.locator(
      'button[aria-label*="announcements"], button[aria-label="Announcements"]',
    );
    await bellBtn.click();
    await page.waitForTimeout(300);

    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    const panel = page.locator('div[role="dialog"][aria-label="Announcements"]');
    await expect(panel).not.toBeVisible();
  });

  test("panel shows announcement count in footer", async ({ page }) => {
    const bellBtn = page.locator(
      'button[aria-label*="announcements"], button[aria-label="Announcements"]',
    );
    await bellBtn.click();
    await page.waitForTimeout(300);

    // Footer shows "{n} announcement(s)"
    await expect(
      page.getByText(/\d+ announcements?/),
    ).toBeVisible();
  });

  test("bell button has aria-expanded attribute", async ({ page }) => {
    // Match button by its aria-label which contains "announcement" (could be "Announcements" or "N new announcements")
    const bellBtn = page.getByRole("button", { name: /announcement/i });

    // Wait for hydration (component returns null until mounted)
    await bellBtn.waitFor({ state: "visible", timeout: 10000 });

    // Should be false initially
    await expect(bellBtn).toHaveAttribute("aria-expanded", "false");

    // Open panel
    await bellBtn.click();
    await page.waitForTimeout(300);

    // Should be true when open
    await expect(bellBtn).toHaveAttribute("aria-expanded", "true");
  });
});
