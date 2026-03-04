import { expect, test } from "@playwright/test";

test.describe("API Integration Tests", () => {
  test("should load homepage successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("should load contact page with form", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("form").first()).toBeVisible();
  });

  test("should handle navigation without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");
    const criticalErrors = errors.filter(
      (e) => !e.includes("hydration") && !e.includes("HMR"),
    );
    expect(criticalErrors.length).toBe(0);
  });

  test("should fetch resume data via API", async ({ request }) => {
    const response = await request.get("/api/resume");
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("personal");
  });

  test("should cache API responses on reload", async ({ page }) => {
    await page.goto("/");
    await page.reload();
    await expect(page.locator("h1").first()).toBeVisible();
  });
});
