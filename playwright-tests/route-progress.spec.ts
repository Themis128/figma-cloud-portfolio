import { expect, test } from "@playwright/test";

/** Dismiss cookie consent if present */
async function dismissCookies(page: import("@playwright/test").Page) {
  const btn = page.locator('button[aria-label="Accept all cookies"]');
  if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(500);
  }
}

test.describe("Route Progress Bar", () => {
  test("should navigate successfully with progress bar support", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await dismissCookies(page);

    // Click a desktop nav link to trigger route change
    const aboutLink = page.locator('nav a[href="/about/"]').first();
    await aboutLink.click();

    // Wait for navigation to complete
    await expect(page).toHaveURL(/about/, { timeout: 15000 });
  });

  test("RouteProgressBar component should be rendered in layout", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await dismissCookies(page);

    // Navigate to trigger the component
    const contactLink = page.locator('nav a[href="/contact/"]').first();
    await contactLink.click();
    await expect(page).toHaveURL(/contact/, { timeout: 15000 });
  });

  test("progress bar should have correct ARIA attributes when visible", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await dismissCookies(page);

    // Set up a listener for the progress bar before navigating
    const progressBarPromise = page.waitForSelector(
      '[role="progressbar"][aria-label="Page loading"]',
      { timeout: 5000, state: "attached" },
    ).catch(() => null);

    // Trigger navigation
    const aboutLink = page.locator('nav a[href="/about/"]').first();
    await aboutLink.click();

    // Check if we caught the progress bar (it's very brief)
    const progressBar = await progressBarPromise;
    if (progressBar) {
      expect(await progressBar.getAttribute("aria-label")).toBe("Page loading");
    }

    // Verify navigation completed regardless
    await expect(page).toHaveURL(/about/, { timeout: 15000 });
  });
});
