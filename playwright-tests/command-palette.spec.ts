import { expect, test } from "@playwright/test";

/**
 * Command Palette Tests
 *
 * Tests the Ctrl+K / Cmd+K command palette overlay.
 */

test.describe("CommandPalette", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("opens with Ctrl+K shortcut", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await page.waitForTimeout(300);

    const dialog = page.locator('div[role="dialog"][aria-label="Command palette"]');
    await expect(dialog).toBeVisible();
  });

  test("closes with Escape key", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await page.waitForTimeout(300);

    const dialog = page.locator('div[role="dialog"][aria-label="Command palette"]');
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    await expect(dialog).not.toBeVisible();
  });

  test("closes when clicking backdrop", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await page.waitForTimeout(300);

    // Click the backdrop (outside the panel)
    await page.locator(".bg-black\\/60").click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(300);

    const dialog = page.locator('div[role="dialog"][aria-label="Command palette"]');
    await expect(dialog).not.toBeVisible();
  });

  test("has search input with placeholder", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await page.waitForTimeout(300);

    const input = page.locator('input[aria-label="Search commands"]');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute(
      "placeholder",
      "Search pages, actions...",
    );
  });

  test("displays Pages and Actions categories", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await page.waitForTimeout(300);

    await expect(page.getByText("Pages", { exact: true })).toBeVisible();
    await expect(page.getByText("Actions", { exact: true })).toBeVisible();
  });

  test("shows navigation items: Home, About, Contact", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await page.waitForTimeout(300);

    const dialog = page.locator('div[role="dialog"][aria-label="Command palette"]');
    await expect(dialog.getByText("Home", { exact: true })).toBeVisible();
    await expect(dialog.getByText("About", { exact: true })).toBeVisible();
    await expect(dialog.getByText("Contact", { exact: true })).toBeVisible();
  });

  test("filters results when typing a query", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await page.waitForTimeout(300);

    const input = page.locator('input[aria-label="Search commands"]');
    await input.fill("performance");
    await page.waitForTimeout(200);

    const dialog = page.locator('div[role="dialog"][aria-label="Command palette"]');
    await expect(dialog.getByText("Performance", { exact: true })).toBeVisible();

    // Other nav items should be filtered out
    const aboutBtn = dialog.locator("button", { hasText: "About" });
    await expect(aboutBtn).toHaveCount(0);
  });

  test("shows 'No results found' for non-matching query", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await page.waitForTimeout(300);

    const input = page.locator('input[aria-label="Search commands"]');
    await input.fill("xyznonexistent");
    await page.waitForTimeout(200);

    await expect(page.getByText("No results found")).toBeVisible();
  });

  test("navigates to page on Enter", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await page.waitForTimeout(300);

    // Type "about" to filter to the About page
    const input = page.locator('input[aria-label="Search commands"]');
    await input.fill("about");
    await page.waitForTimeout(200);

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/about/);
  });

  test("keyboard navigation with arrow keys", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await page.waitForTimeout(300);

    // Press ArrowDown to move selection
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(100);

    // Second item should now be selected (data-selected="true")
    const selected = page.locator('[data-selected="true"]');
    await expect(selected).toBeVisible();
  });

  test("has footer with keyboard hints", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await page.waitForTimeout(300);

    await expect(page.getByText("navigate", { exact: false })).toBeVisible();
    await expect(page.getByText("select", { exact: false })).toBeVisible();
  });
});
