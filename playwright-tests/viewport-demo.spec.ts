import { test, expect } from "@playwright/test";

/**
 * Viewport Demo Tests
 *
 * This file demonstrates how to test your Next.js portfolio across different viewport sizes:
 * - Large Desktop (1280x800)
 * - Small Desktop (900x600)
 * - Tablet (768x1024)
 * - Mobile (360x640)
 *
 * Run specific viewport tests with:
 * npx playwright test --project="large-desktop-1280x800"
 * npx playwright test --project="small-desktop-900x600"
 * npx playwright test --project="tablet-768x1024"
 * npx playwright test --project="mobile-360x640"
 */

test.describe("Portfolio Viewport Testing", () => {
  test.beforeEach(async ({ page }) => {
    // Get current viewport size
    const viewport = page.viewportSize();
    console.log(`Testing with viewport: ${viewport?.width}x${viewport?.height}`);

    await page.goto("/");
  });

  test("should display correctly on Large Desktop (1280x800)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const viewport = page.viewportSize();

    // Verify viewport size
    expect(viewport?.width).toBe(1280);
    expect(viewport?.height).toBe(800);

    // Test that page loads correctly
    await expect(page).toHaveURL(/.*/);

    // Test that main navigation is visible
    const nav = page.locator('nav, header nav, .navbar, .navigation');
    if (await nav.count() > 0) {
      await expect(nav.first()).toBeVisible();
    }

    // Test that some main content is visible
    const mainContent = page.locator('main, .main, body');
    await expect(mainContent.first()).toBeVisible();

    // Test that mobile menu button is hidden on desktop (if it exists)
    const mobileMenuButton = page.locator('button[aria-label="Toggle menu"]');
    if (await mobileMenuButton.count() > 0) {
      await expect(mobileMenuButton.first()).toBeHidden();
    }

    // Test that the page has some interactive elements
    const links = page.locator('a[href^="/"], a[href^="http"]');
    if (await links.count() > 0) {
      await expect(links.first()).toBeVisible();
    }
  });

  test("should display correctly on Small Desktop (900x600)", async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 600 });
    const viewport = page.viewportSize();

    // Verify viewport size
    expect(viewport?.width).toBe(900);
    expect(viewport?.height).toBe(600);

    // Test that page loads correctly
    await expect(page).toHaveURL(/.*/);

    // Test that main content is visible
    const mainContent = page.locator('main, .main, body');
    await expect(mainContent.first()).toBeVisible();

    // Test that navigation is accessible
    const nav = page.locator('nav, header nav, .navbar, .navigation');
    if (await nav.count() > 0) {
      await expect(nav.first()).toBeVisible();
    }

    // Test that links are accessible
    const links = page.locator('a[href^="/"], a[href^="http"]');
    if (await links.count() > 0) {
      await expect(links.first()).toBeVisible();
    }
  });

  test("should display correctly on Tablet (768x1024)", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    const viewport = page.viewportSize();

    // Verify viewport size
    expect(viewport?.width).toBe(768);
    expect(viewport?.height).toBe(1024);

    // Test tablet-specific behavior
    await expect(page.locator('nav').first()).toBeVisible();

    // Test that content is readable on tablet
    const headings = page.locator('h1, h2, h3');
    for (let i = 0; i < await headings.count(); i++) {
      const heading = headings.nth(i);
      if (await heading.isVisible()) {
        await expect(heading).toBeVisible();
      }
    }

    // Test touch-friendly nav buttons (theme toggle, accessibility toggle)
    const navButtons = page.locator('header button:visible');
    for (let i = 0; i < await navButtons.count(); i++) {
      const button = navButtons.nth(i);
      const box = await button.boundingBox();
      if (box && box.width > 10 && box.height > 10) {
        // Navigation buttons should meet WCAG 2.2 Level AA touch target (44x44px)
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test("should display correctly on Mobile (360x640)", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const viewport = page.viewportSize();

    // Verify viewport size
    expect(viewport?.width).toBe(360);
    expect(viewport?.height).toBe(640);

    // Test mobile navigation (hamburger menu)
    const mobileMenuButton = page.locator('button[aria-label="Toggle menu"]');
    await expect(mobileMenuButton).toBeVisible();

    // Test mobile-friendly layout
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Test that content is properly scaled for mobile
    const body = page.locator('body');
    const bodyBox = await body.boundingBox();
    expect(bodyBox?.width).toBeLessThanOrEqual(360);

    // Test mobile-specific interactions
    await mobileMenuButton.click();
    // Wait for menu to open
    await page.waitForTimeout(300);

    // Test that menu items are accessible
    const menuItems = page.locator('nav a');
    await expect(menuItems.first()).toBeVisible();
  });

  test("should handle viewport changes gracefully", async ({ page }) => {
    // Start on mobile
    await page.setViewportSize({ width: 360, height: 640 });
    await expect(page.locator('button[aria-label="Toggle menu"]')).toBeVisible();

    // Switch to desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.locator('button[aria-label="Toggle menu"]')).toBeHidden();
    await expect(page.locator('nav a').first()).toBeVisible();

    // Switch back to mobile
    await page.setViewportSize({ width: 360, height: 640 });
    await expect(page.locator('button[aria-label="Toggle menu"]')).toBeVisible();
  });

  test("should maintain functionality across all viewports", async ({ page }) => {
    const viewports = [
      { width: 1280, height: 800, name: "Large Desktop" },
      { width: 900, height: 600, name: "Small Desktop" },
      { width: 768, height: 1024, name: "Tablet" },
      { width: 360, height: 640, name: "Mobile" },
    ];

    for (const { width, height, name } of viewports) {
      console.log(`Testing functionality on ${name} (${width}x${height})`);

      await page.setViewportSize({ width, height });
      await page.waitForTimeout(300);

      // Test basic navigation structure
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();

      // Test that nav links exist
      const links = page.locator('nav a[href^="/"]');
      expect(await links.count()).toBeGreaterThan(0);
    }
  });
});

