import { expect, test } from "@playwright/test";

test.describe("Comprehensive Tests", () => {
  test("should load homepage with heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("should load homepage with navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("nav").first()).toBeVisible();
  });

  test("should navigate to projects page", async ({ page }) => {
    // Navigate directly since "Projects" is not in the main navigation
    await page.goto("/projects");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/projects/);
  });

  test("should navigate to about page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.click("text=About");
    await page.waitForURL(/\/about/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/about/);
  });

  test("should navigate to contact page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.click("text=Contact");
    await page.waitForURL(/\/contact/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/contact/);
  });

  test("should navigate to resume page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.click("text=Resume");
    await page.waitForURL(/\/resume/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/resume/);
  });

  test("should load contact page with form", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("form").first()).toBeVisible();
  });

  test("should have proper page title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/./);
  });

  test("should respond quickly", async ({ page }) => {
    const start = Date.now();
    await page.goto("/");
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(30000);
  });

  test("should have no console errors on homepage", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const criticalErrors = errors.filter(
      (e) => !e.includes("hydration") && !e.includes("HMR"),
    );
    expect(criticalErrors.length).toBe(0);
  });
});
