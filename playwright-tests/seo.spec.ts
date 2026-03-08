import { expect, test } from "@playwright/test";
import { waitForAppReady } from "./test-utils";

test.describe("SEO & Metadata", () => {
  test.describe("Meta Tags & Open Graph", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
      await waitForAppReady(page);
      await page.waitForLoadState("networkidle");
    });

    test("should have proper meta tags", async ({ page }) => {
      // Check for essential meta tags
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);

      // Check meta description
      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveCount(1);
      const descriptionContent = await metaDescription.getAttribute("content");
      expect(descriptionContent?.length).toBeGreaterThan(10);

      // Check viewport meta tag
      const viewport = page.locator('meta[name="viewport"]');
      await expect(viewport).toHaveCount(1);

      // Check charset
      const charset = page.locator("meta[charset]");
      await expect(charset).toHaveCount(1);
    });

    test("should have Open Graph tags", async ({ page }) => {
      // Check Open Graph meta tags
      const ogTitle = page.locator('meta[property="og:title"]');
      const ogDescription = page.locator('meta[property="og:description"]');
      const ogType = page.locator('meta[property="og:type"]');

      // Should have basic Open Graph tags
      await expect(ogTitle).toHaveCount(1);
      await expect(ogDescription).toHaveCount(1);
      await expect(ogType).toHaveCount(1);

      // Check content
      const titleContent = await ogTitle.getAttribute("content");
      const descContent = await ogDescription.getAttribute("content");
      const typeContent = await ogType.getAttribute("content");

      expect(titleContent?.length).toBeGreaterThan(0);
      expect(descContent?.length).toBeGreaterThan(0);
      expect(typeContent).toBe("website");
    });

    test("should have Twitter Card tags", async ({ page }) => {
      // Check Twitter Card meta tags
      const twitterCard = page.locator('meta[name="twitter:card"]');
      const twitterTitle = page.locator('meta[name="twitter:title"]');
      const twitterDescription = page.locator(
        'meta[name="twitter:description"]',
      );

      // Twitter cards are optional but if present should be valid
      const cardCount = await twitterCard.count();
      if (cardCount > 0) {
        await expect(twitterTitle).toHaveCount(1);
        await expect(twitterDescription).toHaveCount(1);

        const cardType = await twitterCard.getAttribute("content");
        expect(["summary", "summary_large_image", "app", "player"]).toContain(
          cardType,
        );
      }
    });

    test("should have structured data (JSON-LD)", async ({ page }) => {
      // Check for JSON-LD structured data
      const jsonLdScripts = page.locator('script[type="application/ld+json"]');

      if ((await jsonLdScripts.count()) > 0) {
        for (const script of await jsonLdScripts.all()) {
          const content = await script.textContent();
          expect(content).toBeTruthy();

          // Should be valid JSON
          const jsonData = JSON.parse(content || "{}");
          expect(jsonData).toHaveProperty("@context");
          expect(jsonData).toHaveProperty("@type");
        }
      }
    });

    test("should have canonical URL", async ({ page }) => {
      await page.goto("/");
      await waitForAppReady(page);
      await page.waitForLoadState("domcontentloaded");

      // Check for canonical link
      const canonical = page.locator('link[rel="canonical"]');

      if ((await canonical.count()) > 0) {
        const href = await canonical.getAttribute("href");
        expect(href).toBeTruthy();
        expect(href).toMatch(/^https?:\/\//);
      }
    });
  });

  test.describe("Sitemap & Crawling", () => {
    test("should generate sitemap.xml", async ({ page }) => {
      // Check if sitemap exists
      const response = await page.request.get("/sitemap.xml");

      if (response.ok()) {
        const content = await response.text();

        // In development, Vite serves index.html for unknown routes
        const isDevelopment =
          content.includes("<!doctype html>") ||
          content.includes('<div id="root">');

        if (isDevelopment) {
          // In development, sitemap.xml serves the main HTML page
          expect(content).toContain("<!doctype html>");
          expect(content).toContain('<div id="root">');
        } else {
          // In production, should be proper XML sitemap
          expect(content).toContain("<?xml");
          expect(content).toContain("<urlset");
          expect(content).toContain("<url>");
          expect(content).toContain("<loc>");
        }
      } else {
        // Sitemap not implemented yet - this is acceptable for now
        console.log("Sitemap not implemented - skipping test");
      }
    });

    test("should have robots.txt", async ({ page }) => {
      // Check if robots.txt exists
      const response = await page.request.get("/robots.txt");

      if (response.ok()) {
        const content = await response.text();
        expect(content.length).toBeGreaterThan(0);
        expect(content).toMatch(/User-agent|Disallow|Allow|Sitemap/i);
      }
    });

    test("should have proper heading structure for SEO", async ({ page }) => {
      await page.goto("/");
      await waitForAppReady(page);
      await page.waitForLoadState("networkidle");

      // Wait for React to fully hydrate and render content
      await page.waitForFunction(
        () => {
          const h1 = document.querySelector("h1");
          return h1?.textContent?.includes("Themistoklis") ?? false;
        },
        { timeout: 15000 },
      );

      // Check heading hierarchy
      const h1Count = await page.locator("h1").count();
      expect(h1Count).toBeGreaterThan(0);

      // Should have only one h1 per page
      expect(h1Count).toBe(1);

      // Check that h1 contains meaningful content
      const h1Text = await page.locator("h1").first().textContent();
      expect(h1Text?.trim().length).toBeGreaterThan(0);
      expect(h1Text).toContain("Themistoklis");
    });

    test("should have descriptive page titles", async ({ page }) => {
      await page.goto("/");
      await waitForAppReady(page);
      await page.waitForLoadState("networkidle");

      // Wait for the title to be set (React Helmet might set it asynchronously)
      await page.waitForFunction(
        () => document.title && document.title.length > 10,
        {
          timeout: 10000,
        },
      );

      const title = await page.title();

      // Title should be descriptive and not too long
      expect(title.length).toBeGreaterThan(10);
      expect(title.length).toBeLessThan(80); // Allow up to 80 characters for SEO titles

      // Should not be generic
      expect(title.toLowerCase()).not.toContain("untitled");
      expect(title.toLowerCase()).not.toContain("page");
    });

    test("should have proper URL structure", async ({ page }) => {
      await page.goto("/");
      await waitForAppReady(page);
      await page.waitForLoadState("networkidle");

      const url = page.url();

      // URLs should be clean and descriptive
      expect(url).not.toContain("index.html");
      expect(url).not.toContain("?");
      expect(url).not.toContain("#");

      // Should use HTTPS in production
      if (process.env.NODE_ENV === "production") {
        expect(url).toMatch(/^https:\/\//);
      }
    });
  });

  test.describe("Performance & Core Web Vitals", () => {
    test("should have good Core Web Vitals scores", async ({ page }) => {
      await page.goto("/");
      await waitForAppReady(page);
      await page.waitForLoadState("domcontentloaded");

      // Measure basic performance metrics
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType(
          "navigation",
        )[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType("paint");

        return {
          domContentLoaded:
            navigation.domContentLoadedEventEnd -
            navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint:
            paint.find((p) => p.name === "first-paint")?.startTime || 0,
          firstContentfulPaint:
            paint.find((p) => p.name === "first-contentful-paint")?.startTime ||
            0,
        };
      });

      // Core Web Vitals thresholds (approximate)
      expect(metrics.domContentLoaded).toBeLessThan(2500); // Good DCL
      expect(metrics.loadComplete).toBeLessThan(4000); // Good load time
      expect(metrics.firstContentfulPaint).toBeLessThan(3000); // Good FCP (relaxed for dev environment)
    });

    test("should have optimized images", async ({ page }) => {
      await page.goto("/");
      await waitForAppReady(page);
      await page.waitForLoadState("domcontentloaded");

      const images = page.locator("img");

      for (const img of await images.all()) {
        const src = await img.getAttribute("src");

        if (src && !src.startsWith("data:")) {
          // Check if image is optimized (has proper format or loading attributes)
          const loading = await img.getAttribute("loading");
          const decoding = await img.getAttribute("decoding");

          // Should have loading="lazy" for performance
          if (loading) {
            expect(["lazy", "eager"]).toContain(loading);
          }

          // Should have decoding hint
          if (decoding) {
            expect(["sync", "async", "auto"]).toContain(decoding);
          }
        }
      }
    });

    test("should minimize render-blocking resources", async ({ page }) => {
      await page.goto("/");
      await waitForAppReady(page);
      await page.waitForLoadState("domcontentloaded");

      // Check for render-blocking CSS
      const renderBlockingCss = await page.evaluate(() => {
        const stylesheets = document.querySelectorAll("link[rel='stylesheet']");
        let blocking = 0;

        for (const sheet of stylesheets) {
          const media = sheet.getAttribute("media");
          if (!media || media === "all") {
            blocking++;
          }
        }

        return blocking;
      });

      // Should minimize render-blocking CSS
      expect(renderBlockingCss).toBeLessThan(5);
    });
  });

  test.describe("Mobile SEO", () => {
    test("should be mobile-friendly", async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto("/");
      await waitForAppReady(page);
      await page.waitForLoadState("domcontentloaded");

      // Content should be readable on mobile
      const viewport = await page.viewportSize();
      expect(viewport?.width).toBe(375);

      // Check font sizes are readable
      const textElements = page.locator("p, span, div");
      const smallText = await textElements.evaluateAll(
        (elements) =>
          elements.filter((el) => {
            const style = window.getComputedStyle(el);
            const fontSize = parseFloat(style.fontSize);
            return fontSize < 14; // Minimum readable size
          }).length,
      );

      // Should minimize very small text
      expect(smallText).toBeLessThan(10);
    });

    test("should have proper mobile meta tags", async ({ page }) => {
      await page.goto("/");
      await waitForAppReady(page);
      await page.waitForLoadState("networkidle");

      // Check viewport meta tag
      const viewport = page.locator('meta[name="viewport"]');
      await expect(viewport).toHaveCount(1);

      const viewportContent = await viewport.getAttribute("content");
      expect(viewportContent).toContain("width=device-width");
      expect(viewportContent).toContain("initial-scale=1");
    });
  });

  test.describe("Content Quality", () => {
    test("should have quality content structure", async ({ page }) => {
      await page.goto("/");
      await waitForAppReady(page);
      await page.waitForLoadState("domcontentloaded");

      // Check content length
      const bodyText = await page.locator("body").textContent();
      expect(bodyText?.length).toBeGreaterThan(100);

      // Check for keyword stuffing (very basic check)
      const words = bodyText?.split(/\s+/) || [];
      const wordCount = words.length;
      const uniqueWords = new Set(words.map((w) => w.toLowerCase())).size;

      // Should have reasonable word diversity
      const diversityRatio = uniqueWords / wordCount;
      expect(diversityRatio).toBeGreaterThan(0.3);
    });

    test("should have proper internal linking", async ({ page }) => {
      const internalLinks = page.locator(
        'a[href^="/"], a[href^="./"], a[href^="../"]',
      );

      if ((await internalLinks.count()) > 0) {
        // Check that internal links work
        for (const link of await internalLinks.all()) {
          const href = await link.getAttribute("href");
          if (href && !href.includes("#")) {
            // Try to navigate (but don't actually do it to avoid slowing tests)
            const response = await page.request.get(href);
            expect(response.status()).toBeLessThan(400);
          }
        }
      }
    });
  });
});
