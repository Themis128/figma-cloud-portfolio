import { expect, test } from "@playwright/test";

const VALID_EMAIL = "tbaltzakis@cloudless.com";
const VALID_PASS = "TH!123789th!";

// Helper: login to admin
async function adminLogin(page: import("@playwright/test").Page) {
  await page.goto("/admin");
  await page.waitForLoadState("domcontentloaded");

  await page.locator('input[type="email"]').fill(VALID_EMAIL);
  await page.locator('input[type="password"]').fill(VALID_PASS);
  await page.locator('button[type="submit"]').click();

  await expect(page.locator("text=Admin Dashboard")).toBeVisible({
    timeout: 5000,
  });
}

// ─── Authentication ──────────────────────────────────────────────────────────

test.describe("Admin Page — Authentication", () => {
  test("should show login form when not authenticated", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("text=Admin Access")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator("text=Authenticate")).toBeVisible();
    await expect(
      page.locator("text=Unauthorized access prohibited"),
    ).toBeVisible();
  });

  test("should reject invalid credentials", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    await page.locator('input[type="email"]').fill("wrong@test.com");
    await page.locator('input[type="password"]').fill("wrongpass");
    await page.locator('button[type="submit"]').click();

    await expect(page.locator("text=Invalid credentials")).toBeVisible();
    await expect(page.locator("text=Admin Access")).toBeVisible();
  });

  test("should login with valid credentials", async ({ page }) => {
    await adminLogin(page);

    await expect(page.locator("text=Admin Dashboard")).toBeVisible();
    await expect(page.locator("text=Online")).toBeVisible();
    await expect(page.locator("text=Logout")).toBeVisible();
  });

  test("should persist session on page reload", async ({ page }) => {
    await adminLogin(page);

    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("text=Admin Dashboard")).toBeVisible({
      timeout: 5000,
    });
  });

  test("should logout and return to login form", async ({ page }) => {
    await adminLogin(page);

    await page.locator("text=Logout").click();

    await expect(page.locator("text=Admin Access")).toBeVisible({
      timeout: 5000,
    });
  });
});

// ─── Health Tab ──────────────────────────────────────────────────────────────

test.describe("Admin Page — Health Tab", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test("should display Health tab by default with endpoint cards", async ({
    page,
  }) => {
    const healthTab = page.locator('[role="tab"]', { hasText: "Health" });
    await expect(healthTab).toHaveAttribute("data-state", "active");

    // Use getByText with exact: false to find endpoint paths in cards
    const cardArea = page.locator('[role="tabpanel"]');
    await expect(cardArea.getByText("/api/ping", { exact: false })).toBeVisible();
    await expect(cardArea.getByText("/api/health", { exact: false })).toBeVisible();
    await expect(cardArea.getByText("/api/booking/slots", { exact: false })).toBeVisible();
    await expect(cardArea.getByText("/api/chat", { exact: false })).toBeVisible();
    await expect(cardArea.getByText("/api/resume/download", { exact: false })).toBeVisible();
    await expect(cardArea.getByText("/api/organizations/api_keys", { exact: false })).toBeVisible();
    await expect(cardArea.getByText("/api/contact", { exact: false })).toBeVisible();
    await expect(cardArea.getByText("/api/push-notifications", { exact: false })).toBeVisible();
  });

  test("should show summary stats", async ({ page }) => {
    await page.waitForTimeout(3000);

    await expect(page.locator("text=Total")).toBeVisible();
    await expect(page.locator("text=Healthy")).toBeVisible();
  });

  test("should show Refresh All button", async ({ page }) => {
    await expect(page.locator("text=Refresh All")).toBeVisible();
  });

  test("should display service labels on cards", async ({ page }) => {
    await expect(page.locator("text=Lambda").first()).toBeVisible();
    await expect(page.locator("text=Cal.com").first()).toBeVisible();
    await expect(page.locator("text=HuggingFace")).toBeVisible();
    await expect(page.locator("text=Web Push")).toBeVisible();
  });

  test("should show method badges", async ({ page }) => {
    const getBadges = page.locator("text=GET");
    expect(await getBadges.count()).toBeGreaterThanOrEqual(5);

    const postBadges = page.locator("text=POST");
    expect(await postBadges.count()).toBeGreaterThanOrEqual(3);
  });
});

// ─── Console Tab ─────────────────────────────────────────────────────────────

