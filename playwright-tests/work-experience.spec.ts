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
    await expect(page.getByText("Estarta Solutions")).toBeVisible();
    await expect(page.getByText("Cosmos Business Systems")).toBeVisible();
    await expect(
      page.getByText("CPI SA", { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByText("Athens International Airport"),
    ).toBeVisible();
    await expect(
      page.getByText("Cosmote", { exact: false }),
    ).toBeVisible();
  });

  test("should display position titles", async ({ page }) => {
    await expect(
      page.getByText("Systems and Network Engineer"),
    ).toBeVisible();
    await expect(page.getByText("IT Support Engineer")).toBeVisible();
    await expect(page.getByText("IT Consultant")).toBeVisible();
    await expect(
      page.getByText("Network & Infrastructure Engineer"),
    ).toBeVisible();
    await expect(
      page.getByText("Telecommunications Engineer"),
    ).toBeVisible();
  });

  test("should display time periods", async ({ page }) => {
    await expect(
      page.getByText("Dec 2024", { exact: false }).first(),
    ).toBeVisible();
    await expect(
      page.getByText("Mar 2023", { exact: false }).first(),
    ).toBeVisible();
    await expect(
      page.getByText("Jun 2021", { exact: false }).first(),
    ).toBeVisible();
  });

  test("should display locations", async ({ page }) => {
    await expect(page.getByText("Remote")).toBeVisible();
    const athensLocations = page.getByText("Athens, Greece");
    expect(await athensLocations.count()).toBeGreaterThanOrEqual(3);
  });

  test("should display responsibility bullet points", async ({ page }) => {
    // Estarta responsibilities
    await expect(
      page.getByText("Cisco virtualization", { exact: false }),
    ).toBeVisible();
    // Cosmos responsibilities
    await expect(
      page.getByText("Azure Active Directory", { exact: false }),
    ).toBeVisible();
    // Athens Airport
    await expect(
      page.getByText("airport network infrastructure", { exact: false }),
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
