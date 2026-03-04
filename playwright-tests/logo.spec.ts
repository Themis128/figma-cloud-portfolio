import { expect, test } from "@playwright/test";
import { waitForAppReady } from "./test-utils";

test.describe("Logo and Branding", () => {
  test("should display logo/branding in navigation", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    // The Navigation component uses text "TB" as the logo, not an image
    const logoLink = page.locator('a[href="/"]').first();
    await expect(logoLink).toBeVisible();

    const logoText = await logoLink.textContent();
    expect(logoText?.trim()).toBe("TB");
  });

  test("should have accessible home link", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    // The logo link has aria-label="Home"
    const logoLink = page.locator('a[aria-label="Home"]');
    await expect(logoLink).toBeVisible();
  });

  test("should navigate to home when logo is clicked", async ({ page }) => {
    await page.goto("/contact");
    await waitForAppReady(page);

    // Click the logo/home link
    const logoLink = page.locator('a[aria-label="Home"]');
    await logoLink.click();

    // Should navigate to home
    await page.waitForURL("**/");
    expect(page.url()).toMatch(/\/$/);
  });

  test("should have proper styling classes", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    const logoLink = page.locator('a[aria-label="Home"]');
    const className = await logoLink.getAttribute("class");

    // Should have font-bold and tracking-wider for the cyberpunk aesthetic
    expect(className).toContain("font-bold");
    expect(className).toContain("tracking-wider");
  });

  // The current Navigation uses text "TB" instead of an image — these tests are not applicable
  test.skip("should load logo with proper optimization", async () => {
    // Logo is text-based (TB), not an image
  });

  test.skip("should use modern image formats", async () => {
    // Logo is text-based (TB), not an image
  });
});
