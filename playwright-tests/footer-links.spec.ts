import { expect, test } from "@playwright/test";

/**
 * Footer Links Tests
 *
 * Tests the Footer component: brand column, navigation links, legal links,
 * social links (LinkedIn, GitHub, Email), copyright year, tech stack line,
 * Manage Cookies button, and mobile rendering.
 */

const PAGES_TO_CHECK = ["/", "/about/", "/contact/", "/blog/"];

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/product/", label: "Experience" },
  { href: "/projects/", label: "Projects" },
  { href: "/blog/", label: "Blog" },
  { href: "/contact/", label: "Contact" },
  { href: "/performance/", label: "Performance" },
  { href: "/about/", label: "About" },
];

test.describe("Footer | Visibility", () => {
  for (const pagePath of PAGES_TO_CHECK) {
    test(`footer is visible on ${pagePath}`, async ({ page }) => {
      await page.goto(pagePath);
      await page.waitForLoadState("domcontentloaded");

      const footer = page.locator("footer");
      await expect(footer).toBeVisible();
    });
  }
});

test.describe("Footer | Brand", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("brand name is present", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer.getByText("Themis Baltzakis")).toBeVisible();
  });

  test("brand description is present", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(
      footer.getByText("Cloud Architect & Cybersecurity Specialist"),
    ).toBeVisible();
  });
});

test.describe("Footer | Navigation Links", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("navigation section has correct links", async ({ page }) => {
    const footerNav = page.locator('nav[aria-label="Footer navigation"]');
    await expect(footerNav).toBeVisible();

    for (const link of NAV_LINKS) {
      const navLink = footerNav.locator(`a:has-text("${link.label}")`);
      await expect(navLink).toBeVisible();
    }
  });

  test("all nav links have correct href values", async ({ page }) => {
    const footerNav = page.locator('nav[aria-label="Footer navigation"]');

    for (const link of NAV_LINKS) {
      const navLink = footerNav.locator(`a:has-text("${link.label}")`);
      await expect(navLink).toHaveAttribute("href", link.href);
    }
  });
});

test.describe("Footer | Legal Links", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("legal section has Privacy, Cookies, and Terms links", async ({
    page,
  }) => {
    const legalNav = page.locator('nav[aria-label="Legal"]');
    await expect(legalNav).toBeVisible();

    await expect(legalNav.locator('a:has-text("Privacy")')).toBeVisible();
    await expect(legalNav.locator('a:has-text("Cookies")')).toBeVisible();
    await expect(legalNav.locator('a:has-text("Terms")')).toBeVisible();
  });

  test("legal links have correct href values", async ({ page }) => {
    const legalNav = page.locator('nav[aria-label="Legal"]');

    await expect(legalNav.locator('a:has-text("Privacy")')).toHaveAttribute(
      "href",
      "/privacy/",
    );
    await expect(legalNav.locator('a:has-text("Cookies")')).toHaveAttribute(
      "href",
      "/cookies/",
    );
    await expect(legalNav.locator('a:has-text("Terms")')).toHaveAttribute(
      "href",
      "/terms/",
    );
  });
});

test.describe("Footer | Social Links", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("LinkedIn, GitHub, and Email social links are present", async ({
    page,
  }) => {
    const footer = page.locator("footer");

    await expect(
      footer.locator('a[aria-label="LinkedIn"]'),
    ).toBeVisible();
    await expect(
      footer.locator('a[aria-label="GitHub"]'),
    ).toBeVisible();
    await expect(
      footer.locator('a[aria-label="Email"]'),
    ).toBeVisible();
  });

  test("LinkedIn and GitHub links open in new tab", async ({ page }) => {
    const footer = page.locator("footer");

    const linkedIn = footer.locator('a[aria-label="LinkedIn"]');
    await expect(linkedIn).toHaveAttribute("target", "_blank");
    await expect(linkedIn).toHaveAttribute("rel", /noopener/);

    const github = footer.locator('a[aria-label="GitHub"]');
    await expect(github).toHaveAttribute("target", "_blank");
    await expect(github).toHaveAttribute("rel", /noopener/);
  });

  test("social links have correct hrefs", async ({ page }) => {
    const footer = page.locator("footer");

    await expect(
      footer.locator('a[aria-label="LinkedIn"]'),
    ).toHaveAttribute("href", "https://www.linkedin.com/in/baltzakis-themis");

    await expect(
      footer.locator('a[aria-label="GitHub"]'),
    ).toHaveAttribute("href", "https://github.com/Themis128");

    await expect(
      footer.locator('a[aria-label="Email"]'),
    ).toHaveAttribute("href", "mailto:baltzakis.themis@gmail.com");
  });

  test("Email link has mailto: prefix", async ({ page }) => {
    const footer = page.locator("footer");
    const emailLink = footer.locator('a[aria-label="Email"]');
    const href = await emailLink.getAttribute("href");
    expect(href).toMatch(/^mailto:/);
  });

  test("Email link does NOT open in new tab", async ({ page }) => {
    const footer = page.locator("footer");
    const emailLink = footer.locator('a[aria-label="Email"]');
    // mailto links should not have target="_blank"
    const target = await emailLink.getAttribute("target");
    expect(target).toBeNull();
  });
});

test.describe("Footer | Bottom Row", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("copyright year is current (2026)", async ({ page }) => {
    const footer = page.locator("footer");
    const currentYear = new Date().getFullYear().toString();
    await expect(footer.getByText(`${currentYear}`)).toBeVisible();
    await expect(
      footer.getByText("Themistoklis Baltzakis"),
    ).toBeVisible();
  });

  test("tech stack line mentions key technologies", async ({ page }) => {
    const footer = page.locator("footer");

    await expect(footer.getByText("Next.js")).toBeVisible();
    await expect(footer.getByText("Tailwind")).toBeVisible();
    await expect(footer.getByText("AWS")).toBeVisible();
    await expect(footer.getByText("TypeScript")).toBeVisible();
  });
});

test.describe("Footer | Manage Cookies Button", () => {
  test("Manage Cookies button is present in legal section", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Dismiss cookie banner if visible
    const banner = page.locator('[role="dialog"][aria-label="Cookie consent"]');
    if (await banner.isVisible()) {
      await page.getByRole("button", { name: "Accept all cookies" }).click();
    }

    const footer = page.locator("footer");
    const manageCookiesBtn = footer.getByRole("button", {
      name: "Manage cookie preferences",
    });
    await manageCookiesBtn.scrollIntoViewIfNeeded();
    await expect(manageCookiesBtn).toBeVisible();
    await expect(manageCookiesBtn).toHaveText("Manage Cookies");
  });
});

test.describe("Footer | Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("footer renders correctly on mobile viewport", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const footer = page.locator("footer");
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();

    // Brand, nav, and legal sections should all be visible
    await expect(footer.getByText("Themis Baltzakis")).toBeVisible();
    await expect(
      footer.locator('nav[aria-label="Footer navigation"]'),
    ).toBeVisible();
    await expect(footer.locator('nav[aria-label="Legal"]')).toBeVisible();

    // Social links should be visible
    await expect(
      footer.locator('a[aria-label="LinkedIn"]'),
    ).toBeVisible();
    await expect(
      footer.locator('a[aria-label="GitHub"]'),
    ).toBeVisible();
    await expect(
      footer.locator('a[aria-label="Email"]'),
    ).toBeVisible();
  });
});
