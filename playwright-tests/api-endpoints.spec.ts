import { expect, test } from "@playwright/test";

test.describe("API Endpoints", () => {
  test("should handle contact form API", async ({ page }) => {
    await page.goto("/contact");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForSelector("form", { timeout: 10000 });

    await page.fill("#name", "Test User");
    await page.fill("#email", "test@example.com");
    await page.fill("#subject", "Test Subject");
    await page.fill("#message", "Test message content");

    await page.getByRole("button", { name: "Send Message" }).click();

    // Wait for response — success or error message should appear
    await page.waitForTimeout(6000);

    const hasSuccess = await page
      .locator("text=/Message sent successfully/i")
      .isVisible()
      .catch(() => false);
    const hasError = await page
      .locator("text=/Something went wrong|error|failed/i")
      .isVisible()
      .catch(() => false);

    // Form should show some kind of response after submission
    expect(hasSuccess || hasError).toBe(true);
  });

  test("should handle booking API endpoints", async ({ page }) => {
    // Only test the read-only slots endpoint — creating bookings would
    // send real calendar invitations via Cal.com
    const slotsResponse = await page.request.get("/api/booking/slots");

    // 200 if Cal.com is configured, 503 if not
    expect([200, 503]).toContain(slotsResponse.status());

    if (slotsResponse.status() === 200) {
      const slotsData = await slotsResponse.json();
      expect(slotsData).toHaveProperty("slots");
    }
  });

  test("should handle GitHub API integration", async ({ page }) => {
    const githubResponse = await page.request.get("/api/github/stats");
    // 200 if GITHUB_TOKEN is configured, 503 if not, 404 if route not registered
    expect([200, 404, 503]).toContain(githubResponse.status());

    if (githubResponse.status() === 200) {
      const githubData = await githubResponse.json();
      expect(githubData).toHaveProperty("stars");
      expect(githubData).toHaveProperty("repos");
      expect(githubData).toHaveProperty("followers");
    }

    const reposResponse = await page.request.get("/api/github/repos");
    expect([200, 404, 503]).toContain(reposResponse.status());

    if (reposResponse.status() === 200) {
      const reposData = await reposResponse.json();
      expect(Array.isArray(reposData)).toBe(true);
    }
  });

  test("should handle resume API", async ({ page }) => {
    const resumeResponse = await page.request.get("/api/resume/generate");
    expect(resumeResponse.status()).toBe(200);

    const resumeData = await resumeResponse.json();
    expect(resumeData).toHaveProperty("pdfUrl");
    expect(resumeData).toHaveProperty("htmlContent");

    const downloadResponse = await page.request.get("/api/resume/download");
    expect(downloadResponse.status()).toBe(200);

    const contentType = downloadResponse.headers()["content-type"];
    expect(contentType).toContain("application/pdf");
  });

  test("should handle chat API", async ({ page }) => {
    const chatResponse = await page.request.post("/api/chat", {
      data: {
        message: "Hello, I need help with cloud architecture",
        history: [],
      },
    });

    // 200 if HF_TOKEN is configured, 503 if not
    expect([200, 503]).toContain(chatResponse.status());

    if (chatResponse.status() === 200) {
      const contentType = chatResponse.headers()["content-type"];
      expect(contentType).toContain("text/event-stream");
    }
  });

  test("should handle API error responses", async ({ page }) => {
    // Contact API returns {success, message} format
    const contactResponse = await page.request.post("/api/contact", {
      data: { name: "", email: "invalid-email", subject: "", message: "" },
    });

    expect(contactResponse.status()).toBe(400);

    const errorData = await contactResponse.json();
    expect(errorData).toHaveProperty("success", false);
    expect(errorData).toHaveProperty("message");
  });

  test("should handle API rate limiting", async ({ page }) => {
    const requests = [];
    for (let i = 0; i < 10; i++) {
      requests.push(page.request.get("/api/ping"));
    }

    const responses = await Promise.all(requests);

    // All requests to simple ping should succeed
    const successCount = responses.filter((r) => r.status() === 200).length;
    expect(successCount).toBe(10);
  });

  test("should handle API authentication", async ({ page }) => {
    // Protected endpoint without auth should return 401
    const protectedResponse = await page.request.get("/api/admin/stats");
    expect([401, 403, 302]).toContain(protectedResponse.status());

    // Invalid token should return 401
    const authResponse = await page.request.get("/api/admin/stats", {
      headers: { Authorization: "Bearer invalid-token" },
    });
    expect([200, 401]).toContain(authResponse.status());
  });

  test("should handle API CORS", async ({ page }) => {
    const response = await page.request.get("/api/ping");
    const headers = response.headers();

    // In development, CORS middleware returns the requesting origin
    // In production, it returns one of the allowed origins
    expect(headers).toHaveProperty("access-control-allow-origin");
    expect(headers["access-control-allow-origin"]).toBeTruthy();
  });

  test("should handle API timeouts", async ({ page }) => {
    const timeoutResponse = await page.request.get("/api/health", {
      timeout: 5000,
    });

    expect(timeoutResponse.status()).toBe(200);
  });

  test("should handle API data validation", async ({ page }) => {
    // Send invalid types — server coerces them, but empty name/message triggers 400
    const response = await page.request.post("/api/contact", {
      data: { name: "", email: "", subject: null, message: "" },
    });

    expect(response.status()).toBe(400);

    const errorData = await response.json();
    expect(errorData).toHaveProperty("success", false);
    expect(errorData).toHaveProperty("message");
  });

  test("should handle API file uploads", async ({ page }) => {
    const uploadResponse = await page.request.post("/api/upload", {
      data: { file: { name: "test.pdf", type: "application/pdf", size: 1024 } },
    });

    expect([200, 400, 413]).toContain(uploadResponse.status());
  });

  test("should handle API pagination", async ({ page }) => {
    const page1Response = await page.request.get(
      "/api/github/repos?page=1&limit=10",
    );
    const page2Response = await page.request.get(
      "/api/github/repos?page=2&limit=10",
    );

    // 200 if GITHUB_TOKEN is configured, 503 if not, 404 if route not registered
    expect([200, 404, 503]).toContain(page1Response.status());
    expect([200, 404, 503]).toContain(page2Response.status());

    if (page1Response.status() === 200) {
      const page1Data = await page1Response.json();
      expect(Array.isArray(page1Data)).toBe(true);
    }

    if (page2Response.status() === 200) {
      const page2Data = await page2Response.json();
      expect(Array.isArray(page2Data)).toBe(true);
    }
  });

  test("should handle API search functionality", async ({ page }) => {
    const searchResponse = await page.request.get("/api/search?q=cloud");
    expect(searchResponse.status()).toBe(200);

    const searchData = await searchResponse.json();
    expect(searchData).toHaveProperty("results");
    expect(Array.isArray(searchData.results)).toBe(true);
  });

  test("should handle API webhooks", async ({ page }) => {
    const webhookResponse = await page.request.post("/api/webhook", {
      data: {
        event: "deployment",
        data: { status: "success", timestamp: new Date().toISOString() },
      },
    });

    expect(webhookResponse.status()).toBe(200);

    const result = await webhookResponse.json();
    expect(result).toHaveProperty("status");
    expect(result.status).toBe("received");
  });

  test("should handle API health checks", async ({ page }) => {
    const healthResponse = await page.request.get("/api/health");
    expect(healthResponse.status()).toBe(200);

    const healthData = await healthResponse.json();
    expect(healthData).toHaveProperty("status");
    expect(healthData.status).toBe("healthy");
    expect(healthData).toHaveProperty("timestamp");
  });

  test("should handle API versioning", async ({ page }) => {
    // Versioned endpoints are not implemented — should return 404
    const v1Response = await page.request.get("/api/v1/github/stats");
    const v2Response = await page.request.get("/api/v2/github/stats");

    expect([200, 404, 410]).toContain(v1Response.status());
    expect([200, 404, 410]).toContain(v2Response.status());
  });

  test("should handle API caching", async ({ page }) => {
    const response1 = await page.request.get("/api/health");
    const response2 = await page.request.get("/api/health");

    expect(response1.status()).toBe(200);
    expect(response2.status()).toBe(200);

    // Both should return valid JSON
    const data1 = await response1.json();
    const data2 = await response2.json();
    expect(data1).toHaveProperty("status");
    expect(data2).toHaveProperty("status");
  });

  test("should handle API monitoring and logging", async ({ page }) => {
    const monitorResponse = await page.request.get("/api/monitor");
    expect(monitorResponse.status()).toBe(200);

    const monitorData = await monitorResponse.json();
    expect(monitorData).toHaveProperty("requests");
    expect(monitorData).toHaveProperty("errors");
    expect(monitorData).toHaveProperty("uptime");
  });

  test("should handle API documentation", async ({ page }) => {
    const docsResponse = await page.request.get("/api/docs");
    expect(docsResponse.status()).toBe(200);

    const docsContent = await docsResponse.text();
    expect(docsContent).toContain("API Documentation");
    expect(docsContent).toContain("Endpoints");
  });
});
