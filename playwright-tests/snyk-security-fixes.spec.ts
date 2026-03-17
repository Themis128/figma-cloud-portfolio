import { expect, test } from "@playwright/test";

/**
 * Snyk Security Fix Verification Tests
 *
 * Validates fixes applied after Snyk SAST scan findings:
 * - X-Powered-By header suppression
 * - Chat API rate limiting (429 response)
 * - Input type validation on API endpoints
 * - Service worker same-origin enforcement
 */

const API_BASE =
  process.env.BACKEND_API_URL || "http://localhost:3001";

test.describe("Snyk Security Fixes — API Hardening", () => {
  test("API should not expose X-Powered-By header on /api/health", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/health`);
    expect(res.headers()["x-powered-by"]).toBeUndefined();
  });

  test("API should not expose X-Powered-By header on /api/ping", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/ping`);
    expect(res.headers()["x-powered-by"]).toBeUndefined();
  });

  test("/api/chat should reject empty message", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/chat`, {
      data: { message: "", history: [] },
    });
    // 400 = validation error, 429 = rate limited (both are correct rejections)
    expect([400, 429]).toContain(res.status());
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  test("/api/chat should reject non-string message", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/chat`, {
      data: { message: 12345, history: [] },
    });
    expect([400, 429]).toContain(res.status());
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  test("/api/contact should return 400 for missing fields", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/contact`, {
      data: { name: "", email: "", message: "" },
    });
    // Should reject with 400 (missing required fields)
    expect(res.status()).toBe(400);
  });

  test("/api/search should return 400 for missing query", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/search`);
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("required");
  });

  test("/api/search should handle non-string query gracefully", async ({
    request,
  }) => {
    // Array-style query param — should not crash
    const res = await request.get(`${API_BASE}/api/search?q[]=test`);
    expect([200, 400]).toContain(res.status());
  });

  test("/api/webhook should return 400 for missing event type", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/webhook`, {
      data: { data: {} },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Event type");
  });

  test("/api/upload should accept valid upload request", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/upload`, {
      data: "test file content",
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});

test.describe("Snyk Security Fixes — Rate Limiting", () => {
  test("chat endpoint should return 429 after exceeding rate limit", async ({
    request,
  }) => {
    // Send 16 requests rapidly (limit is 15/min)
    const results: number[] = [];
    for (let i = 0; i < 17; i++) {
      const res = await request.post(`${API_BASE}/api/chat`, {
        data: { message: `rate limit test ${i}`, history: [] },
      });
      results.push(res.status());
      // Stop early if we get 429
      if (res.status() === 429) break;
    }

    // At least one response should be 429
    expect(results).toContain(429);
  });
});

test.describe("Snyk Security Fixes — Service Worker", () => {
  test("service worker file should contain same-origin validation", async () => {
    // Read sw.js directly from the filesystem to verify SSRF protection
    const fs = await import("fs");
    const path = await import("path");
    const swPath = path.join(process.cwd(), "public", "sw.js");
    const text = fs.readFileSync(swPath, "utf-8");
    // Verify SSRF protection: cross-origin requests are blocked in retry logic
    expect(text).toContain("requestUrl.origin !== self.location.origin");
    // Verify postMessage origin validation
    expect(text).toContain("event.origin");
  });
});
