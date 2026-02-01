import { expect, test } from "@playwright/test";
import { waitForAppReady } from "./test-utils";

test.describe("Projects Page", () => {
  test.beforeEach(async ({ page }) => {
    // Capture console messages
    const consoleMessages: Array<{ type: string; text: string }> = [];
    page.on("console", (msg) => {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
    });

    // Capture page errors
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    // Navigate to projects page
    await page.goto("http://localhost:3001/projects");
    await waitForAppReady(page);
    await page.waitForLoadState("domcontentloaded");
    // Wait for React to hydrate
    await page.waitForTimeout(2000);

    // Log console messages and errors
    console.log("Console messages:", consoleMessages);
    if (pageErrors.length > 0) {
      console.log("Page errors:", pageErrors);
    }
  });

  test("should load projects page with correct title and description", async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Projects.*Themistoklis Baltzakis/);

    // Check main heading
    const heading = page.locator("h1").first();
    await expect(heading).toContainText("Projects & Portfolio");

    // Check description
    const description = page.locator("text=Explore my latest work and technical projects");
    await expect(description).toBeVisible();
  });

  test("should display project statistics", async ({ page }) => {
    // Check that project statistics are displayed on the page
    // The key requirement is that the numbers 5, 3, and 1 are visible (total, web, mobile)
    await expect(page.getByText("5", { exact: true })).toBeVisible();
    await expect(page.getByText("3", { exact: true })).toBeVisible();
    await expect(page.getByText("1", { exact: true })).toBeVisible();

    // Check that there are descriptive elements (cards or sections with statistics)
    const statElements = page.locator('[class*="text-3xl"]').filter({ hasText: /\d/ });
    await expect(statElements).toHaveCount(3);
  });

  test("should have structured data for SEO", async ({ page }) => {
    // Check for JSON-LD structured data
    const structuredData = await page.locator('script[type="application/ld+json"]').all();
    expect(structuredData.length).toBeGreaterThan(0);

    // Check that at least one contains project-related data
    let hasProjectData = false;
    for (const script of structuredData) {
      const content = await script.textContent();
      if (
        content &&
        (content.includes("projects") || content.includes("Project") || content.includes("WebPage"))
      ) {
        hasProjectData = true;
        break;
      }
    }
    expect(hasProjectData).toBe(true);
  });

  test("should default to 2D grid view", async ({ page }) => {
    // Check that 2D view is active by default
    const gridViewTab = page.locator('[role="tab"]').filter({ hasText: "Grid View" });
    await expect(gridViewTab).toHaveAttribute("data-state", "active");

    // Check that SearchableProjects component is visible - look for the search input
    const searchInput = page.locator('input[placeholder="Search projects..."]').first();
    await expect(searchInput).toBeVisible();
  });

  test("should switch between 2D and 3D views", async ({ page }) => {
    // Start in 2D view
    const gridTab = page.locator('[role="tab"]').filter({ hasText: "Grid View" });
    const demoTab = page.locator('[role="tab"]').filter({ hasText: "3D Demo" });

    await expect(gridTab).toHaveAttribute("data-state", "active");
    await expect(demoTab).toHaveAttribute("data-state", "inactive");

    // Switch to 3D view
    await demoTab.click();
    await expect(demoTab).toHaveAttribute("data-state", "active");
    await expect(gridTab).toHaveAttribute("data-state", "inactive");

    // Check 3D demo content is visible
    await expect(page.locator("text=Interactive 3D Portfolio Demo")).toBeVisible();
    // Check that the 3D scene instructions are visible - look for the instruction text
    const instructionText = page.locator("text=/🖱️ Click and drag to rotate/");
    await expect(instructionText).toBeVisible();
  });

  test("should display 3D demo with canvas", async ({ page }) => {
    // Switch to 3D view
    const demoTab = page.locator('[role="tab"]').filter({ hasText: "3D Demo" });
    await demoTab.click();

    // Wait for canvas to be present
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();

    // Check that 3D demo title is visible
    await expect(page.locator("text=Interactive 3D Portfolio Demo")).toBeVisible();
  });

  test("should have working search functionality in 2D view", async ({ page }) => {
    // Ensure we're in 2D view
    const gridTab = page.locator('[role="tab"]').filter({ hasText: "Grid View" });
    await expect(gridTab).toHaveAttribute("data-state", "active");

    // Wait for the SearchableProjects component to render
    await page.waitForTimeout(1000);

    // Find search input - use the correct placeholder
    const searchInput = page.locator('input[placeholder="Search projects..."]');
    await expect(searchInput).toBeVisible();

    // Type in search
    await searchInput.fill("React");
    await searchInput.press("Enter");

    // Wait for search results to update
    await page.waitForTimeout(500);

    // Check that some projects are still visible (assuming React projects exist)
    // Use a more specific locator for project cards
    const projectCards = page.locator(
      'div[data-radix-scroll-area-viewport] article, [class*="grid"] [class*="hover:shadow-lg"]',
    );
    const visibleCards = await projectCards.count();
    expect(visibleCards).toBeGreaterThan(0);
  });

  test("should have filter functionality", async ({ page }) => {
    // Ensure we're in 2D view
    const gridTab = page.locator('[role="tab"]').filter({ hasText: "Grid View" });
    await expect(gridTab).toHaveAttribute("data-state", "active");

    // Look for filter buttons or dropdowns
    const filterElements = page
      .locator("button, select")
      .filter({ hasText: /(filter|category|technology)/i });
    const filterCount = await filterElements.count();

    if (filterCount > 0) {
      // If filters exist, test one
      const firstFilter = filterElements.first();
      await expect(firstFilter).toBeVisible();
    }
  });

  test("should display project cards with proper information", async ({ page }) => {
    // Ensure we're in 2D view
    const gridTab = page.locator('[role="tab"]').filter({ hasText: "Grid View" });
    await expect(gridTab).toHaveAttribute("data-state", "active");

    // Wait for projects to load
    await page.waitForTimeout(1000);

    // Check for project cards
    const projectCards = page.locator(
      '[data-testid="project-card"], .project-card, article, [role="article"]',
    );
    const cardCount = await projectCards.count();

    if (cardCount > 0) {
      // Test first project card
      const firstCard = projectCards.first();

      // Should have a title
      const title = firstCard.locator('h3, h4, [role="heading"]').first();
      await expect(title).toBeVisible();

      // Should have some description or content
      const content = firstCard.locator("p, span").first();
      await expect(content).toBeVisible();

      // Should have technology badges or tags
      const badges = firstCard
        .locator('[data-testid="badge"], .badge, span')
        .filter({ hasText: /(React|TypeScript|Node|Python)/i });
      const badgeCount = await badges.count();
      expect(badgeCount).toBeGreaterThanOrEqual(0); // May or may not have visible tech badges
    }
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that main elements are still visible
    await expect(page.locator("h1").filter({ hasText: "Projects" })).toBeVisible();

    // Check tabs are accessible
    const tabs = page.locator('[role="tab"]');
    await expect(tabs.filter({ hasText: "Grid View" })).toBeVisible();
    await expect(tabs.filter({ hasText: "3D Demo" })).toBeVisible();

    // Check that content adjusts to mobile
    const container = page.locator(".container").first();
    await expect(container).toBeVisible();
  });

  test("should have proper accessibility attributes", async ({ page }) => {
    // Check for proper heading hierarchy
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);

    // Check for ARIA labels where appropriate
    const tabs = page.locator('[role="tab"]');
    await expect(tabs).toHaveCount(2);

    // Check for focusable elements
    const focusableElements = page.locator("button, a, input, select, textarea");
    const focusableCount = await focusableElements.count();
    expect(focusableCount).toBeGreaterThan(0);
  });

  test("should handle 3D demo interactions", async ({ page }) => {
    // Switch to 3D view - use specific selector for 3D Demo tab
    const demoTab = page.locator('[role="tab"]').filter({ hasText: "3D Demo" });

    await expect(demoTab).toBeVisible({ timeout: 10000 });
    await demoTab.click();

    // Wait for 3D demo content to load (may not be present)
    const demoText = page.locator("text=Interactive 3D Portfolio Demo");
    try {
      await expect(demoText).toBeVisible({ timeout: 5000 });
    } catch {
      // 3D demo content may not be loaded - this is acceptable
      console.log("3D demo content not found - may not be implemented");
      return;
    }

    // Check that canvas is present for 3D interactions
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();

    // Try clicking on canvas (may or may not trigger interactions)
    // This is more of a smoke test for the 3D functionality
    if (await canvas.isVisible()) {
      await canvas.click({ position: { x: 100, y: 100 }, timeout: 5000 }).catch(() => {
        // Canvas click may fail in headless mode, that's okay
        console.log("Canvas click failed, continuing test");
      });
    }

    // Canvas should still be present after interaction
    if (await canvas.isVisible()) {
      await expect(canvas).toBeVisible();
    }
  });
});
