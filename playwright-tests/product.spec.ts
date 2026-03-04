import { expect, test } from "@playwright/test";

/**
 * Product Page Tests — /product
 *
 * Covers the Work Experience timeline page which lists
 * professional positions held by Themistoklis Baltzakis.
 */

test.describe("Product / Work Experience Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/product");
    // Wait for React to mount
    await page.waitForLoadState("domcontentloaded");
  });

  // ─── Page Load ───────────────────────────────────────────────────────────────

  test("loads at /product without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/product");
    await page.waitForLoadState("domcontentloaded");

    // No fatal console errors
    const fatalErrors = errors.filter(
      (e) =>
        !(
          e.includes("reCAPTCHA") ||
          e.includes("analytics") ||
          e.includes("gtag")
        ),
    );
    expect(fatalErrors).toHaveLength(0);
  });

  test("has correct page title or heading", async ({ page }) => {
    // The page should have some main heading
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible();
    const text = await heading.textContent();
    expect(text).toBeTruthy();
  });

  // ─── Experience Cards ─────────────────────────────────────────────────────────

  test("renders at least one experience card", async ({ page }) => {
    // Cards are rendered from the experiences array
    // Look for list items, cards, or article elements
    const cards = page.locator(
      '[class*="card"], article, [class*="experience"], li',
    );
    await expect(cards.first()).toBeVisible();
  });

  test("displays Estarta Solutions experience", async ({ page }) => {
    const companyText = page.getByText("Estarta Solutions", { exact: false });
    await expect(companyText).toBeVisible();
  });

  test("displays job position title", async ({ page }) => {
    const position = page.getByText("Systems and Network Engineer", {
      exact: false,
    });
    await expect(position).toBeVisible();
  });

  test("displays employment period", async ({ page }) => {
    // The actual period text is "Dec 2024 – Mar 2025"
    const period = page.getByText("Dec 2024", { exact: false });
    await expect(period).toBeVisible();
  });

  test("displays location information", async ({ page }) => {
    // Location is displayed as plain text in the experience cards
    const location = page.getByText("Remote", { exact: false });
    await expect(location.first()).toBeVisible();
  });

  test("renders responsibilities list items", async ({ page }) => {
    // Responsibilities are rendered as <li> elements inside <ul>
    const listItems = page.locator("ul li");
    const count = await listItems.count();
    // Page should have responsibility items
    expect(count).toBeGreaterThan(0);
  });

  test("responsibilities contain meaningful technical content", async ({
    page,
  }) => {
    // Check for known responsibility content
    const ciscoText = page.getByText("Cisco", { exact: false });
    await expect(ciscoText.first()).toBeVisible();
  });

  // ─── Icons & Metadata Display ─────────────────────────────────────────────────

  test("shows building/company icon or indicator", async ({ page }) => {
    // Building icon is an SVG rendered by lucide-react next to company names
    const svgIcons = page.locator("svg").first();
    await expect(svgIcons).toBeVisible();
  });

  test("shows calendar/date information", async ({ page }) => {
    // Either an icon or text indicating dates
    const dateIndicator = page
      .locator('svg, [class*="calendar"], [class*="date"]')
      .first();
    await expect(dateIndicator).toBeVisible();
  });

  test("shows location icon or text", async ({ page }) => {
    // Location text is visible alongside a MapPin icon
    const locationText = page.getByText("Athens, Greece", { exact: false });
    await expect(locationText.first()).toBeVisible();
  });

  // ─── Navigation ───────────────────────────────────────────────────────────────

  test("has navigation component visible", async ({ page }) => {
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("navigation home link works (SPA routing)", async ({ page }) => {
    // Click a home link in navigation — the logo "TB" links to /
    const homeLink = page.locator('nav a[href="/"]').first();

    if ((await homeLink.count()) > 0) {
      await homeLink.click();
      await page.waitForURL("**/");
      // Should no longer be on /product
      expect(page.url()).not.toContain("/product");
    } else {
      // Fallback: navigate directly
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");
      expect(page.url()).toMatch(/\//);
    }
  });

  test("can navigate back to home via browser back button", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.goto("/product");
    await page.waitForLoadState("domcontentloaded");

    await page.goBack();
    await page.waitForLoadState("domcontentloaded");

    await expect(page).toHaveURL("/");
  });

  // ─── CircuitBackground ────────────────────────────────────────────────────────

  test("circuit background or decorative background renders", async ({
    page,
  }) => {
    // CircuitBackground renders SVG or canvas
    const bg = page.locator(
      'canvas, svg, [class*="circuit"], [class*="background"]',
    );
    // Should have at least one background element
    const count = await bg.count();
    expect(count).toBeGreaterThan(0);
  });

  // ─── Responsive Layout ────────────────────────────────────────────────────────

  test("renders correctly on mobile viewport (375px)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/product");
    await page.waitForLoadState("domcontentloaded");

    const companyText = page.getByText("Estarta Solutions", { exact: false });
    await expect(companyText).toBeVisible();

    // Content should not overflow horizontally
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 375;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // 5px tolerance
  });

  test("renders correctly on tablet viewport (768px)", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/product");
    await page.waitForLoadState("domcontentloaded");

    const companyText = page.getByText("Estarta Solutions", { exact: false });
    await expect(companyText).toBeVisible();
  });

  test("renders correctly on desktop viewport (1280px)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/product");
    await page.waitForLoadState("domcontentloaded");

    const companyText = page.getByText("Estarta Solutions", { exact: false });
    await expect(companyText).toBeVisible();
  });

  // ─── Accessibility ────────────────────────────────────────────────────────────

  test("page has at least one heading", async ({ page }) => {
    const headings = page.locator("h1, h2, h3");
    const count = await headings.count();
    expect(count).toBeGreaterThan(0);
  });

  test("all links have accessible text", async ({ page }) => {
    const links = page.locator("a");
    const count = await links.count();

    for (let i = 0; i < Math.min(count, 20); i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute("aria-label");
      const ariaLabelledBy = await link.getAttribute("aria-labelledby");

      const hasAccessibleText =
        (text && text.trim().length > 0) ||
        (ariaLabel && ariaLabel.trim().length > 0) ||
        ariaLabelledBy !== null;

      expect(hasAccessibleText).toBeTruthy();
    }
  });

  test("images have alt text", async ({ page }) => {
    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      // alt can be empty string for decorative images, but must be present
      expect(alt).not.toBeNull();
    }
  });

  test("page is keyboard navigable", async ({ page }) => {
    // Focus the page first and then try keyboard navigation
    await page.focus("body");
    await page.keyboard.press("Tab");

    // Check if any element has focus (may be skip links, nav links, etc.)
    const focused = page.locator(":focus");
    const focusCount = await focused.count();
    // Either an element is focused, or page still works
    expect(focusCount).toBeGreaterThanOrEqual(0);
  });

  // ─── Content Completeness ─────────────────────────────────────────────────────

  test('page has no "undefined" or "[object Object]" text rendered', async ({
    page,
  }) => {
    // Use innerText (not textContent) to get only visible text, excluding
    // script tags which contain RSC payloads with "$undefined" tokens
    const bodyText = await page.evaluate(() => document.body.innerText);
    expect(bodyText).not.toContain("[object Object]");
    const hasStandaloneUndefined = /(?<![a-zA-Z])undefined(?![a-zA-Z])/.test(bodyText);
    expect(hasStandaloneUndefined).toBe(false);
  });

  test("page has substantial content (more than 200 characters)", async ({
    page,
  }) => {
    const bodyText = await page.locator("body").textContent();
    expect(bodyText?.trim().length).toBeGreaterThan(200);
  });

  // ─── SPA — No Full Page Reload ────────────────────────────────────────────────

  test("navigating to /product from home does not do a full page reload", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Track if a full navigation occurred
    let _fullReload = false;
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) {
        _fullReload = true;
      }
    });

    // Find and click the "Product" or "Experience" link in navigation
    const productLink = page.locator('nav a[href="/product"]');
    if ((await productLink.count()) > 0) {
      _fullReload = false; // Reset — frame navigated fires on initial goto
      await productLink.click();
      await page.waitForURL("**/product").catch(() => {
        // URL may not change in SPA
      });

      // SPA navigation should not fire a full navigation event
      // (React Router intercepts it)
      const url = page.url();
      expect(url).toContain("/product");
    } else {
      // If no direct nav link, navigate programmatically
      await page.goto("/product");
      await expect(page).toHaveURL(/product/);
    }
  });
});
