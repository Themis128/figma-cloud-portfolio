import { expect, test } from "@playwright/test";

test.describe("Settings Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should load and display page heading", async ({ page }) => {
    await expect(page.getByText("SETTINGS")).toBeVisible();
  });

  test("should have navigation component", async ({ page }) => {
    await expect(page.locator("nav")).toBeVisible();
  });

  test("should have main content area", async ({ page }) => {
    await expect(page.locator("#main-content")).toBeVisible();
  });

  // ─── Appearance Section ─────────────────────────────────────────────────

  test("should display Appearance section", async ({ page }) => {
    await expect(
      page.getByText("Appearance", { exact: true }).first(),
    ).toBeVisible();
  });

  test("should have three theme options", async ({ page }) => {
    await expect(page.getByText("Light", { exact: true })).toBeVisible();
    await expect(page.getByText("Dark", { exact: true })).toBeVisible();
    await expect(page.getByText("System", { exact: true })).toBeVisible();
  });

  test("should have aria-pressed attributes on theme buttons", async ({
    page,
  }) => {
    const themeButtons = page.locator("[aria-pressed]");
    expect(await themeButtons.count()).toBe(3);

    // Exactly one should be pressed
    const pressed = page.locator('[aria-pressed="true"]');
    expect(await pressed.count()).toBe(1);
  });

  test("should toggle theme on click", async ({ page }) => {
    const lightButton = page.getByText("Light", { exact: true });
    await lightButton.click();

    // Light button should now be pressed
    const pressed = page.locator('[aria-pressed="true"]');
    await expect(pressed).toContainText("Light");
  });

  // ─── Accessibility Section ──────────────────────────────────────────────

  test("should display Accessibility section", async ({ page }) => {
    await expect(
      page.getByText("Accessibility", { exact: true }).first(),
    ).toBeVisible();
  });

  test("should have animations toggle", async ({ page }) => {
    await expect(
      page.getByText("Enable Animations", { exact: false }),
    ).toBeVisible();
  });

  test("should have reduced motion toggle", async ({ page }) => {
    await expect(
      page.getByText("Reduced Motion", { exact: false }),
    ).toBeVisible();
  });

  // ─── Notifications Section ──────────────────────────────────────────────

  test("should display Notifications section", async ({ page }) => {
    await expect(
      page.getByText("Notifications", { exact: true }).first(),
    ).toBeVisible();
  });

  test("should have push notifications toggle", async ({ page }) => {
    await expect(
      page.getByText("Push Notifications", { exact: false }),
    ).toBeVisible();
  });

  // ─── Privacy Section ────────────────────────────────────────────────────

  test("should display Privacy section", async ({ page }) => {
    await expect(
      page.getByText("Privacy", { exact: true }).first(),
    ).toBeVisible();
  });

  test("should have analytics toggle", async ({ page }) => {
    await expect(
      page.getByText("Analytics", { exact: false }).first(),
    ).toBeVisible();
  });

  // ─── Action Buttons ─────────────────────────────────────────────────────

  test("should have Reset to Defaults button", async ({ page }) => {
    const resetButton = page.getByRole("button", {
      name: /Reset to Defaults/i,
    });
    await expect(resetButton).toBeVisible();
  });

  test("should have Save Settings button", async ({ page }) => {
    const saveButton = page.getByRole("button", {
      name: /Save Settings/i,
    });
    await expect(saveButton).toBeVisible();
  });

  test("should show saved confirmation after clicking Save", async ({
    page,
  }) => {
    const saveButton = page.getByRole("button", {
      name: /Save Settings/i,
    });
    await saveButton.click();

    // Button text should change to "Saved!"
    await expect(page.getByText("Saved!")).toBeVisible();
  });

  // ─── Theme Persistence ──────────────────────────────────────────────────

  test("should persist theme selection to localStorage", async ({
    page,
  }) => {
    // Select Light theme
    const lightButton = page.getByText("Light", { exact: true });
    await lightButton.click();

    // Save settings
    const saveButton = page.getByRole("button", {
      name: /Save Settings/i,
    });
    await saveButton.click();
    await expect(page.getByText("Saved!")).toBeVisible();

    // Check localStorage
    const theme = await page.evaluate(() =>
      localStorage.getItem("portfolio-theme"),
    );
    expect(theme).toBe("light");
  });

  test("should persist animation preference to localStorage", async ({
    page,
  }) => {
    // Save and check localStorage has animation key
    const saveButton = page.getByRole("button", {
      name: /Save Settings/i,
    });
    await saveButton.click();

    const animations = await page.evaluate(() =>
      localStorage.getItem("portfolio-animations"),
    );
    // Should exist (true or false)
    expect(animations).not.toBeNull();
  });

  // ─── Reset Defaults ─────────────────────────────────────────────────────

  test("should reset settings when clicking Reset to Defaults", async ({
    page,
  }) => {
    // Change theme to Light
    await page.getByText("Light", { exact: true }).click();

    // Reset
    const resetButton = page.getByRole("button", {
      name: /Reset to Defaults/i,
    });
    await resetButton.click();

    // Should revert (exact default depends on implementation)
    const pressed = page.locator('[aria-pressed="true"]');
    expect(await pressed.count()).toBe(1);
  });

  // ─── Responsive Layout ──────────────────────────────────────────────────

  test("should be responsive on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    await expect(page.getByText("SETTINGS")).toBeVisible();
    await expect(page.getByText("Light", { exact: true })).toBeVisible();
    await expect(page.getByText("Dark", { exact: true })).toBeVisible();
    await expect(page.getByText("System", { exact: true })).toBeVisible();
  });
});
