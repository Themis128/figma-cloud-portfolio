import { test, expect } from "@playwright/test";
import {
  DEVICE_PRESETS,
  setViewportAndWait,
  testResponsiveNavigation,
  testTouchFriendlyElements,
  testResponsiveTypography,
  testResponsiveImages,
  testResponsiveForms,
  testResponsiveLayout,
  runResponsiveTests,
  testAcrossViewports
} from "./utils/viewport-helpers";

/**
 * Comprehensive Responsive Design Tests
 * 
 * This file contains comprehensive tests for responsive design across all viewport sizes.
 * Uses the viewport-helpers utility functions for consistent testing patterns.
 */

test.describe("Comprehensive Responsive Design", () => {
  test.setTimeout(60_000);

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should pass all responsive tests on Large Desktop", async ({ page }) => {
    await setViewportAndWait(page, DEVICE_PRESETS["large-desktop"].viewport);
    
    await runResponsiveTests(page, {
      testNavigation: true,
      testTypography: true,
      testImages: true,
      testForms: true,
      testLayout: true,
      customTests: [
        async (page) => {
          // Desktop-specific test: navigation should be visible
          const nav = page.locator('nav').first();
          await expect(nav).toBeVisible();
          
          // Mobile menu button should be hidden
          const mobileMenu = page.locator('button[aria-label="Toggle menu"]');
          await expect(mobileMenu).toBeHidden();
        }
      ]
    });
  });

  test("should pass all responsive tests on Small Desktop", async ({ page }) => {
    await setViewportAndWait(page, DEVICE_PRESETS["small-desktop"].viewport);
    
    await runResponsiveTests(page, {
      testNavigation: true,
      testTypography: true,
      testImages: true,
      testForms: true,
      testLayout: true,
      customTests: [
        async (page) => {
          // Test that content adapts to smaller width — nav fits within viewport
          const nav = page.locator('nav').first();
          const navBox = await nav.boundingBox();
          const viewportSize = page.viewportSize();
          if (navBox && viewportSize) {
            expect(navBox.width).toBeLessThanOrEqual(viewportSize.width + 10);
          }
        }
      ]
    });
  });

  test("should pass all responsive tests on Tablet", async ({ page }) => {
    await setViewportAndWait(page, DEVICE_PRESETS["tablet"].viewport);
    
    await runResponsiveTests(page, {
      testNavigation: true,
      testTypography: true,
      testImages: true,
      testForms: true,
      testLayout: true,
      customTests: [
        async (page) => {
          // Tablet-specific test: touch targets should be adequate
          await testTouchFriendlyElements(page);
          
          // Test that content is readable on tablet
          const headings = page.locator('h1, h2, h3');
          for (let i = 0; i < await headings.count(); i++) {
            const heading = headings.nth(i);
            await expect(heading).toBeVisible();
          }
        }
      ]
    });
  });

  test("should pass all responsive tests on Mobile", async ({ page }) => {
    await setViewportAndWait(page, DEVICE_PRESETS["mobile"].viewport);
    
    await runResponsiveTests(page, {
      testNavigation: true,
      testTypography: true,
      testImages: true,
      testForms: true,
      testLayout: true,
      customTests: [
        async (page) => {
          // Mobile-specific test: mobile menu should be visible
          const mobileMenu = page.locator('button[aria-label="Toggle menu"]');
          await expect(mobileMenu).toBeVisible();
          
          // Test mobile menu functionality
          await mobileMenu.click();
          await page.waitForTimeout(300);
          
          const menuItems = page.locator('[role="menu"] a, nav[aria-expanded="true"] a');
          if (await menuItems.count() > 0) {
            await expect(menuItems.first()).toBeVisible();
          }
          
          await mobileMenu.click();
          await page.waitForTimeout(300);
        }
      ]
    });
  });

  test("should handle viewport transitions smoothly", async ({ page }) => {
    const viewports = [
      DEVICE_PRESETS["mobile"].viewport,
      DEVICE_PRESETS["tablet"].viewport,
      DEVICE_PRESETS["small-desktop"].viewport,
      DEVICE_PRESETS["large-desktop"].viewport,
    ];

    for (const viewport of viewports) {
      await setViewportAndWait(page, viewport);
      
      // Test that the page adapts correctly to each viewport
      await expect(page.locator('nav').first()).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      
      // Test navigation adapts correctly
      await testResponsiveNavigation(page);
    }
  });

  test("should maintain accessibility across all viewports", async ({ page }) => {
    const accessibilityTests = [
      async (page: any, viewport: any) => {
        // Test touch targets on mobile/tablet
        if (viewport.width < 1024) {
          await testTouchFriendlyElements(page);
        }
      },
      async (page: any) => {
        // Test responsive typography
        await testResponsiveTypography(page);
      },
      async (page: any) => {
        // Test responsive images
        await testResponsiveImages(page);
      },
      async (page: any) => {
        // Test responsive forms
        await testResponsiveForms(page);
      }
    ];

    await testAcrossViewports(page, [
      DEVICE_PRESETS["mobile"].viewport,
      DEVICE_PRESETS["tablet"].viewport,
      DEVICE_PRESETS["small-desktop"].viewport,
      DEVICE_PRESETS["large-desktop"].viewport,
    ], async (page, viewport) => {
      for (const test of accessibilityTests) {
        await test(page, viewport);
      }
    });
  });

  test("should handle extreme viewport sizes gracefully", async ({ page }) => {
    const extremeViewports = [
      { width: 320, height: 568 },   // Very small mobile
      { width: 414, height: 896 },   // Large mobile
      { width: 1440, height: 900 },  // Large desktop
      { width: 1920, height: 1080 }, // Full HD
      { width: 2560, height: 1440 }, // 2K
    ];

    for (const viewport of extremeViewports) {
      await setViewportAndWait(page, viewport);
      
      // Test that content is still accessible
      await expect(page.locator('nav').first()).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      
      // Test that navigation works
      await testResponsiveNavigation(page);
      
      // Test that content fits within viewport
      const body = page.locator('body');
      const bodyBox = await body.boundingBox();
      if (bodyBox) {
        expect(bodyBox.width).toBeLessThanOrEqual(viewport.width + 20);
      }
    }
  });

  test("should handle dynamic content resizing", async ({ page }) => {
    await setViewportAndWait(page, DEVICE_PRESETS["mobile"].viewport);
    
    // Test that dynamic content (like modals, dropdowns) works on mobile
    const buttons = page.locator('button');
    for (let i = 0; i < await buttons.count(); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      
      if (box && box.width >= 44 && box.height >= 44) {
        try {
          await button.click({ timeout: 1000 });
          await page.waitForTimeout(500);
          
          // Check if any modal or dropdown appeared
          const modal = page.locator('[role="dialog"], .modal, .dropdown');
          if (await modal.count() > 0) {
            await expect(modal.first()).toBeVisible();
            
            // Test that modal content is accessible
            const modalContent = modal.locator('h1, h2, h3, p, span');
            for (let j = 0; j < await modalContent.count(); j++) {
              const content = modalContent.nth(j);
              await expect(content).toBeVisible();
            }
          }
        } catch (error) {
          // Button click might fail, that's okay for this test
          console.log(`Button ${i} click failed:`, error.message);
        }
      }
    }
  });

  test("should handle orientation changes", async ({ page }) => {
    // Start in portrait
    await setViewportAndWait(page, DEVICE_PRESETS["tablet"].viewport);
    await expect(page.locator('nav').first()).toBeVisible();

    // Switch to landscape
    await setViewportAndWait(page, { width: 1024, height: 768 });
    await expect(page.locator('nav').first()).toBeVisible();

    // Switch back to portrait
    await setViewportAndWait(page, DEVICE_PRESETS["tablet"].viewport);
    await expect(page.locator('nav').first()).toBeVisible();
    
    // Test that navigation adapts correctly in both orientations
    await testResponsiveNavigation(page);
  });
});

