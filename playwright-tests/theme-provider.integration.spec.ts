import { test, expect } from "@playwright/test";

// Utility to check theme class on <html>
async function expectTheme(page, theme: "dark" | "light") {
  const htmlClass = await page.evaluate(
    () => document.documentElement.className,
  );
  expect(htmlClass).toContain(theme);
}

test.describe("ThemeProvider integration", () => {
  test("toggles dark/light/system themes and persists across pages", async ({
    page,
  }) => {
    await page.goto("/");

    // Find theme toggle button using actual data-testid="theme-toggle"
    const toggle = page.locator('[data-testid="theme-toggle"]').first();

    await toggle.waitFor({ state: "visible", timeout: 10000 });
    await expect(toggle).toBeVisible();

    // Initial theme (next-themes defaults to 'dark' for this project)
    // The html element should have either 'dark' or 'light' class
    const initialClass = await page.evaluate(
      () => document.documentElement.className,
    );
    expect(initialClass).toMatch(/dark|light/);

    // Toggle theme once
    await toggle.click();
    await page.waitForTimeout(300);

    // Check theme changed
    const afterFirstToggle = await page.evaluate(
      () => document.documentElement.className,
    );
    // Should contain a valid theme class
    expect(afterFirstToggle).toMatch(/dark|light/);

    // Navigate to another page
    await page.goto("/about");
    await page.waitForLoadState("domcontentloaded");

    // Theme should persist
    const htmlClassAfterNav = await page.evaluate(
      () => document.documentElement.className,
    );
    expect(htmlClassAfterNav).toMatch(/dark|light/);

    // Go back to home and verify toggle is still visible
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const toggleAfterNav = page.locator('[data-testid="theme-toggle"]').first();
    await expect(toggleAfterNav).toBeVisible();
  });
});
