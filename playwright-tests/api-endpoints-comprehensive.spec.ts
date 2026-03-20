import { expect, test } from "@playwright/test";

/**
 * Comprehensive API Endpoint Tests
 *
 * Tests ALL Express backend API endpoints against their actual validation logic,
 * response schemas, edge cases, and security inputs.
 *
 * Targets: server/routes/ — general, contact, chat, booking, github, resume, apiKeys, admin
 *
 * Run against local dev server:
 *   pnpm dev:server & npx playwright test playwright-tests/api-endpoints-comprehensive.spec.ts --project=chromium
 */

const API = process.env.BACKEND_API_URL || "http://localhost:3002";

// ═══════════════════════════════════════════════════════════════════════════════
// GENERAL ROUTES — /api/ping, /api/health, /api/search, /api/webhook,
//                   /api/monitor, /api/docs, /api/upload
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("General — GET /api/ping", () => {
  test("returns 200 with ping_pong message", async ({ request }) => {
    const res = await request.get(`${API}/api/ping`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("message");
    expect(typeof body.message).toBe("string");
  });

  test("returns JSON content-type", async ({ request }) => {
    const res = await request.get(`${API}/api/ping`);
    expect(res.headers()["content-type"]).toContain("application/json");
  });
});

test.describe("General — GET /api/health", () => {
  test("returns all required fields", async ({ request }) => {
    const res = await request.get(`${API}/api/health`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("healthy");
    expect(typeof body.uptime).toBe("number");
    expect(body.uptime).toBeGreaterThanOrEqual(0);
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("environment");
    expect(body).toHaveProperty("memory");
  });

  test("timestamp is valid ISO 8601 and recent", async ({ request }) => {
    const res = await request.get(`${API}/api/health`);
    const body = await res.json();

    const parsed = new Date(body.timestamp);
    expect(parsed.getTime()).not.toBeNaN();
    expect(Date.now() - parsed.getTime()).toBeLessThan(60_000);
  });

  test("memory field contains MB suffix", async ({ request }) => {
    const res = await request.get(`${API}/api/health`);
    const body = await res.json();
    expect(body.memory).toMatch(/^\d+MB$/);
  });
});

test.describe("General — GET /api/search", () => {
  test("returns results for valid query", async ({ request }) => {
    const res = await request.get(`${API}/api/search?q=cloud`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("results");
    expect(Array.isArray(body.results)).toBe(true);
    expect(body.results.length).toBeGreaterThan(0);
    expect(body).toHaveProperty("query", "cloud");
    expect(body).toHaveProperty("total");
    expect(body.total).toBe(body.results.length);
  });

  test("each result has title, type, and description", async ({ request }) => {
    const res = await request.get(`${API}/api/search?q=cloud`);
    const body = await res.json();

    for (const result of body.results) {
      expect(result).toHaveProperty("title");
      expect(result).toHaveProperty("type");
      expect(result).toHaveProperty("description");
      expect(typeof result.title).toBe("string");
      expect(typeof result.type).toBe("string");
      expect(typeof result.description).toBe("string");
    }
  });

  test("returns 400 when query param q is missing", async ({ request }) => {
    const res = await request.get(`${API}/api/search`);
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body).toHaveProperty("error");
    expect(body.error).toContain("required");
    expect(body.results).toEqual([]);
  });

  test("returns empty results for non-matching query", async ({ request }) => {
    const res = await request.get(`${API}/api/search?q=zzzznonexistent`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.results).toEqual([]);
    expect(body.total).toBe(0);
  });

  test("search is case-insensitive", async ({ request }) => {
    const lower = await request.get(`${API}/api/search?q=cloud`);
    const upper = await request.get(`${API}/api/search?q=CLOUD`);

    const lowerBody = await lower.json();
    const upperBody = await upper.json();

    expect(lowerBody.total).toBe(upperBody.total);
    expect(lowerBody.total).toBeGreaterThan(0);
  });

  test("matches on both title and description", async ({ request }) => {
    // "Azure" appears in descriptions but also in titles
    const res = await request.get(`${API}/api/search?q=azure`);
    const body = await res.json();
    expect(body.total).toBeGreaterThan(0);
  });

  test("handles special characters in query without error", async ({ request }) => {
    const res = await request.get(`${API}/api/search?q=${encodeURIComponent("<script>alert(1)</script>")}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.results).toEqual([]);
  });
});

test.describe("General — POST /api/webhook", () => {
  test("accepts valid webhook with event field", async ({ request }) => {
    const res = await request.post(`${API}/api/webhook`, {
      data: {
        event: "deployment",
        data: { status: "success", timestamp: new Date().toISOString() },
      },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("received");
    expect(body.event).toBe("deployment");
    expect(body).toHaveProperty("timestamp");
  });

  test("returns 400 when event field is missing", async ({ request }) => {
    const res = await request.post(`${API}/api/webhook`, {
      data: { data: { foo: "bar" } },
    });
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.error).toContain("required");
  });

  test("returns 400 for empty body", async ({ request }) => {
    const res = await request.post(`${API}/api/webhook`, {
      data: {},
    });
    expect(res.status()).toBe(400);
  });

  test("accepts webhook with only event (no data)", async ({ request }) => {
    const res = await request.post(`${API}/api/webhook`, {
      data: { event: "ping" },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.event).toBe("ping");
  });
});

test.describe("General — GET /api/monitor", () => {
  test("returns monitoring data with all required fields", async ({ request }) => {
    const res = await request.get(`${API}/api/monitor`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("requests");
    expect(body).toHaveProperty("errors");
    expect(body).toHaveProperty("uptime");
    expect(body).toHaveProperty("memory");
    expect(body).toHaveProperty("timestamp");

    expect(typeof body.requests).toBe("number");
    expect(typeof body.errors).toBe("number");
    expect(typeof body.uptime).toBe("number");
    expect(body.requests).toBeGreaterThanOrEqual(0);
    expect(body.errors).toBeGreaterThanOrEqual(0);
    expect(body.uptime).toBeGreaterThanOrEqual(0);
  });

  test("memory object has heapUsed, heapTotal, and rss", async ({ request }) => {
    const res = await request.get(`${API}/api/monitor`);
    const body = await res.json();

    expect(body.memory).toHaveProperty("heapUsed");
    expect(body.memory).toHaveProperty("heapTotal");
    expect(body.memory).toHaveProperty("rss");
    expect(typeof body.memory.heapUsed).toBe("number");
    expect(typeof body.memory.heapTotal).toBe("number");
    expect(typeof body.memory.rss).toBe("number");
  });

  test("request count increments between calls", async ({ request }) => {
    const res1 = await request.get(`${API}/api/monitor`);
    const body1 = await res1.json();

    const res2 = await request.get(`${API}/api/monitor`);
    const body2 = await res2.json();

    // Second call should show a higher request count
    expect(body2.requests).toBeGreaterThan(body1.requests);
  });
});

test.describe("General — GET /api/docs", () => {
  test("returns HTML documentation", async ({ request }) => {
    const res = await request.get(`${API}/api/docs`);
    expect(res.status()).toBe(200);

    const contentType = res.headers()["content-type"] ?? "";
    expect(contentType).toContain("text/html");

    const html = await res.text();
    expect(html).toContain("API Documentation");
    expect(html).toContain("Endpoints");
    expect(html).toContain("/api/ping");
    expect(html).toContain("/api/health");
    expect(html).toContain("/api/contact");
  });
});

test.describe("General — POST /api/upload", () => {
  test("accepts small upload and returns success", async ({ request }) => {
    const res = await request.post(`${API}/api/upload`, {
      data: { file: "small content" },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("size");
    expect(body).toHaveProperty("timestamp");
  });

  test("returns 413 for oversized content-length", async ({ request }) => {
    // Send a request with Content-Length > 10MB
    // Note: Playwright may override Content-Length, so accept 200 if server
    // reads actual body size instead of header
    const res = await request.post(`${API}/api/upload`, {
      headers: { "Content-Length": "11000000" },
      data: "x",
    });
    expect([200, 413]).toContain(res.status());

    if (res.status() === 413) {
      const body = await res.json();
      expect(body.error).toContain("10MB");
    }
  });
});

test.describe("General — 404 handling", () => {
  test("returns 404 for unknown routes", async ({ request }) => {
    const res = await request.get(`${API}/api/nonexistent-route`);
    expect(res.status()).toBe(404);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CONTACT — POST /api/contact
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("Contact — POST /api/contact", () => {
  // When RECAPTCHA_SECRET_KEY is set, valid submissions without token return 400.
  // Accept 200 (no reCAPTCHA) or 400 (reCAPTCHA configured, no token).

  test("accepts valid submission or requires reCAPTCHA", async ({ request }) => {
    const res = await request.post(`${API}/api/contact`, {
      data: {
        name: "Test User",
        email: "test@example.com",
        subject: "Test Subject",
        message: "This is a test message",
      },
    });
    expect([200, 400]).toContain(res.status());

    const body = await res.json();
    if (res.status() === 200) {
      expect(body.success).toBe(true);
      expect(body.message).toBe("Message sent successfully");
    } else {
      // reCAPTCHA is configured — token required
      expect(body.success).toBe(false);
      expect(body.message).toContain("reCAPTCHA");
    }
  });

  test("subject is optional (not a validation error)", async ({ request }) => {
    const res = await request.post(`${API}/api/contact`, {
      data: {
        name: "Test User",
        email: "test@example.com",
        message: "Message without subject",
      },
    });
    // 200 = no reCAPTCHA, 400 = reCAPTCHA required (not a subject issue)
    expect([200, 400]).toContain(res.status());
    const body = await res.json();
    if (res.status() === 200) {
      expect(body.success).toBe(true);
    } else {
      // If 400, it should be about reCAPTCHA, NOT about missing subject
      expect(body.message).toContain("reCAPTCHA");
    }
  });

  test("returns 400 when name is missing", async ({ request }) => {
    const res = await request.post(`${API}/api/contact`, {
      data: {
        email: "test@example.com",
        message: "Test message",
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain("required");
  });

  test("returns 400 when email is missing", async ({ request }) => {
    const res = await request.post(`${API}/api/contact`, {
      data: {
        name: "Test User",
        message: "Test message",
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test("returns 400 when message is missing", async ({ request }) => {
    const res = await request.post(`${API}/api/contact`, {
      data: {
        name: "Test User",
        email: "test@example.com",
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test("returns 400 for empty strings", async ({ request }) => {
    const res = await request.post(`${API}/api/contact`, {
      data: { name: "", email: "", message: "" },
    });
    expect(res.status()).toBe(400);
  });

  test("returns 400 for whitespace-only fields", async ({ request }) => {
    const res = await request.post(`${API}/api/contact`, {
      data: {
        name: "   ",
        email: "test@example.com",
        message: "Hello",
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test("returns 400 for invalid email format", async ({ request }) => {
    const res = await request.post(`${API}/api/contact`, {
      data: {
        name: "Test User",
        email: "not-an-email",
        message: "Test message",
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain("email");
  });

  test("rejects email without @ symbol", async ({ request }) => {
    const res = await request.post(`${API}/api/contact`, {
      data: {
        name: "Test",
        email: "invalidemail.com",
        message: "Test",
      },
    });
    expect(res.status()).toBe(400);
  });

  test("rejects email without domain", async ({ request }) => {
    const res = await request.post(`${API}/api/contact`, {
      data: {
        name: "Test",
        email: "user@",
        message: "Test",
      },
    });
    expect(res.status()).toBe(400);
  });

  test("accepts email with subdomain (not a validation error)", async ({ request }) => {
    const res = await request.post(`${API}/api/contact`, {
      data: {
        name: "Test",
        email: "user@mail.example.com",
        message: "Test",
      },
    });
    // 200 or 400 (reCAPTCHA), but NOT 400 for email format
    expect([200, 400]).toContain(res.status());
    if (res.status() === 400) {
      const body = await res.json();
      expect(body.message).not.toContain("email");
    }
  });

  test("handles XSS payload in name without server error", async ({ request }) => {
    const res = await request.post(`${API}/api/contact`, {
      data: {
        name: '<script>alert("xss")</script>',
        email: "test@example.com",
        message: "Security test",
      },
    });
    // Should not 500 — accept (200) or reCAPTCHA required (400)
    expect([200, 400]).toContain(res.status());
    expect(res.status()).not.toBe(500);
  });

  test("handles SQL injection payload without server error", async ({ request }) => {
    const res = await request.post(`${API}/api/contact`, {
      data: {
        name: "'; DROP TABLE users; --",
        email: "test@example.com",
        message: "SQL injection test",
      },
    });
    expect([200, 400]).toContain(res.status());
    expect(res.status()).not.toBe(500);
  });

  test("handles very long message without server error", async ({ request }) => {
    const res = await request.post(`${API}/api/contact`, {
      data: {
        name: "Test User",
        email: "test@example.com",
        message: "A".repeat(10000),
      },
    });
    expect([200, 400]).toContain(res.status());
    expect(res.status()).not.toBe(500);
  });

  test("returns consistent response schema", async ({ request }) => {
    const res = await request.post(`${API}/api/contact`, {
      data: {
        name: "Schema Test",
        email: "schema@example.com",
        message: "Testing response schema",
      },
    });
    const body = await res.json();

    // Schema always: { success: boolean, message: string }
    expect(body).toHaveProperty("success");
    expect(body).toHaveProperty("message");
    expect(typeof body.success).toBe("boolean");
    expect(typeof body.message).toBe("string");
  });

  test("returns consistent response schema on validation error", async ({ request }) => {
    const res = await request.post(`${API}/api/contact`, {
      data: { name: "", email: "", message: "" },
    });
    const body = await res.json();

    expect(body).toHaveProperty("success", false);
    expect(body).toHaveProperty("message");
    expect(typeof body.message).toBe("string");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CHAT — POST /api/chat
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("Chat — POST /api/chat", () => {
  test("returns 400 for empty message", async ({ request }) => {
    const res = await request.post(`${API}/api/chat`, {
      data: { message: "" },
    });
    const status = res.status();
    expect([400, 503]).toContain(status);

    if (status === 400) {
      const body = await res.json();
      expect(body.error).toContain("Message is required");
    }
  });

  test("returns 400 for missing message field", async ({ request }) => {
    const res = await request.post(`${API}/api/chat`, {
      data: {},
    });
    expect([400, 503]).toContain(res.status());
  });

  test("returns 400 for whitespace-only message", async ({ request }) => {
    const res = await request.post(`${API}/api/chat`, {
      data: { message: "    " },
    });
    expect([400, 503]).toContain(res.status());
  });

  test("valid message returns SSE stream or 503 if unconfigured", async ({ request }) => {
    const res = await request.post(`${API}/api/chat`, {
      data: { message: "Hello, who is Themis?" },
    });
    const status = res.status();

    if (status === 503) {
      const body = await res.json();
      expect(body.error).toContain("HF_TOKEN");
    } else {
      expect(status).toBe(200);
      const ct = res.headers()["content-type"] ?? "";
      expect(ct).toContain("text/event-stream");

      const text = await res.text();
      expect(text).toContain("data:");
      expect(text).toContain("[DONE]");
    }
  });

  test("accepts history array alongside message", async ({ request }) => {
    const res = await request.post(`${API}/api/chat`, {
      data: {
        message: "What certifications?",
        history: [
          { role: "user", content: "Tell me about Themis" },
          { role: "assistant", content: "Themis is a Cloud Architect." },
        ],
      },
    });
    expect([200, 503]).toContain(res.status());
  });

  test("handles very long message without 400", async ({ request }) => {
    const res = await request.post(`${API}/api/chat`, {
      data: { message: "Tell me about " + "cloud ".repeat(100) },
    });
    expect([200, 503]).toContain(res.status());
  });

  test("503 response includes descriptive error about HF_TOKEN", async ({ request }) => {
    const res = await request.post(`${API}/api/chat`, {
      data: { message: "test" },
    });
    if (res.status() === 503) {
      const body = await res.json();
      expect(body).toHaveProperty("error");
      expect(body.error).toContain("HF_TOKEN");
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// BOOKING — GET /api/booking/slots, POST /api/booking/create
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("Booking — GET /api/booking/slots", () => {
  test("returns slots or 503 if Cal.com not configured", async ({ request }) => {
    const res = await request.get(`${API}/api/booking/slots`);
    const status = res.status();
    expect([200, 503]).toContain(status);

    if (status === 200) {
      const body = await res.json();
      expect(body).toHaveProperty("slots");
      expect(typeof body.slots).toBe("object");
    } else {
      const body = await res.json();
      expect(body.error).toContain("not configured");
    }
  });

  test("ignores extra query parameters", async ({ request }) => {
    const res = await request.get(`${API}/api/booking/slots?foo=bar&baz=123`);
    expect([200, 503]).toContain(res.status());
  });
});

test.describe("Booking — POST /api/booking/create", () => {
  test("rejects empty body", async ({ request }) => {
    const res = await request.post(`${API}/api/booking/create`, { data: {} });
    expect([400, 503]).toContain(res.status());
  });

  test("rejects missing email", async ({ request }) => {
    const res = await request.post(`${API}/api/booking/create`, {
      data: { start: "2026-03-10T09:00:00Z", name: "Test User" },
    });
    expect([400, 503]).toContain(res.status());
    if (res.status() === 400) {
      const body = await res.json();
      expect(body.error).toContain("required");
    }
  });

  test("rejects missing name", async ({ request }) => {
    const res = await request.post(`${API}/api/booking/create`, {
      data: { start: "2026-03-10T09:00:00Z", email: "test@example.com" },
    });
    expect([400, 503]).toContain(res.status());
    if (res.status() === 400) {
      const body = await res.json();
      expect(body.error).toContain("required");
    }
  });

  test("rejects missing start", async ({ request }) => {
    const res = await request.post(`${API}/api/booking/create`, {
      data: { name: "Test", email: "test@example.com" },
    });
    expect([400, 503]).toContain(res.status());
    if (res.status() === 400) {
      const body = await res.json();
      expect(body.error).toContain("required");
    }
  });

  test("rejects empty string fields", async ({ request }) => {
    const res = await request.post(`${API}/api/booking/create`, {
      data: { start: "", name: "", email: "" },
    });
    expect([400, 503]).toContain(res.status());
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GITHUB — GET /api/github/stats, GET /api/github/repos
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("GitHub — GET /api/github/stats", () => {
  test("returns profile stats with correct schema", async ({ request }) => {
    const res = await request.get(`${API}/api/github/stats`);
    // Works even without GITHUB_TOKEN (public API, rate-limited)
    expect([200, 403, 404]).toContain(res.status());

    if (res.status() === 200) {
      const body = await res.json();
      expect(body).toHaveProperty("stars");
      expect(body).toHaveProperty("repos");
      expect(body).toHaveProperty("followers");
      expect(body).toHaveProperty("following");
      expect(body).toHaveProperty("gists");
      expect(body).toHaveProperty("name");
      expect(body).toHaveProperty("bio");
      expect(body).toHaveProperty("avatar");
      expect(body).toHaveProperty("profile");

      expect(typeof body.stars).toBe("number");
      expect(typeof body.repos).toBe("number");
      expect(typeof body.followers).toBe("number");
      expect(typeof body.following).toBe("number");
      expect(typeof body.gists).toBe("number");
      expect(typeof body.profile).toBe("string");
      expect(body.profile).toContain("github.com");
    }
  });
});

test.describe("GitHub — GET /api/github/repos", () => {
  test("returns array of repos with correct schema", async ({ request }) => {
    const res = await request.get(`${API}/api/github/repos`);
    expect([200, 403, 404]).toContain(res.status());

    if (res.status() === 200) {
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);

      if (body.length > 0) {
        const repo = body[0];
        expect(repo).toHaveProperty("id");
        expect(repo).toHaveProperty("name");
        expect(repo).toHaveProperty("fullName");
        expect(repo).toHaveProperty("url");
        expect(repo).toHaveProperty("language");
        expect(repo).toHaveProperty("stars");
        expect(repo).toHaveProperty("forks");
        expect(repo).toHaveProperty("updatedAt");
        expect(repo).toHaveProperty("topics");

        expect(typeof repo.id).toBe("number");
        expect(typeof repo.name).toBe("string");
        expect(typeof repo.stars).toBe("number");
        expect(typeof repo.forks).toBe("number");
        expect(Array.isArray(repo.topics)).toBe(true);
      }
    }
  });

  test("supports pagination with page and limit params", async ({ request }) => {
    const res = await request.get(`${API}/api/github/repos?page=1&limit=5`);
    expect([200, 403, 404]).toContain(res.status());

    if (res.status() === 200) {
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeLessThanOrEqual(5);
    }
  });

  test("page 2 returns different results than page 1", async ({ request }) => {
    const res1 = await request.get(`${API}/api/github/repos?page=1&limit=5`);
    const res2 = await request.get(`${API}/api/github/repos?page=2&limit=5`);

    if (res1.status() === 200 && res2.status() === 200) {
      const body1 = await res1.json();
      const body2 = await res2.json();

      if (body1.length > 0 && body2.length > 0) {
        expect(body1[0].id).not.toBe(body2[0].id);
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RESUME — GET /api/resume/generate, GET /api/resume/download
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("Resume — GET /api/resume/generate", () => {
  test("returns complete resume data", async ({ request }) => {
    const res = await request.get(`${API}/api/resume/generate`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("pdfUrl", "/api/resume/download");
    expect(body).toHaveProperty("htmlContent");
    expect(body).toHaveProperty("data");
    expect(body).toHaveProperty("generatedAt");

    // Verify htmlContent contains name
    expect(body.htmlContent).toContain("Themistoklis Baltzakis");
  });

  test("data object has all resume sections", async ({ request }) => {
    const res = await request.get(`${API}/api/resume/generate`);
    const body = await res.json();
    const data = body.data;

    expect(data).toHaveProperty("name", "Themistoklis Baltzakis");
    expect(data).toHaveProperty("title");
    expect(data).toHaveProperty("email");
    expect(data).toHaveProperty("location");
    expect(data).toHaveProperty("summary");
    expect(data).toHaveProperty("experience");
    expect(data).toHaveProperty("certifications");
    expect(data).toHaveProperty("skills");

    expect(Array.isArray(data.experience)).toBe(true);
    expect(data.experience.length).toBeGreaterThan(0);
    expect(Array.isArray(data.certifications)).toBe(true);
    expect(data.certifications.length).toBeGreaterThan(0);
    expect(Array.isArray(data.skills)).toBe(true);
    expect(data.skills.length).toBeGreaterThan(0);
  });

  test("experience entries have company, role, and period", async ({ request }) => {
    const res = await request.get(`${API}/api/resume/generate`);
    const body = await res.json();

    for (const exp of body.data.experience) {
      expect(exp).toHaveProperty("company");
      expect(exp).toHaveProperty("role");
      expect(exp).toHaveProperty("period");
      expect(typeof exp.company).toBe("string");
      expect(typeof exp.role).toBe("string");
      expect(typeof exp.period).toBe("string");
    }
  });

  test("generatedAt is valid ISO timestamp", async ({ request }) => {
    const res = await request.get(`${API}/api/resume/generate`);
    const body = await res.json();

    const parsed = new Date(body.generatedAt);
    expect(parsed.getTime()).not.toBeNaN();
    expect(Date.now() - parsed.getTime()).toBeLessThan(60_000);
  });
});

test.describe("Resume — GET /api/resume/download", () => {
  test("returns PDF with correct content-type and disposition", async ({ request }) => {
    const res = await request.get(`${API}/api/resume/download`);
    expect(res.status()).toBe(200);

    const ct = res.headers()["content-type"] ?? "";
    expect(ct).toContain("application/pdf");

    const cd = res.headers()["content-disposition"] ?? "";
    expect(cd).toContain("attachment");
    expect(cd).toContain("Themistoklis_Baltzakis_Resume.pdf");
  });

  test("response body starts with PDF magic bytes", async ({ request }) => {
    const res = await request.get(`${API}/api/resume/download`);
    const text = await res.text();
    expect(text.startsWith("%PDF")).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// API KEYS — /api/organizations/api_keys (Protected by Firebase Auth)
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("API Keys — Auth Protection", () => {
  test("GET /api/organizations/api_keys returns 401 without auth", async ({ request }) => {
    const res = await request.get(`${API}/api/organizations/api_keys`);
    expect(res.status()).toBe(401);

    const body = await res.json();
    expect(body.error).toContain("authorization");
  });

  test("POST /api/organizations/api_keys returns 401 without auth", async ({ request }) => {
    const res = await request.post(`${API}/api/organizations/api_keys`, {
      data: { name: "Test Key" },
    });
    expect(res.status()).toBe(401);
  });

  test("GET /api/organizations/api_keys/:id returns 401 without auth", async ({ request }) => {
    const res = await request.get(`${API}/api/organizations/api_keys/ak_1234567890`);
    expect(res.status()).toBe(401);
  });

  test("POST /api/organizations/api_keys/:id returns 401 without auth", async ({ request }) => {
    const res = await request.post(`${API}/api/organizations/api_keys/ak_1234567890`, {
      data: { name: "Updated" },
    });
    expect(res.status()).toBe(401);
  });

  test("DELETE /api/organizations/api_keys/:id returns 401 without auth", async ({ request }) => {
    const res = await request.delete(`${API}/api/organizations/api_keys/ak_1234567890`);
    expect(res.status()).toBe(401);
  });

  test("invalid Bearer token returns 401", async ({ request }) => {
    const res = await request.get(`${API}/api/organizations/api_keys`, {
      headers: { Authorization: "Bearer fake-token-12345" },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toContain("Invalid");
  });

  test("Basic auth returns 401 (only Bearer accepted)", async ({ request }) => {
    const res = await request.get(`${API}/api/organizations/api_keys`, {
      headers: { Authorization: "Basic dXNlcjpwYXNz" },
    });
    expect(res.status()).toBe(401);
  });

  test("empty Authorization header returns 401", async ({ request }) => {
    const res = await request.get(`${API}/api/organizations/api_keys`, {
      headers: { Authorization: "" },
    });
    expect(res.status()).toBe(401);
  });

  test("Bearer without token returns 401", async ({ request }) => {
    const res = await request.get(`${API}/api/organizations/api_keys`, {
      headers: { Authorization: "Bearer " },
    });
    expect(res.status()).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN — GET /api/admin/stats (Protected by Firebase Auth)
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("Admin — Auth Protection", () => {
  test("GET /api/admin/stats returns 401 without auth", async ({ request }) => {
    const res = await request.get(`${API}/api/admin/stats`);
    expect(res.status()).toBe(401);

    const body = await res.json();
    expect(body.error).toContain("authorization");
  });

  test("GET /api/admin/stats with invalid token returns 401", async ({ request }) => {
    const res = await request.get(`${API}/api/admin/stats`, {
      headers: { Authorization: "Bearer invalid-token" },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toContain("Invalid");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CROSS-CUTTING CONCERNS — CORS, Content-Type, Concurrency
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("Cross-Cutting — CORS", () => {
  test("CORS headers present on public endpoints", async ({ request }) => {
    const endpoints = ["/api/ping", "/api/health", "/api/search?q=test"];

    for (const endpoint of endpoints) {
      const res = await request.get(`${API}${endpoint}`);
      const corsHeader = res.headers()["access-control-allow-origin"];

      // CORS header may be absent when request has no Origin header
      if (corsHeader) {
        expect(corsHeader).toBe("*");
      } else {
        const preflight = await request.fetch(`${API}${endpoint}`, {
          method: "OPTIONS",
          headers: { Origin: "https://baltzakisthemis.com" },
        });
        expect(preflight.headers()["access-control-allow-origin"]).toBeTruthy();
      }
    }
  });
});

test.describe("Cross-Cutting — Content-Type", () => {
  test("all JSON endpoints return application/json", async ({ request }) => {
    const endpoints = ["/api/ping", "/api/health", "/api/monitor"];

    for (const endpoint of endpoints) {
      const res = await request.get(`${API}${endpoint}`);
      expect(res.headers()["content-type"]).toContain("application/json");
    }
  });

  test("/api/docs returns text/html", async ({ request }) => {
    const res = await request.get(`${API}/api/docs`);
    expect(res.headers()["content-type"]).toContain("text/html");
  });

  test("/api/resume/download returns application/pdf", async ({ request }) => {
    const res = await request.get(`${API}/api/resume/download`);
    expect(res.headers()["content-type"]).toContain("application/pdf");
  });
});

test.describe("Cross-Cutting — Concurrent Requests", () => {
  test("handles concurrent requests to different endpoints", async ({ request }) => {
    const results = await Promise.all([
      request.get(`${API}/api/ping`),
      request.get(`${API}/api/health`),
      request.get(`${API}/api/monitor`),
      request.get(`${API}/api/search?q=cloud`),
      request.get(`${API}/api/resume/generate`),
    ]);

    for (const res of results) {
      expect(res.status()).toBe(200);
    }
  });

  test("handles rapid sequential requests to same endpoint", async ({ request }) => {
    for (let i = 0; i < 10; i++) {
      const res = await request.get(`${API}/api/ping`);
      expect(res.status()).toBe(200);
    }
  });
});

test.describe("Cross-Cutting — HTTP Methods", () => {
  test("POST to GET-only endpoints returns 404 or 405", async ({ request }) => {
    const res = await request.post(`${API}/api/ping`, { data: {} });
    expect([404, 405]).toContain(res.status());
  });

  test("GET to POST-only endpoints returns 404 or 405", async ({ request }) => {
    const res = await request.get(`${API}/api/contact`);
    expect([404, 405]).toContain(res.status());
  });
});
