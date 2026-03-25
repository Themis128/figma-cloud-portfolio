import { expect, test } from "@playwright/test";

/**
 * Navigation Tests
 *
 * Tests the sticky glassmorphic navbar, desktop links, mobile Sheet menu,
 * icon toolbar, and active link highlighting.
 */

test.describe("Navigation | Desktop", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("should display logo linking to home", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const logo = page.locator('a[aria-label="Home"]');
    await expect(logo).toBeVisible();
    await expect(logo).toContainText("TB");
    await expect(logo).toHaveAttribute("href", "/");
  });

  test("should be sticky with glassmorphic background", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const header = page.locator("header").first();
    await expect(header).toHaveCSS("position", "sticky");
    const cls = await header.getAttribute("class");
    expect(cls).toContain("backdrop-blur");
  });

  test("should display all 8 nav links on desktop", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const navLinks = ["Home", "About", "Resume", "Contact", "Blog", "Performance", "Agents", "Admin"];

    for (const name of navLinks) {
      const link = page.locator("nav").locator("a", { hasText: name }).first();
      await expect(link).toBeVisible();
    }
  });

  test("should highlight active link on home page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const homeLink = page.locator('nav a[href="/"]').filter({ hasText: "Home" }).first();
    await expect(homeLink).toHaveClass(/border-cyan-400/);
  });

  test("should highlight About link when on about page", async ({ page }) => {
    await page.goto("/about/");
    await page.waitForLoadState("networkidle");

    const aboutLink = page.locator('nav a[href*="/about"]').first();
    await expect(aboutLink).toHaveClass(/border-cyan-400/);
  });

  test("should highlight Contact link when on contact page", async ({ page }) => {
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

  test("should show separator between primary and effects toolbar groups", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Separator is a Radix Separator with vertical orientation
    const toolbar = page.locator("header .hidden.md\\:flex").last();
    const separator = toolbar.locator('[data-orientation="vertical"]');
    await expect(separator).toBeAttached();
  });
});

test.describe("Navigation | Desktop Toolbar", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("should have theme toggle button", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const themeToggle = page.locator('[data-testid="theme-toggle"]').first();
    await expect(themeToggle).toBeVisible();
  });

  test("should have accessibility button", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const a11yButton = page.locator('button[aria-label="Open accessibility settings"]');
    await expect(a11yButton).toBeVisible();
  });

  test("should have notification bell", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const bellBtn = page.locator(
      'button[aria-label*="announcements"], button[aria-label="Announcements"]',
    );
    await expect(bellBtn.first()).toBeVisible();
  });
});

test.describe("Navigation | Mobile Sheet Menu", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("should show hamburger menu button on mobile", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await expect(menuButton).toBeVisible({ timeout: 15000 });

    // Desktop nav links should be hidden on mobile
    const desktopNav = page.locator(".hidden.md\\:flex");
    await expect(desktopNav.first()).not.toBeVisible();
  });

  test("should open Sheet menu and show all nav links with icons", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Click hamburger to open Sheet
    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await menuButton.click();
    await page.waitForTimeout(600);

    // Sheet dialog should be visible
    const sheet = page.getByRole("dialog", { name: "TB" });
    await expect(sheet).toBeVisible();

    // All nav links should be visible inside the Sheet
    const navNames = ["Home", "About", "Resume", "Contact", "Blog", "Performance", "Agents", "Admin"];
    for (const name of navNames) {
      await expect(sheet.locator("a", { hasText: name }).first()).toBeVisible();
    }

    // Each link should have an SVG icon
    const navLinks = sheet.locator("a").filter({ has: page.locator("svg") });
    expect(await navLinks.count()).toBeGreaterThanOrEqual(8);
  });

  test("should show bell and theme toggle in mobile top bar", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Scope to the mobile toolbar (flex md:hidden)
    const mobileBar = page.locator("header .flex.md\\:hidden");
    const bellBtn = mobileBar.locator(
      'button[aria-label*="announcements"], button[aria-label="Announcements"]',
    );
    await expect(bellBtn.first()).toBeVisible({ timeout: 15000 });

    const themeToggle = mobileBar.locator('[data-testid="theme-toggle"]');
    await expect(themeToggle).toBeVisible();
  });

  test("should show Effects & Settings section in Sheet menu", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await menuButton.click();
    await page.waitForTimeout(600);

    const sheet = page.getByRole("dialog", { name: "TB" });
    await expect(sheet.getByText("Effects & Settings")).toBeVisible();

    // Accessibility icon button should be in the sheet
    const a11yButton = sheet.locator('button[aria-label="Open accessibility settings"]');
    await expect(a11yButton).toBeVisible();
  });

  test("should show Get In Touch CTA in Sheet menu", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await menuButton.click();
    await page.waitForTimeout(600);

    const sheet = page.getByRole("dialog", { name: "TB" });
    await expect(sheet.locator("a", { hasText: "Get In Touch" })).toBeVisible();
  });

  test("should close Sheet when a nav link is clicked", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await menuButton.click();
    await page.waitForTimeout(600);

    const sheet = page.getByRole("dialog", { name: "TB" });
    await sheet.locator("a", { hasText: "About" }).click();

    // Sheet should close after navigation
    await expect(sheet).not.toBeVisible({ timeout: 5000 });
  });

  test("should highlight active link in Sheet menu", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await menuButton.click();
    await page.waitForTimeout(600);

    const sheet = page.getByRole("dialog", { name: "TB" });
    const homeLink = sheet.locator('a[href="/"]');
    await expect(homeLink).toHaveClass(/text-cyan-400/);
  });
});
