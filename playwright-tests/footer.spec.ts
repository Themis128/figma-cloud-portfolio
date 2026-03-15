import { expect, test } from "@playwright/test";

/**
 * Footer Tests
 *
 * Tests the enhanced footer with sitemap, social links, legal links, and tech stack.
 */

test.describe("Footer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("renders footer element", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeAttached();
  });

  test("has footer navigation with sitemap links", async ({ page }) => {
    const footerNav = page.locator('footer nav[aria-label="Footer navigation"]');
    await expect(footerNav).toBeAttached();

    const sitemapLinks = ["Home", "About", "Experience", "Projects", "Contact", "Performance"];
    for (const name of sitemapLinks) {
      await expect(footerNav.getByText(name, { exact: true })).toBeAttached();
    }
  });

  test("has social links with correct aria-labels", async ({ page }) => {
    const footer = page.locator("footer");

    const linkedIn = footer.locator('a[aria-label="LinkedIn"]');
    await expect(linkedIn).toBeAttached();
    await expect(linkedIn).toHaveAttribute("target", "_blank");

    const github = footer.locator('a[aria-label="GitHub"]');
    await expect(github).toBeAttached();
    await expect(github).toHaveAttribute("target", "_blank");

    const email = footer.locator('a[aria-label="Email"]');
    await expect(email).toBeAttached();
    await expect(email).toHaveAttribute("href", /mailto:/);
  });

  test("displays copyright text", async ({ page }) => {
    const year = new Date().getFullYear().toString();
    await expect(
      page.locator("footer").getByText(`${year}`, { exact: false }),
    ).toBeVisible();
    await expect(
      page.locator("footer").getByText("Themistoklis Baltzakis", { exact: false }),
    ).toBeVisible();
  });

  test("has legal navigation links", async ({ page }) => {
    const legalNav = page.locator('footer nav[aria-label="Legal"]');
    await expect(legalNav).toBeAttached();

    await expect(legalNav.getByText("Privacy", { exact: true })).toBeAttached();
    await expect(legalNav.getByText("Cookies", { exact: true })).toBeAttached();
    await expect(legalNav.getByText("Terms", { exact: true })).toBeAttached();
  });

  test("displays 'Built with' tech stack line", async ({ page }) => {
    await expect(
      page.locator("footer").getByText("Built with Next.js", { exact: false }),
    ).toBeAttached();
  });
});
