import { expect, test } from "@playwright/test";

/**
 * Security Headers Tests
 *
 * Tests that the Lambda API returns proper security response headers.
 */

const API_BASE =
  process.env.BACKEND_API_URL ||
  "https://wctxhmfzgk.execute-api.us-east-1.amazonaws.com";

test.describe("Security Headers — API Endpoints", () => {
  test("should include X-Frame-Options: DENY on /api/health", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/health`);
    expect(res.headers()["x-frame-options"]).toBe("DENY");
  });

  test("should include X-Content-Type-Options: nosniff", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/health`);
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  });

  test("should include X-XSS-Protection", async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/health`);
    expect(res.headers()["x-xss-protection"]).toBe("1; mode=block");
  });

  test("should include Referrer-Policy", async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/health`);
    expect(res.headers()["referrer-policy"]).toBe(
      "strict-origin-when-cross-origin",
    );
  });

  test("should include CORS Allow-Origin on /api/ping", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/ping`);
    expect(res.headers()["access-control-allow-origin"]).toBe("*");
  });

  test("security headers present on /api/ping", async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/ping`);
    const headers = res.headers();

    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-xss-protection"]).toBe("1; mode=block");
    expect(headers["referrer-policy"]).toBe(
      "strict-origin-when-cross-origin",
    );
  });

  test("security headers present on /api/booking/slots", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/booking/slots`);
    const headers = res.headers();

    // Endpoint may return 200 or 503, but headers should still be present
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
  });

  test("all API responses include Content-Type: application/json", async ({
    request,
  }) => {
    const endpoints = ["/api/health", "/api/ping"];

    for (const endpoint of endpoints) {
      const res = await request.get(`${API_BASE}${endpoint}`);
      const contentType = res.headers()["content-type"] ?? "";
      expect(contentType).toContain("application/json");
    }
  });
});
