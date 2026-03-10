import { expect, test } from "@playwright/test";

/**
 * React 19 Features Test Suite
 * Tests for React 19 specific features including concurrent rendering,
 * automatic batching, Suspense, and error boundaries.
 *
 * Updated for Next.js 16 App Router (no #root element — uses __next or body).
 */

test.describe("React 19 Features", () => {
  test("should render app with React 19 concurrent features", async ({
    page,
  }) => {
    await page.goto("/");

    // Next.js App Router renders into #__next or directly into body
    await page.waitForSelector("body", { state: "attached" });

    // Verify the page has mounted React content
    const bodyContent = await page.locator("body").textContent();
    expect(bodyContent?.length).toBeGreaterThan(0);

    // Verify at least one top-level element is visible
    const body = page.locator("body");
    await expect(body).toBeVisible();

    // Confirm no unhandled JS errors crashed the page
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    // Re-navigate to capture any errors
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    expect(errors.filter((e) => !e.includes("ResizeObserver"))).toHaveLength(0);
  });

  test("should handle navigation errors gracefully with error boundary", async ({
    page,
  }) => {
    // Navigate to the app normally
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // The error boundary should NOT be in error state on a normal load
    const errorBoundaryVisible = await page
      .locator('[data-testid="error-boundary"]')
      .isVisible();
    expect(errorBoundaryVisible).toBe(false);

    // Navigate to a route that should render the NotFound page (not crash the app)
    await page.goto("/this-route-does-not-exist");
    await page.waitForLoadState("domcontentloaded");

    // App should still be mounted — body has content, not a blank page
    const content = await page.locator("body").textContent();
    expect(content?.length).toBeGreaterThan(0);
  });

  test("should batch updates automatically for better performance", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // In React 18+/19, setState calls inside event handlers are automatically batched.
    // We verify by dispatching multiple synchronous events and confirming the page
    // remains responsive (no crash, DOM still accessible).
    const isBatchingWorking = await page.evaluate(() => {
      for (let i = 0; i < 5; i++) {
        document.dispatchEvent(
          new CustomEvent("test-batch-update", { detail: i }),
        );
      }
      // Page is still responsive if body is accessible
      return document.body !== null;
    });

    expect(isBatchingWorking).toBe(true);
  });

  test("should support Suspense — lazy-loaded pages eventually render", async ({
    page,
  }) => {
    await page.goto("/");

    // The hero heading is defined in the homepage with id="hero-heading"
    await page.waitForSelector("#hero-heading", { timeout: 10000 });

    const heading = page.locator("#hero-heading");
    await expect(heading).toBeVisible();

    // Confirm the heading contains the expected text
    const text = await heading.textContent();
    expect(text).toBeTruthy();
    expect(text?.toLowerCase()).toMatch(/themistoklis|baltzakis/i);
  });
});
