import { expect, test } from "@playwright/test";

/**
 * Projects Page — Comprehensive Tests
 *
 * Verifies the projects page including search, category filtering,
 * project cards, featured badges, links, and responsive layout.
 */

test.describe("Projects Page — Loading & Structure", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/projects/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display the Projects heading", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Projects");
  });

  test("should display project cards", async ({ page }) => {
    const cards = page.locator(".grid > div");
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("should display project count in results header", async ({ page }) => {
    // The results header shows "N Projects" or "N Project"
    const resultHeader = page.locator("h2.font-mono").filter({ hasText: /\d+ Projects?/ });
    await expect(resultHeader).toBeVisible();
  });

  test("each project card should have title, description, and tech tags", async ({
    page,
  }) => {
    // Check first visible project card
    const firstCard = page.locator(".grid > div").first();
    await expect(firstCard).toBeVisible();

    // Title (h3 inside the card)
    const title = firstCard.locator("h3");
    await expect(title).toBeVisible();
    const titleText = await title.textContent();
    expect(titleText?.length).toBeGreaterThan(0);

    // Description (paragraph with line-clamp-2 for description)
    const description = firstCard.locator("p.text-white\\/50");
    await expect(description).toBeVisible();

    // Tech tags (spans inside the flex-wrap gap container)
    const techTags = firstCard.locator(".flex.flex-wrap span");
    const tagCount = await techTags.count();
    expect(tagCount).toBeGreaterThanOrEqual(1);
  });

  test("should display Featured badge on featured projects", async ({
    page,
  }) => {
    const featuredBadges = page.getByText("Featured", { exact: true });
    const count = await featuredBadges.count();
    // There are 2 featured projects in the data
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe("Projects Page — Search", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/projects/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should have a search input", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search projects...");
    await expect(searchInput).toBeVisible();
  });

  test("should filter projects by name when searching", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search projects...");
    await searchInput.fill("Portfolio");

    // Wait for deferred value to settle
    await page.waitForTimeout(500);

    // Should show the Portfolio Website project
    const cards = page.locator(".grid > div");
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Verify a matching title is visible
    await expect(page.locator("h3").filter({ hasText: "Portfolio" }).first()).toBeVisible();
  });

  test("should filter projects by description when searching", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder("Search projects...");
    // "containerlab" appears in the description of Network Automation Lab
    await searchInput.fill("containerlab");

    await page.waitForTimeout(500);

    const resultHeader = page.locator("h2.font-mono").filter({ hasText: /\d+ Projects?/ });
    const text = await resultHeader.textContent();
    // Should find at least the Network Automation Lab
    expect(text).toMatch(/[1-9]/);
  });

  test("should update project count when filtered", async ({ page }) => {
    const resultHeader = page.locator("h2.font-mono").filter({ hasText: /\d+ Projects?/ });
    const initialText = await resultHeader.textContent();
    const initialCount = parseInt(initialText?.match(/(\d+)/)?.[1] ?? "0", 10);

    const searchInput = page.getByPlaceholder("Search projects...");
    await searchInput.fill("Docker");
    await page.waitForTimeout(500);

    const filteredText = await resultHeader.textContent();
    const filteredCount = parseInt(filteredText?.match(/(\d+)/)?.[1] ?? "0", 10);

    expect(filteredCount).toBeLessThan(initialCount);
    expect(filteredCount).toBeGreaterThanOrEqual(1);
  });

  test("should show empty state when no projects match search", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder("Search projects...");
    await searchInput.fill("xyznonexistentproject123");
    await page.waitForTimeout(500);

    await expect(page.getByText("No projects found")).toBeVisible();
    await expect(
      page.getByText("Try adjusting your search terms or filters."),
    ).toBeVisible();
  });

  test("should show all projects when search is cleared", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search projects...");
    const resultHeader = page.locator("h2.font-mono").filter({ hasText: /\d+ Projects?/ });

    // Get initial count
    const initialText = await resultHeader.textContent();
    const initialCount = parseInt(initialText?.match(/(\d+)/)?.[1] ?? "0", 10);

    // Search for something specific
    await searchInput.fill("Telegram");
    await page.waitForTimeout(500);

    // Clear search
    await searchInput.fill("");
    await page.waitForTimeout(500);

    // Should show all projects again
    const restoredText = await resultHeader.textContent();
    const restoredCount = parseInt(restoredText?.match(/(\d+)/)?.[1] ?? "0", 10);
    expect(restoredCount).toBe(initialCount);
  });
});

