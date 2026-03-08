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
    const mobileMenuButton = page.locator('button[aria-label="Open menu"], .mobile-menu, .hamburger');
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
    const viewport = page.viewportSize();
    
    // Verify viewport size
    expect(viewport?.width).toBe(768);
    expect(viewport?.height).toBe(1024);

    // Test tablet-specific behavior
    // On tablet, navigation might be condensed or in a different layout
    await expect(page.locator('nav')).toBeVisible();
    
    // Test that content is readable on tablet
    const headings = page.locator('h1, h2, h3');
    for (let i = 0; i < await headings.count(); i++) {
      const heading = headings.nth(i);
      await expect(heading).toBeVisible();
    }
    
    // Test touch-friendly elements
    const buttons = page.locator('button, a');
    for (let i = 0; i < await buttons.count(); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      if (box) {
        // Touch targets should be at least 44x44px for accessibility
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test("should display correctly on Mobile (360x640)", async ({ page }) => {
    const viewport = page.viewportSize();
    
    // Verify viewport size
    expect(viewport?.width).toBe(360);
    expect(viewport?.height).toBe(640);

    // Test mobile navigation (hamburger menu)
    const mobileMenuButton = page.locator('button[aria-label="Open menu"]');
    await expect(mobileMenuButton).toBeVisible();
    
    // Test that main navigation is hidden initially on mobile
    const navLinks = page.locator('nav a');
    // On mobile, main nav might be hidden behind hamburger menu
    // This depends on your implementation
    
    // Test mobile-friendly layout
    const hero = page.locator('section[id="hero"]');
    await expect(hero).toBeVisible();
    
    // Test that content is properly scaled for mobile
    const body = page.locator('body');
    const bodyBox = await body.boundingBox();
    expect(bodyBox?.width).toBeLessThanOrEqual(360);
    
    // Test mobile-specific interactions
    await mobileMenuButton.click();
    // Wait for menu to open
    await page.waitForTimeout(300);
    
    // Test that menu items are accessible
    const menuItems = page.locator('[role="menu"] a, nav a');
    await expect(menuItems.first()).toBeVisible();
  });

  test("should handle viewport changes gracefully", async ({ page }) => {
    // Start on mobile
    await page.setViewportSize({ width: 360, height: 640 });
    await expect(page.locator('button[aria-label="Open menu"]')).toBeVisible();
    
    // Switch to desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.locator('button[aria-label="Open menu"]')).toBeHidden();
    await expect(page.locator('nav a')).toBeVisible();
    
    // Switch back to mobile
    await page.setViewportSize({ width: 360, height: 640 });
    await expect(page.locator('button[aria-label="Open menu"]')).toBeVisible();
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
      
      // Test basic navigation
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      
      // Test that links work
      const links = page.locator('a[href^="/"]');
      if (await links.count() > 0) {
        const firstLink = links.first();
        const href = await firstLink.getAttribute('href');
        if (href && href !== '#') {
          await firstLink.click();
          await page.waitForLoadState('domcontentloaded');
          await expect(page).toHaveURL(new RegExp(href));
          await page.goBack();
        }
      }
    }
  });
});

test.describe("Responsive Design Elements", () => {
  test("should have proper meta viewport tag", async ({ page }) => {
    await page.goto("/");
    
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toBeAttached();
    await expect(viewportMeta).toHaveAttribute(
      'content', 
      'width=device-width, initial-scale=1'
    );
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
    await page.goto("/contact");
    
    // Test form elements are accessible
    const inputs = page.locator('input, textarea, select');
    for (let i = 0; i < await inputs.count(); i++) {
      const input = inputs.nth(i);
      const box = await input.boundingBox();
      
      if (box) {
        // Form inputs should be large enough to tap on mobile
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});