import { expect, test } from "@playwright/test";

/**
 * Theme Toggle Tests
 *
 * Tests the ThemeToggle component behavior: switching between dark/light mode,
 * persistence, icon states, and accessibility.
 */

/** Helper: check if body has a specific theme class */
async function hasThemeClass(page: import("@playwright/test").Page, cls: string): Promise<boolean> {
  return page.evaluate((c) => document.body.classList.contains(c), cls);
}

test.describe("Theme Toggle | Desktop", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display theme toggle button in desktop navbar", async ({ page }) => {
    const toggle = page.getByTestId("theme-toggle").first();
    await expect(toggle).toBeVisible();
  });

  test("should have correct aria-label", async ({ page }) => {
    const toggle = page.getByTestId("theme-toggle").first();
    await expect(toggle).toHaveAttribute("aria-label", "Toggle theme");
  });

  test("should have data-testid attribute", async ({ page }) => {
    const toggle = page.getByTestId("theme-toggle").first();
    await expect(toggle).toBeAttached();
  });

  test("should toggle body class between dark and light on click", async ({ page }) => {
    const toggle = page.getByTestId("theme-toggle").first();

    const initialIsDark = await hasThemeClass(page, "dark");

    // First click should switch mode
    await toggle.click();
    await page.waitForTimeout(300);

    const afterFirstClick = await hasThemeClass(page, "dark");
    expect(afterFirstClick).toBe(!initialIsDark);

    // Second click should switch back
    await toggle.click();
    await page.waitForTimeout(300);

    const afterSecondClick = await hasThemeClass(page, "dark");
    expect(afterSecondClick).toBe(initialIsDark);
  });

  test("should apply dark class to body in dark mode", async ({ page }) => {
    const toggle = page.getByTestId("theme-toggle").first();
    const isDark = await hasThemeClass(page, "dark");

    if (!isDark) {
      await toggle.click();
      await page.waitForTimeout(300);
    }

    expect(await hasThemeClass(page, "dark")).toBe(true);
  });

  test("should apply light class to body in light mode", async ({ page }) => {
    const toggle = page.getByTestId("theme-toggle").first();
    const isDark = await hasThemeClass(page, "dark");

    if (isDark) {
      await toggle.click();
      await page.waitForTimeout(300);
    }

    expect(await hasThemeClass(page, "light")).toBe(true);
  });

  test("should have Sun and Moon SVG icons", async ({ page }) => {
    const toggle = page.getByTestId("theme-toggle").first();
    const svgs = toggle.locator("svg");
    expect(await svgs.count()).toBeGreaterThanOrEqual(2);
  });

  test("should persist theme after page reload", async ({ page }) => {
    const toggle = page.getByTestId("theme-toggle").first();

    // Switch to dark mode
    const isDark = await hasThemeClass(page, "dark");
    if (!isDark) {
      await toggle.click();
      await page.waitForTimeout(300);
    }
    expect(await hasThemeClass(page, "dark")).toBe(true);

    // Reload
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);

    // Should still be dark
    expect(await hasThemeClass(page, "dark")).toBe(true);
  });

  test("should handle multiple rapid toggles without getting stuck", async ({ page }) => {
    const toggle = page.getByTestId("theme-toggle").first();
    const initialIsDark = await hasThemeClass(page, "dark");

    // 6 rapid toggles (even number = back to original)
    for (let i = 0; i < 6; i++) {
      await toggle.click();
    }
    await page.waitForTimeout(300);

    expect(await hasThemeClass(page, "dark")).toBe(initialIsDark);
  });

  test("should contain screen-reader-only text", async ({ page }) => {
    const toggle = page.getByTestId("theme-toggle").first();
    const srText = toggle.locator(".sr-only");
    await expect(srText).toHaveText("Toggle theme");
  });

  test("should have tooltip on theme toggle", async ({ page }) => {
    const toggle = page.getByTestId("theme-toggle").first();
    await expect(toggle).toHaveAttribute("title", /theme/i);
  });
});

test.describe("Theme Toggle | Mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("should display theme toggle in mobile toolbar", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const mobileBar = page.locator("header .flex.md\\:hidden");
    const toggle = mobileBar.getByTestId("theme-toggle");
    await expect(toggle).toBeVisible();
  });

  test("should toggle theme on mobile", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const mobileBar = page.locator("header .flex.md\\:hidden");
    const toggle = mobileBar.getByTestId("theme-toggle");

    const initialIsDark = await hasThemeClass(page, "dark");
    await toggle.click();
    await page.waitForTimeout(300);

    expect(await hasThemeClass(page, "dark")).toBe(!initialIsDark);
  });
});
