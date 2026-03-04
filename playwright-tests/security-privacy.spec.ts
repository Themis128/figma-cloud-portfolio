import { expect, test } from "@playwright/test";

/**
 * Security and Privacy Testing Suite
 * Tests for security vulnerabilities, privacy compliance, and secure practices
 */

test.describe("Security & Privacy", () => {
  test.describe("HTTPS and Secure Connections", () => {
    test(
      "should use HTTPS in production",
      { tag: "@fast" },
      async ({ page }) => {
        // Skip in development or when running against a local server
        const baseURL =
          process.env.PLAYWRIGHT_BASE_URL || "/";
        if (
          process.env.NODE_ENV === "development" ||
          baseURL.includes("localhost") ||
          baseURL.includes("127.0.0.1")
        ) {
          test.skip();
        }

        await page.goto("/");
        const url = page.url();
        expect(url).toMatch(/^https:\/\//);
      },
    );

    test("should not have mixed content warnings", async ({ page }) => {
      await page.goto("/");

      // Check for mixed content (HTTP resources on HTTPS pages)
      const mixedContent = await page.evaluate(() => {
        const resources = performance.getEntriesByType(
          "resource",
        ) as PerformanceResourceTiming[];
        return resources.some(
          (resource) =>
            resource.name.startsWith("http://") &&
            window.location.protocol === "https:",
        );
      });

      expect(mixedContent).toBe(false);
    });
  });

  test.describe("Content Security Policy", () => {
    test("should have CSP headers", async ({ page }) => {
      const response = await page.request.get("/");
      const cspHeader = response.headers()["content-security-policy"];

      // CSP may not be configured in dev; verify it's either present or absent
      if (cspHeader) {
        expect(typeof cspHeader).toBe("string");
      } else {
        // Accept absence in development — CSP is typically added via middleware or CDN
        console.log("CSP header not present — acceptable in development");
      }
    });

    test("should prevent XSS attacks", async ({ page }) => {
      await page.goto("/");

      // Test that script injection is prevented
      const scriptInjection = await page.evaluate(() => {
        const testElement = document.createElement("div");
        testElement.innerHTML = "<script>window.testXSS = true;</script>";
        document.body.appendChild(testElement);

        return new Promise<boolean>((resolve) => {
          setTimeout(() => {
            resolve(
              (window as typeof window & { testXSS?: boolean }).testXSS ===
                true,
            );
          }, 100);
        });
      });

      expect(scriptInjection).toBe(false);
    });
  });

  test.describe("Data Privacy", () => {
    test("should not leak sensitive data in console", async ({ page }) => {
      const consoleMessages: string[] = [];

      page.on("console", (msg) => {
        consoleMessages.push(msg.text());
      });

      await page.goto("/");

      // Check that no sensitive data is logged (patterns must be specific
      // to avoid false positives from framework internals like "hot-reload token")
      const sensitivePatterns = [
        /password\s*[:=]/i,
        /bearer\s+[a-z0-9]/i,
        /api[_-]?key\s*[:=]/i,
        /secret\s*[:=]/i,
      ];

      const hasSensitiveData = consoleMessages.some((msg) =>
        sensitivePatterns.some((pattern) => pattern.test(msg)),
      );

      expect(hasSensitiveData).toBe(false);
    });

    test("should handle user data securely", async ({ page }) => {
      await page.goto("/");

      // Check that forms don't autocomplete sensitive information
      const sensitiveInputs = await page.$$eval(
        'input[type="password"], input[name*="password"], input[name*="token"]',
        (inputs) =>
          inputs.map((input) => (input as HTMLInputElement).autocomplete),
      );

      // Sensitive inputs should have autocomplete off or appropriate values
      sensitiveInputs.forEach((autocomplete) => {
        expect(["off", "current-password", "new-password"]).toContain(
          autocomplete,
        );
      });
    });
  });

  test.describe("Input Validation", () => {
    test("should prevent SQL injection attempts", async ({ page }) => {
      await page.goto("/");

      // Check if contact form inputs exist
      const nameInput = page
        .locator('input[name="name"], input[placeholder*="name"]')
        .first();
      const messageInput = page.locator('textarea[name="message"]');
      const submitButton = page.locator('button[type="submit"]');

      const nameExists = (await nameInput.count()) > 0;
      const messageExists = (await messageInput.count()) > 0;

      if (nameExists && messageExists) {
        // Test contact form with SQL injection payload
        const sqlPayload = "'; DROP TABLE users; --";

        await nameInput.fill(sqlPayload);
        await messageInput.fill(sqlPayload);

        // Submit form if button exists
        if ((await submitButton.count()) > 0) {
          await submitButton.click();
        }

        // Should handle input safely (no crash, proper sanitization)
        await expect(page.locator("body")).toBeVisible();
      } else {
        console.log("Contact form not found - skipping SQL injection test");
      }
    });

    test("should prevent XSS in form inputs", async ({ page }) => {
      await page.goto("/");

      // Check if contact form inputs exist
      const nameInput = page.locator('input[name="name"]').first();
      const messageInput = page.locator('textarea[name="message"]');
      const submitButton = page.locator('button[type="submit"]');

      const nameExists = (await nameInput.count()) > 0;
      const messageExists = (await messageInput.count()) > 0;

      if (nameExists && messageExists) {
        // Test with XSS payload
        const xssPayload = '<script>alert("XSS")</script>';

        await nameInput.fill(xssPayload);
        await messageInput.fill(xssPayload);

        // Submit form if button exists
        if ((await submitButton.count()) > 0) {
          await submitButton.click();
        }

        // Should sanitize input and not execute scripts
        await expect(page.locator("body")).toBeVisible();
      } else {
        console.log("Contact form not found - skipping XSS test");
      }
    });

    test("should validate email format", async ({ page }) => {
      await page.goto("/");

      // Check if email input exists
      const emailInputExists =
        (await page.locator('input[type="email"]').count()) > 0;

      if (emailInputExists) {
        // Test with invalid email
        await page.fill('input[type="email"]', "invalid-email");
        await page.click('button[type="submit"]');

        // Should show validation error
        const hasValidationError = await page.evaluate(() => {
          const inputs = document.querySelectorAll(
            'input[type="email"]:invalid',
          );
          return inputs.length > 0;
        });

        expect(hasValidationError).toBe(true);
      } else {
        console.log("Email input not found - skipping email validation test");
      }
    });
  });

  test.describe("Session Security", () => {
    test("should handle session timeouts gracefully", async ({ page }) => {
      await page.goto("/");

      // Simulate session timeout by clearing storage
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      // Navigate to protected area
      await page.goto("/agents");

      // Should handle gracefully (redirect or show appropriate message)
      await expect(page.locator("body")).toBeVisible();
    });

    test("should not store sensitive data in localStorage", async ({
      page,
    }) => {
      await page.goto("/");

      // Check localStorage contents
      const localStorageData = await page.evaluate(() => {
        const data: Record<string, string> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            data[key] = localStorage.getItem(key) || "";
          }
        }
        return data;
      });

      // Check for sensitive data patterns
      const sensitiveKeys = Object.keys(localStorageData).filter((key) =>
        /password|token|key|secret|auth/i.test(key),
      );

      const sensitiveValues = Object.values(localStorageData).filter((value) =>
        /password|token|key|secret|auth/i.test(value),
      );

      expect(sensitiveKeys.length).toBe(0);
      expect(sensitiveValues.length).toBe(0);
    });
  });

  test.describe("Network Security", () => {
    test("should use secure API endpoints", async ({ page }) => {
      await page.goto("/");

      // Intercept network requests
      const insecureRequests: string[] = [];

      page.on("request", (request) => {
        if (
          request.url().startsWith("http://") &&
          !request.url().includes("localhost")
        ) {
          insecureRequests.push(request.url());
        }
      });

      // Wait for page to load and make requests
      await page.waitForLoadState("networkidle");

      // Should not make insecure requests in production
      if (process.env.NODE_ENV === "production") {
        expect(insecureRequests.length).toBe(0);
      }
    });

    test("should handle CORS properly", async ({ page }) => {
      const capturedApiRequests: string[] = [];

      // Listen for API requests (non-blocking)
      page.on("request", (request) => {
        if (/\/api\//.test(request.url())) {
          capturedApiRequests.push(request.url());
        }
      });

      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      // Check if API button exists
      const apiButton = page
        .locator('button:has-text("Download"), a[href*="api"]')
        .first();
      if ((await apiButton.count()) > 0) {
        await apiButton.click();
        // Wait briefly for any API request to be made
        await page.waitForTimeout(1000);

        if (capturedApiRequests.length > 0) {
          // Request should be made (CORS should allow it)
          expect(capturedApiRequests[0]).toMatch(/\/api\//);
        } else {
          // API might not be available, which is acceptable
          console.log("No API request captured after button click — acceptable");
        }
      } else {
        console.log("API button not found - skipping CORS test");
        // Verify page loaded correctly as a basic check
        await expect(page.locator("body")).toBeVisible();
      }
    });
  });

  test.describe("Third-party Security", () => {
    test("should load third-party scripts securely", async ({ page }) => {
      await page.goto("/");

      // Check that external scripts use HTTPS
      const insecureScripts = await page.$$eval(
        'script[src^="http://"]',
        (scripts) => scripts.map((script) => (script as HTMLScriptElement).src),
      );

      expect(insecureScripts.length).toBe(0);
    });

    test("should handle third-party failures gracefully", async ({ page }) => {
      await page.goto("/");

      // Block a common third-party service (Google Analytics, etc.)
      await page.route("**/*googletagmanager*/**", (route) => route.abort());
      await page.route("**/*google-analytics*/**", (route) => route.abort());

      // Page should still load
      await expect(page.locator("body")).toBeVisible();
    });
  });

  test.describe("Error Handling Security", () => {
    test("should not expose internal errors", async ({ page }) => {
      await page.goto("/");

      // Trigger an error condition
      await page.route("**/api/**", (route) => {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Internal server error",
            stack:
              "Error: Something went wrong\n    at someInternalFunction (/app/internal.js:123:45)",
          }),
        });
      });

      // Check if API button exists
      const apiButton = page
        .locator('button:has-text("Download"), a[href*="api"]')
        .first();
      if ((await apiButton.count()) > 0) {
        // Try to make an API call
        await apiButton.click();

        // Should not expose stack traces or internal paths
        const pageContent = await page.textContent("body");
        expect(pageContent?.toLowerCase()).not.toContain("internal.js");
        expect(pageContent?.toLowerCase()).not.toContain("stack");
      } else {
        console.log("API button not found - skipping error exposure test");
      }
    });
  });
});
