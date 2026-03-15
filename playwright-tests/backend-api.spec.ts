import { expect, test } from "@playwright/test";

/**
 * Backend API Tests
 *
 * Tests the Express.js backend deployed on AWS Lambda via API Gateway.
 * All requests go directly to the production Lambda endpoint.
 *
 * Run: PLAYWRIGHT_BASE_URL=http://localhost:3000 PLAYWRIGHT_SKIP_WEBSERVER=true \
 *      npx playwright test playwright-tests/backend-api.spec.ts --project=chromium
 */

const API_BASE =
  process.env.BACKEND_API_URL ||
  "https://wctxhmfzgk.execute-api.us-east-1.amazonaws.com";

// ─── Health & Status ────────────────────────────────────────────────────────────

test.describe("Backend API — Health & Status", () => {
  test("GET /api/health returns healthy status with all required fields", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/health`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("healthy");
    expect(["production", "development"]).toContain(body.environment);
    expect(typeof body.uptime).toBe("number");
    expect(body.uptime).toBeGreaterThanOrEqual(0);
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("memory");
  });

  test("GET /api/health timestamp is valid ISO 8601", async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/health`);
    const body = await res.json();

    const parsed = new Date(body.timestamp);
    expect(parsed.getTime()).not.toBeNaN();
    // Timestamp should be recent (within last 60 seconds)
    expect(Date.now() - parsed.getTime()).toBeLessThan(60_000);
  });

  test("GET /api/health memory is formatted with MB suffix", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/health`);
    const body = await res.json();

    expect(body.memory).toMatch(/^\d+MB$/);
  });

  test("GET /api/ping returns pong", async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/ping`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    // PING_MESSAGE env var may override default; accept any pong-like message
    expect(body.message).toMatch(/ping.?pong/i);
  });

  test("GET /api/demo returns 404 (not deployed to Lambda)", async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/demo`);
    expect(res.status()).toBe(404);
  });

  test("health endpoint responds within 5 seconds (including cold start)", async ({
    request,
  }) => {
    const start = Date.now();
    const res = await request.get(`${API_BASE}/api/health`);
    const elapsed = Date.now() - start;

    expect(res.status()).toBe(200);
    expect(elapsed).toBeLessThan(5000);
  });

  test("consecutive ping calls return consistent results", async ({
    request,
  }) => {
    const results = await Promise.all([
      request.get(`${API_BASE}/api/ping`),
      request.get(`${API_BASE}/api/ping`),
      request.get(`${API_BASE}/api/ping`),
    ]);

    for (const res of results) {
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.message).toMatch(/ping.?pong/i);
    }
  });

  test("HEAD /api/health returns 200 with empty body", async ({ request }) => {
    const res = await request.head(`${API_BASE}/api/health`);
    expect(res.status()).toBe(200);

    const text = await res.text();
    expect(text).toBe("");
  });

  test("CORS headers are present on health endpoint", async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/health`);
    const headers = res.headers();

    expect(headers["access-control-allow-origin"]).toBe("*");
  });
});

// ─── Agents API ─────────────────────────────────────────────────────────────────
// Note: /api/agents is not deployed to the current Lambda. These tests verify 404.

test.describe("Backend API — Agents (not deployed)", () => {
  test("GET /api/agents returns 404 (not deployed to Lambda)", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/agents`);
    expect(res.status()).toBe(404);
  });
});

// ─── Push Notifications API ─────────────────────────────────────────────────────
// The push-notifications endpoint is available on the Express dev server (port 3001)
// but not deployed to the production Lambda.

test.describe("Backend API — Push Notifications", () => {
  test("GET /api/push-notifications returns 200 or 404 depending on backend", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/push-notifications`);
    expect([200, 404]).toContain(res.status());
  });
});

// ─── API Keys — Auth Protection ─────────────────────────────────────────────────
// API Keys endpoints are protected by Cognito Auth (requireAuth middleware).
// All requests without a valid Bearer token should return 401.

