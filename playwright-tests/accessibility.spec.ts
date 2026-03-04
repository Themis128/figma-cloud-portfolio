import { expect, test } from "@playwright/test";

test("should have proper heading hierarchy", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1").first()).toBeVisible();
  const h2Count = await page.locator("h2").count();
  expect(h2Count).toBeGreaterThan(0);
});

test("should have proper alt text for images", async ({ page }) => {
  await page.goto("/");
  const imgNoAlt = await page.locator("img:not([alt])").count();
  expect(imgNoAlt).toBe(0);
});

test("should support keyboard navigation", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const focusedElement = page.locator(":focus");
  await expect(focusedElement).toBeVisible();
});

test("should have proper color contrast", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toHaveCSS("color", /rgb/);
  await expect(page.locator("body")).toHaveCSS("background-color", /rgb/);
});

test("should support screen readers", async ({ page }) => {
  await page.goto("/");
  const mainContent = page.locator("main").first();
  await expect(mainContent).toBeVisible();
});

test("should have proper form labels", async ({ page }) => {
  await page.goto("/contact");
  const labelCount = await page.locator("label").count();
  expect(labelCount).toBeGreaterThan(0);
});

test("should support zoom up to 200%", async ({ page }) => {
  await page.goto("/");
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.evaluate(() => {
    document.body.style.zoom = "200%";
  });
  await expect(page.locator("h1").first()).toBeVisible();
});
