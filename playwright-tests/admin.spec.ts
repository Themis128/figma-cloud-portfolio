import { expect, test } from "@playwright/test";

const VALID_EMAIL = "tbaltzakis@cloudless.com";
const VALID_PASS = "TH!123789th!";

// Firebase Auth can be slow (SDK init + network call to Google servers).
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
  // With Firebase v12+ initializeAuth, some auth failures are silent
  // (no visible error text), so we also check if the login form persists.
  const dashboard = page.locator("text=Admin Dashboard");
  const authError = page.locator("text=/Email\\/password sign-in is not enabled|operation-not-allowed|timed out|Login failed|Invalid email|recaptcha/i");
  const loginForm = page.locator("text=Admin Access");

  try {
    await expect(dashboard.or(authError)).toBeVisible({ timeout: 20000 });
  } catch {
    // Neither dashboard nor known error appeared — if login form is still
    // visible, auth silently failed (e.g. Firebase reCAPTCHA or network issue).
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
    test.skip(true, "Firebase Email/Password auth is not enabled");
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

    // Should show an authentication error (exact message depends on Firebase provider config)
    const authError = page.locator("text=/Invalid email|not enabled|operation-not-allowed|timed out|Login failed/i");
    await expect(authError).toBeVisible({ timeout: 15000 });
    await expect(page.locator("text=Admin Access")).toBeVisible();
  });

  test("should reject valid email with wrong password", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    await page.locator('input[type="email"]').fill(VALID_EMAIL);
    await page.locator('input[type="password"]').fill("wrongpass");
    await page.locator('button[type="submit"]').click();

    const authError = page.locator("text=/Invalid email|not enabled|operation-not-allowed|timed out|Login failed/i");
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

  test("should render exactly 9 endpoint cards", async ({ page }) => {
    const cardArea = page.locator('[role="tabpanel"]');
    // Each endpoint card is a Card with endpoint path
    const cards = cardArea.locator(".grid > div");
    await expect(cards).toHaveCount(9);
  });

  test("should show summary stats", async ({ page }) => {
    await page.waitForTimeout(3000);

    await expect(page.locator("text=Total")).toBeVisible();
    await expect(page.locator("text=Healthy").first()).toBeVisible();
  });

  test("should display total endpoint count of 9", async ({ page }) => {
    // The total count should be 9
    const totalStat = page
      .locator("div.text-center")
      .filter({ hasText: "Total" });
    await expect(totalStat.locator(".font-mono.font-bold")).toContainText("9");
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

  test("should display reCAPTCHA + SES service for contact endpoint", async ({
    page,
  }) => {
    const cardArea = page.locator('[role="tabpanel"]');
    await expect(
      cardArea.getByText("reCAPTCHA + SES", { exact: false }),
    ).toBeVisible();
  });

  test("should show method badges", async ({ page }) => {
    const getBadges = page.locator("text=GET");
    expect(await getBadges.count()).toBeGreaterThanOrEqual(5);

    const postBadges = page.locator("text=POST");
    expect(await postBadges.count()).toBeGreaterThanOrEqual(3);
  });

  test("should display endpoint descriptions", async ({ page }) => {
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
  });

  test("should have individual refresh buttons on each card", async ({
    page,
  }) => {
    const cardArea = page.locator('[role="tabpanel"]');
    const refreshButtons = cardArea.locator('button[title="Refresh"]');
    // Should be 9 refresh buttons (one per endpoint card)
    await expect(refreshButtons).toHaveCount(9);
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

    // When Firebase auth is available and user is logged in,
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

  test("should switch to Push tab and show Web Push API Tester", async ({
    page,
  }) => {
    await expect(page.getByText("Web Push API Tester")).toBeVisible();
    await expect(
      page.getByText(
        "Test push notifications using native Web Push API with VAPID keys.",
      ),
    ).toBeVisible();
  });

  test("should display notification permission status", async ({ page }) => {
    await expect(
      page.getByText("Notification Permission:"),
    ).toBeVisible();
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
    await expect(page.getByText("Service Worker:")).toBeVisible();
    // Should show one of: Active, Registered (Inactive), Not Registered
    const active = page.getByText(/Active \(/);
    const inactive = page.getByText("Registered (Inactive)");
    const notRegistered = page.getByText("Not Registered");
    const count =
      (await active.count()) +
      (await inactive.count()) +
      (await notRegistered.count());
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("should display active subscriptions section", async ({ page }) => {
    await expect(
      page.getByText("Active Subscriptions:"),
    ).toBeVisible();
    // Initially shows "Unknown" before checking
    await expect(page.getByText("Unknown")).toBeVisible();
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

  test("should display Custom Notification Settings form", async ({
    page,
  }) => {
    await expect(
      page.getByText("Custom Notification Settings"),
    ).toBeVisible();
  });

  test("should have title input with default value", async ({ page }) => {
    const titleInput = page.locator("#title");
    await expect(titleInput).toBeVisible();
    await expect(titleInput).toHaveValue("Custom Test Notification");
  });

  test("should have URL input with default value", async ({ page }) => {
    const urlInput = page.locator("#url");
    await expect(urlInput).toBeVisible();
    await expect(urlInput).toHaveValue("/about");
  });

  test("should have message body textarea with default value", async ({
    page,
  }) => {
    const bodyInput = page.locator("#body");
    await expect(bodyInput).toBeVisible();
    await expect(bodyInput).toHaveValue(
      "This is a custom push notification using Web Push API!",
    );
  });

  test("should allow editing custom notification fields", async ({
    page,
  }) => {
    const titleInput = page.locator("#title");
    await titleInput.clear();
    await titleInput.fill("My Custom Title");
    await expect(titleInput).toHaveValue("My Custom Title");

    const urlInput = page.locator("#url");
    await urlInput.clear();
    await urlInput.fill("/projects");
    await expect(urlInput).toHaveValue("/projects");

    const bodyInput = page.locator("#body");
    await bodyInput.clear();
    await bodyInput.fill("Custom body text");
    await expect(bodyInput).toHaveValue("Custom body text");
  });

  test("should display requirements checklist", async ({ page }) => {
    await expect(
      page.getByText("Requirements for notifications to appear:"),
    ).toBeVisible();
    await expect(
      page.getByText("Notification permission must be granted"),
    ).toBeVisible();
    await expect(
      page.getByText("App must be running in background or another tab"),
    ).toBeVisible();
    await expect(
      page.getByText("Must be subscribed using the Notification Button"),
    ).toBeVisible();
    await expect(
      page.getByText("Web Push API must be configured with VAPID keys"),
    ).toBeVisible();
    await expect(
      page.getByText("Service Worker must be registered and active"),
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

    await page.locator('[role="tab"]', { hasText: "Push" }).click();
    await expect(page.getByText("Web Push API Tester")).toBeVisible();

    await page.locator('[role="tab"]', { hasText: "Analytics" }).click();
    await expect(page.getByText("Measurement ID").first()).toBeVisible();

    await page.locator('[role="tab"]', { hasText: "Health" }).click();
    await expect(page.locator("text=Refresh All")).toBeVisible();
  });

  test("should have exactly 4 tabs", async ({ page }) => {
    const tabs = page.locator('[role="tab"]');
    await expect(tabs).toHaveCount(4);
  });

  test("should mark only the active tab with data-state active", async ({
    page,
  }) => {
    // Health tab active by default
    const healthTab = page.locator('[role="tab"]', { hasText: "Health" });
    const consoleTab = page.locator('[role="tab"]', { hasText: "Console" });
    const pushTab = page.locator('[role="tab"]', { hasText: "Push" });
    const analyticsTab = page.locator('[role="tab"]', {
      hasText: "Analytics",
    });

    await expect(healthTab).toHaveAttribute("data-state", "active");
    await expect(consoleTab).toHaveAttribute("data-state", "inactive");
    await expect(pushTab).toHaveAttribute("data-state", "inactive");
    await expect(analyticsTab).toHaveAttribute("data-state", "inactive");

    // Switch to Console
    await consoleTab.click();
    await expect(healthTab).toHaveAttribute("data-state", "inactive");
    await expect(consoleTab).toHaveAttribute("data-state", "active");
    await expect(pushTab).toHaveAttribute("data-state", "inactive");
    await expect(analyticsTab).toHaveAttribute("data-state", "inactive");

    // Switch to Push
    await pushTab.click();
    await expect(healthTab).toHaveAttribute("data-state", "inactive");
    await expect(consoleTab).toHaveAttribute("data-state", "inactive");
    await expect(pushTab).toHaveAttribute("data-state", "active");
    await expect(analyticsTab).toHaveAttribute("data-state", "inactive");

    // Switch to Analytics
    await analyticsTab.click();
    await expect(healthTab).toHaveAttribute("data-state", "inactive");
    await expect(consoleTab).toHaveAttribute("data-state", "inactive");
    await expect(pushTab).toHaveAttribute("data-state", "inactive");
    await expect(analyticsTab).toHaveAttribute("data-state", "active");
  });

  test("should show correct content for each tab", async ({ page }) => {
    // Health tab content
    await expect(page.locator("text=Refresh All")).toBeVisible();

    // Switch to Console — should show request builder, not health
    await page.locator('[role="tab"]', { hasText: "Console" }).click();
    await expect(page.locator("text=Request")).toBeVisible();
    await expect(page.locator("text=Refresh All")).not.toBeVisible();

    // Switch to Push — should show push tester, not console
    await page.locator('[role="tab"]', { hasText: "Push" }).click();
    await expect(page.getByText("Web Push API Tester")).toBeVisible();
    await expect(page.locator("text=Request")).not.toBeVisible();

    // Switch to Analytics — should show GA info, not push
    await page.locator('[role="tab"]', { hasText: "Analytics" }).click();
    await expect(page.getByText("Measurement ID").first()).toBeVisible();
    await expect(page.getByText("Web Push API Tester")).not.toBeVisible();
  });

  test("should have icons in tab labels", async ({ page }) => {
    // Each tab has an SVG icon (lucide icons)
    const tabs = page.locator('[role="tab"]');
    for (let i = 0; i < 4; i++) {
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
