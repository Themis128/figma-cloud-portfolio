import { expect, test } from "@playwright/test";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

// Lambda-only endpoints (contact, github) are not available on the local Express dev server.
// These tests target the Express dev server on port 3001.
// For Lambda endpoint tests, set API_BASE_URL to the Lambda function URL.

test.describe("API Endpoints — Express Dev Server", () => {
  test("GET /api/organizations/api_keys — should return array", async ({
    request,
  }) => {
    const response = await request.get(
      `${API_BASE_URL}/api/organizations/api_keys`,
    );
    expect(response.ok()).toBe(true);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test("GET /api/resume/download — should respond", async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/resume/download`);
    expect(response.status()).toBe(200);
  });

  test("should handle 404 for non-existent API endpoints", async ({
    request,
  }) => {
    const response = await request.get(`${API_BASE_URL}/api/non-existent`);
    expect([404, 500]).toContain(response.status());
  });

  test("should return proper content-type for JSON endpoints", async ({
    request,
  }) => {
    const response = await request.get(
      `${API_BASE_URL}/api/organizations/api_keys`,
    );
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("application/json");
  });

  test("GET / — root should respond", async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/`);
    expect(response.ok()).toBe(true);
  });
});

test.describe("API Endpoints — Lambda Only", () => {
  // These tests require the Lambda function URL or a running Next.js dev server
  // with API routes. Skip when testing against the local Express server.
  const isLocalExpress =
    !process.env.API_BASE_URL ||
    process.env.API_BASE_URL.includes("localhost:3001");

  test("should respond to /api/contact with 404/405 for GET", async ({
    request,
  }) => {
    test.skip(isLocalExpress, "Contact endpoint only available on Lambda");
    const response = await request.get(`${API_BASE_URL}/api/contact`);
    expect([404, 405]).toContain(response.status());
  });

  test("should reject malformed JSON on contact endpoint", async ({
    request,
  }) => {
    test.skip(isLocalExpress, "Contact endpoint only available on Lambda");
    const response = await request.post(`${API_BASE_URL}/api/contact`, {
      data: "{invalid json",
      headers: { "Content-Type": "application/json" },
    });
    expect([400, 500]).toContain(response.status());
  });
});
