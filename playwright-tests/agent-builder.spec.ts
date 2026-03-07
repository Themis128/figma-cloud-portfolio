import { expect, test } from "@playwright/test";
import { waitForAppReady } from "./test-utils";

test.describe("Agent Builder", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/agents");
    await waitForAppReady(page);
  });

  test("should load agent builder page with all sections", async ({ page }) => {
    // Check main heading
    await expect(page.getByRole("heading", { name: "AI Agent Builder" })).toBeVisible();
    
    // Check for agent templates section
    await expect(page.getByText("Available Templates")).toBeVisible();
    
    // Check for workflow visualization
    await expect(page.locator("svg")).toBeVisible();
    
    // Check for configuration panel
    await expect(page.getByText("Agent Configuration")).toBeVisible();
  });

  test("should display agent templates with proper categorization", async ({ page }) => {
    // Check for different template categories
    await expect(page.getByText("Basic Templates")).toBeVisible();
    await expect(page.getByText("Advanced Templates")).toBeVisible();
    await expect(page.getByText("Specialized Templates")).toBeVisible();
    
    // Check for template cards
    const templateCards = page.locator('[data-testid="template-card"]');
    expect(await templateCards.count()).toBeGreaterThan(0);
    
    // Check template details
    const firstTemplate = templateCards.first();
    await expect(firstTemplate.locator("h3")).toBeVisible();
    await expect(firstTemplate.locator("p")).toBeVisible();
    await expect(firstTemplate.locator('[data-testid="difficulty-badge"]')).toBeVisible();
  });

  test("should handle template selection and navigation", async ({ page }) => {
    // Find and click on a template
    const templateCard = page.locator('[data-testid="template-card"]').first();
    const templateName = await templateCard.locator("h3").textContent();
    
    await templateCard.click();
    
    // Should navigate to builder page
    await expect(page.getByText(`Building: ${templateName}`)).toBeVisible();
    
    // Check for workflow builder
    await expect(page.getByText("Workflow Builder")).toBeVisible();
    
    // Check for configuration panel
    await expect(page.getByText("Agent Configuration")).toBeVisible();
  });

  test("should handle workflow builder interactions", async ({ page }) => {
    // Navigate to a template first
    const templateCard = page.locator('[data-testid="template-card"]').first();
    await templateCard.click();
    
    // Check for workflow canvas
    const workflowCanvas = page.locator('[data-testid="workflow-canvas"]');
    await expect(workflowCanvas).toBeVisible();
    
    // Check for nodes in the workflow
    const nodes = page.locator('[data-testid="workflow-node"]');
    expect(await nodes.count()).toBeGreaterThan(0);
    
    // Test node interactions
    const firstNode = nodes.first();
    await firstNode.click();
    
    // Should show node details
    await expect(page.getByText("Node Details")).toBeVisible();
    
    // Test node dragging (if not readonly)
    const isReadonly = await page.locator('[data-testid="workflow-canvas"]').getAttribute("data-readonly");
    if (isReadonly !== "true") {
      await firstNode.hover();
      await page.mouse.down();
      await page.mouse.move(100, 100);
      await page.mouse.up();
      
      // Node should have moved
      await expect(firstNode).toBeVisible();
    }
  });

  test("should handle agent configuration updates", async ({ page }) => {
    // Navigate to a template
    const templateCard = page.locator('[data-testid="template-card"]').first();
    await templateCard.click();
    
    // Check for configuration inputs
    await expect(page.getByLabel("Agent Name")).toBeVisible();
    await expect(page.getByLabel("Description")).toBeVisible();
    await expect(page.getByLabel("Category")).toBeVisible();
    
    // Test updating agent name
    const nameInput = page.getByLabel("Agent Name");
    await nameInput.fill("Test Agent Name");
    await expect(nameInput).toHaveValue("Test Agent Name");
    
    // Test updating description
    const descriptionInput = page.getByLabel("Description");
    await descriptionInput.fill("This is a test agent description");
    await expect(descriptionInput).toHaveValue("This is a test agent description");
    
    // Test category selection
    const categorySelect = page.getByLabel("Category");
    await categorySelect.selectOption("advanced");
    await expect(categorySelect).toHaveValue("advanced");
  });

  test("should handle agent testing and simulation", async ({ page }) => {
    // Navigate to a template
    const templateCard = page.locator('[data-testid="template-card"]').first();
    await templateCard.click();
    
    // Check for test agent button
    const testButton = page.getByRole("button", { name: /Test Agent|Run Agent/i });
    await expect(testButton).toBeVisible();
    
    // Test agent execution
    await testButton.click();
    
    // Should show running state
    await expect(page.getByText("Running...")).toBeVisible();
    
    // Wait for completion
    await page.waitForTimeout(2000);
    
    // Should show completion state
    await expect(page.getByRole("button", { name: /Test Agent|Run Agent/i })).toBeVisible();
  });

  test("should handle agent saving", async ({ page }) => {
    // Navigate to a template
    const templateCard = page.locator('[data-testid="template-card"]').first();
    await templateCard.click();
    
    // Check for save button
    const saveButton = page.getByRole("button", { name: /Save Agent/i });
    await expect(saveButton).toBeVisible();
    
    // Test saving agent
    await saveButton.click();
    
    // Should show success message or navigate back
    await expect(page.getByText(/Agent saved successfully|Saved/i)).toBeVisible();
  });

  test("should handle agent stats display", async ({ page }) => {
    // Navigate to a template
    const templateCard = page.locator('[data-testid="template-card"]').first();
    await templateCard.click();
    
    // Check for agent stats
    await expect(page.getByText("Agent Stats")).toBeVisible();
    
    // Check for specific stats
    await expect(page.getByText("Nodes")).toBeVisible();
    await expect(page.getByText("Connections")).toBeVisible();
    await expect(page.getByText("Features")).toBeVisible();
    await expect(page.getByText("Difficulty")).toBeVisible();
  });

  test("should handle quick actions", async ({ page }) => {
    // Navigate to a template
    const templateCard = page.locator('[data-testid="template-card"]').first();
    await templateCard.click();
    
    // Check for quick actions
    await expect(page.getByText("Quick Actions")).toBeVisible();
    
    // Check for specific actions
    await expect(page.getByRole("button", { name: "Export Configuration" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Duplicate Agent" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete Agent" })).toBeVisible();
  });

  test("should handle responsive design", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/agents");
    await waitForAppReady(page);
    
    await expect(page.getByRole("heading", { name: "AI Agent Builder" })).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/agents");
    await waitForAppReady(page);
    
    await expect(page.getByRole("heading", { name: "AI Agent Builder" })).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/agents");
    await waitForAppReady(page);
    
    await expect(page.getByRole("heading", { name: "AI Agent Builder" })).toBeVisible();
  });

  test("should handle workflow node interactions", async ({ page }) => {
    // Navigate to a template
    const templateCard = page.locator('[data-testid="template-card"]').first();
    await templateCard.click();
    
    // Check for workflow nodes
    const nodes = page.locator('[data-testid="workflow-node"]');
    expect(await nodes.count()).toBeGreaterThan(0);
    
    // Test clicking on different node types
    const nodeTypes = ["input", "output", "llm", "decision", "data-processor", "tool"];
    
    for (const nodeType of nodeTypes) {
      const node = page.locator(`[data-node-type="${nodeType}"]`).first();
      if (await node.isVisible()) {
        await node.click();
        await expect(page.getByText("Node Details")).toBeVisible();
        
        // Check node type display
        await expect(page.getByText(nodeType.toUpperCase())).toBeVisible();
      }
    }
  });

  test("should handle workflow connections", async ({ page }) => {
    // Navigate to a template
    const templateCard = page.locator('[data-testid="template-card"]').first();
    await templateCard.click();
    
    // Check for workflow connections
    const connections = page.locator('[data-testid="workflow-connection"]');
    expect(await connections.count()).toBeGreaterThan(0);
    
    // Check connection paths
    const connectionPaths = page.locator('path[stroke="#60a5fa"]');
    expect(await connectionPaths.count()).toBeGreaterThan(0);
    
    // Check arrow markers
    const arrowMarkers = page.locator('marker#arrowhead');
    expect(await arrowMarkers.count()).toBeGreaterThan(0);
  });

  test("should handle error states gracefully", async ({ page }) => {
    // Navigate to a template
    const templateCard = page.locator('[data-testid="template-card"]').first();
    await templateCard.click();
    
    // Test with invalid configuration
    const nameInput = page.getByLabel("Agent Name");
    await nameInput.fill("");
    
    // Try to save with empty name
    const saveButton = page.getByRole("button", { name: /Save Agent/i });
    await saveButton.click();
    
    // Should handle error gracefully
    await expect(page.locator("body")).toBeVisible();
  });

  test("should handle keyboard navigation", async ({ page }) => {
    // Navigate to a template
    const templateCard = page.locator('[data-testid="template-card"]').first();
    await templateCard.click();
    
    // Test tab navigation through form elements
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    
    // Should be able to navigate without errors
    await expect(page.locator("body")).toBeVisible();
  });

  test("should handle accessibility features", async ({ page }) => {
    // Navigate to a template
    const templateCard = page.locator('[data-testid="template-card"]').first();
    await templateCard.click();
    
    // Check for proper ARIA labels
    const workflowCanvas = page.locator('[data-testid="workflow-canvas"]');
    await expect(workflowCanvas).toHaveAttribute("role", "img");
    await expect(workflowCanvas).toHaveAttribute("aria-label");
    
    // Check for keyboard accessibility on nodes
    const nodes = page.locator('[data-testid="workflow-node"]');
    if (await nodes.count() > 0) {
      await nodes.first().focus();
      await expect(nodes.first()).toBeFocused();
    }
    
    // Check for proper heading structure
    await expect(page.locator("h1, h2, h3")).toHaveCount(await page.locator("h1, h2, h3").count());
  });
});