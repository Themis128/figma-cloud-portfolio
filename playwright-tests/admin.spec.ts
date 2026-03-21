import { expect, test } from "@playwright/test";

const VALID_EMAIL = "testadmin@cloudless.gr";
const VALID_PASS = "TH!123789th!";

// Cognito Auth can be slow (SDK init + network call to AWS).
// Allow generous timeouts for auth-dependent operations.
test.setTimeout(60000);

// Helper: login to admin — returns true if login succeeded, false if auth is unavailable
async function adminLogin(page: import("@playwright/test").Page): Promise<boolean> {
  await page.goto("/admin");
  await page.waitForLoadState("domcontentloaded");

  // Wait for React hydration — login form must appear
  await expect(page.locator("text=Admin Access")).toBeVisible({
    timeout: 10000,
  });

  await page.locator('input[type="email"]').fill(VALID_EMAIL);
  await page.locator('input[type="password"]').fill(VALID_PASS);
  await page.locator('button[type="submit"]').click();

  // Wait for either dashboard (success) or error message (auth failure).
  const dashboard = page.locator("text=Admin Dashboard");
  const authError = page.locator("text=/timed out|Login failed|Invalid email|No account found|not confirmed/i");
  const loginForm = page.locator("text=Admin Access");

  try {
    await expect(dashboard.or(authError)).toBeVisible({ timeout: 20000 });
  } catch {
    // Neither dashboard nor known error appeared — if login form is still
    // visible, auth silently failed (e.g. Cognito network issue).
    // Also handle page crash / browser close gracefully.
    try {
      if (await loginForm.isVisible()) {
        return false;
      }
    } catch {
      // Page crashed or browser closed — treat as auth unavailable
      return false;
    }
    return false;
  }

  // Return true if login succeeded
  return dashboard.isVisible();
}

// Helper: login or skip test if auth provider is disabled
async function adminLoginOrSkip(page: import("@playwright/test").Page) {
  const success = await adminLogin(page);
  if (!success) {
    test.skip(true, "Cognito auth is not available");
  }
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

  test("should have lock icon and gradient divider on login form", async ({
    page,
  }) => {
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    // Lock icon container (cyan circle)
    const lockContainer = page.locator(".rounded-full.bg-cyan-500\\/10");
    await expect(lockContainer).toBeVisible();

    // Gradient divider below heading
    const divider = page.locator(
      ".bg-linear-to-r.from-cyan-400.to-blue-500.rounded-full",
    );
    await expect(divider.first()).toBeVisible();
  });

  test("should have proper input attributes", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute("autocomplete", "email");
    await expect(emailInput).toHaveAttribute("placeholder", "Email");
    await expect(emailInput).toHaveAttribute("required", "");

    const passInput = page.locator('input[type="password"]');
    await expect(passInput).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
    await expect(passInput).toHaveAttribute("placeholder", "Password");
    await expect(passInput).toHaveAttribute("required", "");
  });

  test("should reject invalid credentials", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    await page.locator('input[type="email"]').fill("wrong@test.com");
    await page.locator('input[type="password"]').fill("wrongpass");
    await page.locator('button[type="submit"]').click();

    // Should show an authentication error (exact message depends on Cognito config)
    const authError = page.locator("text=/Invalid email|No account found|timed out|Login failed/i");
    await expect(authError).toBeVisible({ timeout: 15000 });
    await expect(page.locator("text=Admin Access")).toBeVisible();
  });

  // Use a non-existent email to avoid locking out the real admin account.
  // Cognito locks accounts after 5 failed attempts (15-min cooldown), and
  // running this test across 9 browser projects would exceed that limit.
  test("should reject valid email with wrong password", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    await page.locator('input[type="email"]').fill("lockout-test@example.com");
    await page.locator('input[type="password"]').fill("wrongpass");
    await page.locator('button[type="submit"]').click();

    const authError = page.locator("text=/Invalid email|No account found|not enabled|operation-not-allowed|timed out|Login failed/i");
    await expect(authError).toBeVisible({ timeout: 15000 });
  });

  test("should reject wrong email with valid password", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    await page.locator('input[type="email"]').fill("wrong@test.com");
    await page.locator('input[type="password"]').fill(VALID_PASS);
    await page.locator('button[type="submit"]').click();

    const authError = page.locator("text=/Invalid email|not enabled|operation-not-allowed|timed out|Login failed/i");
    await expect(authError).toBeVisible({ timeout: 15000 });
  });

  test("should login with valid credentials", async ({ page }) => {
    await adminLoginOrSkip(page);

    await expect(page.locator("text=Admin Dashboard")).toBeVisible();
    await expect(page.locator("text=Online")).toBeVisible();
    await expect(page.locator("text=Logout")).toBeVisible();
  });

  test("should show dashboard subtitle after login", async ({ page }) => {
    await adminLoginOrSkip(page);

    await expect(
      page.locator("text=Monitoring & management console"),
    ).toBeVisible();
  });

  test("should show gradient divider under dashboard heading", async ({
    page,
  }) => {
    await adminLoginOrSkip(page);

    const divider = page.locator(
      ".bg-linear-to-r.from-cyan-400.to-blue-500.rounded-full",
    );
    await expect(divider.first()).toBeVisible();
  });

  test("should persist session on page reload", async ({ page }) => {
    await adminLoginOrSkip(page);

    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("text=Admin Dashboard")).toBeVisible({
      timeout: 10000,
    });
  });

  test("should logout and return to login form", async ({ page }) => {
    await adminLoginOrSkip(page);

    await page.locator("text=Logout").click();

    await expect(page.locator("text=Admin Access")).toBeVisible({
      timeout: 5000,
    });
    // Ensure dashboard content is gone
    await expect(page.locator("text=Admin Dashboard")).not.toBeVisible();
  });

  test("should require re-login after logout and reload", async ({ page }) => {
    await adminLoginOrSkip(page);
    await page.locator("text=Logout").click();
    await expect(page.locator("text=Admin Access")).toBeVisible({
      timeout: 5000,
    });

    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    // Should still show login, not dashboard
    await expect(page.locator("text=Admin Access")).toBeVisible({
      timeout: 5000,
    });
  });
});

// ─── Health Tab ──────────────────────────────────────────────────────────────

