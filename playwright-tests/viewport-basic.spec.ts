import { test, expect } from "@playwright/test";

/**
 * Basic Viewport Tests
 * 
 * Simple tests that work with any portfolio to verify viewport functionality
 */

test.describe("Basic Viewport Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("large desktop viewport (1280x800) loads page correctly", async ({ page }) => {
    const viewport = page.viewportSize();
    
    // Verify viewport size is set correctly
    expect(viewport?.width).toBe(1280);
    expect(viewport?.height).toBe(800);

    // Test that page loads
    await expect(page).toHaveURL(/.*/);
    
    // Test that body is visible
    await expect(page.locator('body')).toBeVisible();
    
    // Test that page has some content
    const pageTitle = await page.title();
    expect(pageTitle.length).toBeGreaterThan(0);
  });

  test("small desktop viewport (900x600) loads page correctly", async ({ page }) => {
    const viewport = page.viewportSize();
    
    // Verify viewport size is set correctly
    expect(viewport?.width).toBe(900);
    expect(viewport?.height).toBe(600);

    // Test that page loads
    await expect(page).toHaveURL(/.*/);
    
    // Test that body is visible
    await expect(page.locator('body')).toBeVisible();
  });

  test("tablet viewport (768x1024) loads page correctly", async ({ page }) => {
    const viewport = page.viewportSize();
    
    // Verify viewport size is set correctly
    expect(viewport?.width).toBe(768);
    expect(viewport?.height).toBe(1024);

    // Test that page loads
    await expect(page).toHaveURL(/.*/);
    
    // Test that body is visible
    await expect(page.locator('body')).toBeVisible();
  });

  test("mobile viewport (360x640) loads page correctly", async ({ page }) => {
    const viewport = page.viewportSize();
    
    // Verify viewport size is set correctly
    expect(viewport?.width).toBe(360);
    expect(viewport?.height).toBe(640);

    // Test that page loads
    await expect(page).toHaveURL(/.*/);
    
    // Test that body is visible
    await expect(page.locator('body')).toBeVisible();
  });

  test("viewport changes work correctly", async ({ page }) => {
    // Start with current viewport
    let viewport = page.viewportSize();
    console.log(`Starting viewport: ${viewport?.width}x${viewport?.height}`);
    
    // Change to mobile
    await page.setViewportSize({ width: 360, height: 640 });
    viewport = page.viewportSize();
    expect(viewport?.width).toBe(360);
    expect(viewport?.height).toBe(640);
    
    // Change to desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    viewport = page.viewportSize();
    expect(viewport?.width).toBe(1280);
    expect(viewport?.height).toBe(800);
    
    // Change to tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    viewport = page.viewportSize();
    expect(viewport?.width).toBe(768);
    expect(viewport?.height).toBe(1024);
  });
});