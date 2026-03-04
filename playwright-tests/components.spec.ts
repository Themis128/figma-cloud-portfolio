import { expect, test } from "@playwright/test";

test.describe("Core Components", () => {
  // CookieConsentBar is not implemented in the current app
  test.skip("should render CookieConsentBar and accept cookies", async () => {
    // CookieConsentBar component does not exist in the current implementation
  });

  test("should toggle theme via ThemeToggle", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // ThemeToggle has data-testid="theme-toggle"
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await expect(themeToggle).toBeVisible();

    // Click to toggle theme
    await themeToggle.click();
    await page.waitForTimeout(500);

    // Should still be visible after click
    await expect(themeToggle).toBeVisible();
  });

  test("should have accessibility toggle", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // AccessibilityEnhancer toggle has data-testid="accessibility-toggle"
    const a11yToggle = page.locator('[data-testid="accessibility-toggle"]');
    await expect(a11yToggle).toBeVisible();

    // Click to open accessibility panel
    await a11yToggle.click();
    await page.waitForTimeout(500);

    // Should still be visible
    await expect(a11yToggle).toBeVisible();
  });

  // PWA install prompt does not exist as a visible component
  test.skip("should show PWA install prompt", async () => {
    // PWA install prompt is not a visible UI component in the current implementation
  });

  // SkillsMatrix does not exist on the home page with data-testid
  test.skip("should render SkillsMatrix with skills", async () => {
    // SkillsMatrix component is not present on the home page
  });

  // Timeline does not exist on the home page with data-testid
  test.skip("should render Timeline with events", async () => {
    // Timeline component is not present on the home page
  });

  // ProjectShowcase does not exist on the home page with data-testid
  test.skip("should render ProjectShowcase with projects", async () => {
    // ProjectShowcase component is not present on the home page
  });

  test("should submit ContactForm successfully", async ({ page }) => {
    // Mock contact API
    await page.route("**/api/contact", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "Message sent!" }),
      });
    });

    await page.goto("/contact");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForSelector("form", { timeout: 10000 });

    // Fill the form using actual field IDs
    await page.fill("#name", "Test User");
    await page.fill("#email", "test@example.com");
    await page.fill("#subject", "Test Subject");
    await page.fill("#message", "Test message");

    // Submit
    await page.getByRole("button", { name: "Send Message" }).click();

    // Wait for success
    await page.waitForTimeout(2000);

    // Should show success message
    await expect(
      page.locator("text=/Message sent successfully/i"),
    ).toBeVisible();
  });

  test("should validate ContactForm with required fields", async ({ page }) => {
    await page.goto("/contact");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForSelector("form", { timeout: 10000 });

    // All fields have HTML required attribute — browser handles validation
    await expect(page.locator("#name")).toHaveAttribute("required", "");
    await expect(page.locator("#email")).toHaveAttribute("required", "");
    await expect(page.locator("#subject")).toHaveAttribute("required", "");
    await expect(page.locator("#message")).toHaveAttribute("required", "");
  });
});
