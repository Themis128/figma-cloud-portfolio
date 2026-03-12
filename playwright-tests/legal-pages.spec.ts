import { expect, test } from "@playwright/test";

// ─── Cookie Policy (/cookies/) ──────────────────────────────────────────────

test.describe("Cookie Policy Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/cookies/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should load and display page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Cookie Policy/i);
    await expect(page.getByRole("heading", { name: /Cookie Policy/i })).toBeVisible();
  });

  test("should have correct meta description", async ({ page }) => {
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute("content", /cookie/i);
  });

  test("should display effective date", async ({ page }) => {
    await expect(page.getByText("March 2026")).toBeVisible();
  });

  test("should have essential cookies section", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Essential Cookies" })).toBeVisible();
  });

  test("should have analytics cookies section", async ({ page }) => {
    await expect(page.getByText("Analytics Cookies")).toBeVisible();
    // GA cookie names
    await expect(page.getByText("_ga").first()).toBeVisible();
    await expect(page.getByText("_gid").first()).toBeVisible();
  });

  test("should have functional cookies section", async ({ page }) => {
    await expect(page.getByText("Functional Cookies")).toBeVisible();
  });

  test("should have third-party cookies section", async ({ page }) => {
    await expect(page.getByText("Third-Party Cookies")).toBeVisible();
    await expect(page.getByText("reCAPTCHA").first()).toBeVisible();
    await expect(page.getByText("Sentry").first()).toBeVisible();
  });

  test("should have manage cookies button", async ({ page }) => {
    const manageButton = page.getByText("Manage Cookies", { exact: false });
    expect(await manageButton.count()).toBeGreaterThanOrEqual(1);
  });

  test("should have link to privacy policy", async ({ page }) => {
    const privacyLink = page.locator('a[href="/privacy/"]');
    expect(await privacyLink.count()).toBeGreaterThanOrEqual(1);
  });

  test("should have Google Analytics opt-out link", async ({ page }) => {
    const optOutLink = page.locator(
      'a[href="https://tools.google.com/dlpage/gaoptout"]',
    );
    await expect(optOutLink).toBeVisible();
    await expect(optOutLink).toHaveAttribute("target", "_blank");
  });

  test("should have contact email link", async ({ page }) => {
    const emailLink = page.locator(
      'a[href="mailto:tbaltzakis@cloudless.gr"]',
    );
    expect(await emailLink.count()).toBeGreaterThanOrEqual(1);
  });

  test("should have home link in footer", async ({ page }) => {
    const homeLink = page.locator('a[href="/"]').last();
    await expect(homeLink).toBeVisible();
  });

  test("should have navigation component", async ({ page }) => {
    await expect(page.locator("nav").first()).toBeVisible();
  });

  test("should have main content area", async ({ page }) => {
    const mainContent = page.locator("#main-content");
    await expect(mainContent).toBeVisible();
  });
});

// ─── Privacy Policy (/privacy/) ─────────────────────────────────────────────

test.describe("Privacy Policy Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/privacy/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should load and display page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Privacy Policy/i);
    await expect(page.getByRole("heading", { name: /Privacy Policy/i })).toBeVisible();
  });

  test("should have correct meta description", async ({ page }) => {
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute("content", /privacy/i);
  });

  test("should have data controller section", async ({ page }) => {
    const section = page.locator("#data-controller");
    await expect(section).toBeVisible();
    await expect(
      page.getByText("tbaltzakis@cloudless.gr").first(),
    ).toBeVisible();
  });

  test("should have legal bases section with GDPR references", async ({
    page,
  }) => {
    const section = page.locator("#legal-bases");
    await expect(section).toBeVisible();
    await expect(page.getByText("Consent").first()).toBeVisible();
    await expect(
      page.getByText("Legitimate Interest").first(),
    ).toBeVisible();
  });

  test("should have data collected section", async ({ page }) => {
    const section = page.locator("#data-collected");
    await expect(section).toBeVisible();
  });

  test("should have third parties section with provider table", async ({
    page,
  }) => {
    const section = page.locator("#third-parties");
    await expect(section).toBeVisible();
    await expect(page.getByText("Google").first()).toBeVisible();
    await expect(page.getByText("Sentry").first()).toBeVisible();
    await expect(page.getByText("AWS").first()).toBeVisible();
  });

  test("should have GDPR rights section", async ({ page }) => {
    const section = page.locator("#gdpr-rights");
    await expect(section).toBeVisible();
    await expect(page.getByText("Erasure").first()).toBeVisible();
    await expect(
      page.getByText("Data Portability").first(),
    ).toBeVisible();
  });

  test("should have CCPA rights section", async ({ page }) => {
    const section = page.locator("#ccpa-rights");
    await expect(section).toBeVisible();
  });

  test("should have data retention section", async ({ page }) => {
    const section = page.locator("#data-retention");
    await expect(section).toBeVisible();
  });

  test("should have cookie policy link", async ({ page }) => {
    const cookieLink = page.locator('a[href="/cookies/"]');
    expect(await cookieLink.count()).toBeGreaterThanOrEqual(1);
  });

  test("should have external privacy policy links", async ({ page }) => {
    // Check at least one external privacy link exists
    const googlePrivacy = page.locator(
      'a[href*="policies.google.com/privacy"]',
    );
    expect(await googlePrivacy.count()).toBeGreaterThanOrEqual(1);
  });

  test("should have Hellenic DPA link", async ({ page }) => {
    const dpaLink = page.locator('a[href="https://www.dpa.gr/"]');
    expect(await dpaLink.count()).toBeGreaterThanOrEqual(1);
  });

  test("should have navigation and main content", async ({ page }) => {
    await expect(page.locator("nav").first()).toBeVisible();
    await expect(page.locator("#main-content")).toBeVisible();
  });
});

