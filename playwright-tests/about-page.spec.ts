import { expect, test } from "@playwright/test";

/**
 * About Page — Section Navigation Tests
 *
 * Verifies the SectionNav dot navigation and section IDs on /about.
 */

test.describe("About Page — Section Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should have all section IDs for navigation", async ({ page }) => {
    const sectionIds = [
      "hero",
      "summary",
      "focus-areas",
      "skills",
      "badges",
      "awards",
    ];
    for (const id of sectionIds) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });

  test("should display sticky section nav on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/about/");
    await page.waitForLoadState("domcontentloaded");

    // Scroll past the hero to trigger visibility
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(500);

    const sectionNav = page.locator('nav[aria-label="About page sections"]');
    await expect(sectionNav).toBeAttached();
  });

  test("should display page heading", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("About Me");
  });
});