test.describe("Backend API — API Keys Auth Protection", () => {
  test("GET /api/organizations/api_keys returns 401 without auth token", async ({
    request,
  }) => {
    const res = await request.get(
      `${API_BASE}/api/organizations/api_keys`,
    );
    expect(res.status()).toBe(401);

    const body = await res.json();
    expect(body.error).toContain("authorization");
  });

  test("GET /api/organizations/api_keys/:id returns 401 without auth token", async ({
    request,
  }) => {
    const res = await request.get(
      `${API_BASE}/api/organizations/api_keys/ak_1234567890`,
    );
    expect(res.status()).toBe(401);
  });

  test("POST /api/organizations/api_keys returns 401 without auth token", async ({
    request,
  }) => {
    const res = await request.post(
      `${API_BASE}/api/organizations/api_keys`,
      { data: { name: "Unauthorized Key" } },
    );
    expect(res.status()).toBe(401);
  });

  test("DELETE /api/organizations/api_keys/:id returns 401 without auth token", async ({
    request,
  }) => {
    const res = await request.delete(
      `${API_BASE}/api/organizations/api_keys/ak_1234567890`,
    );
    expect(res.status()).toBe(401);
  });

  test("request with invalid Bearer token returns 401", async ({
    request,
  }) => {
    const res = await request.get(
      `${API_BASE}/api/organizations/api_keys`,
      {
        headers: { Authorization: "Bearer invalid-token-12345" },
      },
    );
    expect(res.status()).toBe(401);

    const body = await res.json();
    expect(body.error).toContain("Invalid");
  });

  test("request with malformed Authorization header returns 401", async ({
    request,
  }) => {
    const res = await request.get(
      `${API_BASE}/api/organizations/api_keys`,
      {
        headers: { Authorization: "Basic dXNlcjpwYXNz" },
      },
    );
    expect(res.status()).toBe(401);
  });
});

// ─── Booking API ────────────────────────────────────────────────────────────────

test.describe("Backend API — Booking", () => {
  test("GET /api/booking/slots returns slots object or 503", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/booking/slots`);
    const status = res.status();

    expect([200, 503]).toContain(status);

    const body = await res.json();
    if (status === 200) {
      expect(body).toHaveProperty("slots");
      expect(typeof body.slots).toBe("object");

      // Each key should be an ISO date, each value an array of timestamps
      const dates = Object.keys(body.slots);
      if (dates.length > 0) {
        const firstDate = dates[0]!;
        expect(new Date(firstDate).getTime()).not.toBeNaN();

        const slots = body.slots[firstDate];
        expect(Array.isArray(slots)).toBe(true);
        if (slots.length > 0) {
          expect(new Date(slots[0]).getTime()).not.toBeNaN();
        }
      }
    } else {
      expect(body.error).toContain("not configured");
    }
  });

  test("GET /api/booking/slots ignores unknown query params", async ({
    request,
  }) => {
    const res = await request.get(
      `${API_BASE}/api/booking/slots?date=2026-03-10&invalid=true`,
    );
    // Should not error on extra params — same as base endpoint
    expect([200, 503]).toContain(res.status());
  });

  test("POST /api/booking/create rejects missing email", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/booking/create`, {
      data: { start: "2026-03-10T09:00:00Z", name: "Test User" },
    });
    const status = res.status();

    expect([400, 503]).toContain(status);
    if (status === 400) {
      const body = await res.json();
      expect(body.error).toContain("required");
    }
  });

  test("POST /api/booking/create rejects missing name", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/booking/create`, {
      data: { start: "2026-03-10T09:00:00Z", email: "test@example.com" },
    });
    const status = res.status();

    expect([400, 503]).toContain(status);
    if (status === 400) {
      const body = await res.json();
      expect(body.error).toContain("required");
    }
  });

  test("POST /api/booking/create rejects empty strings as missing", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/booking/create`, {
      data: { start: "", name: "", email: "" },
    });
    const status = res.status();

    expect([400, 503]).toContain(status);
    if (status === 400) {
      const body = await res.json();
      expect(body.error).toContain("required");
    }
  });

  test("POST /api/booking/create rejects request with only start field", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/booking/create`, {
      data: { start: "2026-03-10T09:00:00Z" },
    });
    const status = res.status();

    expect([400, 503]).toContain(status);
  });

  test("POST /api/booking/create rejects empty body", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/booking/create`, {
      data: {},
    });
    const status = res.status();

    expect([400, 503]).toContain(status);
  });
});