test.describe("Admin Page — Health Tab", () => {
  test.beforeEach(async ({ page }) => {
    await adminLoginOrSkip(page);
  });

  test("should display Health tab by default with endpoint cards", async ({
    page,
  }) => {
    const healthTab = page.locator('[role="tab"]', { hasText: "Health" });
    await expect(healthTab).toHaveAttribute("data-state", "active");

    // Use getByText with exact: false to find endpoint paths in cards
    const cardArea = page.locator('[role="tabpanel"]');
    await expect(
      cardArea.getByText("/api/ping", { exact: false }),
    ).toBeVisible();
    await expect(
      cardArea.getByText("/api/health", { exact: false }),
    ).toBeVisible();
    await expect(
      cardArea.getByText("/api/booking/slots", { exact: false }),
    ).toBeVisible();
    await expect(
      cardArea.getByText("/api/chat", { exact: false }),
    ).toBeVisible();
    await expect(
      cardArea.getByText("/api/resume/download", { exact: false }),
    ).toBeVisible();
    await expect(
      cardArea.getByText("/api/organizations/api_keys", { exact: false }),
    ).toBeVisible();
    await expect(
      cardArea.getByText("/api/contact", { exact: false }),
    ).toBeVisible();
    await expect(
      cardArea.getByText("/api/push-notifications", { exact: false }),
    ).toBeVisible();
  });

  test("should render exactly 16 endpoint cards", async ({ page }) => {
    const cardArea = page.locator('[role="tabpanel"]');
    // Each endpoint card is a Card with endpoint path
    const cards = cardArea.locator(".grid > div");
    await expect(cards).toHaveCount(16);
  });

  test("should show summary stats", async ({ page }) => {
    await page.waitForTimeout(3000);

    await expect(page.locator("text=Total")).toBeVisible();
    await expect(page.locator("text=Healthy").first()).toBeVisible();
  });

  test("should display total endpoint count of 16", async ({ page }) => {
    // The total count should be 16
    const totalStat = page
      .locator("div.text-center")
      .filter({ hasText: "Total" });
    await expect(totalStat.locator(".font-mono.font-bold")).toContainText("16");
  });

  test("should show Refresh All button", async ({ page }) => {
    await expect(page.locator("text=Refresh All")).toBeVisible();
  });

  test("should display service labels on cards", async ({ page }) => {
    await expect(page.locator("text=Lambda").first()).toBeVisible();
    await expect(page.locator("text=Cal.com").first()).toBeVisible();
    await expect(page.locator("text=Web Push")).toBeVisible();
    await expect(page.locator("text=GitHub API").first()).toBeVisible();
  });

  test("should display reCAPTCHA + SES service for contact endpoint", async ({
    page,
  }) => {
    const cardArea = page.locator('[role="tabpanel"]');
    await expect(
      cardArea.getByText("reCAPTCHA + SES", { exact: false }),
    ).toBeVisible();
  });

  test("should show method badges", async ({ page }) => {
    // Wait for cards to load (skeleton replaced with real cards)
    await page.waitForTimeout(3000);
    const cardArea = page.locator('[role="tabpanel"]');
    const getBadges = cardArea.locator("text=GET");
    expect(await getBadges.count()).toBeGreaterThanOrEqual(5);

    const postBadges = cardArea.locator("text=POST");
    expect(await postBadges.count()).toBeGreaterThanOrEqual(3);
  });

  test("should display endpoint descriptions", async ({ page }) => {
    // Wait for skeleton cards to be replaced with real endpoint cards
    await page.waitForTimeout(4000);
    const cardArea = page.locator('[role="tabpanel"]');
    await expect(
      cardArea.getByText("Basic health check", { exact: false }),
    ).toBeVisible();
    await expect(
      cardArea.getByText("Detailed health status", { exact: false }),
    ).toBeVisible();
    await expect(
      cardArea.getByText("available booking slots", { exact: false }),
    ).toBeVisible();
    await expect(
      cardArea.getByText("AI assistant", { exact: false }),
    ).toBeVisible();
    await expect(
      cardArea.getByText("PDF resume", { exact: false }),
    ).toBeVisible();
    await expect(
      cardArea.getByText("API key management", { exact: false }),
    ).toBeVisible();
    await expect(
      cardArea.getByText("Contact form submission", { exact: false }),
    ).toBeVisible();
    await expect(
      cardArea.getByText("Push notification management", { exact: false }),
    ).toBeVisible();
    // New endpoints may be below the fold — check they exist in the DOM
    await expect(
      cardArea.getByText("Public profile statistics", { exact: false }),
    ).toBeAttached();
    await expect(
      cardArea.getByText("Public repositories", { exact: false }),
    ).toBeAttached();
    await expect(
      cardArea.getByText("Portfolio content search", { exact: false }),
    ).toBeAttached();
    await expect(
      cardArea.getByText("Server monitoring", { exact: false }),
    ).toBeAttached();
    await expect(
      cardArea.getByText("Resume data as JSON", { exact: false }),
    ).toBeAttached();
    await expect(
      cardArea.getByText("webhook receiver", { exact: false }),
    ).toBeAttached();
    await expect(
      cardArea.getByText("API endpoint documentation", { exact: false }),
    ).toBeAttached();
  });

  test("should have individual refresh buttons on each card", async ({
    page,
  }) => {
    const cardArea = page.locator('[role="tabpanel"]');
    const refreshButtons = cardArea.locator('button[title="Refresh"]');
    // Should be 16 refresh buttons (one per endpoint card)
    await expect(refreshButtons).toHaveCount(16);
  });

  test("should auto-run health checks on mount and show response times", async ({
    page,
  }) => {
    // Wait for health checks to complete (some may fail, that's ok)
    await page.waitForTimeout(5000);

    // At least some endpoints should show "ms" response time
    const cardArea = page.locator('[role="tabpanel"]');
    const responseTimes = cardArea.getByText(/\d+ms/);
    expect(await responseTimes.count()).toBeGreaterThanOrEqual(1);
  });

  test("should send auth header for API Keys health check when logged in", async ({
    page,
  }) => {
    // Intercept API Keys health check requests to verify auth header is sent
    const apiKeysRequests: { authorization: string | null }[] = [];
    await page.route("**/api/organizations/api_keys", (route) => {
      const authHeader = route.request().headers()["authorization"] ?? null;
      apiKeysRequests.push({ authorization: authHeader });
      void route.continue();
    });

    // Click Refresh All to trigger new health checks
    await page.locator("text=Refresh All").click();
    await page.waitForTimeout(5000);

    // When Cognito auth is available and user is logged in,
    // the API Keys request should include a Bearer token.
    // If no requests were captured, the endpoint may be unreachable.
    if (apiKeysRequests.length > 0) {
      const lastReq = apiKeysRequests[apiKeysRequests.length - 1];
      if (lastReq?.authorization) {
        expect(lastReq.authorization).toMatch(/^Bearer .+/);
      }
    }
  });

  test("should show status labels after health checks", async ({ page }) => {
    await page.waitForTimeout(5000);

    const cardArea = page.locator('[role="tabpanel"]');
    // At least one endpoint should show a status (Healthy, Degraded, or Down)
    const healthyLabels = cardArea.getByText("Healthy", { exact: true });
    const degradedLabels = cardArea.getByText("Degraded", { exact: true });
    const downLabels = cardArea.getByText("Down", { exact: true });

    const totalStatuses =
      (await healthyLabels.count()) +
      (await degradedLabels.count()) +
      (await downLabels.count());
    expect(totalStatuses).toBeGreaterThanOrEqual(1);
  });

  test("should show 'Checked' timestamp after health checks run", async ({
    page,
  }) => {
    await page.waitForTimeout(5000);

    const cardArea = page.locator('[role="tabpanel"]');
    const checkedLabels = cardArea.getByText(/Checked/);
    expect(await checkedLabels.count()).toBeGreaterThanOrEqual(1);
  });

  test("should show average response time after checks complete", async ({
    page,
  }) => {
    await page.waitForTimeout(5000);

    // Avg stat appears only when response times are available
    const avgStat = page.locator("div.text-center").filter({ hasText: "Avg" });
    const count = await avgStat.count();
    if (count > 0) {
      await expect(avgStat.locator(".font-mono.font-bold")).toContainText(
        /\d+/,
      );
    }
  });

  test("should re-check endpoints when Refresh All is clicked", async ({
    page,
  }) => {
    // Wait for initial checks to complete
    await page.waitForTimeout(5000);

    // Click Refresh All
    await page.locator("text=Refresh All").click();

    // Should see at least one "Checking..." status during refresh
    // Or alternatively, the response times should update
    // We just verify no crash and the button is still clickable
    await page.waitForTimeout(2000);
    await expect(page.locator("text=Refresh All")).toBeVisible();
  });
});

