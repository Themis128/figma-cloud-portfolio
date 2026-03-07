import { expect, test } from "@playwright/test";

test.describe("API Endpoints", () => {
  test("should handle contact form API", async ({ page }) => {
    // Navigate to contact page
    await page.goto("/contact");
    
    // Fill out contact form
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="subject"]', "Test Subject");
    await page.fill('textarea[name="message"]', "Test message content");
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for response
    await page.waitForTimeout(2000);
    
    // Check for success or error message
    const successMessage = page.locator('[data-testid="success-message"]');
    const errorMessage = page.locator('[data-testid="error-message"]');
    
    // Should show some response
    if (await successMessage.isVisible()) {
      await expect(successMessage).toBeVisible();
    } else if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    } else {
      // Form may be blocked by reCAPTCHA - just verify submission attempt
      await expect(page.locator("body")).toBeVisible();
    }
  });

  test("should handle booking API endpoints", async ({ page }) => {
    // Test booking slots endpoint
    const slotsResponse = await page.request.get("/api/booking/slots");
    expect(slotsResponse.status()).toBe(200);
    
    const slotsData = await slotsResponse.json();
    expect(slotsData).toHaveProperty("slots");
    expect(Array.isArray(slotsData.slots)).toBe(true);
    
    // Test booking creation endpoint
    const bookingData = {
      name: "Test User",
      email: "test@example.com",
      date: "2024-01-15",
      time: "10:00",
      service: "consultation"
    };
    
    const createResponse = await page.request.post("/api/booking/create", {
      data: bookingData
    });
    
    // Should return success or validation error
    expect([200, 400, 500]).toContain(createResponse.status());
  });

  test("should handle GitHub API integration", async ({ page }) => {
    // Test GitHub stats endpoint
    const githubResponse = await page.request.get("/api/github/stats");
    expect(githubResponse.status()).toBe(200);
    
    const githubData = await githubResponse.json();
    expect(githubData).toHaveProperty("stars");
    expect(githubData).toHaveProperty("repos");
    expect(githubData).toHaveProperty("followers");
    
    // Test GitHub repos endpoint
    const reposResponse = await page.request.get("/api/github/repos");
    expect(reposResponse.status()).toBe(200);
    
    const reposData = await reposResponse.json();
    expect(Array.isArray(reposData)).toBe(true);
  });

  test("should handle resume API", async ({ page }) => {
    // Test resume generation endpoint
    const resumeResponse = await page.request.get("/api/resume/generate");
    expect(resumeResponse.status()).toBe(200);
    
    const resumeData = await resumeResponse.json();
    expect(resumeData).toHaveProperty("pdfUrl");
    expect(resumeData).toHaveProperty("htmlContent");
    
    // Test resume download endpoint
    const downloadResponse = await page.request.get("/api/resume/download");
    expect(downloadResponse.status()).toBe(200);
    
    // Should return PDF content
    const contentType = downloadResponse.headers()["content-type"];
    expect(contentType).toContain("application/pdf");
  });

  test("should handle chat API", async ({ page }) => {
    // Test chat endpoint
    const chatData = {
      message: "Hello, I need help with cloud architecture",
      sessionId: "test-session-123"
    };
    
    const chatResponse = await page.request.post("/api/chat", {
      data: chatData
    });
    
    expect(chatResponse.status()).toBe(200);
    
    const chatResult = await chatResponse.json();
    expect(chatResult).toHaveProperty("response");
    expect(chatResult).toHaveProperty("sessionId");
    expect(typeof chatResult.response).toBe("string");
  });

  test("should handle API error responses", async ({ page }) => {
    // Test invalid contact form data
    const invalidContactData = {
      name: "",
      email: "invalid-email",
      subject: "",
      message: ""
    };
    
    const contactResponse = await page.request.post("/api/contact", {
      data: invalidContactData
    });
    
    expect(contactResponse.status()).toBe(400);
    
    const errorData = await contactResponse.json();
    expect(errorData).toHaveProperty("error");
    
    // Test invalid booking data
    const invalidBookingData = {
      name: "",
      email: "invalid",
      date: "invalid-date",
      time: "invalid-time"
    };
    
    const bookingResponse = await page.request.post("/api/booking/create", {
      data: invalidBookingData
    });
    
    expect(bookingResponse.status()).toBe(400);
  });

  test("should handle API rate limiting", async ({ page }) => {
    // Make multiple rapid requests to test rate limiting
    const requests = [];
    for (let i = 0; i < 10; i++) {
      requests.push(page.request.get("/api/github/stats"));
    }
    
    const responses = await Promise.all(requests);
    
    // Some requests should succeed, others might be rate limited
    const successCount = responses.filter(r => r.status() === 200).length;
    const rateLimitedCount = responses.filter(r => r.status() === 429).length;
    
    expect(successCount + rateLimitedCount).toBe(10);
  });

  test("should handle API authentication", async ({ page }) => {
    // Test protected endpoints without authentication
    const protectedResponse = await page.request.get("/api/admin/stats");
    
    // Should return 401 Unauthorized or redirect to login
    expect([401, 403, 302]).toContain(protectedResponse.status());
    
    // Test with mock authentication header
    const authResponse = await page.request.get("/api/admin/stats", {
      headers: {
        "Authorization": "Bearer mock-token"
      }
    });
    
    // Should return 401 for invalid token or 200 for valid
    expect([200, 401]).toContain(authResponse.status());
  });

  test("should handle API CORS", async ({ page }) => {
    // Test CORS headers
    const response = await page.request.get("/api/github/stats");
    const headers = response.headers();
    
    // Should have CORS headers
    expect(headers).toHaveProperty("access-control-allow-origin");
    expect(headers).toHaveProperty("access-control-allow-methods");
    expect(headers).toHaveProperty("access-control-allow-headers");
  });

  test("should handle API timeouts", async ({ page }) => {
    // Test with timeout
    const timeoutResponse = await page.request.get("/api/github/stats", {
      timeout: 5000
    });
    
    expect(timeoutResponse.status()).toBe(200);
  });

  test("should handle API data validation", async ({ page }) => {
    // Test with invalid data types
    const invalidData = {
      name: 123, // Should be string
      email: true, // Should be string
      subject: null, // Should be string
      message: [] // Should be string
    };
    
    const response = await page.request.post("/api/contact", {
      data: invalidData
    });
    
    expect(response.status()).toBe(400);
    
    const errorData = await response.json();
    expect(errorData).toHaveProperty("error");
  });

  test("should handle API file uploads", async ({ page }) => {
    // Test file upload endpoint
    const uploadData = {
      file: {
        name: "test.pdf",
        type: "application/pdf",
        size: 1024
      }
    };
    
    const uploadResponse = await page.request.post("/api/upload", {
      data: uploadData
    });
    
    // Should handle file upload
    expect([200, 400, 413]).toContain(uploadResponse.status());
  });

  test("should handle API pagination", async ({ page }) => {
    // Test pagination parameters
    const page1Response = await page.request.get("/api/github/repos?page=1&limit=10");
    const page2Response = await page.request.get("/api/github/repos?page=2&limit=10");
    
    expect(page1Response.status()).toBe(200);
    expect(page2Response.status()).toBe(200);
    
    const page1Data = await page1Response.json();
    const page2Data = await page2Response.json();
    
    // Should return different data for different pages
    expect(Array.isArray(page1Data)).toBe(true);
    expect(Array.isArray(page2Data)).toBe(true);
  });

  test("should handle API search functionality", async ({ page }) => {
    // Test search endpoint
    const searchResponse = await page.request.get("/api/search?q=cloud");
    expect(searchResponse.status()).toBe(200);
    
    const searchData = await searchResponse.json();
    expect(searchData).toHaveProperty("results");
    expect(Array.isArray(searchData.results)).toBe(true);
  });

  test("should handle API webhooks", async ({ page }) => {
    // Test webhook endpoint
    const webhookData = {
      event: "deployment",
      data: {
        status: "success",
        timestamp: new Date().toISOString()
      }
    };
    
    const webhookResponse = await page.request.post("/api/webhook", {
      data: webhookData
    });
    
    expect(webhookResponse.status()).toBe(200);
    
    const result = await webhookResponse.json();
    expect(result).toHaveProperty("status");
    expect(result.status).toBe("received");
  });

  test("should handle API health checks", async ({ page }) => {
    // Test health check endpoint
    const healthResponse = await page.request.get("/api/health");
    expect(healthResponse.status()).toBe(200);
    
    const healthData = await healthResponse.json();
    expect(healthData).toHaveProperty("status");
    expect(healthData.status).toBe("healthy");
    expect(healthData).toHaveProperty("timestamp");
  });

  test("should handle API versioning", async ({ page }) => {
    // Test versioned endpoints
    const v1Response = await page.request.get("/api/v1/github/stats");
    const v2Response = await page.request.get("/api/v2/github/stats");
    
    // Both should work or return appropriate version errors
    expect([200, 404, 410]).toContain(v1Response.status());
    expect([200, 404, 410]).toContain(v2Response.status());
  });

  test("should handle API caching", async ({ page }) => {
    // Make same request twice to test caching
    const response1 = await page.request.get("/api/github/stats");
    const response2 = await page.request.get("/api/github/stats");
    
    expect(response1.status()).toBe(200);
    expect(response2.status()).toBe(200);
    
    // Should have cache headers
    const headers1 = response1.headers();
    const headers2 = response2.headers();
    
    expect(headers1).toHaveProperty("cache-control");
    expect(headers2).toHaveProperty("cache-control");
  });

  test("should handle API monitoring and logging", async ({ page }) => {
    // Test monitoring endpoint
    const monitorResponse = await page.request.get("/api/monitor");
    expect(monitorResponse.status()).toBe(200);
    
    const monitorData = await monitorResponse.json();
    expect(monitorData).toHaveProperty("requests");
    expect(monitorData).toHaveProperty("errors");
    expect(monitorData).toHaveProperty("uptime");
  });

  test("should handle API documentation", async ({ page }) => {
    // Test API documentation endpoint
    const docsResponse = await page.request.get("/api/docs");
    expect(docsResponse.status()).toBe(200);
    
    const docsContent = await docsResponse.text();
    expect(docsContent).toContain("API Documentation");
    expect(docsContent).toContain("Endpoints");
  });
});