import { expect, test } from "@playwright/test";

/**
 * Home Page Tests
 *
 * Tests the / (home) page content, hero section, CTAs, and layout.
 */

test.describe("Home Page — Hero Section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display owner name in heading", async ({ page }) => {
    await expect(page.getByText("Themistoklis", { exact: true })).toBeVisible();
    await expect(page.getByText("Baltzakis", { exact: true })).toBeVisible();
  });

  test("should display role title via TypeWriter", async ({ page }) => {
    // TypeWriter cycles through roles — at least one should appear within timeout
    await expect(
      page.getByText("IT Network Engineer", { exact: false }),
    ).toBeVisible({ timeout: 10000 });
  });

  test("should display description with experience", async ({ page }) => {
    await expect(
      page.getByText("15 years", { exact: false }),
    ).toBeVisible();
  });

  test("should display cyan gradient divider", async ({ page }) => {
    const divider = page.locator(
      ".bg-linear-to-r.from-cyan-400.to-blue-500.rounded-full",
    );
    await expect(divider.first()).toBeVisible();
  });

  test("should display availability badge", async ({ page }) => {
    await expect(
      page.getByText("Available for Consulting", { exact: true }),
    ).toBeVisible();
  });

  test("availability badge has pulsing green dot", async ({ page }) => {
    const pulseDot = page.locator(".animate-ping.bg-emerald-400");
    await expect(pulseDot).toBeAttached();
  });
});

test.describe("Home Page — CTA Buttons", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should have 'Learn More' button linking to /about", async ({
    page,
  }) => {
    const learnMore = page.locator('a[href="/about/"]').filter({
      hasText: "Learn More",
    });
    await expect(learnMore).toBeVisible();
  });

  test("should have 'Build Resume' button linking to /resume", async ({
    page,
  }) => {
    const buildResume = page
      .locator('main a[href="/resume/"]')
      .filter({ hasText: "Build Resume" });
    await expect(buildResume).toBeVisible();
  });

  test("should have 'Get In Touch' button linking to /contact", async ({
    page,
  }) => {
    const getInTouch = page
      .locator('main a[href="/contact/"]')
      .filter({ hasText: "Get In Touch" });
    await expect(getInTouch).toBeVisible();
  });

  test("CTA buttons navigate correctly", async ({ page }) => {
    const learnMore = page.locator('a[href="/about/"]').filter({
      hasText: "Learn More",
    });
    await learnMore.click();
    await expect(page).toHaveURL(/\/about/);
  });
});

test.describe("Home Page — Social Links", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should have email link", async ({ page }) => {
    const emailLink = page.locator(
      'a[href^="mailto:baltzakis.themis@gmail.com"]',
    );
    await expect(emailLink).toBeAttached();
  });

  test("should have LinkedIn link", async ({ page }) => {
    const linkedIn = page.locator('a[href*="linkedin.com/in/baltzakis-themis"]');
    await expect(linkedIn).toBeAttached();
  });

  test("external links open in new tab", async ({ page }) => {
    const linkedIn = page.locator('a[href*="linkedin.com/in/baltzakis-themis"]');
    await expect(linkedIn).toHaveAttribute("target", "_blank");
  });
});

test.describe("Home Page — Layout", () => {
  test("should display navigation with logo", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("nav").first()).toBeVisible();
    const logo = page.locator('a[aria-label="Home"]');
    await expect(logo).toBeVisible();
    await expect(logo).toContainText("TB");
  });

  test("should have main content area", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("#main-content")).toBeAttached();
  });

  test("should have hero heading with proper aria", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const heading = page.locator("#hero-heading");
    await expect(heading).toBeVisible();
  });
});
