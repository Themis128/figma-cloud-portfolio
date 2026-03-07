import { expect, test } from "@playwright/test";

/**
 * Contact Form API Tests
 *
 * Tests POST /api/contact endpoint validation, error handling, and response format.
 * Uses the production Lambda via API Gateway.
 */

const API_BASE =
  process.env.BACKEND_API_URL ||
  "https://wctxhmfzgk.execute-api.us-east-1.amazonaws.com";

// ─── Validation ─────────────────────────────────────────────────────────────────

test.describe("Contact API — Validation", () => {
  test("POST rejects missing name", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/contact`, {
      data: { email: "test@example.com", message: "Hello" },
    });
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain("required");
  });

  test("POST rejects missing email", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/contact`, {
      data: { name: "Test User", message: "Hello" },
    });
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain("required");
  });

  test("POST rejects missing message", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/contact`, {
      data: { name: "Test User", email: "test@example.com" },
    });
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain("required");
  });

  test("POST rejects whitespace-only name", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/contact`, {
      data: { name: "   ", email: "test@example.com", message: "Hello" },
    });
    expect(res.status()).toBe(400);
  });

  test("POST rejects whitespace-only email", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/contact`, {
      data: { name: "Test", email: "   ", message: "Hello" },
    });
    expect(res.status()).toBe(400);
  });

  test("POST rejects whitespace-only message", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/contact`, {
      data: { name: "Test", email: "test@example.com", message: "   " },
    });
    expect(res.status()).toBe(400);
  });

  test("POST rejects empty body", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/contact`, {
      data: {},
    });
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
  });
});

// ─── Email Validation ───────────────────────────────────────────────────────────

test.describe("Contact API — Email Validation", () => {
  test("POST rejects email without @ symbol", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/contact`, {
      data: { name: "Test", email: "invalidemail.com", message: "Hello" },
    });
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.message).toContain("Invalid email");
  });

  test("POST rejects email without domain", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/contact`, {
      data: { name: "Test", email: "user@", message: "Hello" },
    });
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.message).toContain("Invalid email");
  });

  test("POST rejects email without local part", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/contact`, {
      data: { name: "Test", email: "@domain.com", message: "Hello" },
    });
    expect(res.status()).toBe(400);
  });
});

// ─── Valid Submission ───────────────────────────────────────────────────────────

test.describe("Contact API — Submission", () => {
  test("POST with valid payload returns success or reCAPTCHA challenge", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/contact`, {
      data: {
        name: "Playwright Test",
        email: "playwright@test.dev",
        subject: "Automated Test",
        message: "This is an automated test submission from Playwright.",
      },
    });
    const status = res.status();

    // 200 if reCAPTCHA not configured, 400 if reCAPTCHA required, 403 if reCAPTCHA fails
    expect([200, 400, 403]).toContain(status);

    const body = await res.json();
    expect(body).toHaveProperty("success");
    expect(body).toHaveProperty("message");
  });

  test("POST response has correct content-type", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/contact`, {
      data: { name: "Test", email: "test@example.com", message: "Hello" },
    });
    const contentType = res.headers()["content-type"] ?? "";
    expect(contentType).toContain("application/json");
  });

  test("POST without subject defaults gracefully", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/contact`, {
      data: {
        name: "No Subject Test",
        email: "test@example.com",
        message: "Message without a subject",
      },
    });
    // Should not fail due to missing subject
    expect([200, 400, 403]).toContain(res.status());
  });
});
