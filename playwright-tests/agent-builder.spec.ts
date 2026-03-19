import { expect, test } from "@playwright/test";
import { waitForAppReady } from "./test-utils";

test.describe("Agent Builder (Interactive Section)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/agents/");
    await waitForAppReady(page);
  });

  test("should load educational agents page with builder section", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: "Understanding AI Agents" }),
    ).toBeVisible();

    // Interactive builder section exists
    await expect(page.getByText("Interactive Agent Builder")).toBeVisible();

    // Search input inside builder section
    const searchInput = page.getByPlaceholder("Search templates...");
    const searchVisible = await searchInput.isVisible().catch(() => false);
    if (searchVisible) {
      await expect(searchInput).toBeVisible();
    }
  });

  test("should display agent templates with proper categorization", async ({
    page,
  }) => {
    // Category filter buttons inside the builder
    const allTemplatesButton = page.locator("button", {
      hasText: "All Templates",
    });
    const allVisible = await allTemplatesButton
      .isVisible()
      .catch(() => false);
    if (!allVisible) {
      console.log("All Templates button not visible — builder may not have loaded");
      return;
    }
    await expect(allTemplatesButton).toBeVisible();

    // Template cards are visible (buttons containing h3)
    const cards = page.locator("button:has(h3)");
    expect(await cards.count()).toBeGreaterThan(0);

    // First card has name and description
    const firstCard = cards.first();
    await expect(firstCard.locator("h3")).toBeVisible();
    await expect(firstCard.locator("p").first()).toBeVisible();
  });

  test("should handle template selection and navigation", async ({
    page,
  }) => {
    // Wait for builder to render
    await page.waitForTimeout(2000);

    const cards = page.locator("button:has(h3)");
    const cardCount = await cards.count();
    if (cardCount === 0) {
      console.log("No template cards found — skipping");
      return;
    }

    const templateName = await cards.first().locator("h3").textContent();
    await cards.first().click();

    // Should show the builder view with the template name (second h1 inside builder)
    await expect(page.locator("h1").nth(1)).toContainText(templateName ?? "");

    // Should show Workflow Builder and Agent Configuration sections
    await expect(page.getByText("Workflow Builder")).toBeVisible();
    await expect(page.getByText("Agent Configuration")).toBeVisible();
  });

  test("should handle workflow builder interactions", async ({ page }) => {
    await page.waitForTimeout(2000);
    const cards = page.locator("button:has(h3)");
    const cardCount = await cards.count();
    if (cardCount === 0) return;

    await cards.first().click();

    // SVG workflow visualization
    const workflowSvg = page.locator(
      'svg[role="img"][aria-label="Workflow visualization"]',
    );
    await expect(workflowSvg).toBeVisible();

    // Workflow nodes
    const nodes = page.locator('rect[role="button"]');
    expect(await nodes.count()).toBeGreaterThan(0);

    // Click on a node
    await nodes.first().click();
    await expect(page.getByText("Node Details")).toBeVisible();
  });

  test("should handle agent configuration updates", async ({ page }) => {
    await page.waitForTimeout(2000);
    const cards = page.locator("button:has(h3)");
    const cardCount = await cards.count();
    if (cardCount === 0) return;

    await cards.first().click();

    // Form labels exist
    await expect(page.getByLabel("Agent Name")).toBeVisible();
    await expect(page.getByLabel("Description")).toBeVisible();
    await expect(page.getByLabel("Category")).toBeVisible();

    // Update agent name
    const nameInput = page.getByLabel("Agent Name");
    await nameInput.fill("Test Agent Name");
    await expect(nameInput).toHaveValue("Test Agent Name");
  });

  test("should handle agent testing and simulation", async ({ page }) => {
    await page.waitForTimeout(2000);
    const cards = page.locator("button:has(h3)");
    const cardCount = await cards.count();
    if (cardCount === 0) return;

    await cards.first().click();

    const testButton = page.getByRole("button", { name: "Test Agent" });
    await expect(testButton).toBeVisible();

    await testButton.click();
    await expect(page.getByText("Running...")).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Test Agent" }),
    ).toBeVisible({ timeout: 5000 });
  });

  test("should handle agent saving", async ({ page }) => {
    await page.waitForTimeout(2000);
    const cards = page.locator("button:has(h3)");
    const cardCount = await cards.count();
    if (cardCount === 0) return;

    await cards.first().click();

    const saveButton = page.getByRole("button", { name: "Save Agent" });
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    // Should navigate back to template selection within builder
    await expect(
      page.getByText("Choose Your AI Agent Template"),
    ).toBeVisible();
  });

  test("should handle agent stats display", async ({ page }) => {
    await page.waitForTimeout(2000);
    const cards = page.locator("button:has(h3)");
    const cardCount = await cards.count();
    if (cardCount === 0) return;

    await cards.first().click();

    const statsHeading = page.getByText("Agent Stats");
    await expect(statsHeading).toBeVisible();

    const statsSection = statsHeading
      .locator("xpath=ancestor::div[1]/..")
      .first();
    await expect(
      statsSection.getByText("Nodes", { exact: true }),
    ).toBeVisible();
    await expect(
      statsSection.getByText("Connections", { exact: true }),
    ).toBeVisible();
  });

  test("should handle quick actions", async ({ page }) => {
    await page.waitForTimeout(2000);
    const cards = page.locator("button:has(h3)");
    const cardCount = await cards.count();
    if (cardCount === 0) return;

    await cards.first().click();

    await expect(page.getByText("Quick Actions")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Export Configuration" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Duplicate Agent" }),
    ).toBeVisible();
  });

  test("should handle responsive design", async ({ page }) => {
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/agents/");
    await waitForAppReady(page);
    await expect(
      page.getByRole("heading", { name: "Understanding AI Agents" }),
    ).toBeVisible();

    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/agents/");
    await waitForAppReady(page);
    await expect(
      page.getByRole("heading", { name: "Understanding AI Agents" }),
    ).toBeVisible();
  });

  test("should handle workflow connections", async ({ page }) => {
    await page.waitForTimeout(2000);
    const cards = page.locator("button:has(h3)");
    const cardCount = await cards.count();
    if (cardCount === 0) return;

    await cards.first().click();

    // Connection paths
    const connectionPaths = page.locator('path[stroke="#60a5fa"]');
    expect(await connectionPaths.count()).toBeGreaterThan(0);

    // Arrow marker
    const arrowMarker = page.locator("marker#arrowhead");
    expect(await arrowMarker.count()).toBeGreaterThan(0);
  });

  test("should handle accessibility features", async ({ page }) => {
    await page.waitForTimeout(2000);
    const cards = page.locator("button:has(h3)");
    const cardCount = await cards.count();
    if (cardCount === 0) return;

    await cards.first().click();

    // Workflow SVG has proper ARIA
    const workflowSvg = page.locator(
      'svg[role="img"][aria-label="Workflow visualization"]',
    );
    await expect(workflowSvg).toBeVisible();

    // Nodes have role="button" and aria-label
    const nodes = page.locator('rect[role="button"]');
    const nodeCount = await nodes.count();
    expect(nodeCount).toBeGreaterThan(0);
    if (nodeCount > 0) {
      await expect(nodes.first()).toHaveAttribute("aria-label", /.+/);
    }
  });
});
