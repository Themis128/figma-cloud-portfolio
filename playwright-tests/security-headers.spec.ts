import { expect, test } from "@playwright/test";

/**
 * Security Headers Tests
 *
 * Tests that the Lambda API returns proper security response headers.
 */

const API_BASE =
  process.env.BACKEND_API_URL ||
  "https://wctxhmfzgk.execute-api.us-east-1.amazonaws.com";

// Security headers (X-Frame-Options, X-Content-Type-Options, etc.) are set by
// AWS Amplify/Lambda (amplify.yml customHeaders), NOT by the Express dev server.
// These tests check for their presence when available, but don't fail on local dev.

const isProduction = API_BASE.includes("execute-api.amazonaws.com");

test.describe("Security Headers — API Endpoints", () => {
  test("should include X-Frame-Options: DENY on /api/health", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/health`);
    const xfo = res.headers()["x-frame-options"];
    if (isProduction) {
      expect(xfo).toBe("DENY");
    } else {
      // Local dev: header may not be set
      expect(xfo === "DENY" || xfo === undefined).toBe(true);
    }
  });

  test("should include X-Content-Type-Options: nosniff", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/health`);
    const xcto = res.headers()["x-content-type-options"];
    if (isProduction) {
      expect(xcto).toBe("nosniff");
    } else {
      expect(xcto === "nosniff" || xcto === undefined).toBe(true);
    }
  });

  test("should include X-XSS-Protection", async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/health`);
    const xxp = res.headers()["x-xss-protection"];
    if (isProduction) {
      expect(xxp).toBe("1; mode=block");
    } else {
      expect(xxp === "1; mode=block" || xxp === undefined).toBe(true);
    }
  });

  test("should include Referrer-Policy", async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/health`);
    const rp = res.headers()["referrer-policy"];
    if (isProduction) {
      expect(rp).toBe("strict-origin-when-cross-origin");
    } else {
      expect(
        rp === "strict-origin-when-cross-origin" || rp === undefined,
      ).toBe(true);
    }
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

    if (isProduction) {
      expect(headers["x-frame-options"]).toBe("DENY");
      expect(headers["x-content-type-options"]).toBe("nosniff");
      expect(headers["x-xss-protection"]).toBe("1; mode=block");
      expect(headers["referrer-policy"]).toBe(
        "strict-origin-when-cross-origin",
      );
    } else {
      // On local dev, just verify CORS is present
      expect(headers["access-control-allow-origin"]).toBe("*");
    }
  });

  test("security headers present on /api/booking/slots", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/booking/slots`);
    const headers = res.headers();

    if (isProduction) {
      expect(headers["x-frame-options"]).toBe("DENY");
      expect(headers["x-content-type-options"]).toBe("nosniff");
    } else {
      // On local dev, endpoint should at least return a valid status
      expect([200, 503]).toContain(res.status());
    }
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