// ─── Chat API ───────────────────────────────────────────────────────────────────

test.describe("Backend API — Chat", () => {
  test("POST /api/chat rejects empty message with descriptive error", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/chat`, {
      data: { message: "" },
    });
    const status = res.status();

    expect([400, 503]).toContain(status);
    if (status === 400) {
      const body = await res.json();
      expect(body.error).toContain("Message is required");
    }
  });

  test("POST /api/chat rejects missing message field", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/chat`, {
      data: {},
    });
    const status = res.status();

    expect([400, 503]).toContain(status);
  });

  test("POST /api/chat rejects whitespace-only message", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/chat`, {
      data: { message: "   " },
    });
    const status = res.status();

    expect([400, 503]).toContain(status);
    if (status === 400) {
      const body = await res.json();
      expect(body.error).toContain("Message is required");
    }
  });

  test("POST /api/chat with valid message returns SSE or 503", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/chat`, {
      data: { message: "Who is Themis?" },
    });
    const status = res.status();

    if (status === 503) {
      const body = await res.json();
      expect(body.error).toContain("not configured");
    } else {
      expect(status).toBe(200);
      const contentType = res.headers()["content-type"] ?? "";
      // SSE response
      expect(contentType).toContain("text/event-stream");

      const text = await res.text();
      expect(text).toContain("data:");
      expect(text).toContain("[DONE]");
    }
  });

  test("POST /api/chat accepts history array", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/chat`, {
      data: {
        message: "What certifications does he have?",
        history: [
          { role: "user", content: "Tell me about Themis" },
          {
            role: "assistant",
            content: "Themis is a Cloud Architect...",
          },
        ],
      },
    });
    const status = res.status();

    // Should not reject the history format
    expect([200, 503]).toContain(status);
  });

  test("POST /api/chat handles very long messages without error", async ({
    request,
  }) => {
    const longMessage = "A".repeat(500);
    const res = await request.post(`${API_BASE}/api/chat`, {
      data: { message: longMessage },
    });
    const status = res.status();

    // Should accept (200) or be unconfigured (503), not 400
    expect([200, 503]).toContain(status);
  });

  test("POST /api/chat 503 includes descriptive error when HF_TOKEN missing", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/chat`, {
      data: { message: "test" },
    });
    const status = res.status();

    if (status === 503) {
      const body = await res.json();
      expect(body.error).toContain("HF_TOKEN");
    }
  });
});

// ─── Resume API ─────────────────────────────────────────────────────────────────

test.describe("Backend API — Resume", () => {
  test("GET /api/resume/download returns PDF redirect or placeholder", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/resume/download`, {
      maxRedirects: 0,
    });
    const status = res.status();

    // Lambda returns 302 redirect to PDF, local returns 200 with placeholder
    expect([200, 302]).toContain(status);

    if (status === 302) {
      const location = res.headers()["location"] ?? "";
      expect(location).toContain("resume");
      expect(location).toContain(".pdf");
    }
  });

  test("GET /api/resume/download redirect follows to valid PDF", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/resume/download`);
    const status = res.status();

    // Following redirect should yield 200 with PDF or text
    expect(status).toBe(200);
  });
});

// ─── Playwright Autofix API ──────────────────────────────────────────────────────
// Only available on local Express server (port 3001), not deployed to Lambda.

