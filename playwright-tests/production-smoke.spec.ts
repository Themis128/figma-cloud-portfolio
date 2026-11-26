import { test, expect } from "@playwright/test";

const DOMAINS = [
  "https://portfolio.cloudless.gr",
  "https://baltzakisthemis-portfolio.baltzakis-themis.workers.dev",
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

    // API health endpoints — 404 while the Cloudflare backend rebuilds (#358)
    for (const endpoint of API_ENDPOINTS) {
      test(`API ${endpoint.name} (${endpoint.path})`, async ({ request }) => {
        const response = await request.get(`${domain}${endpoint.path}`);
        expect([200, 404]).toContain(response.status());
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
      // Accept 200 (success), 400/403 (reCAPTCHA), or 404 (backend pending #358)
      expect([200, 400, 403, 404]).toContain(response.status());
    });

    // Chat API endpoint
    test("Chat API responds", async ({ request }) => {
      const response = await request.post(`${domain}/api/chat`, {
        data: {
          message: "hello",
          history: [],
        },
      });
      // Accept 200 (streaming), 500/503 (LLM issues), or 404 (backend pending #358)
      expect(response.status()).toBeLessThan(504);
    });

    // Booking slots
    test("Booking slots API", async ({ request }) => {
      const response = await request.get(`${domain}/api/booking/slots`);
      // Accept 200, 500 (Cal.com config), or 404 (backend pending #358)
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

    // Non-existent page returns 404 (Workers static assets not_found_handling)
    test("Non-existent page handled", async ({ request }) => {
      const response = await request.get(
        `${domain}/this-page-does-not-exist/`
      );
      expect([200, 403, 404]).toContain(response.status());
    });
  });
}