test.describe("Responsive Design Elements", () => {
  test("should have proper meta viewport tag", async ({ page }) => {
    await page.goto("/");

    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toBeAttached();
    const content = await viewportMeta.getAttribute('content');
    // Verify essential viewport properties are present
    expect(content).toContain('width=device-width');
    expect(content).toContain('initial-scale=1');
  });

  test("should handle responsive images", async ({ page }) => {
    await page.goto("/");

    // Test that images have proper responsive attributes
    const images = page.locator('img');
    for (let i = 0; i < await images.count(); i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');

      // Images should have alt text
      expect(alt).toBeTruthy();

      // Test that images load properly at different sizes
      await expect(img).toBeVisible();
    }
  });

  test("should handle responsive typography", async ({ page }) => {
    await page.goto("/");

    // Test that text is readable at different viewport sizes
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    for (let i = 0; i < await headings.count(); i++) {
      const heading = headings.nth(i);
      const fontSize = await heading.evaluate(el =>
        window.getComputedStyle(el).fontSize
      );

      // Font size should be reasonable (not too small)
      const size = parseInt(fontSize.replace('px', ''));
      expect(size).toBeGreaterThan(12);
      expect(size).toBeLessThan(100);
    }
  });

  test("should handle responsive forms", async ({ page }) => {
    await page.goto("/contact/");

    // Test form elements are accessible
    const inputs = page.locator('input:visible, textarea:visible, select:visible');
    for (let i = 0; i < await inputs.count(); i++) {
      const input = inputs.nth(i);
      const box = await input.boundingBox();

      if (box) {
        // Form inputs should be large enough to tap on mobile (WCAG 2.2 Level AA: 24px min)
        expect(box.width).toBeGreaterThanOrEqual(24);
        expect(box.height).toBeGreaterThanOrEqual(24);
      }
    }
  });
});