test.describe("Admin Page — Console Tab", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
    await page.locator('[role="tab"]', { hasText: "Console" }).click();
  });

  test("should switch to Console tab and show request builder", async ({
    page,
  }) => {
    await expect(page.locator("text=Request")).toBeVisible();
    await expect(page.locator('input[placeholder="/api/..."]')).toBeVisible();
  });

  test("should have quick preset buttons", async ({ page }) => {
    // Use more specific selectors scoped to the console panel
    const panel = page.locator('[role="tabpanel"]');
    await expect(panel.getByText("Ping", { exact: true })).toBeVisible();
    await expect(panel.getByText("Slots", { exact: true })).toBeVisible();
    await expect(panel.getByText("API Keys", { exact: true })).toBeVisible();
    await expect(panel.getByText("Subscriptions", { exact: true })).toBeVisible();
    // "Health" preset button — distinguish from tab by scoping to preset row
    const presetButtons = panel.locator("button").filter({ hasText: /^Health$/ });
    expect(await presetButtons.count()).toBeGreaterThanOrEqual(1);
  });

  test("should execute GET /api/ping and show response", async ({ page }) => {
    const urlInput = page.locator('input[placeholder="/api/..."]');
    await expect(urlInput).toHaveValue("/api/ping");

    // Click the Send button (the one with Play icon inside the card)
    const panel = page.locator('[role="tabpanel"]');
    await panel.locator("button", { hasText: "Send" }).click();

    // Wait for response terminal
    await expect(page.getByText("$ GET /api/ping")).toBeVisible({
      timeout: 10000,
    });

    // Response terminal should contain status info
    const responseTerm = page.locator("pre");
    await expect(responseTerm.first()).toBeVisible({ timeout: 5000 });
  });

  test("should execute preset and show response", async ({ page }) => {
    // Click Health preset button (not the tab)
    const panel = page.locator('[role="tabpanel"]');
    const healthPreset = panel.locator("button").filter({ hasText: /^Health$/ }).first();
    await healthPreset.click();

    const urlInput = page.locator('input[placeholder="/api/..."]');
    await expect(urlInput).toHaveValue("/api/health");

    await panel.locator("button", { hasText: "Send" }).click();

    await expect(page.getByText("$ GET /api/health")).toBeVisible({
      timeout: 10000,
    });
  });

  test("should show request history after executing", async ({ page }) => {
    const panel = page.locator('[role="tabpanel"]');
    await panel.locator("button", { hasText: "Send" }).click();

    await expect(page.getByText("$ GET /api/ping")).toBeVisible({
      timeout: 10000,
    });

    await expect(page.getByText("History").first()).toBeVisible();
  });

  test("should show body textarea for POST method", async ({ page }) => {
    await page.locator('[role="combobox"]').click();
    await page.locator('[role="option"]', { hasText: "POST" }).click();

    await expect(page.locator("text=+ Show body")).toBeVisible();

    await page.locator("text=+ Show body").click();
    await expect(page.locator("textarea")).toBeVisible();
  });
});

// ─── Analytics Tab ───────────────────────────────────────────────────────────

test.describe("Admin Page — Analytics Tab", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
    await page.locator('[role="tab"]', { hasText: "Analytics" }).click();
  });

  test("should display Measurement ID section", async ({ page }) => {
    await expect(page.getByText("Measurement ID").first()).toBeVisible();
    const gaIdVisible = await page
      .locator("text=G-FT79QM66D3")
      .isVisible()
      .catch(() => false);
    const notConfigured = await page
      .locator("text=Not configured")
      .isVisible()
      .catch(() => false);
    expect(gaIdVisible || notConfigured).toBe(true);
  });

  test("should display Configuration section", async ({ page }) => {
    await expect(page.getByText("Configuration").first()).toBeVisible();
    await expect(page.getByText("page_path").first()).toBeVisible();
    await expect(page.getByText("anonymize_ip").first()).toBeVisible();
    await expect(page.getByText("cookie_flags").first()).toBeVisible();
  });

  test("should explain page_path tracking", async ({ page }) => {
    await expect(page.getByText("usePathname()").first()).toBeVisible();
    await expect(page.getByText("useSearchParams()").first()).toBeVisible();
  });

  test("should explain anonymize_ip", async ({ page }) => {
    await expect(page.getByText("GDPR").first()).toBeVisible();
  });

  test("should display Event Helpers section", async ({ page }) => {
    await expect(page.getByText("Event Helpers").first()).toBeVisible();
    await expect(page.getByText("trackEvent").first()).toBeVisible();
    await expect(page.getByText("trackConversion").first()).toBeVisible();
  });

  test("should show code snippets", async ({ page }) => {
    const codeBlocks = page.locator("pre");
    expect(await codeBlocks.count()).toBeGreaterThanOrEqual(2);
  });

  test("should have link to GA4 Dashboard", async ({ page }) => {
    const gaLink = page.locator('a[href="https://analytics.google.com/"]');
    await expect(gaLink).toBeVisible();
    await expect(page.getByText("Open GA4 Dashboard").first()).toBeVisible();
  });

  test("should display Implementation Reference", async ({ page }) => {
    await expect(
      page.getByText("Implementation Reference").first(),
    ).toBeVisible();
    await expect(
      page.getByText("src/components/GoogleAnalytics.tsx").first(),
    ).toBeVisible();
    await expect(
      page.getByText("afterInteractive").first(),
    ).toBeVisible();
  });
});

// ─── Tab Navigation ──────────────────────────────────────────────────────────

test.describe("Admin Page — Tab Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test("should switch between all tabs", async ({ page }) => {
    const healthTab = page.locator('[role="tab"]', { hasText: "Health" });
    await expect(healthTab).toHaveAttribute("data-state", "active");

    await page.locator('[role="tab"]', { hasText: "Console" }).click();
    await expect(page.locator("text=Request")).toBeVisible();

    await page.locator('[role="tab"]', { hasText: "Analytics" }).click();
    await expect(page.getByText("Measurement ID").first()).toBeVisible();

    await page.locator('[role="tab"]', { hasText: "Health" }).click();
    await expect(page.locator("text=Refresh All")).toBeVisible();
  });
});

// ─── noindex Meta ────────────────────────────────────────────────────────────

test.describe("Admin Page — SEO", () => {
  test("should have noindex meta tag", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    const robotsMeta = page.locator('meta[name="robots"][content="noindex, nofollow"]');
    await expect(robotsMeta).toBeAttached();
  });
});
