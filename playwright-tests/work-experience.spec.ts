import { expect, test } from "@playwright/test";

/**
 * Work Experience Page Tests
 *
 * Tests /product page — company cards, timeline, responsibilities, CTAs.
 */

test.describe("Work Experience Page — Content", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/product");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display page heading", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Work Experience");
  });

  test("should display all 5 companies", async ({ page }) => {
    // InteractiveTimeline renders both desktop and mobile views, use .first()
    await expect(page.getByText("Skaramangas Shipyards").first()).toBeVisible();
    await expect(page.getByText("Estarta Solutions").first()).toBeVisible();
    await expect(page.getByText("Cosmos Business Systems").first()).toBeVisible();
    await expect(
      page.getByText("CPI SA", { exact: false }).first(),
    ).toBeVisible();
    await expect(
      page.getByText("Printec Hellas").first(),
    ).toBeVisible();
  });

  test("should display position titles", async ({ page }) => {
    await expect(
      page.getByText("IT Network Engineer").first(),
    ).toBeVisible();
    await expect(page.getByText("Network and Systems Engineer").first()).toBeVisible();
    await expect(page.getByText("IT Consultant Analyst").first()).toBeVisible();
    await expect(
      page.getByText("Technical Engineer").first(),
    ).toBeVisible();
  });

  test("should display time periods", async ({ page }) => {
    await expect(
      page.getByText("2025", { exact: false }).first(),
    ).toBeVisible();
    await expect(
      page.getByText("Mar 2023", { exact: false }).first(),
    ).toBeVisible();
    await expect(
      page.getByText("Jan 2022", { exact: false }).first(),
    ).toBeVisible();
  });

  test("should display locations", async ({ page }) => {
    const greeceLocations = page.getByText("Greece", { exact: false });
    expect(await greeceLocations.count()).toBeGreaterThanOrEqual(3);
  });

  test("should display responsibility bullet points", async ({ page }) => {
    // Skaramangas responsibilities
    await expect(
      page.getByText("Cisco-based network infrastructure", { exact: false }).first(),
    ).toBeVisible();
    // Cosmos responsibilities
    await expect(
      page.getByText("Azure Active Directory", { exact: false }).first(),
    ).toBeVisible();
    // Printec
    await expect(
      page.getByText("Windows and Cisco Systems", { exact: false }).first(),
    ).toBeVisible();
  });
});

test.describe("Work Experience Page — CTAs", () => {
  test("should have CTA buttons", async ({ page }) => {
    await page.goto("/product");
    await page.waitForLoadState("domcontentloaded");

    // Scope to #main-content to avoid matching nav links
    const main = page.locator("#main-content");
    await expect(
      main.getByText("Build Resume", { exact: false }).first(),
    ).toBeVisible();
    await expect(
      main.getByText("Get In Touch", { exact: false }).first(),
    ).toBeVisible();
  });

  test("'Get In Touch' should link to /contact", async ({ page }) => {
    await page.goto("/product");
    await page.waitForLoadState("domcontentloaded");

    const contactLink = page.locator('a[href*="/contact"]').filter({ hasText: "Get In Touch" });
    await expect(contactLink.first()).toBeAttached();
  });
});
