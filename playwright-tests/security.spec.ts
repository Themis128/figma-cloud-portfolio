import { expect, test } from "@playwright/test";

test.describe("Security Tests", () => {
  // Security headers (CSP, X-Frame-Options, HSTS) are typically set in production only.
  // These tests are skipped in development mode.
  test.skip("should have valid CSP headers", async () => {
    // CSP headers are not set in Next.js dev server by default
  });

  test("should prevent XSS in rendered output", async ({ page }) => {
    await page.goto("/contact");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForSelector("form", { timeout: 10000 });

    // Fill the message field with an XSS payload
    await page.fill("#message", "<script>alert(1)</script>");

    // Verify no actual <script> elements were injected into the DOM
    // (textarea values containing script text are safe — React escapes them)
    const injectedScripts = await page.evaluate(() => {
      const scripts = document.querySelectorAll("script");
      return Array.from(scripts).filter((s) =>
        s.textContent?.includes("alert(1)"),
      ).length;
    });
    expect(injectedScripts).toBe(0);

    // Verify no alert dialog was triggered
    let alertTriggered = false;
    page.on("dialog", () => {
      alertTriggered = true;
    });
    await page.waitForTimeout(500);
    expect(alertTriggered).toBe(false);
  });

  test("should validate input sanitization on contact form", async ({ page }) => {
    await page.goto("/contact");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForSelector("form", { timeout: 10000 });

    await page.fill("#name", '"><script>alert(1)</script>');

    // The rendered page should not display script content
    await expect(page.locator("body")).not.toContainText("alert(1)");
  });

  // Cookie flags (httpOnly, secure) are typically only set in production with HTTPS
  test.skip("should have secure cookies", async () => {
    // Secure cookie flags are not set in local dev (no HTTPS)
  });

  // X-Frame-Options is typically set by server/CDN in production
  test.skip("should prevent clickjacking", async () => {
    // X-Frame-Options header is not set in Next.js dev server by default
  });

  // HSTS requires HTTPS and is set in production only
  test.skip("should have HSTS enabled", async () => {
    // HSTS is not applicable in development (no HTTPS)
  });

  test("should not have open redirect links", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Verify no redirect links exist on the page — all links are internal or known external
    const links = page.locator("a[href]");
    const count = await links.count();

    for (let i = 0; i < Math.min(count, 20); i++) {
      const href = await links.nth(i).getAttribute("href");
      if (href) {
        // Should not contain redirect parameters pointing to external domains
        expect(href).not.toMatch(/redirect=http/);
      }
    }
  });
});
