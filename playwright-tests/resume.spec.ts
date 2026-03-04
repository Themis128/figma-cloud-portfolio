import { expect, test } from "@playwright/test";

test.describe("Resume Page", () => {
  test("should load resume page with hero section", async ({ page }) => {
    await page.goto("/resume");
    await page.waitForLoadState("domcontentloaded");

    // The resume page shows "Resume Builder" as the h1 heading
    await expect(page.locator("h1")).toBeVisible();
    const headingText = await page.locator("h1").textContent();
    expect(headingText).toContain("Resume Builder");
  });

  test("should display Coming Soon badge", async ({ page }) => {
    await page.goto("/resume");
    await page.waitForLoadState("domcontentloaded");

    // Should show "Coming Soon" badge (use .first() — text appears in badge and may repeat)
    await expect(page.getByText("Coming Soon").first()).toBeVisible();
  });

  test("should display subtitle description", async ({ page }) => {
    await page.goto("/resume");
    await page.waitForLoadState("domcontentloaded");

    // Should show the subtitle
    await expect(
      page.getByText("Interactive resume builder coming soon"),
    ).toBeVisible();
  });

  test("should display feature preview tags", async ({ page }) => {
    await page.goto("/resume");
    await page.waitForLoadState("domcontentloaded");

    // Should show feature tags (use exact match to avoid matching headings/descriptions)
    // The tags are rendered as styled <span> elements in the hero section
    const featureTags = page.locator("span").filter({ hasText: /^(AI-Powered|ATS-Optimized|Multiple Templates|Real-time Preview)$/ });
    const count = await featureTags.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test("should have email signup form", async ({ page }) => {
    await page.goto("/resume");
    await page.waitForLoadState("domcontentloaded");

    // Should have email input and notify button
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    const notifyButton = page.getByRole("button", { name: "Notify Me" });
    await expect(notifyButton).toBeVisible();
  });

  test("should handle email signup submission", async ({ page }) => {
    await page.goto("/resume");
    await page.waitForLoadState("domcontentloaded");

    // Fill in email
    await page.fill('input[type="email"]', "test@example.com");

    // Submit
    await page.getByRole("button", { name: "Notify Me" }).click();

    // Should show confirmation (text includes a checkmark prefix)
    await page.waitForTimeout(500);
    await expect(
      page.getByText("notify you when it launches", { exact: false }),
    ).toBeVisible();
  });
});
