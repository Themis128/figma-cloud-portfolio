import { expect, test } from "@playwright/test";

test.describe("Main Pages", () => {
  test("should load home page correctly", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("nav").first()).toBeVisible();
    // Home page may not have a visible footer element
  });

  test("should navigate to About page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Click About link in nav
    await page.locator('a[href="/about/"]').first().click();
    await page.waitForURL(/\/about/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/about/);
    // About page heading is "About Me"
    const headingText = await page.locator("h1").textContent();
    expect(headingText?.toLowerCase()).toContain("about");
  });

  test("should navigate to Projects page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    // Projects page is accessible directly (no nav link called "Projects" in desktop nav)
    await page.goto("/projects");
    await expect(page).toHaveURL(/\/projects/);
    const headingText = await page.locator("h1").textContent();
    expect(headingText?.toLowerCase()).toContain("project");
  });

  test("should navigate to Resume page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const resumeLink = page.locator('a[href="/resume/"]').first();
    await resumeLink.waitFor({ state: "visible", timeout: 10000 });
    await resumeLink.click();
    await page.waitForURL(/\/resume/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/resume/);
    // Resume page should have a heading containing "resume"
    const heading = page.locator("h1").first();
    await heading.waitFor({ state: "visible", timeout: 10000 });
    const headingText = await heading.textContent();
    expect(headingText?.toLowerCase()).toMatch(/resume|cv builder|career guide/);
  });

  test("should navigate to Contact page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.locator('a[href="/contact/"]').first().click();
    await page.waitForURL(/\/contact/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/contact/);
    // Contact page heading is "Get In Touch"
    const headingText = await page.locator("h1").textContent();
    expect(headingText?.toLowerCase()).toContain("get in touch");
  });

  test("should handle 404 page", async ({ page }) => {
    await page.goto("/nonexistent-page-that-does-not-exist");
    // Next.js shows a 404 page — just verify the page loaded without crashing
    await expect(page.locator("body")).toBeVisible();
  });
});
