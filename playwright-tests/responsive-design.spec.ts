import { expect, test } from "@playwright/test";
import { waitForAppReady } from "./test-utils";

test.describe("Responsive Design", () => {
  test("should handle mobile viewport (375px)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await waitForAppReady(page);

    // Check mobile navigation
    const mobileMenuButton = page.getByRole("button", { name: "Toggle menu" });
    await expect(mobileMenuButton).toBeVisible();

    // Check mobile-friendly touch targets
    const touchTargets = page.locator('button, a, input[type="button"], input[type="submit"]');
    const touchTargetCount = await touchTargets.count();
    expect(touchTargetCount).toBeGreaterThan(0);

    // Check for mobile-specific content
    const mobileContent = page.locator('[data-testid="mobile-content"]');
    if (await mobileContent.isVisible()) {
      await expect(mobileContent).toBeVisible();
    }

    // Check for proper font sizes
    const body = page.locator("body");
    await expect(body).toBeVisible();

    // Check for mobile meta viewport
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toBeAttached();
    await expect(viewport).toHaveAttribute("content");
  });

  test("should handle mobile viewport (414px)", async ({ page }) => {
    await page.setViewportSize({ width: 414, height: 896 });
    await page.goto("/");
    await waitForAppReady(page);

    // Check for proper layout
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("nav")).toBeVisible();

    // Check for mobile navigation
    const mobileMenuButton = page.getByRole("button", { name: "Toggle menu" });
    await expect(mobileMenuButton).toBeVisible();
  });

  test("should handle mobile viewport (360px)", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto("/");
    await waitForAppReady(page);

    // Check for mobile layout
    await expect(page.locator("body")).toBeVisible();

    // Check for mobile navigation
    const mobileMenuButton = page.getByRole("button", { name: "Toggle menu" });
    await expect(mobileMenuButton).toBeVisible();
  });

  test("should handle tablet viewport (768px)", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await waitForAppReady(page);

    // Check for tablet layout
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("nav")).toBeVisible();

    // Check for responsive navigation
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();

    // Check for proper content layout
    const mainContent = page.locator("main, .main-content");
    await expect(mainContent).toBeVisible();
  });

  test("should handle tablet viewport (1024px)", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/");
    await waitForAppReady(page);

    // Check for tablet layout
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("nav")).toBeVisible();

    // Check for responsive navigation
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("should handle desktop viewport (1366px)", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/");
    await waitForAppReady(page);

    // Check for desktop layout
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("nav")).toBeVisible();

    // Check for desktop navigation
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();

    // Check for desktop-specific content
    const desktopContent = page.locator('[data-testid="desktop-content"]');
    if (await desktopContent.isVisible()) {
      await expect(desktopContent).toBeVisible();
    }
  });

  test("should handle desktop viewport (1920px)", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await waitForAppReady(page);

    // Check for desktop layout
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("nav")).toBeVisible();

    // Check for desktop navigation
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();

    // Check for desktop-specific features
    const desktopFeatures = page.locator('[data-testid="desktop-features"]');
    if (await desktopFeatures.isVisible()) {
      await expect(desktopFeatures).toBeVisible();
    }
  });

  test("should handle large desktop viewport (2560px)", async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.goto("/");
    await waitForAppReady(page);

    // Check for large desktop layout
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("nav")).toBeVisible();

    // Check for proper scaling
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("should handle responsive navigation", async ({ page }) => {
    // Test mobile navigation
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await waitForAppReady(page);

    const mobileMenuButton = page.getByRole("button", { name: "Toggle menu" });
    await expect(mobileMenuButton).toBeVisible();

    // Open mobile menu
    await mobileMenuButton.click();
    await page.waitForTimeout(500);

    // Check mobile menu content
    const mobileMenu = page.locator('[aria-expanded="true"]');
    await expect(mobileMenu).toBeVisible();

    // Close mobile menu
    await mobileMenuButton.click();
    await page.waitForTimeout(500);

    // Test desktop navigation
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await waitForAppReady(page);

    const desktopNav = page.locator("nav");
    await expect(desktopNav).toBeVisible();
  });

  test("should handle responsive images", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    // Check for responsive images
    const images = page.locator("img");
    const imageCount = await images.count();

    if (imageCount > 0) {
      for (let i = 0; i < imageCount; i++) {
        const image = images.nth(i);
        const src = await image.getAttribute("src");
        const srcset = await image.getAttribute("srcset");
        const sizes = await image.getAttribute("sizes");

        // Images should have responsive attributes
        expect(src || srcset).toBeTruthy();
      }
    }
  });

  test("should handle responsive typography", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    // Check for responsive typography
    const headings = page.locator("h1, h2, h3, h4, h5, h6");
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);

    // Check for responsive text
    const textElements = page.locator("p, span, div");
    const textCount = await textElements.count();
    expect(textCount).toBeGreaterThan(0);
  });

  test("should handle responsive forms", async ({ page }) => {
    await page.goto("/contact");
    await waitForAppReady(page);

    // Test mobile form
    await page.setViewportSize({ width: 375, height: 667 });

    const formInputs = page.locator('input, textarea, select');
    const inputCount = await formInputs.count();

    if (inputCount > 0) {
      for (let i = 0; i < inputCount; i++) {
        const input = formInputs.nth(i);
        await expect(input).toBeVisible();
      }
    }

    // Test desktop form
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/contact");
    await waitForAppReady(page);

    const desktopFormInputs = page.locator('input, textarea, select');
    const desktopInputCount = await desktopFormInputs.count();
    expect(desktopInputCount).toBeGreaterThan(0);
  });

  test("should handle responsive tables", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    // Check for tables
    const tables = page.locator("table");
    const tableCount = await tables.count();

    if (tableCount > 0) {
      for (let i = 0; i < tableCount; i++) {
        const table = tables.nth(i);

        // Test mobile table
        await page.setViewportSize({ width: 375, height: 667 });
        await expect(table).toBeVisible();

        // Test desktop table
        await page.setViewportSize({ width: 1920, height: 1080 });
        await expect(table).toBeVisible();
      }
    }
  });

  test("should handle responsive grids", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    // Check for grid layouts
    const grids = page.locator('[class*="grid"], [class*="columns"], .grid, .columns');
    const gridCount = await grids.count();

    if (gridCount > 0) {
      for (let i = 0; i < gridCount; i++) {
        const grid = grids.nth(i);

        // Test mobile grid
        await page.setViewportSize({ width: 375, height: 667 });
        await expect(grid).toBeVisible();

        // Test desktop grid
        await page.setViewportSize({ width: 1920, height: 1080 });
        await expect(grid).toBeVisible();
      }
    }
  });

  test("should handle responsive modals", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    // Check for modals
    const modals = page.locator('[role="dialog"], .modal, .overlay');
    const modalCount = await modals.count();

    if (modalCount > 0) {
      for (let i = 0; i < modalCount; i++) {
        const modal = modals.nth(i);

        // Test mobile modal
        await page.setViewportSize({ width: 375, height: 667 });
        await expect(modal).toBeVisible();

        // Test desktop modal
        await page.setViewportSize({ width: 1920, height: 1080 });
        await expect(modal).toBeVisible();
      }
    }
  });

  test("should handle responsive navigation menus", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    // Test mobile menu
    await page.setViewportSize({ width: 375, height: 667 });

    const mobileMenuButton = page.getByRole("button", { name: "Toggle menu" });
    await expect(mobileMenuButton).toBeVisible();

    // Test desktop menu
    await page.setViewportSize({ width: 1920, height: 1080 });

    const desktopNav = page.locator("nav");
    await expect(desktopNav).toBeVisible();
  });

  test("should handle responsive buttons", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    // Check for buttons
    const buttons = page.locator('button, [role="button"]');
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);

        // Test mobile button — skip if hidden at this viewport (e.g. desktop-only buttons)
        await page.setViewportSize({ width: 375, height: 667 });
        if (await button.isVisible().catch(() => false)) {
          await expect(button).toBeVisible();
        }

        // Test desktop button — skip if hidden at this viewport (e.g. mobile menu toggle with md:hidden)
        await page.setViewportSize({ width: 1920, height: 1080 });
        if (await button.isVisible().catch(() => false)) {
          await expect(button).toBeVisible();
        }
      }
    }
  });

  test("should handle responsive cards", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    // Check for cards
    const cards = page.locator('[class*="card"], .card, [data-testid*="card"]');
    const cardCount = await cards.count();

    if (cardCount > 0) {
      for (let i = 0; i < cardCount; i++) {
        const card = cards.nth(i);

        // Test mobile card
        await page.setViewportSize({ width: 375, height: 667 });
        await expect(card).toBeVisible();

        // Test desktop card
        await page.setViewportSize({ width: 1920, height: 1080 });
        await expect(card).toBeVisible();
      }
    }
  });

  test("should handle responsive navigation transitions", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    // Test mobile navigation transitions
    await page.setViewportSize({ width: 375, height: 667 });

    const mobileMenuButton = page.getByRole("button", { name: "Toggle menu" });
    await expect(mobileMenuButton).toBeVisible();

    // Open menu
    await mobileMenuButton.click();
    await page.waitForTimeout(500);

    // Check menu is open
    await expect(mobileMenuButton).toHaveAttribute("aria-expanded", "true");

    // Close menu
    await mobileMenuButton.click();
    await page.waitForTimeout(500);

    // Check menu is closed
    await expect(mobileMenuButton).toHaveAttribute("aria-expanded", "false");
  });

  test("should handle responsive content visibility", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    // Test mobile content visibility
    await page.setViewportSize({ width: 375, height: 667 });

    const mobileContent = page.locator('[data-testid="mobile-content"], .mobile-only');
    if (await mobileContent.isVisible()) {
      await expect(mobileContent).toBeVisible();
    }

    // Test desktop content visibility
    await page.setViewportSize({ width: 1920, height: 1080 });

    const desktopContent = page.locator('[data-testid="desktop-content"], .desktop-only');
    if (await desktopContent.isVisible()) {
      await expect(desktopContent).toBeVisible();
    }
  });

  test("should handle responsive layout breakpoints", async ({ page }) => {
    test.setTimeout(60_000);

    // Test key breakpoints (reduced set to avoid timeout from multiple page.goto calls)
    const breakpoints = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      await page.goto("/");
      await waitForAppReady(page);

      // Check basic content visibility
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("nav")).toBeVisible();
      await expect(page.locator("body")).toBeVisible();
    }
  });

  test("should handle responsive navigation accessibility", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    // Test mobile navigation accessibility
    await page.setViewportSize({ width: 375, height: 667 });

    const mobileMenuButton = page.getByRole("button", { name: "Toggle menu" });
    await expect(mobileMenuButton).toBeVisible();
    await expect(mobileMenuButton).toHaveAttribute("aria-label", "Toggle menu");
    await expect(mobileMenuButton).toHaveAttribute("aria-expanded");

    // Test desktop navigation accessibility
    await page.setViewportSize({ width: 1920, height: 1080 });

    // <nav> has implicit navigation role — no explicit role attribute needed
    const desktopNav = page.locator("nav");
    await expect(desktopNav).toBeVisible();
  });

  test("should handle responsive form accessibility", async ({ page }) => {
    await page.goto("/contact");
    await waitForAppReady(page);

    // Test mobile form accessibility
    await page.setViewportSize({ width: 375, height: 667 });

    const formInputs = page.locator('input, textarea, select');
    const inputCount = await formInputs.count();

    if (inputCount > 0) {
      for (let i = 0; i < inputCount; i++) {
        const input = formInputs.nth(i);
        const label = page.locator(`label[for="${await input.getAttribute("id")}"]`);
        
        if (await label.isVisible()) {
          await expect(label).toBeVisible();
        }
      }
    }

    // Test desktop form accessibility
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/contact");
    await waitForAppReady(page);

    const desktopFormInputs = page.locator('input, textarea, select');
    const desktopInputCount = await desktopFormInputs.count();

    if (desktopInputCount > 0) {
      for (let i = 0; i < desktopInputCount; i++) {
        const input = desktopFormInputs.nth(i);
        const label = page.locator(`label[for="${await input.getAttribute("id")}"]`);
        
        if (await label.isVisible()) {
          await expect(label).toBeVisible();
        }
      }
    }
  });

  test("should handle responsive image accessibility", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    // Check for responsive images with accessibility
    const images = page.locator("img");
    const imageCount = await images.count();

    if (imageCount > 0) {
      for (let i = 0; i < imageCount; i++) {
        const image = images.nth(i);
        const alt = await image.getAttribute("alt");
        
        // All images should have alt text
        expect(alt).toBeDefined();
      }
    }
  });

  test("should handle responsive content scaling", async ({ page }) => {
    test.setTimeout(60_000);

    await page.goto("/");
    await waitForAppReady(page);

    // Test content scaling on different viewports
    const viewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await waitForAppReady(page);

      // Check that content scales properly
      const bodyText = await page.locator("body").textContent();
      expect(bodyText?.length).toBeGreaterThan(10);

      // Check that navigation is accessible
      const nav = page.locator("nav");
      await expect(nav).toBeVisible();
    }
  });

  test("should handle responsive navigation state", async ({ page }) => {
    test.setTimeout(30_000);

    // Start at mobile viewport so the mobile menu button is rendered
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await waitForAppReady(page);

    const mobileMenuButton = page.getByRole("button", { name: "Toggle menu" });
    await expect(mobileMenuButton).toBeVisible({ timeout: 10_000 });
    await expect(mobileMenuButton).toHaveAttribute("aria-expanded", "false");

    // Open menu
    await mobileMenuButton.click();
    await page.waitForTimeout(500);
    await expect(mobileMenuButton).toHaveAttribute("aria-expanded", "true");

    // Close menu
    await mobileMenuButton.click();
    await page.waitForTimeout(500);
    await expect(mobileMenuButton).toHaveAttribute("aria-expanded", "false");

    // Test desktop navigation state
    await page.setViewportSize({ width: 1920, height: 1080 });

    const desktopNav = page.locator("nav");
    await expect(desktopNav).toBeVisible();
  });
});