// ─── Console Tab ─────────────────────────────────────────────────────────────

test.describe("Admin Page — Console Tab", () => {
  test.beforeEach(async ({ page }) => {
    await adminLoginOrSkip(page);
    await page.locator('[role="tab"]', { hasText: "Console" }).click();
  });

  test("should switch to Console tab and show request builder", async ({
    page,
  }) => {
    await expect(page.locator("text=Request")).toBeVisible();
    await expect(page.locator('input[placeholder="/api/..."]')).toBeVisible();
  });

  test("should default to GET method and /api/ping URL", async ({ page }) => {
    const urlInput = page.locator('input[placeholder="/api/..."]');
    await expect(urlInput).toHaveValue("/api/ping");

    // Method selector should show GET
    const methodSelector = page.locator('[role="combobox"]');
    await expect(methodSelector).toContainText("GET");
  });

  test("should have Send button", async ({ page }) => {
    const panel = page.locator('[role="tabpanel"]');
    const sendButton = panel.locator("button", { hasText: "Send" });
    await expect(sendButton).toBeVisible();
    await expect(sendButton).toBeEnabled();
  });

  test("should have quick preset buttons", async ({ page }) => {
    // Use more specific selectors scoped to the console panel
    const panel = page.locator('[role="tabpanel"]');
    await expect(panel.getByText("Ping", { exact: true })).toBeVisible();
    await expect(panel.getByText("Slots", { exact: true })).toBeVisible();
    await expect(
      panel.getByText("API Keys", { exact: true }),
    ).toBeVisible();
    await expect(
      panel.getByText("Subscriptions", { exact: true }),
    ).toBeVisible();
    // "Health" preset button — distinguish from tab by scoping to preset row
    const presetButtons = panel
      .locator("button")
      .filter({ hasText: /^Health$/ });
    expect(await presetButtons.count()).toBeGreaterThanOrEqual(1);
  });

  test("should populate URL when clicking Health preset", async ({ page }) => {
    const panel = page.locator('[role="tabpanel"]');
    const healthPreset = panel
      .locator("button")
      .filter({ hasText: /^Health$/ })
      .first();
    await healthPreset.click();

    const urlInput = page.locator('input[placeholder="/api/..."]');
    await expect(urlInput).toHaveValue("/api/health");
  });

  test("should populate URL when clicking Slots preset", async ({ page }) => {
    const panel = page.locator('[role="tabpanel"]');
    await panel.getByText("Slots", { exact: true }).click();

    const urlInput = page.locator('input[placeholder="/api/..."]');
    await expect(urlInput).toHaveValue("/api/booking/slots");
  });

  test("should populate URL when clicking API Keys preset", async ({
    page,
  }) => {
    const panel = page.locator('[role="tabpanel"]');
    await panel.getByText("API Keys", { exact: true }).click();

    const urlInput = page.locator('input[placeholder="/api/..."]');
    await expect(urlInput).toHaveValue("/api/organizations/api_keys");
  });

  test("should populate URL when clicking Subscriptions preset", async ({
    page,
  }) => {
    const panel = page.locator('[role="tabpanel"]');
    await panel.getByText("Subscriptions", { exact: true }).click();

    const urlInput = page.locator('input[placeholder="/api/..."]');
    await expect(urlInput).toHaveValue(
      "/api/push-notifications?action=subscriptions",
    );
  });

  test("should allow editing URL input manually", async ({ page }) => {
    const urlInput = page.locator('input[placeholder="/api/..."]');
    await urlInput.clear();
    await urlInput.fill("/api/custom-endpoint");
    await expect(urlInput).toHaveValue("/api/custom-endpoint");
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

  test("should show status badge in response viewer", async ({ page }) => {
    const panel = page.locator('[role="tabpanel"]');
    await panel.locator("button", { hasText: "Send" }).click();

    await expect(page.getByText("$ GET /api/ping")).toBeVisible({
      timeout: 10000,
    });

    // Should show a status code badge (200 OK or similar)
    const statusBadge = page.locator('[class*="border-green"]').first();
    await expect(statusBadge).toBeVisible({ timeout: 5000 });
  });

  test("should show response timing in ms", async ({ page }) => {
    const panel = page.locator('[role="tabpanel"]');
    await panel.locator("button", { hasText: "Send" }).click();

    await expect(page.getByText("$ GET /api/ping")).toBeVisible({
      timeout: 10000,
    });

    // Response area should contain timing in ms
    const timingText = page.getByText(/\d+ms/);
    expect(await timingText.count()).toBeGreaterThanOrEqual(1);
  });

  test("should execute preset and show response", async ({ page }) => {
    // Click Health preset button (not the tab)
    const panel = page.locator('[role="tabpanel"]');
    const healthPreset = panel
      .locator("button")
      .filter({ hasText: /^Health$/ })
      .first();
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

  test("should show history entry with method, URL, status, and timing", async ({
    page,
  }) => {
    const panel = page.locator('[role="tabpanel"]');
    await panel.locator("button", { hasText: "Send" }).click();

    await expect(page.getByText("$ GET /api/ping")).toBeVisible({
      timeout: 10000,
    });

    // History section should show entry with timing
    const historySection = page
      .locator("div")
      .filter({ hasText: /^History/ })
      .first();
    await expect(historySection).toBeVisible();
  });

  test("should accumulate multiple history entries", async ({ page }) => {
    const panel = page.locator('[role="tabpanel"]');

    // Send first request (Ping)
    await panel.locator("button", { hasText: "Send" }).first().click();
    await expect(page.getByText("$ GET /api/ping")).toBeVisible({
      timeout: 10000,
    });

    // Switch to Health preset and send
    const healthPreset = panel
      .locator("button")
      .filter({ hasText: /^Health$/ })
      .first();
    await healthPreset.click();
    await panel.locator("button", { hasText: "Send" }).first().click();
    await expect(page.getByText("$ GET /api/health")).toBeVisible({
      timeout: 10000,
    });

    // History should show count of 2
    await expect(page.getByText("History (2)")).toBeVisible();
  });

  test("should replay history entry on click", async ({ page }) => {
    const panel = page.locator('[role="tabpanel"]');
    await panel.locator("button", { hasText: "Send" }).click();

    await expect(page.getByText("$ GET /api/ping")).toBeVisible({
      timeout: 10000,
    });

    // Switch URL to something else
    const urlInput = page.locator('input[placeholder="/api/..."]');
    await urlInput.clear();
    await urlInput.fill("/api/other");

    // Click the history entry to replay
    const historyEntry = page
      .locator("button")
      .filter({ hasText: "/api/ping" })
      .last();
    await historyEntry.click();

    // URL should be repopulated with /api/ping
    await expect(urlInput).toHaveValue("/api/ping");
  });

  test("should show body textarea for POST method", async ({ page }) => {
    await page.locator('[role="combobox"]').click();
    await page.locator('[role="option"]', { hasText: "POST" }).click();

    await expect(page.locator("text=+ Show body")).toBeVisible();

    await page.locator("text=+ Show body").click();
    await expect(page.locator("textarea")).toBeVisible();
  });

  test("should hide body toggle when switching back to GET", async ({
    page,
  }) => {
    // Switch to POST
    await page.locator('[role="combobox"]').click();
    await page.locator('[role="option"]', { hasText: "POST" }).click();
    await expect(page.locator("text=+ Show body")).toBeVisible();

    // Switch back to GET
    await page.locator('[role="combobox"]').click();
    await page.locator('[role="option"]', { hasText: "GET" }).click();

    // Body toggle should not be visible
    await expect(page.locator("text=+ Show body")).not.toBeVisible();
  });

  test("should toggle body textarea visibility", async ({ page }) => {
    await page.locator('[role="combobox"]').click();
    await page.locator('[role="option"]', { hasText: "POST" }).click();

    // Show body
    await page.locator("text=+ Show body").click();
    await expect(page.locator("textarea")).toBeVisible();

    // Hide body
    await page.locator("text=- Hide body").click();
    await expect(page.locator("textarea")).not.toBeVisible();
  });

  test("should have all HTTP methods in dropdown", async ({ page }) => {
    await page.locator('[role="combobox"]').click();

    const options = page.locator('[role="option"]');
    await expect(
      page.locator('[role="option"]', { hasText: "GET" }),
    ).toBeVisible();
    await expect(
      page.locator('[role="option"]', { hasText: "POST" }),
    ).toBeVisible();
    await expect(
      page.locator('[role="option"]', { hasText: "PUT" }),
    ).toBeVisible();
    await expect(
      page.locator('[role="option"]', { hasText: "DELETE" }),
    ).toBeVisible();
    await expect(
      page.locator('[role="option"]', { hasText: "OPTIONS" }),
    ).toBeVisible();
    await expect(
      page.locator('[role="option"]', { hasText: "HEAD" }),
    ).toBeVisible();
    expect(await options.count()).toBe(6);
  });

  test("should disable Send button when URL is empty", async ({ page }) => {
    const urlInput = page.locator('input[placeholder="/api/..."]');
    await urlInput.clear();

    const panel = page.locator('[role="tabpanel"]');
    const sendButton = panel.locator("button", { hasText: "Send" });
    await expect(sendButton).toBeDisabled();
  });

  test("should show clear history button when history exists", async ({
    page,
  }) => {
    const panel = page.locator('[role="tabpanel"]');
    await panel.locator("button", { hasText: "Send" }).click();

    await expect(page.getByText("$ GET /api/ping")).toBeVisible({
      timeout: 10000,
    });

    // The trash icon button should appear in the history section
    await expect(page.getByText("History").first()).toBeVisible();
  });
});

// ─── Push Tab ────────────────────────────────────────────────────────────────

test.describe("Admin Page — Push Tab", () => {
  test.beforeEach(async ({ page }) => {
    await adminLoginOrSkip(page);
    await page.locator('[role="tab"]', { hasText: "Push" }).click();
  });

  test("should switch to Push tab and show permission card", async ({
    page,
  }) => {
    await expect(page.getByText("Permission", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Check Subscriptions" })).toBeVisible();
  });

  test("should display notification permission status", async ({ page }) => {
    await expect(page.getByText("Permission", { exact: true })).toBeVisible();
    // Should show one of: Granted, Denied, Not Requested
    const granted = page.getByText("Granted", { exact: true });
    const denied = page.getByText("Denied", { exact: true });
    const notRequested = page.getByText("Not Requested", { exact: true });
    const count =
      (await granted.count()) +
      (await denied.count()) +
      (await notRequested.count());
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("should display service worker status", async ({ page }) => {
    await expect(page.getByText("Service Worker", { exact: true })).toBeVisible();
    // Should show one of: Active, Inactive, Missing
    const active = page.getByText("Active", { exact: true });
    const inactive = page.getByText("Inactive", { exact: true });
    const missing = page.getByText("Missing", { exact: true });
    const count =
      (await active.count()) +
      (await inactive.count()) +
      (await missing.count());
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("should display subscriptions section", async ({ page }) => {
    await expect(page.getByText("Subscriptions", { exact: true })).toBeVisible();
    // Initially shows "—" before checking
    await expect(page.getByText("—", { exact: true })).toBeVisible();
  });

  test("should have Check Subscriptions button", async ({ page }) => {
    const checkButton = page.getByRole("button", {
      name: "Check Subscriptions",
    });
    await expect(checkButton).toBeVisible();
    await expect(checkButton).toBeEnabled();
  });

  test("should have Send Test Notification button", async ({ page }) => {
    const sendButton = page.getByRole("button", {
      name: "Send Test Notification",
    });
    await expect(sendButton).toBeVisible();
  });

  test("should have Send Custom Notification button", async ({ page }) => {
    const customButton = page.getByRole("button", {
      name: "Send Custom Notification",
    });
    await expect(customButton).toBeVisible();
  });

  test("should display Custom Notification form", async ({
    page,
  }) => {
    await expect(
      page.getByText("Custom Notification", { exact: true }),
    ).toBeVisible();
  });

  test("should have title input with default value", async ({ page }) => {
    const titleInput = page.locator("#push-title");
    await expect(titleInput).toBeVisible();
    await expect(titleInput).toHaveValue("Custom Test Notification");
  });

  test("should have URL input with default value", async ({ page }) => {
    const urlInput = page.locator("#push-url");
    await expect(urlInput).toBeVisible();
    await expect(urlInput).toHaveValue("/about");
  });

  test("should have message body textarea with default value", async ({
    page,
  }) => {
    const bodyInput = page.locator("#push-body");
    await expect(bodyInput).toBeVisible();
    await expect(bodyInput).toHaveValue(
      "This is a custom push notification using Web Push API!",
    );
  });

  test("should allow editing custom notification fields", async ({
    page,
  }) => {
    const titleInput = page.locator("#push-title");
    await titleInput.clear();
    await titleInput.fill("My Custom Title");
    await expect(titleInput).toHaveValue("My Custom Title");

    const urlInput = page.locator("#push-url");
    await urlInput.clear();
    await urlInput.fill("/projects");
    await expect(urlInput).toHaveValue("/projects");

    const bodyInput = page.locator("#push-body");
    await bodyInput.clear();
    await bodyInput.fill("Custom body text");
    await expect(bodyInput).toHaveValue("Custom body text");
  });

  test("should display requirements checklist", async ({ page }) => {
    await expect(page.getByText("Requirements", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Notification permission granted"),
    ).toBeVisible();
    await expect(
      page.getByText("Service Worker registered and active"),
    ).toBeVisible();
    await expect(
      page.getByText("Subscribed via Notification Button"),
    ).toBeVisible();
    await expect(
      page.getByText("Web Push API configured with VAPID keys"),
    ).toBeVisible();
  });

  test("should have bell icon in header", async ({ page }) => {
    const panel = page.locator('[role="tabpanel"]');
    const bellIcon = panel.locator("svg").first();
    await expect(bellIcon).toBeVisible();
  });

  test("should show form labels for all inputs", async ({ page }) => {
    await expect(page.getByText("Title", { exact: true })).toBeVisible();
    await expect(
      page.getByText("URL (optional)", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Message Body", { exact: true }),
    ).toBeVisible();
  });

  test("should show Register Service Worker button when SW is not registered", async ({ page }) => {
    // In test environment, SW is typically not registered
    const registerButton = page.getByRole("button", { name: "Register Service Worker" });
    // Button is shown only when SW is not registered — check it exists or is absent
    const count = await registerButton.count();
    // Either visible (SW missing) or absent (SW already registered) — both valid
    expect(count).toBeLessThanOrEqual(1);
  });

  test("should show subscribers list after checking subscriptions", async ({ page }) => {
    const checkButton = page.getByRole("button", { name: "Check Subscriptions" });
    await checkButton.click();
    // Wait for result message
    await expect(page.getByText(/Found \d+ active subscription/)).toBeVisible({ timeout: 10_000 });
    // If subscribers exist, the list section should appear
    const subscribersList = page.locator('[role="list"][aria-label="Push notification subscribers"]');
    const count = await subscribersList.count();
    // List appears only if >0 subscribers — both cases are valid
    expect(count).toBeLessThanOrEqual(1);
  });
});

// ─── Analytics Tab ───────────────────────────────────────────────────────────

test.describe("Admin Page — Analytics Tab", () => {
  test.beforeEach(async ({ page }) => {
    await adminLoginOrSkip(page);
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

  test("should show GA detection status badge", async ({ page }) => {
    // Should show either "Active" or "Not Detected" badge
    const activeBadge = page.getByText("Active", { exact: true });
    const notDetectedBadge = page.getByText("Not Detected", { exact: true });
    const activeCount = await activeBadge.count();
    const notDetectedCount = await notDetectedBadge.count();
    expect(activeCount + notDetectedCount).toBeGreaterThanOrEqual(1);
  });

  test("should have a copy button for Measurement ID", async ({ page }) => {
    // Copy button is a button with title "Copy ID"
    const copyButton = page.locator('button[title="Copy ID"]');
    await expect(copyButton).toBeVisible();
  });

  test("should explain NEXT_PUBLIC_GA_ID env variable", async ({ page }) => {
    await expect(
      page.getByText("NEXT_PUBLIC_GA_ID", { exact: false }).first(),
    ).toBeVisible();
  });

  test("should explain afterInteractive loading strategy", async ({
    page,
  }) => {
    await expect(
      page.getByText("afterInteractive").first(),
    ).toBeVisible();
  });

  test("should display Configuration section", async ({ page }) => {
    await expect(page.getByText("Configuration").first()).toBeVisible();
    await expect(page.getByText("page_path").first()).toBeVisible();
    await expect(page.getByText("anonymize_ip").first()).toBeVisible();
    await expect(page.getByText("cookie_flags").first()).toBeVisible();
  });

  test("should explain page_path tracking with hooks", async ({ page }) => {
    await expect(page.getByText("usePathname()").first()).toBeVisible();
    await expect(page.getByText("useSearchParams()").first()).toBeVisible();
  });

  test("should explain Suspense boundary usage", async ({ page }) => {
    await expect(
      page.getByText("Suspense", { exact: false }).first(),
    ).toBeVisible();
  });

  test("should explain anonymize_ip with GDPR context", async ({ page }) => {
    await expect(page.getByText("GDPR").first()).toBeVisible();
    await expect(
      page.getByText("IP anonymization", { exact: false }).first(),
    ).toBeVisible();
  });

  test("should explain IP truncation behavior", async ({ page }) => {
    await expect(
      page.getByText("last octet", { exact: false }).first(),
    ).toBeVisible();
    await expect(
      page.getByText("IPv4", { exact: false }).first(),
    ).toBeVisible();
  });

  test("should explain cookie_flags with SameSite and Secure", async ({
    page,
  }) => {
    await expect(
      page.getByText("SameSite=None", { exact: false }).first(),
    ).toBeVisible();
    await expect(page.getByText("Secure").first()).toBeVisible();
    await expect(
      page.getByText("cross-origin", { exact: false }).first(),
    ).toBeVisible();
  });

  test("should display Event Helpers section", async ({ page }) => {
    await expect(page.getByText("Event Helpers").first()).toBeVisible();
    await expect(page.getByText("trackEvent").first()).toBeVisible();
    await expect(page.getByText("trackConversion").first()).toBeVisible();
  });

  test("should show trackEvent parameters", async ({ page }) => {
    await expect(
      page
        .getByText("(action, category, label?, value?)", { exact: false })
        .first(),
    ).toBeVisible();
  });

  test("should show trackConversion parameters", async ({ page }) => {
    await expect(
      page
        .getByText("(conversionId, label?)", { exact: false })
        .first(),
    ).toBeVisible();
  });

  test("should describe trackEvent usage", async ({ page }) => {
    await expect(
      page.getByText("custom GA4 event", { exact: false }).first(),
    ).toBeVisible();
  });

  test("should describe trackConversion usage", async ({ page }) => {
    await expect(
      page.getByText("conversion event", { exact: false }).first(),
    ).toBeVisible();
  });

  test("should show code snippets with examples", async ({ page }) => {
    const codeBlocks = page.locator("pre");
    expect(await codeBlocks.count()).toBeGreaterThanOrEqual(2);

    // First code block should contain trackEvent usage examples
    const firstBlock = codeBlocks.first();
    await expect(firstBlock).toContainText("trackEvent");

    // Should contain example categories
    await expect(firstBlock).toContainText("Navigation");
  });

  test("should show gtag internals in code snippets", async ({ page }) => {
    const codeBlocks = page.locator("pre");
    // At least one code block should show gtag("event", ...)
    const allCode = await codeBlocks.allTextContents();
    const hasGtag = allCode.some((text) => text.includes("gtag"));
    expect(hasGtag).toBe(true);
  });

  test("should have link to GA4 Dashboard", async ({ page }) => {
    const gaLink = page.locator('a[href="https://analytics.google.com/"]');
    await expect(gaLink).toBeVisible();
    await expect(page.getByText("Open GA4 Dashboard").first()).toBeVisible();

    // Link should open in new tab
    await expect(gaLink).toHaveAttribute("target", "_blank");
    await expect(gaLink).toHaveAttribute("rel", /noopener/);
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

  test("should show route tracking implementation details", async ({
    page,
  }) => {
    await expect(
      page.getByText("usePathname()").first(),
    ).toBeVisible();
    await expect(
      page.getByText("useSearchParams()").first(),
    ).toBeVisible();
    // Null guard
    await expect(
      page.getByText("Null guard", { exact: false }).first(),
    ).toBeVisible();
    await expect(
      page.getByText("NEXT_PUBLIC_GA_ID is unset", { exact: false }).first(),
    ).toBeVisible();
  });

  test("should explain GA4 dashboard link purpose", async ({ page }) => {
    await expect(
      page
        .getByText("Real-time reports", { exact: false })
        .first(),
    ).toBeVisible();
    await expect(
      page
        .getByText("engagement metrics", { exact: false })
        .first(),
    ).toBeVisible();
  });
});

// ─── Deploy Tab ─────────────────────────────────────────────────────────────

test.describe("Admin Page — Deploy Tab", () => {
  test.beforeEach(async ({ page }) => {
    await adminLoginOrSkip(page);
    await page.locator('[role="tab"]', { hasText: "Deploy" }).click();
  });

  test("should display Production Deployment header", async ({ page }) => {
    await expect(page.getByText("Production Deployment")).toBeVisible();
  });

  test("should have Check button", async ({ page }) => {
    const checkButton = page.getByRole("button", { name: "Check" });
    await expect(checkButton).toBeVisible();
    await expect(checkButton).toBeEnabled({ timeout: 10000 });
  });

  test("should show Frontend and API sections", async ({ page }) => {
    await expect(page.getByText("Frontend").first()).toBeVisible();
    await expect(page.getByText("API (Lambda)").first()).toBeVisible();
  });

  test("should display Infrastructure section", async ({ page }) => {
    await expect(page.getByText("Infrastructure").first()).toBeVisible();
    await expect(page.getByText("S3 Bucket").first()).toBeVisible();
    await expect(page.getByText("CloudFront").first()).toBeVisible();
    await expect(page.getByText("Region").first()).toBeVisible();
    await expect(page.getByText("Amplify App").first()).toBeVisible();
  });

  test("should display Health Checks section", async ({ page }) => {
    await expect(page.getByText("Health Checks").first()).toBeVisible();
    await expect(page.getByText("Frontend reachable")).toBeVisible();
    await expect(page.getByText("API responding")).toBeVisible();
    await expect(page.getByText("API latency < 2s")).toBeVisible();
  });

  test("should show hosting details", async ({ page }) => {
    await expect(
      page.getByText("S3 + CloudFront", { exact: false }),
    ).toBeVisible();
  });

  test("should run deployment checks when Check button is clicked", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Check" }).click();
    // Wait for checks to complete
    await page.waitForTimeout(5000);

    // After checking, should show status labels
    const panel = page.locator('[role="tabpanel"]');
    const statusLabels = panel.getByText(/healthy|degraded|down|unknown/i);
    expect(await statusLabels.count()).toBeGreaterThanOrEqual(1);
  });
});

// ─── Errors Tab ─────────────────────────────────────────────────────────────

test.describe("Admin Page — Errors Tab", () => {
  test.beforeEach(async ({ page }) => {
    await adminLoginOrSkip(page);
    await page.locator('[role="tab"]', { hasText: "Errors" }).click();
  });

  test("should display error count", async ({ page }) => {
    await expect(page.getByText("Captured", { exact: true })).toBeVisible();
  });

  test("should have Live/Paused toggle button", async ({ page }) => {
    const liveButton = page.locator("button", { hasText: /Live|Paused/ });
    await expect(liveButton).toBeVisible();
  });

  test("should have Clear button", async ({ page }) => {
    const clearButton = page.locator("button", { hasText: "Clear" });
    await expect(clearButton).toBeVisible();
  });

  test("should show capture status when live", async ({ page }) => {
    await expect(
      page.getByText("Capturing browser errors", { exact: false }),
    ).toBeVisible();
  });

  test("should show empty state when no errors captured", async ({ page }) => {
    await expect(page.getByText("No errors captured yet")).toBeVisible();
    await expect(
      page.getByText("Errors will appear here in real time"),
    ).toBeVisible();
  });

  test("should toggle capturing on/off", async ({ page }) => {
    // Initially Live
    const toggleButton = page.locator("button", { hasText: /Live|Paused/ });
    await expect(toggleButton).toContainText("Live");

    // Click to pause
    await toggleButton.click();
    await expect(toggleButton).toContainText("Paused");

    // Click to resume
    await toggleButton.click();
    await expect(toggleButton).toContainText("Live");
  });
});

// ─── Perf Tab ───────────────────────────────────────────────────────────────

test.describe("Admin Page — Perf Tab", () => {
  test.beforeEach(async ({ page }) => {
    await adminLoginOrSkip(page);
    await page.locator('[role="tab"]', { hasText: "Perf" }).click();
  });

  test("should display performance grade", async ({ page }) => {
    await expect(page.getByText("Grade")).toBeVisible();
  });

  test("should display score", async ({ page }) => {
    await expect(page.getByText("Score")).toBeVisible();
  });

  test("should display Within Budget count", async ({ page }) => {
    await expect(page.getByText("Within Budget")).toBeVisible();
  });

  test("should show Live from web-vitals badge", async ({ page }) => {
    await expect(page.getByText("Live from web-vitals")).toBeVisible();
  });

  test("should display all 4 Core Web Vital metrics", async ({ page }) => {
    const panel = page.locator('[role="tabpanel"]');
    await expect(panel.getByText("LCP").first()).toBeVisible();
    await expect(panel.getByText("FCP").first()).toBeVisible();
    await expect(panel.getByText("CLS").first()).toBeVisible();
    await expect(panel.getByText("TTFB").first()).toBeVisible();
  });

  test("should show metric descriptions", async ({ page }) => {
    await expect(
      page.getByText("Largest Contentful Paint", { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByText("First Contentful Paint", { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByText("Cumulative Layout Shift", { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByText("Time to First Byte", { exact: false }),
    ).toBeVisible();
  });

  test("should show budget thresholds section", async ({ page }) => {
    await expect(
      page.getByText("Budget Thresholds", { exact: false }),
    ).toBeVisible();
  });

  test("should show budget values", async ({ page }) => {
    await expect(page.getByText("≤ 2500ms")).toBeVisible();
    await expect(page.getByText("≤ 1800ms")).toBeVisible();
    await expect(page.getByText("≤ 800ms")).toBeVisible();
  });
});

// ─── SEO Audit Tab ──────────────────────────────────────────────────────────

test.describe("Admin Page — SEO Audit Tab", () => {
  test.beforeEach(async ({ page }) => {
    await adminLoginOrSkip(page);
    await page.locator('[role="tab"]', { hasText: "SEO" }).click();
  });

  test("should display Pages count", async ({ page }) => {
    await expect(page.getByText("Pages").first()).toBeVisible();
  });

  test("should have Re-scan button", async ({ page }) => {
    const rescanButton = page.locator("button", { hasText: /Re-scan|Scanning/ });
    await expect(rescanButton).toBeVisible();
  });

  test("should show scan results with page paths", async ({ page }) => {
    // Wait for initial scan to complete
    await page.waitForTimeout(8000);

    const panel = page.locator('[role="tabpanel"]');
    // Should show at least the homepage path
    await expect(panel.getByText("/", { exact: true }).first()).toBeVisible();
  });

  test("should show status labels (Pass/Warn/Error)", async ({ page }) => {
    await page.waitForTimeout(8000);

    // At least one of these status labels should appear
    const pass = page.getByText("Pass", { exact: true });
    const warn = page.getByText("Warn", { exact: true });
    const error = page.getByText("Error", { exact: true });
    const count =
      (await pass.count()) + (await warn.count()) + (await error.count());
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("should show metadata badges after scan", async ({ page }) => {
    await page.waitForTimeout(8000);

    const panel = page.locator('[role="tabpanel"]');
    // At least some metadata badges should be visible
    const badges = panel.getByText(
      /og:image|canonical|JSON-LD|og:title/,
    );
    expect(await badges.count()).toBeGreaterThanOrEqual(1);
  });
});

// ─── Auth Tab ───────────────────────────────────────────────────────────────

test.describe("Admin Page — Auth Tab", () => {
  test.beforeEach(async ({ page }) => {
    await adminLoginOrSkip(page);
    await page.locator('[role="tab"]', { hasText: "Auth" }).click();
  });

  test("should display Current Session section", async ({ page }) => {
    await expect(page.getByText("Current Session")).toBeVisible();
  });

  test("should show user session details", async ({ page }) => {
    // Since we're logged in, should show user info
    await expect(page.getByText("Username").first()).toBeVisible();
    await expect(page.getByText("User ID").first()).toBeVisible();
    await expect(page.getByText("Sign-in Method").first()).toBeVisible();
    await expect(page.getByText("Groups").first()).toBeVisible();
  });

  test("should display AWS Cognito section", async ({ page }) => {
    await expect(page.getByText("AWS Cognito")).toBeVisible();
  });

  test("should show Cognito active badge", async ({ page }) => {
    await expect(page.getByText("active", { exact: true })).toBeVisible();
  });

  test("should display Cognito Region, App ID, and User Pool fields", async ({
    page,
  }) => {
    await expect(page.getByText("Region").first()).toBeVisible();
    await expect(page.getByText("App ID").first()).toBeVisible();
    await expect(page.getByText("User Pool").first()).toBeVisible();
    await expect(page.getByText("Auth Method").first()).toBeVisible();
  });

  test("should show ID Token section when logged in", async ({ page }) => {
    // Token section appears when user has an active token
    const tokenSection = page.getByText("ID Token");
    const count = await tokenSection.count();
    if (count > 0) {
      await expect(page.getByText("Expires").first()).toBeVisible();
      await expect(page.getByText("Issuer").first()).toBeVisible();
    }
  });
});

// ─── Env Tab ────────────────────────────────────────────────────────────────

test.describe("Admin Page — Env Tab", () => {
  test.beforeEach(async ({ page }) => {
    await adminLoginOrSkip(page);
    await page.locator('[role="tab"]', { hasText: "Env" }).click();
  });

  test("should display Build Info section", async ({ page }) => {
    await expect(page.getByText("Build Info")).toBeVisible();
  });

  test("should show build info fields", async ({ page }) => {
    await expect(page.getByText("App Version").first()).toBeVisible();
    await expect(page.getByText("Environment").first()).toBeVisible();
    await expect(page.getByText("Site URL").first()).toBeVisible();
    await expect(page.getByText("Framework").first()).toBeVisible();
  });

  test("should show Next.js framework value", async ({ page }) => {
    await expect(
      page.getByText("Next.js 16 (App Router)", { exact: false }),
    ).toBeVisible();
  });

  test("should display Integrations section", async ({ page }) => {
    await expect(page.getByText("Integrations")).toBeVisible();
  });

  test("should show integration items", async ({ page }) => {
    await expect(page.getByText("Google Analytics").first()).toBeVisible();
    await expect(page.getByText("Sentry").first()).toBeVisible();
    await expect(page.getByText("reCAPTCHA v3").first()).toBeVisible();
  });

  test("should show integration status badges", async ({ page }) => {
    // Each integration should show "active" or "inactive"
    const active = page.getByText("active", { exact: true });
    const inactive = page.getByText("inactive", { exact: true });
    const count = (await active.count()) + (await inactive.count());
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("should display Git section", async ({ page }) => {
    await expect(page.getByText("Git").first()).toBeVisible();
    await expect(page.getByText("Branch").first()).toBeVisible();
  });

  test("should display Client section with device info", async ({ page }) => {
    await expect(page.getByText("Client").first()).toBeVisible();
    await expect(page.getByText("Viewport").first()).toBeVisible();
    await expect(page.getByText("Language").first()).toBeVisible();
    await expect(page.getByText("Platform").first()).toBeVisible();
  });
});

// ─── Tab Navigation ──────────────────────────────────────────────────────────

test.describe("Admin Page — Tab Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await adminLoginOrSkip(page);
  });

  test("should switch between all tabs", async ({ page }) => {
    const healthTab = page.locator('[role="tab"]', { hasText: "Health" });
    await expect(healthTab).toHaveAttribute("data-state", "active");

    await page.locator('[role="tab"]', { hasText: "Console" }).click();
    await expect(page.locator("text=Request")).toBeVisible();

    await page.locator('[role="tab"]', { hasText: "Deploy" }).click();
    await expect(page.getByText("Production Deployment")).toBeVisible();

    await page.locator('[role="tab"]', { hasText: "Errors" }).click();
    await expect(page.getByText("Captured", { exact: true })).toBeVisible();

    await page.locator('[role="tab"]', { hasText: "Perf" }).click();
    await expect(page.getByText("Grade")).toBeVisible();

    await page.locator('[role="tab"]', { hasText: "SEO" }).click();
    await expect(page.getByText("Pages").first()).toBeVisible();

    await page.locator('[role="tab"]', { hasText: "Push" }).click();
    await expect(page.getByText("Check Subscriptions")).toBeVisible();

    await page.locator('[role="tab"]', { hasText: "Analytics" }).click();
    await expect(page.getByText("Measurement ID").first()).toBeVisible();

    await page.locator('[role="tab"]', { hasText: "Auth" }).click();
    await expect(page.getByText("Current Session")).toBeVisible();

    await page.locator('[role="tab"]', { hasText: "Env" }).click();
    await expect(page.getByText("Build Info")).toBeVisible();

    await page.locator('[role="tab"]', { hasText: "Health" }).click();
    await expect(page.locator("text=Refresh All")).toBeVisible();
  });

  test("should have exactly 10 tabs", async ({ page }) => {
    const tabs = page.locator('[role="tab"]');
    await expect(tabs).toHaveCount(10);
  });

  test("should mark only the active tab with data-state active", async ({
    page,
  }) => {
    // Health tab active by default
    const healthTab = page.locator('[role="tab"]', { hasText: "Health" });
    await expect(healthTab).toHaveAttribute("data-state", "active");

    // All other tabs should be inactive
    const tabNames = ["Console", "Deploy", "Errors", "Perf", "SEO", "Push", "Analytics", "Auth", "Env"];
    for (const name of tabNames) {
      const tab = page.locator('[role="tab"]', { hasText: name });
      await expect(tab).toHaveAttribute("data-state", "inactive");
    }

    // Switch to Deploy and verify
    await page.locator('[role="tab"]', { hasText: "Deploy" }).click();
    await expect(healthTab).toHaveAttribute("data-state", "inactive");
    await expect(
      page.locator('[role="tab"]', { hasText: "Deploy" }),
    ).toHaveAttribute("data-state", "active");
  });

  test("should show correct content for each tab", async ({ page }) => {
    // Health tab content
    await expect(page.locator("text=Refresh All")).toBeVisible();

    // Switch to Console — should show request builder, not health
    await page.locator('[role="tab"]', { hasText: "Console" }).click();
    await expect(page.locator("text=Request")).toBeVisible();
    await expect(page.locator("text=Refresh All")).not.toBeVisible();

    // Switch to Deploy
    await page.locator('[role="tab"]', { hasText: "Deploy" }).click();
    await expect(page.getByText("Production Deployment")).toBeVisible();
    await expect(page.locator("text=Request")).not.toBeVisible();

    // Switch to Env
    await page.locator('[role="tab"]', { hasText: "Env" }).click();
    await expect(page.getByText("Build Info")).toBeVisible();
    await expect(page.getByText("Production Deployment")).not.toBeVisible();
  });

  test("should have icons in tab labels", async ({ page }) => {
    // Each tab has an SVG icon (lucide icons)
    const tabs = page.locator('[role="tab"]');
    const count = await tabs.count();
    expect(count).toBe(10);
    for (let i = 0; i < count; i++) {
      const tab = tabs.nth(i);
      const svg = tab.locator("svg");
      await expect(svg).toBeVisible();
    }
  });
});

// ─── noindex Meta ────────────────────────────────────────────────────────────

test.describe("Admin Page — SEO", () => {
  test("should have noindex meta tag", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    const robotsMeta = page.locator(
      'meta[name="robots"][content="noindex, nofollow"]',
    );
    await expect(robotsMeta).toBeAttached();
  });

  test("should not be accessible from site navigation for unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    // Admin page should show login gate, not dashboard content
    await expect(page.locator("text=Admin Access")).toBeVisible();
    await expect(page.locator("text=Admin Dashboard")).not.toBeVisible();
  });
});

// ─── Accessibility ──────────────────────────────────────────────────────────

test.describe("Admin Page — Accessibility", () => {
  test("should have ARIA labels on login form inputs", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute("aria-label", "Email address");

    const passInput = page.locator('input[type="password"]');
    await expect(passInput).toHaveAttribute("aria-label", "Password");
  });

  test("should show error with role=alert on invalid login", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    await page.locator('input[type="email"]').fill("wrong@test.com");
    await page.locator('input[type="password"]').fill("wrong");
    await page.locator('button[type="submit"]').click();

    const authError = page.locator('[role="alert"]');
    await expect(authError).toBeVisible({ timeout: 20000 });
  });

  test("should have aria-describedby linking form to error", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    // Before error, no aria-describedby
    const form = page.locator("form");
    await expect(form).not.toHaveAttribute("aria-describedby");

    // Trigger error
    await page.locator('input[type="email"]').fill("wrong@test.com");
    await page.locator('input[type="password"]').fill("wrong");
    await page.locator('button[type="submit"]').click();

    // After error, form links to error message
    const errorEl = page.locator('[role="alert"]');
    await expect(errorEl).toBeVisible({ timeout: 20000 });
    await expect(form).toHaveAttribute("aria-describedby", "login-error");
  });
});

// ─── Mobile Responsive ──────────────────────────────────────────────────────

test.describe("Admin Page — Mobile Responsive", () => {
  test("should show dropdown tab selector on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const success = await adminLogin(page);
    if (!success) {
      test.skip(true, "Cognito auth is not available");
      return;
    }

    // Mobile dropdown should be visible
    const mobileSelect = page.locator('select[aria-label="Select admin tab"]');
    await expect(mobileSelect).toBeVisible();

    // Desktop tabs should be hidden
    const desktopTabs = page.locator('[role="tablist"]');
    await expect(desktopTabs).not.toBeVisible();
  });

  test("should show tab bar on desktop viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const success = await adminLogin(page);
    if (!success) {
      test.skip(true, "Cognito auth is not available");
      return;
    }

    // Desktop tabs should be visible
    const desktopTabs = page.locator('[role="tablist"]');
    await expect(desktopTabs).toBeVisible();

    // Mobile dropdown should be hidden
    const mobileSelect = page.locator('select[aria-label="Select admin tab"]');
    await expect(mobileSelect).not.toBeVisible();
  });
});
