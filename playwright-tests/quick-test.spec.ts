import { expect, test } from "@playwright/test";

test("homepage loads and displays content", async ({ page }) => {
  await page.goto("/");

  // Wait for the page to load
  await page.waitForLoadState("domcontentloaded");

  // Check the title
  await expect(page).toHaveTitle(/Themistoklis/);

  // Check main heading is visible — h1 contains "Themistoklis" and "Baltzakis"
  const heading = page.locator("h1").first();
  await expect(heading).toBeVisible();
  const headingText = await heading.textContent();
  expect(headingText?.toLowerCase()).toContain("themistoklis");

  // Check navigation exists
  const nav = page.locator("nav").first();
  await expect(nav).toBeVisible();
});

test("can navigate to Agents page", async ({ page }) => {
  test.setTimeout(30_000);
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");

  // Click on first Agents link (in nav)
  const agentsLink = page.locator('a:has-text("Agents")').first();
  await agentsLink.waitFor({ state: "visible", timeout: 10000 });
  await agentsLink.click();

  // Wait for navigation
  await page.waitForURL(/agents/, { timeout: 15000 });

  // Check we're on the agents page
  await expect(page).toHaveURL(/agents/);
});

test("theme toggle works", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");

  // ThemeToggle has data-testid="theme-toggle"
  const themeToggle = page.locator('[data-testid="theme-toggle"]');
  await themeToggle.waitFor({ state: "visible", timeout: 5000 });

  // Click it
  await themeToggle.click();

  // Should still be visible after click
  await expect(themeToggle).toBeVisible();
});
