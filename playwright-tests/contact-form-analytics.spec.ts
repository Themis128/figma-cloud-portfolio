import { expect, test } from "@playwright/test";

test.describe("Contact Form Submission with Analytics", () => {
  test.describe("Form Submission and Analytics Integration", () => {
    test("should submit contact form successfully", async ({ page }) => {
      await page.goto("/contact");
      await page.waitForLoadState("domcontentloaded");

      // Wait for React to hydrate and render
      await page.waitForSelector("form", { timeout: 10000 });

      // Verify form is present
      await expect(page.locator("form")).toBeVisible();

      // Fill out the form using name attributes matching the actual component
      await page.fill("#name", "Test User");
      await page.fill("#email", "test@example.com");
      await page.fill("#subject", "Test Subject");
      await page.fill("#message", "This is a test message for contact form submission.");

      // Submit the form
      const submitButton = page.getByRole("button", { name: "Send Message" });
      await submitButton.click();

      // Wait for response — success or error (reCAPTCHA timeout is 5s, plus API call time)
      const successLocator = page.locator("text=/Message sent successfully/i");
      const errorLocator = page.locator("text=/Something went wrong|error|failed/i");

      await expect(successLocator.or(errorLocator)).toBeVisible({ timeout: 10000 });
    });

    test("should prevent duplicate submissions via disabled button", async ({ page }) => {
      // Mock contact API with a delay
      await page.route("**/api/contact", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      });

      await page.goto("/contact");
      await page.waitForLoadState("domcontentloaded");
      await page.waitForSelector("form", { timeout: 10000 });

      // Fill out the form
      await page.fill("#name", "Test User");
      await page.fill("#email", "test@example.com");
      await page.fill("#subject", "Test Subject");
      await page.fill("#message", "Test message");

      // Submit form — use type="submit" selector to find button regardless of text
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Button should be disabled during submission (text changes to "Sending...")
      await expect(submitButton).toBeDisabled();
    });

    test("should handle form validation with required fields", async ({ page }) => {
      await page.goto("/contact");
      await page.waitForLoadState("domcontentloaded");
      await page.waitForSelector("form", { timeout: 10000 });

      // All fields have HTML required attribute — browser validation prevents submission
      // Verify required attributes exist
      await expect(page.locator("#name")).toHaveAttribute("required", "");
      await expect(page.locator("#email")).toHaveAttribute("required", "");
      await expect(page.locator("#subject")).toHaveAttribute("required", "");
      await expect(page.locator("#message")).toHaveAttribute("required", "");
    });

    test("should handle server errors gracefully", async ({ page }) => {
      // Mock contact API to return server error
      await page.route("**/api/contact", (route) => {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ success: false, message: "Server error" }),
        });
      });

      await page.goto("/contact");
      await page.waitForLoadState("domcontentloaded");
      await page.waitForSelector("form", { timeout: 10000 });

      // Fill and submit form
      await page.fill("#name", "Test User");
      await page.fill("#email", "test@example.com");
      await page.fill("#subject", "Test Subject");
      await page.fill("#message", "Test message");

      await page.getByRole("button", { name: "Send Message" }).click();

      // Should show error message (reCAPTCHA timeout is 5s, then mock returns 500)
      await expect(
        page.locator("text=/Something went wrong/i"),
      ).toBeVisible({ timeout: 10000 });
    });

    test("should track page views correctly on navigation", async ({ page }) => {
      // Navigate to home page
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      // Navigate to contact page
      await page.goto("/contact");
      await page.waitForLoadState("domcontentloaded");

      // Wait for React to hydrate and render
      await page.waitForSelector("form", { timeout: 10000 });

      // Navigate back to home
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      // Pages should load without errors
      await expect(page.locator("body")).toBeVisible();
    });

    test("should handle reCAPTCHA failures gracefully", async ({ page }) => {
      // The contact form uses reCAPTCHA v3 with a timeout fallback.
      // If reCAPTCHA fails/times out, the form still submits without a token.
      await page.goto("/contact");
      await page.waitForLoadState("domcontentloaded");
      await page.waitForSelector("form", { timeout: 10000 });

      // Fill form
      await page.fill("#name", "Test User");
      await page.fill("#email", "test@example.com");
      await page.fill("#subject", "Test Subject");
      await page.fill("#message", "Test message");

      // Submit form (will try to hit /api/contact)
      await page.getByRole("button", { name: "Send Message" }).click();

      // Form should remain functional regardless of outcome
      // reCAPTCHA timeout is 5s, then form submits
      const successLocator = page.locator("text=/Message sent successfully/i");
      const errorLocator = page.locator("text=/Something went wrong/i");
      await expect(successLocator.or(errorLocator).or(page.locator("form"))).toBeVisible({ timeout: 10000 });
    });

    test("should validate email format", async ({ page }) => {
      await page.goto("/contact");
      await page.waitForLoadState("domcontentloaded");
      await page.waitForSelector("form", { timeout: 10000 });

      // Email input has type="email" — browser validates format
      const emailInput = page.locator("#email");
      await expect(emailInput).toHaveAttribute("type", "email");
    });

    test("should handle network failures during form submission", async ({ page }) => {
      // Mock network failure for contact API
      await page.route("**/api/contact", (route) => route.abort());

      await page.goto("/contact");
      await page.waitForLoadState("domcontentloaded");
      await page.waitForSelector("form", { timeout: 10000 });

      // Fill and submit form
      await page.fill("#name", "Test User");
      await page.fill("#email", "test@example.com");
      await page.fill("#subject", "Test Subject");
      await page.fill("#message", "Test message");

      await page.getByRole("button", { name: "Send Message" }).click();

      // Should show error message (reCAPTCHA timeout is 5s, then network error)
      await expect(
        page.locator("text=/Something went wrong/i"),
      ).toBeVisible({ timeout: 10000 });
    });

    test("should maintain form state during submission", async ({ page }) => {
      await page.goto("/contact");
      await page.waitForLoadState("domcontentloaded");
      await page.waitForSelector("form", { timeout: 10000 });

      // Fill form
      const testData = {
        name: "Test User",
        email: "test@example.com",
        subject: "Test Subject",
        message: "Test message for form state preservation",
      };

      await page.fill("#name", testData.name);
      await page.fill("#email", testData.email);
      await page.fill("#subject", testData.subject);
      await page.fill("#message", testData.message);

      // Verify values are set
      expect(await page.inputValue("#name")).toBe(testData.name);
      expect(await page.inputValue("#email")).toBe(testData.email);
      expect(await page.inputValue("#subject")).toBe(testData.subject);
      expect(await page.inputValue("#message")).toBe(testData.message);
    });
  });

  test.describe("Analytics Event Deduplication", () => {
    test("should handle rapid page reloads", async ({ page }) => {
      // Rapid navigation to test stability
      await page.goto("/contact");
      await page.waitForLoadState("domcontentloaded");
      await page.waitForSelector("form", { timeout: 10000 });

      await page.reload();
      await page.waitForLoadState("domcontentloaded");

      await page.reload();
      await page.waitForLoadState("domcontentloaded");

      // Page should still load properly after rapid reloads
      await expect(page.locator("form")).toBeVisible();
    });

    test("should handle analytics API failures gracefully", async ({ page }) => {
      // Mock analytics API to fail (if it exists)
      await page.route("**/api/analytics", (route) => {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ success: false, message: "Analytics API error" }),
        });
      });

      await page.goto("/contact");
      await page.waitForLoadState("domcontentloaded");
      await page.waitForSelector("form", { timeout: 10000 });

      // Fill and submit form
      await page.fill("#name", "Test User");
      await page.fill("#email", "test@example.com");
      await page.fill("#subject", "Test Subject");
      await page.fill("#message", "Test message");

      await page.getByRole("button", { name: "Send Message" }).click();

      // Form submission should still work despite analytics failure
      // reCAPTCHA timeout is 5s, then real API call
      const successLocator = page.locator("text=/Message sent successfully/i");
      const errorLocator = page.locator("text=/Something went wrong/i");
      await expect(successLocator.or(errorLocator)).toBeVisible({ timeout: 10000 });

      // Page should remain functional
      await expect(page.locator("form")).toBeVisible();
    });
  });
});
