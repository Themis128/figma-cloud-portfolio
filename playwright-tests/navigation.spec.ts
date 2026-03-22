import { expect, test } from "@playwright/test";

/**
 * Navigation Tests
 *
 * Tests the navigation bar behavior, active states, mobile menu, and utilities.
 */

test.describe("Navigation — Desktop", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("should display logo linking to home", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const logo = page.locator('a[aria-label="Home"]');
    await expect(logo).toBeVisible();
    await expect(logo).toContainText("TB");
    await expect(logo).toHaveAttribute("href", "/");
  });

  test("should display all 7 nav links on desktop", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const navLinks = [
      "Home",
      "About",
      "Resume",
      "Contact",
      "Performance",
      "Agents",
      "Admin",
    ];

    for (const name of navLinks) {
      const link = page.locator("nav").locator("a", { hasText: name }).first();
      await expect(link).toBeVisible();
    }
  });

  test("should highlight active link on home page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Active link gets border-b-2 style (use .first() to avoid mobile nav duplicate)
    const homeLink = page.locator('nav a[href="/"]').filter({ hasText: "Home" }).first();
    await expect(homeLink).toHaveClass(/border-cyan-400/);
  });

  test("should highlight About link when on about page", async ({ page }) => {
    await page.goto("/about/");
    await page.waitForLoadState("networkidle");

    const aboutLink = page.locator('nav a[href*="/about"]').first();
    await expect(aboutLink).toHaveClass(/border-cyan-400/);
  });

  test("should highlight Contact link when on contact page", async ({
    page,
  }) => {
    await page.goto("/contact/");
    await page.waitForLoadState("networkidle");

    const contactLink = page.locator('nav a[href*="/contact"]').first();
    await expect(contactLink).toHaveClass(/border-cyan-400/);
  });

  test("should not highlight inactive links", async ({ page }) => {
    await page.goto("/about/");
    await page.waitForLoadState("networkidle");

    const homeLink = page.locator('nav a[href="/"]').filter({ hasText: "Home" }).first();
    const cls = await homeLink.getAttribute("class");
    expect(cls).not.toContain("border-cyan-400");
  });
});

test.describe("Navigation — Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("should show hamburger menu on mobile", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Hamburger button should be visible (wait for hydration)
    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await expect(menuButton).toBeVisible({ timeout: 15000 });

    // Desktop nav links should be hidden on mobile
    const desktopNav = page.locator(".hidden.md\\:flex");
    await expect(desktopNav.first()).not.toBeVisible();
  });

  test("should open mobile menu and show all links", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Click hamburger
    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await menuButton.click();

    // Wait for menu to expand
    await page.waitForTimeout(500);

    // Mobile menu links should be visible (block-level links inside the mobile nav container)
    const mobileMenu = page.locator('button[aria-label="Toggle menu"][aria-expanded="true"]').locator('..').locator('..').locator('..').locator('div.md\\:hidden');
    // Simpler: just check that links with block display are now visible
    await expect(page.locator('a.block', { hasText: "Home" })).toBeVisible();
    await expect(page.locator('a.block', { hasText: "About" })).toBeVisible();
    await expect(page.locator('a.block', { hasText: "Contact" })).toBeVisible();
  });

  test("should show bell and theme toggle in mobile top bar", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Bell button should be visible on mobile (in the top bar, not behind hamburger)
    const bellBtn = page.locator(
      'button[aria-label*="announcements"], button[aria-label="Announcements"]',
    );
    await expect(bellBtn.first()).toBeVisible({ timeout: 15000 });

    // Theme toggle should be visible on mobile
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await expect(themeToggle.first()).toBeVisible();
  });

  test("should open notification panel on mobile", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const bellBtn = page.locator(
      'button[aria-label*="announcements"], button[aria-label="Announcements"]',
    );
    await bellBtn.first().click();
    await page.waitForTimeout(300);

    // Panel should be visible as a near-full-width fixed panel
    const panel = page.locator('div[role="dialog"][aria-label="Announcements"]');
    await expect(panel).toBeVisible();

    // Panel should have reasonable width on mobile (not overflowing)
    const box = await panel.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(375);
      expect(box.width).toBeGreaterThan(200);
    }
  });

  test("should show accessibility settings button in mobile menu", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Open mobile menu
    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await menuButton.click();
    await page.waitForTimeout(500);

    // Accessibility Settings button should be visible in the mobile nav
    const a11yButton = page.getByText("Accessibility Settings", {
      exact: true,
    });
    await expect(a11yButton).toBeVisible();
  });
});

test.describe("Navigation — Utilities", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("should have theme toggle button", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Theme toggle is a button in the nav area
    const themeToggle = page.locator("nav button").filter({
      has: page.locator("svg"),
    });
    expect(await themeToggle.count()).toBeGreaterThanOrEqual(1);
  });

  test("should have accessibility button on desktop", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const a11yButton = page.locator(
      'button[aria-label="Open accessibility settings"]',
    );
    await expect(a11yButton).toBeVisible();
  });
});
