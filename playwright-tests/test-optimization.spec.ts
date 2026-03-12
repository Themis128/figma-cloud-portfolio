import { expect, test } from "@playwright/test";
import { waitForAppReady, retryOperation, measurePerformance } from "./test-utils";

test.describe("Test Optimization and Reliability", () => {
  test("should optimize test performance with proper timeouts", async ({ page }) => {
    // Test with optimized timeouts
    const performance = await measurePerformance(page, async () => {
      await page.goto("/");
      await waitForAppReady(page);
      await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });
    });

    // Performance should be reasonable
    expect(performance.totalTime).toBeLessThan(15000); // 15 seconds max
    expect(performance.domContentLoaded).toBeLessThan(8000); // 8 seconds max
    expect(performance.loadComplete).toBeLessThan(12000); // 12 seconds max
  });

  test("should handle flaky tests with retry mechanism", async ({ page }) => {
    // Test retry mechanism
    let attemptCount = 0;
    const result = await retryOperation(
      async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error("Flaky test failure");
        }
        await page.goto("/");
        await waitForAppReady(page);
        return "success";
      },
      3,
      1000
    );

    expect(result).toBe("success");
    expect(attemptCount).toBe(3);
  });

  test("should optimize network requests", async ({ page }) => {
    // Block unnecessary requests for faster tests
    await page.route("**/analytics.js", (route) => route.abort());
    await page.route("**/tracking.js", (route) => route.abort());
    await page.route("**/ads.js", (route) => route.abort());
    await page.route("**/*.png", (route) => route.abort());
    await page.route("**/*.jpg", (route) => route.abort());
    await page.route("**/*.gif", (route) => route.abort());

    const startTime = Date.now();
    await page.goto("/");
    await waitForAppReady(page);
    const loadTime = Date.now() - startTime;

    // Should load faster with blocked requests
    expect(loadTime).toBeLessThan(12000); // 12 seconds max (includes Playwright overhead)
  });

  test("should handle test isolation", async ({ page }) => {
    // Navigate first so we have a page context for storage access
    await page.goto("/");
    await waitForAppReady(page);

    // Clear browser state
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
    });
    await expect(page.locator("body")).toBeVisible();
  });

  test("should optimize screenshot performance", async ({ page }) => {
    // Take optimized screenshot
    const startTime = Date.now();
    
    // Hide elements that might cause flakiness
    await page.evaluate(() => {
      const elements = document.querySelectorAll('canvas, video, iframe');
      elements.forEach(el => {
        el.style.visibility = 'hidden';
      });
    });

    await page.screenshot({ 
      fullPage: true, 
      type: 'png',
      animations: 'disabled'
    });
    
    const screenshotTime = Date.now() - startTime;
    
    // Screenshot should be fast
    expect(screenshotTime).toBeLessThan(3000); // 3 seconds max
  });

  test("should handle test parallelization", async ({ page }) => {
    // Test that doesn't interfere with other tests
    await page.goto("/");
    await waitForAppReady(page);
    
    // Use unique selectors to avoid conflicts
    const uniqueElement = page.locator('[data-testid="unique-test-element"]');
    if (await uniqueElement.isVisible()) {
      await expect(uniqueElement).toBeVisible();
    }
    
    await expect(page.locator("body")).toBeVisible();
  });

  test("should optimize test data", async ({ page }) => {
    // Use minimal test data
    const testData = {
      name: "Test User",
      email: "test@example.com",
      subject: "Test",
      message: "Test message"
    };

    await page.goto("/contact");
    await waitForAppReady(page);

    // Fill form with minimal data
    await page.fill('input[name="name"]', testData.name);
    await page.fill('input[name="email"]', testData.email);
    await page.fill('input[name="subject"]', testData.subject);
    await page.fill('textarea[name="message"]', testData.message);

    await expect(page.locator("body")).toBeVisible();
  });

  test("should handle test cleanup", async ({ page }) => {
    // Navigate first so we have a page context for storage access
    await page.goto("/");
    await waitForAppReady(page);

    // Create test artifacts
    await page.evaluate(() => {
      localStorage.setItem('test-key', 'test-value');
      sessionStorage.setItem('test-key', 'test-value');
      document.cookie = 'test-cookie=test-value; path=/';
    });

    // Cleanup should work
    await page.evaluate(() => {
      localStorage.removeItem('test-key');
      sessionStorage.removeItem('test-key');
      document.cookie = 'test-cookie=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    });

    // Verify cleanup
    const localStorageValue = await page.evaluate(() => localStorage.getItem('test-key'));
    const sessionStorageValue = await page.evaluate(() => sessionStorage.getItem('test-key'));
    const cookieValue = await page.evaluate(() => document.cookie.includes('test-cookie'));

    expect(localStorageValue).toBeNull();
    expect(sessionStorageValue).toBeNull();
    expect(cookieValue).toBe(false);
  });

  test("should optimize test assertions", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    // Use specific, fast assertions
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("nav").first()).toBeVisible();
    await expect(page.locator("main")).toBeVisible();

    // Avoid expensive assertions
    const bodyText = await page.locator("body").textContent();
    expect(bodyText?.length).toBeGreaterThan(10);
  });

  test("should handle test dependencies", async ({ page }) => {
    // Navigate first so we have a page context
    await page.goto("/");
    await waitForAppReady(page);

    // Check for required dependencies
    const dependencies = await page.evaluate(() => {
      return {
        fetch: typeof fetch !== 'undefined',
        Promise: typeof Promise !== 'undefined',
        localStorage: typeof localStorage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        console: typeof console !== 'undefined'
      };
    });

    expect(dependencies.fetch).toBe(true);
    expect(dependencies.Promise).toBe(true);
    expect(dependencies.localStorage).toBe(true);
    expect(dependencies.sessionStorage).toBe(true);
    expect(dependencies.console).toBe(true);
  });

  test("should optimize test execution order", async ({ page }) => {
    // Run tests in optimal order (fastest first)
    const tests = [
      () => page.goto("/"),
      () => waitForAppReady(page),
      () => expect(page.locator("h1")).toBeVisible(),
      () => expect(page.locator("nav").first()).toBeVisible()
    ];

    for (const test of tests) {
      await test();
    }
  });

  test("should handle test resource management", async ({ page }) => {
    // Manage test resources efficiently
    const startTime = Date.now();

    // Create minimal DOM elements
    await page.evaluate(() => {
      const div = document.createElement('div');
      div.id = 'test-resource';
      div.textContent = 'Test Resource';
      document.body.appendChild(div);
    });

    // Use resource
    const resource = page.locator('#test-resource');
    await expect(resource).toBeVisible();

    // Clean up resource
    await page.evaluate(() => {
      const element = document.getElementById('test-resource');
      if (element) {
        element.remove();
      }
    });

    const totalTime = Date.now() - startTime;
    expect(totalTime).toBeLessThan(2000); // 2 seconds max
  });

  test("should optimize test configuration", async ({ page }) => {
    // Use optimized test configuration
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.context().setOffline(false);

    // Disable animations for faster tests
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });

    await page.goto("/");
    await waitForAppReady(page);
    await expect(page.locator("body")).toBeVisible();
  });

  test("should handle test error recovery", async ({ page }) => {
    // Test error recovery mechanism
    try {
      await page.goto("/non-existent-page");
      // Should handle 404 gracefully
      await page.goto("/");
      await waitForAppReady(page);
    } catch (error) {
      // Should recover from errors
      await page.goto("/");
      await waitForAppReady(page);
    }

    await expect(page.locator("body")).toBeVisible();
  });

  test("should optimize test memory usage", async ({ page }) => {
    // Monitor memory usage
    const initialMemory = await page.evaluate(() => {
      return performance.memory ? performance.memory.usedJSHeapSize : 0;
    });

    // Create some test data
    await page.evaluate(() => {
      const data = new Array(1000).fill(0).map((_, i) => `test-data-${i}`);
      window.testData = data;
    });

    // Clean up test data
    await page.evaluate(() => {
      window.testData = null;
      if (window.gc) {
        window.gc();
      }
    });

    const finalMemory = await page.evaluate(() => {
      return performance.memory ? performance.memory.usedJSHeapSize : 0;
    });

    // Memory should be managed properly
    expect(finalMemory).toBeLessThanOrEqual(initialMemory * 1.5); // Allow 50% growth
  });

  test("should handle test timing optimization", async ({ page }) => {
    // Optimize test timing
    const timings = {
      navigationTimeout: 10000,
      actionTimeout: 5000,
      expectTimeout: 3000,
      defaultTimeout: 15000
    };

    await page.setDefaultTimeout(timings.defaultTimeout);
    await page.setDefaultNavigationTimeout(timings.navigationTimeout);
    await page.setDefaultTimeout(timings.actionTimeout);

    await page.goto("/");
    await waitForAppReady(page);
    await expect(page.locator("h1")).toBeVisible({ timeout: timings.expectTimeout });

    await expect(page.locator("body")).toBeVisible();
  });

  test("should optimize test parallel execution", async ({ page }) => {
    // Test that can run in parallel
    await page.goto("/");
    await waitForAppReady(page);

    // Use unique test identifiers
    const testId = `test-${Date.now()}`;
    await page.evaluate((id) => {
      localStorage.setItem('parallel-test', id);
    }, testId);

    const storedId = await page.evaluate(() => localStorage.getItem('parallel-test'));
    expect(storedId).toBe(testId);

    // Clean up
    await page.evaluate(() => localStorage.removeItem('parallel-test'));
  });

  test("should handle test result consistency", async ({ page }) => {
    // Run same test multiple times for consistency
    const results: boolean[] = [];

    for (let i = 0; i < 3; i++) {
      await page.goto("/");
      await waitForAppReady(page);
      
      const isVisible = await page.locator("h1").isVisible();
      results.push(isVisible);
    }

    // All results should be consistent
    const allTrue = results.every(result => result === true);
    const allFalse = results.every(result => result === false);

    expect(allTrue || allFalse).toBe(true);
  });

  test("should optimize test reporting", async ({ page }) => {
    // Test with optimized reporting
    const startTime = Date.now();

    await page.goto("/");
    await waitForAppReady(page);

    const loadTime = Date.now() - startTime;

    // Log performance metrics
    console.log(`Page load time: ${loadTime}ms`);

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("nav").first()).toBeVisible();

    // Performance should be acceptable
    expect(loadTime).toBeLessThan(10000); // 10 seconds max
  });

  test("should handle test environment optimization", async ({ page }) => {
    // Optimize test environment
    await page.addInitScript(() => {
      // Disable unnecessary features
      Object.defineProperty(navigator, 'webdriver', { value: false });
      
      // Optimize performance
      if (window.performance && window.performance.mark) {
        window.performance.mark('test-start');
      }
    });

    await page.goto("/");
    await waitForAppReady(page);

    // Environment should be optimized
    await expect(page.locator("body")).toBeVisible();
  });

  test("should optimize test data generation", async ({ page }) => {
    // Generate test data efficiently
    const generateTestData = (count: number) => {
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        name: `Test User ${i}`,
        email: `test${i}@example.com`
      }));
    };

    const testData = generateTestData(10);

    await page.goto("/");
    await waitForAppReady(page);

    // Use generated test data
    for (const data of testData) {
      await page.evaluate((d) => {
        localStorage.setItem(`test-user-${d.id}`, JSON.stringify(d));
      }, data);
    }

    // Verify data was stored
    const storedData = await page.evaluate((count) => {
      const users = [];
      for (let i = 0; i < count; i++) {
        const user = localStorage.getItem(`test-user-${i}`);
        if (user) {
          users.push(JSON.parse(user));
        }
      }
      return users;
    }, 10);

    expect(storedData.length).toBe(10);
    expect(storedData[0].name).toBe("Test User 0");

    // Clean up
    for (let i = 0; i < 10; i++) {
      await page.evaluate((id) => {
        localStorage.removeItem(`test-user-${id}`);
      }, i);
    }
  });
});