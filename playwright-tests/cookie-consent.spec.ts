import { expect, test } from "@playwright/test";

/**
 * Cookie Consent Banner Tests
 *
 * Tests the CookieConsentBanner component: simple view (accept/reject/customise),
 * customise view (toggle switches, save preferences), localStorage persistence,
 * accessibility (role="dialog"), and the ManageCookiesButton footer link.
 */

const STORAGE_KEY = "cookie-consent";

test.describe("Cookie Consent Banner", () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookie consent state before each test so the banner appears
    await page.goto("/");
    await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
  });

  test("banner appears on first visit", async ({ page }) => {
    const banner = page.locator('[role="dialog"][aria-label="Cookie consent"]');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("This site uses cookies");
  });

  test("Accept All button hides banner and sets localStorage", async ({
    page,
  }) => {
    const banner = page.locator('[role="dialog"][aria-label="Cookie consent"]');
    await expect(banner).toBeVisible();

    await page.getByRole("button", { name: "Accept all cookies" }).click();

    await expect(banner).not.toBeVisible();

    const stored = await page.evaluate(
      (key) => localStorage.getItem(key),
      STORAGE_KEY,
    );
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.essential).toBe(true);
    expect(parsed.analytics).toBe(true);
    expect(parsed.marketing).toBe(true);
    expect(parsed.timestamp).toBeTruthy();
  });

  test("Reject Non-Essential button hides banner and sets localStorage", async ({
    page,
  }) => {
    const banner = page.locator('[role="dialog"][aria-label="Cookie consent"]');
    await expect(banner).toBeVisible();

    await page
      .getByRole("button", { name: "Reject non-essential cookies" })
      .click();

    await expect(banner).not.toBeVisible();

    const stored = await page.evaluate(
      (key) => localStorage.getItem(key),
      STORAGE_KEY,
    );
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.essential).toBe(true);
    expect(parsed.analytics).toBe(false);
    expect(parsed.marketing).toBe(false);
    expect(parsed.timestamp).toBeTruthy();
  });

  test("Customise button shows toggle switches", async ({ page }) => {
    await page
      .getByRole("button", { name: "Customise cookie preferences" })
      .click();

    // Customise view heading
    await expect(page.getByText("Cookie Preferences")).toBeVisible();

    // Three consent rows should be visible
    await expect(page.getByText("Essential")).toBeVisible();
    await expect(page.getByText("Analytics")).toBeVisible();
    await expect(page.getByText("Marketing")).toBeVisible();

    // Save Preferences button should be visible
    await expect(
      page.getByRole("button", { name: "Save cookie preferences" }),
    ).toBeVisible();
  });

  test("Essential cookies toggle is always on and disabled", async ({
    page,
  }) => {
    await page
      .getByRole("button", { name: "Customise cookie preferences" })
      .click();

    const essentialSwitch = page.locator("#consent-essential");
    await expect(essentialSwitch).toBeVisible();
    await expect(essentialSwitch).toBeDisabled();
    await expect(essentialSwitch).toHaveAttribute("data-state", "checked");

    // "(always on)" label should be present
    await expect(page.getByText("(always on)")).toBeVisible();
  });

  test("Analytics toggle can be toggled on and off", async ({ page }) => {
    await page
      .getByRole("button", { name: "Customise cookie preferences" })
      .click();

    const analyticsSwitch = page.locator("#consent-analytics");
    await expect(analyticsSwitch).toBeVisible();
    await expect(analyticsSwitch).not.toBeDisabled();

    // Default state should be unchecked
    await expect(analyticsSwitch).toHaveAttribute("data-state", "unchecked");

    // Toggle on
    await analyticsSwitch.click();
    await expect(analyticsSwitch).toHaveAttribute("data-state", "checked");

    // Toggle off
    await analyticsSwitch.click();
    await expect(analyticsSwitch).toHaveAttribute("data-state", "unchecked");
  });

  test("Marketing toggle can be toggled on and off", async ({ page }) => {
    await page
      .getByRole("button", { name: "Customise cookie preferences" })
      .click();

    const marketingSwitch = page.locator("#consent-marketing");
    await expect(marketingSwitch).toBeVisible();
    await expect(marketingSwitch).not.toBeDisabled();

    // Default state should be unchecked
    await expect(marketingSwitch).toHaveAttribute("data-state", "unchecked");

    // Toggle on
    await marketingSwitch.click();
    await expect(marketingSwitch).toHaveAttribute("data-state", "checked");

    // Toggle off
    await marketingSwitch.click();
    await expect(marketingSwitch).toHaveAttribute("data-state", "unchecked");
  });

  test("Save Preferences from customise view hides banner and persists selection", async ({
    page,
  }) => {
    const banner = page.locator('[role="dialog"][aria-label="Cookie consent"]');

    await page
      .getByRole("button", { name: "Customise cookie preferences" })
      .click();

    // Enable analytics, leave marketing off
    await page.locator("#consent-analytics").click();

    await page
      .getByRole("button", { name: "Save cookie preferences" })
      .click();

    await expect(banner).not.toBeVisible();

    const stored = await page.evaluate(
      (key) => localStorage.getItem(key),
      STORAGE_KEY,
    );
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.essential).toBe(true);
    expect(parsed.analytics).toBe(true);
    expect(parsed.marketing).toBe(false);
    expect(parsed.timestamp).toBeTruthy();
  });

  test("banner does NOT reappear after accepting (localStorage persisted)", async ({
    page,
  }) => {
    // Accept all cookies
    await page.getByRole("button", { name: "Accept all cookies" }).click();
    const banner = page.locator('[role="dialog"][aria-label="Cookie consent"]');
    await expect(banner).not.toBeVisible();

    // Navigate to another page and back
    await page.goto("/about/");
    await page.waitForLoadState("domcontentloaded");
    await expect(banner).not.toBeVisible();

    // Reload the page
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    await expect(banner).not.toBeVisible();
  });

  test("banner reappears after clearing localStorage", async ({ page }) => {
    // Accept all
    await page.getByRole("button", { name: "Accept all cookies" }).click();
    const banner = page.locator('[role="dialog"][aria-label="Cookie consent"]');
    await expect(banner).not.toBeVisible();

    // Clear localStorage and reload
    await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    await expect(banner).toBeVisible();
  });

  test('banner has accessible role="dialog" and aria attributes', async ({
    page,
  }) => {
    const banner = page.locator('[role="dialog"]');
    await expect(banner).toBeVisible();
    await expect(banner).toHaveAttribute("aria-label", "Cookie consent");
    await expect(banner).toHaveAttribute("aria-modal", "true");
  });

  test("banner contains Privacy Policy and Cookie Policy links", async ({
    page,
  }) => {
    const banner = page.locator('[role="dialog"][aria-label="Cookie consent"]');
    await expect(banner).toBeVisible();

    const privacyLink = banner.locator('a[href="/privacy/"]');
    await expect(privacyLink).toBeVisible();
    await expect(privacyLink).toHaveText("Privacy Policy");

    const cookieLink = banner.locator('a[href="/cookies/"]');
    await expect(cookieLink).toBeVisible();
    await expect(cookieLink).toHaveText("Cookie Policy");
  });

  test("Back button in customise view returns to simple view", async ({
    page,
  }) => {
    await page
      .getByRole("button", { name: "Customise cookie preferences" })
      .click();

    // Verify we are in customise view
    await expect(page.getByText("Cookie Preferences")).toBeVisible();

    // Click back
    await page
      .getByRole("button", { name: "Go back to simple cookie banner" })
      .click();

    // Verify we are back to simple view
    await expect(page.getByText("Cookie Preferences")).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "Accept all cookies" }),
    ).toBeVisible();
  });
});