// ─── Terms of Service (/terms/) ─────────────────────────────────────────────

test.describe("Terms of Service Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/terms/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should load and display page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Terms of Service/i);
    await expect(page.getByRole("heading", { name: /Terms of Service/i })).toBeVisible();
  });

  test("should have correct meta description", async ({ page }) => {
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute("content", /terms/i);
  });

  test("should have acceptance section with privacy link", async ({
    page,
  }) => {
    const heading = page.locator("#acceptance");
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible();
    // id is on the <h2> (SectionCard), so look in the parent container
    const section = heading.locator("..");
    const privacyLink = section.locator('a[href="/privacy/"]');
    await expect(privacyLink).toBeAttached();
  });

  test("should have services section listing all services", async ({
    page,
  }) => {
    const section = page.locator("#services");
    await expect(section).toBeVisible();
    await expect(page.getByText("Portfolio").first()).toBeVisible();
    await expect(page.getByText("Contact Form").first()).toBeVisible();
  });

  test("should have user responsibilities section", async ({ page }) => {
    const section = page.locator("#responsibilities");
    await expect(section).toBeVisible();
  });

  test("should have intellectual property section", async ({ page }) => {
    const section = page.locator("#intellectual-property");
    await expect(section).toBeVisible();
  });

  test("should have disclaimer section", async ({ page }) => {
    const section = page.locator("#disclaimer");
    await expect(section).toBeVisible();
    await expect(
      page.getByText("as is", { exact: false }).first(),
    ).toBeVisible();
  });

  test("should have AI chat disclaimer section", async ({ page }) => {
    const section = page.locator("#ai-chat");
    await expect(section).toBeVisible();
  });

  test("should have booking section with Cal.com links", async ({
    page,
  }) => {
    const section = page.locator("#booking");
    await expect(section).toBeVisible();
    const calLink = page.locator('a[href="https://cal.com"]');
    expect(await calLink.count()).toBeGreaterThanOrEqual(1);
  });

  test("should have governing law section referencing Greek law", async ({
    page,
  }) => {
    const heading = page.locator("#governing-law");
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible();
    // id is on the <h2> (SectionCard), so look in the parent container
    const section = heading.locator("..");
    await expect(section.getByText("Greece").first()).toBeVisible({ timeout: 10000 });
  });

  test("should have contact section with email", async ({ page }) => {
    const heading = page.locator("#contact");
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible();
    // id is on the <h2> (SectionCard), so look in the parent container
    const section = heading.locator("..");
    const emailLink = section.locator(
      'a[href="mailto:tbaltzakis@cloudless.gr"]',
    );
    await expect(emailLink).toBeAttached();
    await expect(
      page.getByText("Themistoklis Baltzakis").first(),
    ).toBeAttached();
  });

  test("should have navigation and main content", async ({ page }) => {
    await expect(page.locator("nav").first()).toBeVisible();
    await expect(page.locator("#main-content")).toBeVisible();
  });
});

// ─── Cross-page Navigation ──────────────────────────────────────────────────

test.describe("Legal Pages — Cross Navigation", () => {
  test("cookie policy should link to privacy policy", async ({ page }) => {
    await page.goto("/cookies/");
    await page.waitForLoadState("domcontentloaded");

    const privacyLink = page.locator('a[href="/privacy/"]').first();
    await expect(privacyLink).toBeVisible();
  });

  test("privacy policy should link to cookie policy", async ({ page }) => {
    await page.goto("/privacy/");
    await page.waitForLoadState("domcontentloaded");

    const cookieLink = page.locator('a[href="/cookies/"]').first();
    await expect(cookieLink).toBeVisible();
  });

  test("terms should link to privacy policy", async ({ page }) => {
    await page.goto("/terms/");
    await page.waitForLoadState("domcontentloaded");

    const privacyLink = page.locator('a[href="/privacy/"]').first();
    await expect(privacyLink).toBeVisible();
  });

  test("all legal pages should have trailing slashes in URLs", async ({
    page,
  }) => {
    for (const path of ["/cookies/", "/privacy/", "/terms/"]) {
      await page.goto(path);
      await page.waitForLoadState("domcontentloaded");
      expect(page.url()).toContain(path);
    }
  });
});
