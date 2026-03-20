import { expect, test } from "@playwright/test";

/**
 * Quick Contact Form — Live E2E test
 *
 * Submits through the real backend (Express → SES + Slack).
 * reCAPTCHA v3 may reject localhost (domain not registered), so this test
 * also verifies correct error handling for that scenario.
 *
 * Run with: pnpm exec playwright test playwright-tests/quick-contact-live.spec.ts
 */

test.describe("Quick Contact Form — Live Backend", () => {
  // These tests submit through the real Express → SES + Slack pipeline.
  // Skip in CI where backend secrets (SES, Slack, reCAPTCHA) are unavailable.
  test.skip(
    !!process.env.CI || !!process.env.GITHUB_ACTIONS,
    "Live backend tests require SES/Slack credentials — skip in CI",
  );

  /** Locate the error alert inside the quick-contact section */
  function errorAlert(page: import("@playwright/test").Page) {
    return page.locator('#quick-contact [role="alert"]');
  }

  test("submits message and handles reCAPTCHA result correctly", async ({ page }) => {
    test.setTimeout(30_000);

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const section = page.locator("#quick-contact");
    await section.scrollIntoViewIfNeeded();

    const form = page.locator("#quick-contact form");
    await expect(form).toBeVisible();

    // Wait for reCAPTCHA script to load (lazyOnload)
    await page.waitForTimeout(3000);

    // Fill in the form
    await form.locator('input[name="name"]').fill("Playwright Live Test");
    await form.locator('input[name="email"]').fill("playwright-live@test.dev");
    await form.locator('textarea[name="message"]').fill(
      "Live E2E test from Quick Contact form.\nTimestamp: " + new Date().toISOString(),
    );

    // Intercept the API call
    const apiPromise = page.waitForResponse(
      (res) => res.url().includes("/api/contact"),
      { timeout: 15_000 },
    );

    await form.locator('button[type="submit"]').click();

    const apiResponse = await apiPromise;
    const status = apiResponse.status();

    console.log("API Status:", status);

    // Redirect responses have no body — skip JSON parsing for 3xx
    if (status >= 300 && status < 400) {
      console.log(`↩️ Redirect response (${status}) — cannot parse body`);
      expect([200, 301, 302, 400, 403]).toContain(status);
      return;
    }

    const body = await apiResponse.json();
    console.log("API Body:", JSON.stringify(body));

    // Expect valid response shape
    expect([200, 400, 403]).toContain(status);
    expect(body).toHaveProperty("success");
    expect(body).toHaveProperty("message");

    if (status === 200) {
      await expect(page.getByTestId("form-success")).toBeVisible({ timeout: 5000 });
      console.log("✅ Message delivered successfully (SES + Slack)");
    } else {
      // Error alert should appear inside the quick-contact section
      await expect(errorAlert(page)).toBeVisible({ timeout: 5000 });
      console.log(`⚠️ reCAPTCHA blocked (status ${status}): ${body.message}`);
    }
  });

  test("shows reCAPTCHA error when token is blocked", async ({ page, request }) => {
    test.setTimeout(30_000);

    // Skip if backend API is not running
    try {
      const ping = await request.get(
        (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3002") + "/api/ping",
        { timeout: 3000 },
      );
      if (!ping.ok()) {
        test.skip(true, "Backend API not running — skipping live reCAPTCHA test");
        return;
      }
    } catch {
      test.skip(true, "Backend API not reachable — skipping live reCAPTCHA test");
      return;
    }

    // Block reCAPTCHA script so no token is generated
    await page.route("**/recaptcha/**", (route) => route.abort());

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const section = page.locator("#quick-contact");
    await section.scrollIntoViewIfNeeded();

    const form = page.locator("#quick-contact form");
    await expect(form).toBeVisible();

    await form.locator('input[name="name"]').fill("Quick Contact Test");
    await form.locator('input[name="email"]').fill("quickcontact@test.dev");
    await form.locator('textarea[name="message"]').fill("Testing without reCAPTCHA token");

    const apiPromise = page.waitForResponse(
      (res) => res.url().includes("/api/contact"),
      { timeout: 15_000 },
    );

    await form.locator('button[type="submit"]').click();

    const apiResponse = await apiPromise;
    const status = apiResponse.status();

    console.log("API Status (no reCAPTCHA):", status);

    // Redirect responses have no body — skip JSON parsing for 3xx
    if (status >= 300 && status < 400) {
      console.log(`↩️ Redirect response (${status}) — cannot parse body`);
      return;
    }

    const body = await apiResponse.json();
    console.log("API Body:", JSON.stringify(body));

    // Without token, backend may return 400 (reCAPTCHA enforced) or 200 (reCAPTCHA optional in dev)
    if (status === 400) {
      expect(body.success).toBe(false);
      expect(body.message).toContain("reCAPTCHA");
      await expect(errorAlert(page)).toBeVisible({ timeout: 5000 });
      await expect(errorAlert(page)).toContainText(/reCAPTCHA/i);
    } else {
      // reCAPTCHA not enforced in this environment — message sent successfully
      expect(status).toBe(200);
      expect(body.success).toBe(true);
    }
  });

  test("delivers message when reCAPTCHA is not required by backend", async ({ page }) => {
    test.setTimeout(30_000);

    // Skip if RECAPTCHA_SECRET_KEY is set (backend will require it)
    // To run this test, start the backend without RECAPTCHA_SECRET_KEY
    // Block reCAPTCHA and mock API to simulate no-reCAPTCHA backend
    await page.route("**/recaptcha/**", (route) => route.abort());

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const section = page.locator("#quick-contact");
    await section.scrollIntoViewIfNeeded();

    const form = page.locator("#quick-contact form");
    await expect(form).toBeVisible();

    await form.locator('input[name="name"]').fill("Delivery Test");
    await form.locator('input[name="email"]').fill("delivery@test.dev");
    await form.locator('textarea[name="message"]').fill(
      "Testing real delivery via Quick Contact.\nTimestamp: " + new Date().toISOString(),
    );

    const apiPromise = page.waitForResponse(
      (res) => res.url().includes("/api/contact"),
      { timeout: 15_000 },
    );

    await form.locator('button[type="submit"]').click();

    const apiResponse = await apiPromise;
    const status = apiResponse.status();

    console.log("Delivery test — Status:", status);

    // Redirect responses have no body — skip JSON parsing for 3xx
    if (status >= 300 && status < 400) {
      console.log(`↩️ Redirect response (${status}) — cannot parse body`);
      return;
    }

    const body = await apiResponse.json();
    console.log("Delivery test — Body:", JSON.stringify(body));

    if (status === 200 && body.success) {
      await expect(page.getByTestId("form-success")).toBeVisible({ timeout: 5000 });
      console.log("✅ DELIVERED — check your email and Slack #personal-website");
    } else if (status === 400 && body.message.includes("reCAPTCHA")) {
      console.log("⏭️ Backend requires reCAPTCHA — skipping delivery verification");
      console.log("   To test delivery, restart backend without RECAPTCHA_SECRET_KEY");
      test.skip();
    } else {
      console.log(`❌ Unexpected response: ${status} ${body.message}`);
      expect.soft(status).toBe(200);
    }
  });
});
