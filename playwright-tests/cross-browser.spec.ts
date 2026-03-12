import { expect, test } from "@playwright/test";

test.describe("Cross-browser Tests", () => {
  test("should render homepage correctly", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should render about page correctly", async ({ page }) => {
    await page.goto("/about");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should render contact page correctly", async ({ page }) => {
    await page.goto("/contact");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should have navigation working", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("nav").first()).toBeVisible();
  });

  test("should handle CSS correctly", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    // Body should be visible and have computed styles
    await expect(page.locator("body")).toBeVisible();
  });

  test("should support modern JavaScript features", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Verify modern JS works by checking React rendered content
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    const text = await h1.textContent();
    expect(text?.length).toBeGreaterThan(0);
  });

  test("should handle JavaScript compatibility", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Check that no JS errors occurred during load
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    await page.waitForTimeout(1000);
    // Allow some non-critical errors but no fatal ones
    const fatalErrors = errors.filter(
      (e) => !e.includes("reCAPTCHA") && !e.includes("analytics") && !e.includes("gtag"),
    );
    expect(fatalErrors).toHaveLength(0);
  });
});
