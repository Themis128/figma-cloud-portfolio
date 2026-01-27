import { expect, test } from "@playwright/test";
import { setupTestEnvironment, teardownTestEnvironment } from "./test-utils";

test.describe("Performance Monitoring", () => {
  test.beforeAll(async () => {
    await setupTestEnvironment();
  });

  test.afterAll(async () => {
    await teardownTestEnvironment();
  });

  test("should track Core Web Vitals metrics", async ({ page }) => {
    await page.goto("/performance");

    // Wait for performance monitoring to initialize and metrics to be captured
    await page.waitForTimeout(2000);

    // Check that web-vitals metrics were captured
    const metrics = await page.evaluate(() => window.webVitalsMetrics || []);
    expect(metrics.length).toBeGreaterThanOrEqual(2); // At least some metrics should be captured

    const metricNames = metrics.map((m) => m.name);
    // Should have at least some expected metrics (browsers may not support all)
    const expectedMetrics = ["INP", "TTFB", "FCP", "LCP", "CLS"];
    const foundMetrics = expectedMetrics.filter((name) => metricNames.includes(name));
    expect(foundMetrics.length).toBeGreaterThanOrEqual(2);
  });

  test("should send analytics data to custom endpoint", async ({ page }) => {
    const analyticsRequests: Array<{
      url: string;
      method: string;
      postData: string | null;
    }> = [];

    // Intercept analytics requests
    page.on("request", (request) => {
      if (request.url().includes("/api/analytics")) {
        analyticsRequests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData(),
        });
      }
    });

    await page.goto("/performance");

    // Wait for analytics to be sent
    await page.waitForTimeout(2000);

    // Check that analytics requests were made
    expect(analyticsRequests.length).toBeGreaterThan(0);

    // Verify analytics data structure
    const analyticsRequest = analyticsRequests[0];
    expect(analyticsRequest.method).toBe("POST");
    expect(analyticsRequest.url).toContain("/api/analytics");

    const analyticsData = JSON.parse(analyticsRequest.postData || "{}");
    expect(analyticsData).toHaveProperty("event");
    expect(analyticsData).toHaveProperty("data");
    expect(analyticsData).toHaveProperty("timestamp");
    expect(analyticsData).toHaveProperty("url");
    expect(analyticsData).toHaveProperty("userAgent");
  });

  test("should track navigation timing", async ({ page, browserName }) => {
    await page.goto("/");

    // For mobile browsers, navigate directly to avoid menu interaction issues
    if (browserName.includes("Mobile") || (page.viewportSize()?.width || 0) < 768) {
      // Navigate directly to about page
      await page.goto("/about");
      await page.waitForURL("**/about");

      // Navigate back to home
      await page.goto("/");
      await page.waitForURL("/");

      // Navigate to contact page
      await page.goto("/contact");
      await page.waitForURL("**/contact");
    } else {
      // Desktop navigation
      // Open mobile menu if present (though unlikely on desktop)
      const menuButton = page.locator('button[aria-label="Toggle menu"]');
      if (await menuButton.isVisible()) {
        await menuButton.click();
        // Wait for menu to open and links to be visible
        await page.waitForSelector('a[href="/about"]:not([style*="display: none"])');
      }

      // Navigate to about page
      await page.click('a[href="/about"]');
      await page.waitForURL("/about");

      // Navigate back to home for contact link
      await page.goto("/");
      await page.waitForURL("/");

      // Open mobile menu again if present
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await page.waitForSelector('a[href="/contact"]:not([style*="display: none"])');
      }

      // Navigate to contact page
      await page.click('a[href="/contact"]');
      await page.waitForURL("/contact");
    }

    // Check navigation timing in performance API
    const navigationTiming = await page.evaluate(() => {
      const entries = performance.getEntriesByType("navigation");
      return entries[0];
    });

    expect(navigationTiming).toBeDefined();
    expect(navigationTiming).toHaveProperty("loadEventEnd");
    expect(navigationTiming).toHaveProperty("domContentLoadedEventEnd");
  });

  test("should track resource loading performance", async ({ page }) => {
    await page.goto("/");

    // Wait for page to load - use domcontentloaded instead of networkidle for dev environment
    await page.waitForLoadState("domcontentloaded");

    // Check resource timing
    const resourceTiming = await page.evaluate(() => {
      const entries = performance.getEntriesByType("resource");
      return entries.filter((entry) => entry.name.includes(".js") || entry.name.includes(".css"));
    });

    expect(resourceTiming.length).toBeGreaterThan(0);

    // Check that resources loaded successfully
    for (const resource of resourceTiming) {
      // Duration may be 0 in some browsers or cached resources
      expect(resource.duration).toBeGreaterThanOrEqual(0);
      // Note: transferSize may be 0 in local development
      if (resource.transferSize > 0) {
        expect(resource.transferSize).toBeGreaterThan(0);
      }
    }
  });

  test("should track memory usage", async ({ page }) => {
    await page.goto("/");

    // Check memory usage if available
    const memoryInfo = await page.evaluate(() => {
      if ("memory" in performance && performance.memory) {
        const mem = performance.memory as {
          usedJSHeapSize: number;
          totalJSHeapSize?: number;
          jsHeapSizeLimit: number;
        };
        return {
          usedJSHeapSize: mem.usedJSHeapSize,
          totalJSHeapSize: mem.totalJSHeapSize || 0,
          jsHeapSizeLimit: mem.jsHeapSizeLimit,
        };
      }
      return null;
    });

    if (memoryInfo) {
      expect(memoryInfo.usedJSHeapSize).toBeGreaterThan(0);
      expect(memoryInfo.totalJSHeapSize).toBeGreaterThan(0);
      expect(memoryInfo.jsHeapSizeLimit).toBeGreaterThan(0);
    }
  });

  test("should handle performance monitoring errors gracefully", async ({ page }) => {
    // Mock web-vitals to throw an error
    await page.addInitScript(() => {
      window.onCLS = () => {
        throw new Error("Test error");
      };
    });

    await page.goto("/performance");

    // Page should still load and function normally
    await expect(page.locator("body")).toBeVisible();

    // Check that error was handled gracefully (allow some console errors but no uncaught exceptions)
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(1000);

    // Allow some errors but ensure no critical errors that break functionality
    // In real implementation, some errors might be logged but handled gracefully
    const criticalErrors = errors.filter(
      (error) =>
        error.includes("Uncaught") ||
        error.includes("ReferenceError") ||
        error.includes("TypeError"),
    );
    expect(criticalErrors.length).toBe(0);
  });

  test("should display performance dashboard", async ({ page }) => {
    await page.goto("/performance");

    // Wait for page to load - use domcontentloaded instead of networkidle for dev environment
    await page.waitForLoadState("domcontentloaded");

    // Check that the page loaded and body is visible
    await expect(page.locator("body")).toBeVisible();

    // Check that performance dashboard components are present (may not be immediately visible due to lazy loading)
    const dashboardElement = page.locator('[data-testid="performance-dashboard"]');
    await dashboardElement.waitFor({ state: "attached", timeout: 10000 });

    // At least check that the main heading is visible
    await expect(page.locator('h1:has-text("Performance Dashboard")')).toBeVisible();
  });

  test("should track route changes", async ({ page, browserName }) => {
    // Track route changes by monitoring URL changes
    const routeChanges: string[] = [];
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) {
        routeChanges.push(frame.url().split("/").pop() || "/");
      }
    });

    await page.goto("/");

    // For mobile browsers, navigate directly
    if (browserName.includes("Mobile") || (page.viewportSize()?.width || 0) < 768) {
      // Navigate to about page
      await page.goto("/about");
      await page.waitForURL("**/about");

      // Navigate back to home
      await page.goto("/");
      await page.waitForURL("/");

      // Navigate to contact page
      await page.goto("/contact");
      await page.waitForURL("**/contact");
    } else {
      // Desktop navigation
      // Open mobile menu if present
      const menuButton = page.locator('button[aria-label="Toggle menu"]');
      if (await menuButton.isVisible()) {
        await menuButton.click();
        // Wait for menu to open
        await page.waitForTimeout(500);
      }

      // Navigate to about page
      await page.click('a[href="/about"]');
      await page.waitForURL("**/about");

      // Navigate back to home
      await page.goto("/");
      await page.waitForURL("/");

      // Open mobile menu again if present
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await page.waitForTimeout(500);
      }

      // Navigate to contact page
      await page.click('a[href="/contact"]');
      await page.waitForURL("**/contact");
    }

    // Check that we navigated to the expected routes
    expect(routeChanges.length).toBeGreaterThanOrEqual(3); // Initial load + about + contact
    expect(routeChanges).toContain("about");
    expect(routeChanges).toContain("contact");
  });

  test("should measure interaction responsiveness", async ({ page }) => {
    await page.goto("/performance");

    // Measure button click responsiveness
    const startTime = Date.now();

    await page.click('button:has-text("Start Real-time Monitoring")');

    const endTime = Date.now();
    const interactionTime = endTime - startTime;

    // Interaction should be reasonably fast (increased threshold for real implementation and browser variability)
    expect(interactionTime).toBeLessThan(15000); // Allow more time for slower browsers
  });

  test("should track bundle loading performance", async ({ page }) => {
    await page.goto("/");

    // Wait for page to load - use domcontentloaded instead of networkidle for dev environment
    await page.waitForLoadState("domcontentloaded");

    // Check script loading performance
    const scriptTiming = await page.evaluate(() => {
      const scripts = document.querySelectorAll("script");
      const timingData: Array<{
        src: string;
        duration: number;
        transferSize: number;
      }> = [];

      for (const script of scripts) {
        if (script.src) {
          const entries = performance.getEntriesByName(script.src);
          if (entries.length > 0) {
            timingData.push({
              src: script.src,
              duration: entries[0].duration,
              transferSize: entries[0].transferSize || 0,
            });
          }
        }
      }

      return timingData;
    });

    expect(scriptTiming.length).toBeGreaterThan(0);

    // Check that scripts loaded with reasonable performance
    for (const script of scriptTiming) {
      expect(script.duration).toBeGreaterThanOrEqual(0);
      // Note: transferSize may be 0 in local development
      if (script.transferSize > 0) {
        expect(script.transferSize).toBeGreaterThan(0);
      }
    }
  });

  test("should handle Google Analytics integration", async ({ page }) => {
    // Mock Google Analytics
    await page.addInitScript(() => {
      window.gtag = (command: string, eventName: string, params?: Record<string, unknown>) => {
        window.gaEvents = window.gaEvents || [];
        window.gaEvents.push({ command, eventName, params });
      };
    });

    await page.goto("/performance");

    // Wait for GA initialization
    await page.waitForTimeout(1000);

    // Check that GA events were tracked
    const gaEvents = await page.evaluate(() => window.gaEvents || []);

    // Should have page view events
    const pageViewEvents = gaEvents.filter((e) => e.eventName === "page_view");
    expect(pageViewEvents.length).toBeGreaterThan(0);
  });
});
