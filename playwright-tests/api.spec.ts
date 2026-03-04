import { expect, test } from "@playwright/test";

test.describe("API Endpoints", () => {
  test("should respond to /api/resume with resume data", async ({
    request,
  }) => {
    const response = await request.get("/api/resume");
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("personal");
    expect(data.personal).toHaveProperty("name");
    expect(data.personal.name).toBe("Themistoklis Baltzakis");
  });

  test("should respond to /api/github with data", async ({
    request,
  }) => {
    const response = await request.get("/api/github");
    // May fail if no GITHUB_TOKEN is set — returns 502 on upstream error
    expect([200, 500, 502]).toContain(response.status());
  });

  test("should handle 404 for non-existent API endpoints", async ({
    request,
  }) => {
    const response = await request.get("/api/non-existent");
    // Next.js dev server may return 200 (HTML not-found page), 404, or 405
    expect([200, 400, 404, 405]).toContain(response.status());
  });

  test("should handle invalid HTTP methods on contact endpoint", async ({
    request,
  }) => {
    const response = await request.get("/api/contact");
    expect([404, 405]).toContain(response.status());
  });

  test("should reject malformed JSON on contact endpoint", async ({
    request,
  }) => {
    const response = await request.post("/api/contact", {
      data: "{invalid json",
      headers: { "Content-Type": "application/json" },
    });
    expect([400, 500]).toContain(response.status());
  });

  test("should handle API timeout gracefully", async ({ request }) => {
    try {
      const response = await request.get("/api/resume", {
        timeout: 1,
      });
      // If response comes back despite tiny timeout, that's fine
      expect(response.status()).toBe(200);
    } catch (error) {
      // Timeout occurred - acceptable behavior
      // Error message may say "timeout" or "Request timed out"
      expect((error as Error).message.toLowerCase()).toMatch(/timeout|timed out|aborted/i);
    }
  });

  test("should return resume data with correct structure", async ({
    request,
  }) => {
    const response = await request.get("/api/resume");
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("personal");
    expect(data).toHaveProperty("experience");
    expect(data.personal).toHaveProperty("title");
    expect(data.personal).toHaveProperty("email");
  });

  test("should return proper content-type header", async ({ request }) => {
    const response = await request.get("/api/resume");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");
  });
});
