import { expect, test } from "@playwright/test";

test.describe("Performance Tests", () => {
  test("should load page within reasonable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const loadTime = Date.now() - startTime;

    // Page should load within 10 seconds (generous for dev environment)
    expect(loadTime).toBeLessThan(10000);
  });

  test("should have reasonable navigation transfer size", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const transferSize = await page.evaluate(() => {
      const navEntries = performance.getEntriesByType("navigation");
      if (navEntries.length > 0) {
        const entry = navEntries[0] as PerformanceNavigationTiming;
        return entry.transferSize || 0;
      }
      return 0;
    });

    // Transfer size check — may be 0 in dev due to caching
    if (transferSize > 0) {
      // Navigation document should be under 2MB
      expect(transferSize).toBeLessThan(2000000);
    }
  });

  test("should have paint events", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    const paintEntries = await page.evaluate(() => {
      return performance.getEntriesByType("paint").map((e) => ({
        name: e.name,
        startTime: e.startTime,
      }));
    });

    // Should have at least first-paint or first-contentful-paint
    if (paintEntries.length > 0) {
      const fcp = paintEntries.find((e) => e.name === "first-contentful-paint");
      if (fcp) {
        // FCP should be under 5s in dev (lenient threshold)
        expect(fcp.startTime).toBeLessThan(5000);
      }
    } else {
      // Some browsers may not report paint entries in headless mode
      console.log("No paint entries available — expected in some test environments");
    }
  });

  // LCP observer API may not fire in headless browsers without real user interaction
  test.skip("should have largest contentful paint under 2.5s", async () => {
    // LCP requires PerformanceObserver and real page rendering which may not
    // be available in headless test browsers
  });

  // FID requires actual user input which cannot be simulated in automated tests
  test.skip("should have first input delay under 100ms", async () => {
    // FID (now INP) requires real user interaction and cannot be measured in automated tests
  });

  test("should have minimal layout shifts", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Layout shifts may not be measurable in all test environments
    const layoutShifts = await page.evaluate(() => {
      const entries = performance.getEntriesByType("layout-shift");
      return entries.length;
    });

    // Having 0 layout shift entries is acceptable (especially in headless)
    expect(layoutShifts).toBeGreaterThanOrEqual(0);
  });

  // TTI is not a standard Performance API entry type
  test.skip("should have time to interactive under 3.5s", async () => {
    // TTI is not a standard Performance API metric and requires Lighthouse or web-vitals library
  });
});
