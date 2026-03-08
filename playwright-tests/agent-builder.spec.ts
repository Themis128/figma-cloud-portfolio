import { expect, test } from "@playwright/test";
import { waitForAppReady } from "./test-utils";

test.describe("Agent Builder", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/agents");
    await waitForAppReady(page);
  });

  test("should load agent builder page with all sections", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: "AI Agent Templates" }),
    ).toBeVisible();

    await expect(page.getByText("Choose Your AI Agent Template")).toBeVisible();

    await expect(
      page.getByPlaceholder("Search templates..."),
    ).toBeVisible();
  });

  test("should display agent templates with proper categorization", async ({
    page,
  }) => {
    // Category filter buttons
    await expect(
      page.locator("button", { hasText: "All Templates" }),
    ).toBeVisible();

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
    const cards = page.locator("button:has(h3)");
    await expect(cards.first()).toBeVisible();

    const templateName = await cards.first().locator("h3").textContent();
    await cards.first().click();

    // Should show the builder view with the template name
    await expect(page.locator("h1")).toContainText(templateName ?? "");

    // Should show Workflow Builder section
    await expect(page.getByText("Workflow Builder")).toBeVisible();

    // Should show Agent Configuration section
    await expect(page.getByText("Agent Configuration")).toBeVisible();
  });

  test("should handle workflow builder interactions", async ({ page }) => {
    const cards = page.locator("button:has(h3)");
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

    // Should show node details
    await expect(page.getByText("Node Details")).toBeVisible();
  });

  test("should handle agent configuration updates", async ({ page }) => {
    const cards = page.locator("button:has(h3)");
    await cards.first().click();

    // Form labels exist
    await expect(page.getByLabel("Agent Name")).toBeVisible();
    await expect(page.getByLabel("Description")).toBeVisible();
    await expect(page.getByLabel("Category")).toBeVisible();

    // Update agent name
    const nameInput = page.getByLabel("Agent Name");
    await nameInput.fill("Test Agent Name");
    await expect(nameInput).toHaveValue("Test Agent Name");

    // Update description
    const descriptionInput = page.getByLabel("Description");
    await descriptionInput.fill("This is a test agent description");
    await expect(descriptionInput).toHaveValue(
      "This is a test agent description",
    );

    // Update category
    const categorySelect = page.getByLabel("Category");
    await categorySelect.selectOption("advanced");
    await expect(categorySelect).toHaveValue("advanced");
  });

  test("should handle agent testing and simulation", async ({ page }) => {
    const cards = page.locator("button:has(h3)");
    await cards.first().click();

    const testButton = page.getByRole("button", { name: "Test Agent" });
    await expect(testButton).toBeVisible();

    await testButton.click();

    // Should show running state
    await expect(page.getByText("Running...")).toBeVisible();

    // Wait for simulation to complete (2000ms + buffer)
    await expect(
      page.getByRole("button", { name: "Test Agent" }),
    ).toBeVisible({ timeout: 5000 });
  });

  test("should handle agent saving", async ({ page }) => {
    const cards = page.locator("button:has(h3)");
    await cards.first().click();

    const saveButton = page.getByRole("button", { name: "Save Agent" });
    await expect(saveButton).toBeVisible();

    await saveButton.click();

    // Should navigate back to template selection
    await expect(
      page.getByText("Choose Your AI Agent Template"),
    ).toBeVisible();
  });

  test("should handle agent stats display", async ({ page }) => {
    const cards = page.locator("button:has(h3)");
    await cards.first().click();

    const statsHeading = page.getByText("Agent Stats");
    await expect(statsHeading).toBeVisible();

    // Scope to the stats section to avoid strict mode violations
    const statsSection = statsHeading.locator("xpath=ancestor::div[1]/..").first();
    await expect(statsSection.getByText("Nodes", { exact: true })).toBeVisible();
    await expect(statsSection.getByText("Connections", { exact: true })).toBeVisible();
    await expect(statsSection.getByText("Features", { exact: true })).toBeVisible();
    await expect(statsSection.getByText("Difficulty", { exact: true })).toBeVisible();
  });

  test("should handle quick actions", async ({ page }) => {
    const cards = page.locator("button:has(h3)");
    await cards.first().click();

    await expect(page.getByText("Quick Actions")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Export Configuration" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Duplicate Agent" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Delete Agent" }),
    ).toBeVisible();
  });

  test("should handle responsive design", async ({ page }) => {
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/agents");
    await waitForAppReady(page);
    await expect(
      page.getByRole("heading", { name: "AI Agent Templates" }),
    ).toBeVisible();

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/agents");
    await waitForAppReady(page);
    await expect(
      page.getByRole("heading", { name: "AI Agent Templates" }),
    ).toBeVisible();

    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/agents");
    await waitForAppReady(page);
    await expect(
      page.getByRole("heading", { name: "AI Agent Templates" }),
    ).toBeVisible();
  });

  test("should handle workflow node interactions", async ({ page }) => {
    const cards = page.locator("button:has(h3)");
    await cards.first().click();

    const nodes = page.locator('rect[role="button"]');
    expect(await nodes.count()).toBeGreaterThan(0);

    // Click on a node to show details
    await nodes.first().click();
    await expect(page.getByText("Node Details")).toBeVisible();
  });

  test("should handle workflow connections", async ({ page }) => {
    const cards = page.locator("button:has(h3)");
    await cards.first().click();

    // Connection paths
    const connectionPaths = page.locator('path[stroke="#60a5fa"]');
    expect(await connectionPaths.count()).toBeGreaterThan(0);

    // Arrow marker
    const arrowMarker = page.locator("marker#arrowhead");
    expect(await arrowMarker.count()).toBeGreaterThan(0);
  });

  test("should handle error states gracefully", async ({ page }) => {
    const cards = page.locator("button:has(h3)");
    await cards.first().click();

    // Clear agent name and save
    const nameInput = page.getByLabel("Agent Name");
    await nameInput.fill("");

    const saveButton = page.getByRole("button", { name: "Save Agent" });
    await saveButton.click();

    // Page should remain functional
    await expect(page.locator("body")).toBeVisible();
  });

  test("should handle keyboard navigation", async ({ page }) => {
    const cards = page.locator("button:has(h3)");
    await cards.first().click();

    // Tab through form elements
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    await expect(page.locator("body")).toBeVisible();
  });

  test("should handle accessibility features", async ({ page }) => {
    const cards = page.locator("button:has(h3)");
    await cards.first().click();

    // Workflow SVG has proper ARIA
    const workflowSvg = page.locator('svg[role="img"][aria-label="Workflow visualization"]');
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
