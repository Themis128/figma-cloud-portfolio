import { test, expect } from "@playwright/test";

/**
 * Live Contact Form Delivery Test
 *
 * Verifies SES email (from noreply@cloudless.gr) and Slack notification delivery.
 *
 * Uses Google's official reCAPTCHA v2 test secret key (v3 has no test keys).
 * The test key returns success=true with no score field, so RECAPTCHA_THRESHOLD=0
 * is required on the test server.
 *
 * Prerequisites:
 *   Start the test contact server:
 *     RECAPTCHA_SECRET_KEY='6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe' \
 *     RECAPTCHA_THRESHOLD='0' \
 *     SES_VERIFIED_EMAIL='noreply@cloudless.gr' \
 *     AWS_REGION='us-east-1' \
 *     SLACK_WEBHOOK_URL='<your-webhook-url>' \
 *     npx tsx scripts/test-contact-server.ts
 *
 * Run:
 *   npx playwright test playwright-tests/contact-live-test.spec.ts --project=chromium
 */

const TEST_API = process.env.CONTACT_TEST_API || "http://localhost:3002";

test.describe("Contact Form — Live Delivery Test", () => {
  test("submits contact form and verifies email + Slack delivery", async ({
    request,
  }) => {
    // Verify test server is running — skip if unavailable
    let pingRes;
    try {
      pingRes = await request.get(`${TEST_API}/api/ping`, { timeout: 3000 });
    } catch {
      test.skip(true, `Test server not running at ${TEST_API}`);
      return;
    }
    if (!pingRes.ok()) {
      test.skip(true, `Test server not healthy at ${TEST_API}`);
      return;
    }
    const pingData = await pingRes.json();
    console.log("Test server config:", JSON.stringify(pingData));

    // Submit the contact form
    const timestamp = new Date().toISOString();
    const response = await request.post(`${TEST_API}/api/contact`, {
      data: {
        name: "Playwright Live Test",
        email: "playwright-test@example.com",
        subject: "Live Test — Email & Slack Verification",
        message: [
          "Automated Playwright test verifying:",
          "1. SES email sent from noreply@cloudless.gr → baltzakis.themis@gmail.com",
          "2. Slack notification delivered to #personal-website",
          "",
          `Timestamp: ${timestamp}`,
        ].join("\n"),
        recaptchaToken: "test-token-for-google-recaptcha-test-key",
      },
    });

    const status = response.status();
    const body = await response.json();

    console.log(`\n━━━ Contact API Response ━━━`);
    console.log(`Status: ${status}`);
    console.log(`Body: ${JSON.stringify(body, null, 2)}`);

    // Assert successful delivery
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Message sent successfully");

    console.log("\nDelivery test PASSED — verify:");
    console.log("  → Email: baltzakis.themis@gmail.com (from noreply@cloudless.gr)");
    console.log("  → Slack: #personal-website channel");
  });
});
