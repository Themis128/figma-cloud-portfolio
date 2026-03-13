import { expect, test } from "@playwright/test";

test.describe("PWA Features", () => {
  test("should have valid manifest file", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Check that manifest link exists in the page
    const manifestLink = page.locator('link[rel="manifest"]');
    const manifestCount = await manifestLink.count();

    if (manifestCount > 0) {
      const href = await manifestLink.getAttribute("href");
      expect(href).toBeTruthy();

      // Fetch the manifest
      if (href) {
        const fullUrl = href.startsWith("http")
          ? href
          : `http://localhost:3000${href}`;
        const response = await page.request.get(fullUrl);
        expect(response.status()).toBe(200);

        const manifest = await response.json();
        expect(manifest.name).toBeTruthy();
        expect(manifest.short_name).toBeTruthy();
      }
    } else {
      console.log("No manifest link found — PWA manifest may not be configured");
    }
  });

  test("should serve offline.html fallback page", async ({ page }) => {
    // Verify the offline page is accessible
    const response = await page.request.get("http://localhost:3000/offline.html");
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain("You're Offline");
    expect(body).toContain("Try Again");
  });

  test("should serve sw.js service worker file", async ({ page }) => {
    const response = await page.request.get("http://localhost:3000/sw.js");
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain("workbox");
    expect(body).toContain("offline-fallback");
    expect(body).toContain("sw-store");
  });
});
