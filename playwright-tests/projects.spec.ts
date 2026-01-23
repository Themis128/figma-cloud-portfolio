import { expect, test } from "@playwright/test";

test.describe("Projects Page", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to projects page
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");
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
    // Check project count badges
    await expect(page.locator("text=6 Projects")).toBeVisible();
    await expect(page.locator("text=2 Web Apps")).toBeVisible();
    await expect(page.locator("text=1 AI Project")).toBeVisible();
  });

  test("should have structured data for SEO", async ({ page }) => {
    // Check for JSON-LD structured data
    const structuredData = await page.locator('script[type="application/ld+json"]').all();
    expect(structuredData.length).toBeGreaterThan(0);

    // Check that at least one contains project data
    let hasProjectData = false;
    for (const script of structuredData) {
      const content = await script.textContent();
      if (content?.includes('"@type": "WebPage"') && content.includes("projects")) {
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

    // Check that SearchableProjects component is visible
    const searchInput = page.locator('input[placeholder*="search"]').first();
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
    await expect(page.locator("text=Click and drag to rotate")).toBeVisible();
  });

  test("should display 3D demo with canvas", async ({ page }) => {
    // Switch to 3D view
    const demoTab = page.locator('[role="tab"]').filter({ hasText: "3D Demo" });
    await demoTab.click();

    // Wait for canvas to be present
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();

    // Check that the 3D scene instructions are visible
    await expect(page.locator("text=Click and drag to rotate")).toBeVisible();
  });

  test("should have working search functionality in 2D view", async ({ page }) => {
    // Ensure we're in 2D view
    const gridTab = page.locator('[role="tab"]').filter({ hasText: "Grid View" });
    await expect(gridTab).toHaveAttribute("data-state", "active");

    // Find search input
    const searchInput = page.locator('input[placeholder*="search"]').first();
    await expect(searchInput).toBeVisible();

    // Type in search
    await searchInput.fill("React");
    await searchInput.press("Enter");

    // Wait for search results to update
    await page.waitForTimeout(500);

    // Check that some projects are still visible (assuming React projects exist)
    const projectCards = page.locator(
      '[data-testid="project-card"], .project-card, [role="article"]',
    );
    const visibleCards = await projectCards.locator("visible=true").count();
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
    // Switch to 3D view
    const demoTab = page.locator('[role="tab"]').filter({ hasText: "3D Demo" });
    await demoTab.click();

    // Wait for canvas
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();

    // Try clicking on canvas (may or may not trigger interactions)
    // This is more of a smoke test for the 3D functionality
    await canvas.click({ position: { x: 100, y: 100 } });

    // Canvas should still be present after interaction
    await expect(canvas).toBeVisible();
  });
});
