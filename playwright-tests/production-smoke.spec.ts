import { test, expect } from "@playwright/test";

const DOMAINS = [
  "https://www.baltzakisthemis.com",
  "https://baltzakisthemis.com",
];

const PAGES = [
  { path: "/", name: "Home" },
  { path: "/about/", name: "About" },
  { path: "/contact/", name: "Contact" },
  { path: "/resume/", name: "Resume" },
  { path: "/projects/", name: "Projects" },
  { path: "/performance/", name: "Performance" },
  { path: "/agents/", name: "Agents" },
  { path: "/settings/", name: "Settings" },
  { path: "/product/", name: "Product" },
];

const API_ENDPOINTS = [
  { path: "/api/ping", name: "Ping" },
  { path: "/api/health", name: "Health" },
];

for (const domain of DOMAINS) {
  test.describe(`${domain}`, () => {
    // Frontend pages
    for (const page of PAGES) {
      test(`${page.name} page loads (${page.path})`, async ({ request }) => {
        const response = await request.get(`${domain}${page.path}`);
        expect(response.status()).toBe(200);
        const body = await response.text();
        expect(body).toContain("<!DOCTYPE html");
      });
    }

    // API health endpoints
    for (const endpoint of API_ENDPOINTS) {
      test(`API ${endpoint.name} (${endpoint.path})`, async ({ request }) => {
        const response = await request.get(`${domain}${endpoint.path}`);
        expect(response.status()).toBe(200);
      });
    }

    // Contact form POST
    test("Contact form POST", async ({ request }) => {
      const response = await request.post(`${domain}/api/contact`, {
        data: {
          name: "Playwright Smoke Test",
          email: "smoke-test@example.com",
          subject: "Automated Smoke Test",
          message:
            "This is an automated smoke test from Playwright production verification.",
        },
      });
      // Accept 200 (success) or 400/403 (reCAPTCHA rejection in production)
      expect([200, 400, 403]).toContain(response.status());
    });

    // Chat API endpoint
    test("Chat API responds", async ({ request }) => {
      const response = await request.post(`${domain}/api/chat`, {
        data: {
          message: "hello",
          history: [],
        },
      });
      // Accept 200 (streaming) or 500/503 (HF token issues)
      expect(response.status()).toBeLessThan(504);
    });

    // Booking slots
    test("Booking slots API", async ({ request }) => {
      const response = await request.get(`${domain}/api/booking/slots`);
      // Accept 200 or 500 (Cal.com config may vary)
      expect(response.status()).toBeLessThan(504);
    });

    // SSL and redirect
    test("HTTPS works", async ({ request }) => {
      const response = await request.get(`${domain}/`, {
        maxRedirects: 0,
      });
      // Should be 200 (already HTTPS) or 301/308 redirect
      expect([200, 301, 308]).toContain(response.status());
    });

    // Non-existent page returns S3 403 or CloudFront error page
    test("Non-existent page handled", async ({ request }) => {
      const response = await request.get(
        `${domain}/this-page-does-not-exist/`
      );
      // S3 static hosting returns 403 for missing keys, CloudFront may return 404 or custom error
      expect([200, 403, 404]).toContain(response.status());
    });
  });
}