test.describe("Backend API — Playwright Autofix", () => {
  test("GET /api/playwright-autofix/health returns ok or 404", async ({
    request,
  }) => {
    const res = await request.get(
      `${API_BASE}/api/playwright-autofix/health`,
    );
    expect([200, 404]).toContain(res.status());

    if (res.status() === 200) {
      const body = await res.json();
      expect(body.status).toBe("ok");
    }
  });

  test("GET /api/playwright-autofix/config returns config or 404", async ({
    request,
  }) => {
    const res = await request.get(
      `${API_BASE}/api/playwright-autofix/config`,
    );
    expect([200, 404]).toContain(res.status());

    if (res.status() === 200) {
      const body = await res.json();
      expect(body).toHaveProperty("config");
    }
  });

  test("POST /api/playwright-autofix/analyze returns suggestions or 404", async ({
    request,
  }) => {
    const res = await request.post(
      `${API_BASE}/api/playwright-autofix/analyze`,
      { data: { test: "data" } },
    );
    expect([200, 404]).toContain(res.status());

    if (res.status() === 200) {
      const body = await res.json();
      expect(Array.isArray(body.suggestions)).toBe(true);
    }
  });

  test("GET /api/playwright-autofix/patterns returns patterns or 404", async ({
    request,
  }) => {
    const res = await request.get(
      `${API_BASE}/api/playwright-autofix/patterns`,
    );
    expect([200, 404]).toContain(res.status());

    if (res.status() === 200) {
      const body = await res.json();
      expect(Array.isArray(body.patterns)).toBe(true);
    }
  });
});

// ─── Error Handling & Cross-Cutting ─────────────────────────────────────────────

test.describe("Backend API — Error Handling", () => {
  test("GET /api/nonexistent returns 404", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/nonexistent`);
    expect(res.status()).toBe(404);

    // Response may be JSON (Express) or HTML (Next.js static)
    const contentType = res.headers()["content-type"] ?? "";
    if (contentType.includes("application/json")) {
      const body = await res.json();
      expect(body).toHaveProperty("error");
    }
  });

  test("all JSON endpoints return application/json content-type", async ({
    request,
  }) => {
    const endpoints = [
      "/api/health",
      "/api/ping",
    ];

    for (const endpoint of endpoints) {
      const res = await request.get(`${API_BASE}${endpoint}`);
      const contentType = res.headers()["content-type"] ?? "";
      expect(contentType).toContain("application/json");
    }
  });

  test("CORS wildcard origin header on multiple endpoints", async ({
    request,
  }) => {
    const endpoints = ["/api/health", "/api/ping"];

    for (const endpoint of endpoints) {
      const res = await request.get(`${API_BASE}${endpoint}`);
      expect(res.headers()["access-control-allow-origin"]).toBe("*");
    }
  });

  test("404 responses return proper status code", async ({ request }) => {
    const paths = [
      "/api/nonexistent",
    ];

    for (const path of paths) {
      const res = await request.get(`${API_BASE}${path}`);
      expect(res.status()).toBe(404);

      // Response may be JSON (Express direct) or HTML (Next.js static)
      const contentType = res.headers()["content-type"] ?? "";
      if (contentType.includes("application/json")) {
        const body = await res.json();
        expect(
          typeof body.error === "string" || typeof body.error === "object",
        ).toBe(true);
      }
    }
  });
});

// ─── Response Time Benchmarks ───────────────────────────────────────────────────

test.describe("Backend API — Response Times", () => {
  test("ping responds under 2 seconds (warm)", async ({ request }) => {
    // Warm up
    await request.get(`${API_BASE}/api/ping`);

    const start = Date.now();
    await request.get(`${API_BASE}/api/ping`);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(2000);
  });

  test("parallel requests to different public endpoints all succeed", async ({
    request,
  }) => {
    const results = await Promise.all([
      request.get(`${API_BASE}/api/health`),
      request.get(`${API_BASE}/api/ping`),
    ]);

    for (const res of results) {
      expect(res.status()).toBe(200);
    }
  });
});