test.describe("Projects Page — Category Filters", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/projects/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display category filter buttons", async ({ page }) => {
    const expectedCategories = [
      "All Projects",
      "Web",
      "Infrastructure",
      "AI / Data",
      "DevOps",
      "Tools",
    ];

    for (const category of expectedCategories) {
      const button = page.locator("button").filter({ hasText: new RegExp(`^${category.replace("/", "\\/")}`) });
      await expect(button).toBeVisible();
    }
  });

  test("should filter projects when clicking a category", async ({
    page,
  }) => {
    const resultHeader = page.locator("h2.font-mono").filter({ hasText: /\d+ Projects?/ });
    const initialText = await resultHeader.textContent();
    const totalCount = parseInt(initialText?.match(/(\d+)/)?.[1] ?? "0", 10);

    // Click "Web" category
    const webButton = page.locator("button").filter({ hasText: /^Web/ });
    await webButton.click();
    await page.waitForTimeout(300);

    const filteredText = await resultHeader.textContent();
    const filteredCount = parseInt(filteredText?.match(/(\d+)/)?.[1] ?? "0", 10);

    expect(filteredCount).toBeLessThan(totalCount);
    expect(filteredCount).toBeGreaterThanOrEqual(1);
  });

  test("should show all projects when All filter is clicked", async ({
    page,
  }) => {
    const resultHeader = page.locator("h2.font-mono").filter({ hasText: /\d+ Projects?/ });

    // First filter to a specific category
    const infraButton = page.locator("button").filter({ hasText: /^Infrastructure/ });
    await infraButton.click();
    await page.waitForTimeout(300);

    // Then click "All Projects"
    const allButton = page.locator("button").filter({ hasText: /^All Projects/ });
    await allButton.click();
    await page.waitForTimeout(300);

    const allText = await resultHeader.textContent();
    const allCount = parseInt(allText?.match(/(\d+)/)?.[1] ?? "0", 10);

    // 12 projects total in the data
    expect(allCount).toBe(12);
  });

  test("should highlight active category filter", async ({ page }) => {
    // "All Projects" should be active by default (has cyan styling)
    const allButton = page.locator("button").filter({ hasText: /^All Projects/ });
    await expect(allButton).toHaveClass(/bg-cyan-500\/20/);

    // Click "DevOps" category
    const devopsButton = page.locator("button").filter({ hasText: /^DevOps/ });
    await devopsButton.click();
    await page.waitForTimeout(300);

    // DevOps should now be active
    await expect(devopsButton).toHaveClass(/bg-cyan-500\/20/);
    // "All Projects" should no longer be active
    await expect(allButton).not.toHaveClass(/bg-cyan-500\/20/);
  });

  test("should combine search and category filter", async ({ page }) => {
    // Select "Web" category
    const webButton = page.locator("button").filter({ hasText: /^Web/ });
    await webButton.click();
    await page.waitForTimeout(300);

    const resultHeader = page.locator("h2.font-mono").filter({ hasText: /\d+ Projects?/ });
    const webOnlyText = await resultHeader.textContent();
    const webOnlyCount = parseInt(webOnlyText?.match(/(\d+)/)?.[1] ?? "0", 10);

    // Add a search term within web category
    const searchInput = page.getByPlaceholder("Search projects...");
    await searchInput.fill("Portfolio");
    await page.waitForTimeout(500);

    const combinedText = await resultHeader.textContent();
    const combinedCount = parseInt(combinedText?.match(/(\d+)/)?.[1] ?? "0", 10);

    expect(combinedCount).toBeLessThanOrEqual(webOnlyCount);
    expect(combinedCount).toBeGreaterThanOrEqual(1);
  });
});

test.describe("Projects Page — Links & Actions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/projects/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should have GitHub links with correct href for public repos", async ({
    page,
  }) => {
    // Find all "Code" links (GitHub links)
    const codeLinks = page.locator("a").filter({ hasText: "Code" });
    const count = await codeLinks.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Check each link has a valid GitHub URL
    for (let i = 0; i < count; i++) {
      const href = await codeLinks.nth(i).getAttribute("href");
      expect(href).toMatch(/^https:\/\/github\.com\//);
    }
  });

  test("should have GitHub links that open in new tab", async ({ page }) => {
    const codeLinks = page.locator("a").filter({ hasText: "Code" });
    const count = await codeLinks.count();

    for (let i = 0; i < count; i++) {
      await expect(codeLinks.nth(i)).toHaveAttribute("target", "_blank");
      await expect(codeLinks.nth(i)).toHaveAttribute(
        "rel",
        /noopener/,
      );
    }
  });

  test("should have Live demo link for projects with liveUrl", async ({
    page,
  }) => {
    const liveLinks = page.locator("a").filter({ hasText: "Live" });
    const count = await liveLinks.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Live links should open in new tab
    for (let i = 0; i < count; i++) {
      await expect(liveLinks.nth(i)).toHaveAttribute("target", "_blank");
      const href = await liveLinks.nth(i).getAttribute("href");
      expect(href).toMatch(/^https?:\/\//);
    }
  });

  test("should show Private Repository label for private projects without live URL", async ({
    page,
  }) => {
    const privateLabels = page.getByText("Private Repository");
    const count = await privateLabels.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe("Projects Page — Mobile Layout", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("should stack project cards in a single column on mobile", async ({
    page,
  }) => {
    await page.goto("/projects/");
    await page.waitForLoadState("domcontentloaded");

    // The grid uses grid-cols-1 on mobile (md:grid-cols-2 lg:grid-cols-3)
    const grid = page.locator(".grid.grid-cols-1");
    await expect(grid).toBeVisible();

    // Verify cards are stacked by checking the grid's computed column count
    const columns = await grid.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.gridTemplateColumns;
    });

    // Single column = one column value (no spaces indicating multiple columns)
    const columnCount = columns.split(" ").length;
    expect(columnCount).toBe(1);
  });
});