test.describe("Cookie Consent Banner | Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("banner renders correctly on mobile viewport", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(
      (key) => localStorage.removeItem(key),
      STORAGE_KEY,
    );
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    const banner = page.locator('[role="dialog"][aria-label="Cookie consent"]');
    await expect(banner).toBeVisible();

    // All three action buttons should be visible
    await expect(
      page.getByRole("button", { name: "Reject non-essential cookies" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Customise cookie preferences" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Accept all cookies" }),
    ).toBeVisible();

    // Banner should span full width at the bottom
    const box = await banner.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(375);
  });
});

test.describe("Manage Cookies Footer Link", () => {
  test("Manage Cookies button in footer re-opens the banner", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // First accept cookies to dismiss the banner
    const banner = page.locator('[role="dialog"][aria-label="Cookie consent"]');
    if (await banner.isVisible()) {
      await page.getByRole("button", { name: "Accept all cookies" }).click();
      await expect(banner).not.toBeVisible();
    }

    // Scroll to footer and click Manage Cookies
    const manageCookiesBtn = page.getByRole("button", {
      name: "Manage cookie preferences",
    });
    await manageCookiesBtn.scrollIntoViewIfNeeded();
    await manageCookiesBtn.click();

    // Banner should reappear
    await expect(banner).toBeVisible();

    // localStorage should have been cleared (resetConsent removes the key)
    const stored = await page.evaluate(
      (key) => localStorage.getItem(key),
      STORAGE_KEY,
    );
    expect(stored).toBeNull();
  });
});