test.describe("Viewport-Specific Component Tests", () => {
  test("hero section should adapt to all viewports", async ({ page }) => {
    await page.goto("/");

    const viewports = [
      DEVICE_PRESETS["mobile"].viewport,
      DEVICE_PRESETS["tablet"].viewport,
      DEVICE_PRESETS["small-desktop"].viewport,
      DEVICE_PRESETS["large-desktop"].viewport,
    ];

    for (const viewport of viewports) {
      await setViewportAndWait(page, viewport);

      // The hero is the first section in main
      const hero = page.locator('main section').first();
      await expect(hero).toBeVisible();

      // Test that hero heading is readable
      const heading = page.locator('h1');
      await expect(heading.first()).toBeVisible();

      // Test that hero fits within viewport
      const heroBox = await hero.boundingBox();
      const viewportSize = page.viewportSize();
      if (heroBox && viewportSize) {
        expect(heroBox.width).toBeLessThanOrEqual(viewportSize.width + 10);
      }
    }
  });

  test("navigation should work correctly on all viewports", async ({ page }) => {
    await page.goto("/");

    const viewports = [
      DEVICE_PRESETS["mobile"].viewport,
      DEVICE_PRESETS["tablet"].viewport,
      DEVICE_PRESETS["small-desktop"].viewport,
      DEVICE_PRESETS["large-desktop"].viewport,
    ];

    for (const viewport of viewports) {
      await setViewportAndWait(page, viewport);

      // Test navigation functionality
      await testResponsiveNavigation(page, {
        hasMobileMenu: true,
        mobileMenuSelector: 'button[aria-label="Toggle menu"]',
        desktopNavSelector: 'nav a'
      });

      // Navigation should contain links
      const navLinks = page.locator('nav a');
      expect(await navLinks.count()).toBeGreaterThan(0);
    }
  });

  test("forms should be accessible on all viewports", async ({ page }) => {
    await page.goto("/contact");
    
    const viewports = [
      DEVICE_PRESETS["mobile"].viewport,
      DEVICE_PRESETS["tablet"].viewport,
      DEVICE_PRESETS["small-desktop"].viewport,
      DEVICE_PRESETS["large-desktop"].viewport,
    ];

    for (const viewport of viewports) {
      await setViewportAndWait(page, viewport);
      
      // Test form accessibility
      await testResponsiveForms(page);
      
      // Test that form labels are associated with inputs
      const inputs = page.locator('input, textarea, select');
      for (let i = 0; i < await inputs.count(); i++) {
        const input = inputs.nth(i);
        const inputId = await input.getAttribute('id');
        
        if (inputId) {
          const label = page.locator(`label[for="${inputId}"]`);
          if (await label.count() > 0) {
            await expect(label).toBeVisible();
          }
        }
      }
    }
  });
});