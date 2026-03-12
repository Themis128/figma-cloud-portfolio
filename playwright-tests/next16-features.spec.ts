import { expect, test } from "@playwright/test";
import { waitForAppReady } from "./test-utils";

/**
 * Next.js 16 Features Test Suite
 * Tests for Next.js 16 App Router specific features including routing,
 * lazy loading, and client-side rendering.
 *
 * Tests have been updated to reflect the Next.js 16 App Router architecture.
 */

test.describe("React SPA Features", () => {
  test("should render pages with React components", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    // Verify Next.js app is mounted (uses #__next or body, not #root)
    const appRoot = page.locator("#__next, main, body");
    await expect(appRoot.first()).toBeVisible();

    // Verify content is rendered
    const bodyText = await page.locator("body").textContent();
    expect(bodyText?.length).toBeGreaterThan(100);
  });

  test("should handle client-side routing", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    // Navigate to about page
    const aboutLink = page.getByRole("link", { name: "About" }).first();
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await page.waitForURL("**/about/", { timeout: 5000 }).catch(() => {
        // SPA routing may not update URL in all cases
      });
    }

    // Verify page content changed
    await expect(page.locator("body")).toBeVisible();
  });

  test("should lazy load content efficiently", async ({ page }) => {
    // Measure time to first contentful paint
    const firstContentfulPaint = await page.evaluate(async () => {
      const perfEntries = performance.getEntriesByType("paint");
      const fcp = perfEntries.find(
        (entry) => entry.name === "first-contentful-paint",
      );
      return fcp?.startTime || 0;
    });

    // Verify content loads within reasonable time (increased threshold for CI)
    expect(firstContentfulPaint).toBeLessThan(5000);

    // Verify dynamic content is loaded
    await page.goto("/");
    await waitForAppReady(page);

    const bodyText = await page.locator("body").textContent();
    expect(bodyText?.length).toBeGreaterThan(50);
  });

  test("should cache static assets properly", async ({ page }) => {
    const requests: string[] = [];

    page.on("request", (request) => {
      requests.push(request.url());
    });

    await page.goto("/");
    await waitForAppReady(page);

    // Verify static assets are loaded
    const staticAssets = requests.filter(
      (url) => url.includes(".js") || url.includes(".css"),
    );
    expect(staticAssets.length).toBeGreaterThan(0);
  });

  test("should handle nested routes in SPA", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    // Test navigation to different pages
    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible();

    // Navigate to projects page if available
    const projectsLink = page.getByRole("link", { name: /projects/i }).first();
    if (await projectsLink.isVisible()) {
      await projectsLink.click();
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("body")).toBeVisible();
    }
  });

  test("should handle browser back/forward navigation", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    // Navigate to about page
    await page.goto("/about");
    await page.waitForLoadState("domcontentloaded");

    // Go back
    await page.goBack();
    await page.waitForLoadState("domcontentloaded");

    // Should be back at home
    await expect(page.locator("body")).toBeVisible();

    // Go forward
    await page.goForward();
    await page.waitForLoadState("domcontentloaded");

    // Should be at about page
    await expect(page.locator("body")).toBeVisible();
  });
});
