import { expect, test } from "@playwright/test";

/**
 * SEO Tests
 *
 * Comprehensive tests for metadata, OpenGraph tags, canonical URLs,
 * structured data (server-rendered JSON-LD), sitemap, robots.txt,
 * llms.txt, heading hierarchy, and admin noindex.
 */

// ─── Metadata ─────────────────────────────────────────────────────────────────

test.describe("SEO — Metadata", () => {
  const pages = [
    { path: "/", title: "Home", hasOg: true },
    { path: "/about/", title: "About Me", hasOg: true },
    { path: "/contact/", title: "Contact", hasOg: true },
    { path: "/agents/", title: "Understanding AI Agents", hasOg: true },
    { path: "/projects/", title: "Projects", hasOg: true },
    { path: "/resume/", title: "CV Builder", hasOg: true },
    { path: "/performance/", title: "Performance", hasOg: true },
    { path: "/product/", title: "Work Experience", hasOg: true },
    { path: "/blog/", title: "Blog", hasOg: true },
    { path: "/privacy/", title: "Privacy Policy", hasOg: true },
    { path: "/terms/", title: "Terms of Service", hasOg: true },
    { path: "/cookies/", title: "Cookie Policy", hasOg: true },
  ];

  for (const pg of pages) {
    test(`${pg.path} should have title containing "${pg.title}"`, async ({
      page,
    }) => {
      await page.goto(pg.path);
      await expect(page).toHaveTitle(new RegExp(pg.title));
    });

    test(`${pg.path} should have meta description`, async ({ page }) => {
      await page.goto(pg.path);
      const desc = page.locator('meta[name="description"]');
      await expect(desc).toBeAttached();
      const content = await desc.getAttribute("content");
      expect(content).toBeTruthy();
      expect(content!.length).toBeGreaterThan(20);
    });

    if (pg.hasOg) {
      test(`${pg.path} should have OpenGraph tags`, async ({ page }) => {
        await page.goto(pg.path);
        await expect(
          page.locator('meta[property="og:title"]'),
        ).toBeAttached();
        await expect(
          page.locator('meta[property="og:description"]'),
        ).toBeAttached();
        await expect(page.locator('meta[property="og:url"]')).toBeAttached();
      });
    }

    test(`${pg.path} should have canonical URL`, async ({ page }) => {
      await page.goto(pg.path);
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toBeAttached();
      const href = await canonical.getAttribute("href");
      expect(href).toContain("baltzakisthemis.com");
    });
  }

  test("blog post should have article-specific OpenGraph tags", async ({ page }) => {
    await page.goto("/blog/building-resilient-cloud-architectures/");
    await expect(page.locator('meta[property="og:type"][content="article"]')).toBeAttached();
    await expect(page.locator('meta[property="og:image"]')).toBeAttached();
    await expect(page.locator('meta[name="twitter:card"]')).toBeAttached();
  });
});

// ─── Structured Data ──────────────────────────────────────────────────────────

test.describe("SEO — Structured Data", () => {
  test("home page should have WebSite JSON-LD (server-rendered)", async ({ page }) => {
    await page.goto("/");
    // JSON-LD is server-rendered — no waitForFunction needed
    const scripts = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const hasWebSite = scripts.some((s) => s.includes('"WebSite"'));
    expect(hasWebSite).toBe(true);
  });

  test("home page should have Person JSON-LD (server-rendered)", async ({ page }) => {
    await page.goto("/");
    const scripts = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const hasPerson = scripts.some((s) => s.includes('"Person"'));
    expect(hasPerson).toBe(true);
  });

  test("home page should have ProfilePage JSON-LD", async ({ page }) => {
    await page.goto("/");
    const scripts = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const hasProfilePage = scripts.some((s) => s.includes('"ProfilePage"'));
    expect(hasProfilePage).toBe(true);
  });

  test("structured data should use @id for entity linking", async ({ page }) => {
    await page.goto("/");
    const scripts = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const personScript = scripts.find((s) => s.includes('"Person"'));
    expect(personScript).toContain('"@id"');
    expect(personScript).toContain("/#person");
  });

  test("about page should have BreadcrumbList JSON-LD", async ({ page }) => {
    await page.goto("/about/");
    const scripts = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const hasBreadcrumb = scripts.some((s) => s.includes('"BreadcrumbList"'));
    expect(hasBreadcrumb).toBe(true);
  });

  test("blog post should have BlogPosting JSON-LD", async ({ page }) => {
    await page.goto("/blog/building-resilient-cloud-architectures/");
    const scripts = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const hasBlogPosting = scripts.some((s) => s.includes('"BlogPosting"'));
    expect(hasBlogPosting).toBe(true);
  });

  test("blog post BlogPosting should have publisher and mainEntityOfPage", async ({ page }) => {
    await page.goto("/blog/building-resilient-cloud-architectures/");
    const scripts = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const blogPosting = scripts.find((s) => s.includes('"BlogPosting"'));
    expect(blogPosting).toBeDefined();
    expect(blogPosting).toContain('"publisher"');
    expect(blogPosting).toContain('"mainEntityOfPage"');
    expect(blogPosting).toContain('"image"');
    expect(blogPosting).toContain('"inLanguage"');
  });
});

// ─── Sitemap & Robots ─────────────────────────────────────────────────────────

test.describe("SEO — Sitemap & Robots", () => {
  test("sitemap.xml should be accessible", async ({ page }) => {
    const res = await page.goto("/sitemap.xml");
    expect(res?.status()).toBe(200);
  });

  test("robots.txt should be accessible and allow AI crawlers", async ({ page }) => {
    const res = await page.goto("/robots.txt");
    expect(res?.status()).toBe(200);
    const text = await page.textContent("body");
    expect(text).toContain("Sitemap:");
    expect(text).toContain("Disallow: /admin/");
    // AI crawler rules
    expect(text).toContain("GPTBot");
    expect(text).toContain("ClaudeBot");
    expect(text).toContain("PerplexityBot");
  });

  test("sitemap should contain all public pages including blog", async ({ page }) => {
    await page.goto("/sitemap.xml");
    const text = (await page.textContent("body")) ?? "";
    const expectedPaths = [
      "/about/",
      "/contact/",
      "/agents/",
      "/projects/",
      "/resume/",
      "/performance/",
      "/product/",
      "/builder/",
      "/blog/",
      "/privacy/",
      "/terms/",
      "/cookies/",
    ];
    for (const path of expectedPaths) {
      expect(text).toContain(path);
    }
  });

  test("sitemap should contain blog post URLs", async ({ page }) => {
    await page.goto("/sitemap.xml");
    const text = (await page.textContent("body")) ?? "";
    expect(text).toContain("/blog/building-resilient-cloud-architectures/");
    expect(text).toContain("/blog/nextjs-static-export-production/");
    expect(text).toContain("/blog/zero-trust-network-security/");
  });

  test("sitemap should NOT contain admin page", async ({ page }) => {
    await page.goto("/sitemap.xml");
    const text = (await page.textContent("body")) ?? "";
    expect(text).not.toContain("/admin/");
  });

  test("sitemap should include lastmod dates", async ({ page }) => {
    await page.goto("/sitemap.xml");
    const text = (await page.textContent("body")) ?? "";
    expect(text).toContain("<lastmod>");
  });

  test("robots.txt should reference llms.txt", async ({ page }) => {
    const res = await page.goto("/robots.txt");
    expect(res?.status()).toBe(200);
    const text = await page.textContent("body");
    expect(text).toContain("llms.txt");
  });
});

// ─── AI Visibility ───────────────────────────────────────────────────────────

test.describe("SEO — AI Visibility", () => {
  test("llms.txt should be accessible", async ({ page }) => {
    const res = await page.goto("/llms.txt");
    expect(res?.status()).toBe(200);
    const text = await page.textContent("body");
    expect(text).toContain("Themistoklis Baltzakis");
    expect(text).toContain("## About");
    expect(text).toContain("## Blog");
  });

  test("llms.txt should reference llms-full.txt", async ({ page }) => {
    const res = await page.goto("/llms.txt");
    expect(res?.status()).toBe(200);
    const text = await page.textContent("body");
    expect(text).toContain("llms-full.txt");
    expect(text).toContain("## Expertise");
    expect(text).toContain("## Projects");
  });

  test("llms-full.txt should be accessible", async ({ page }) => {
    const res = await page.goto("/llms-full.txt");
    expect(res?.status()).toBe(200);
    const text = await page.textContent("body");
    expect(text).toContain("Themistoklis Baltzakis");
    expect(text).toContain("## Professional Summary");
    expect(text).toContain("## Services");
  });
});

// ─── Admin noindex ────────────────────────────────────────────────────────────

test.describe("SEO — Admin noindex", () => {
  test("admin page should have noindex", async ({ page }) => {
    await page.goto("/admin/");
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toBeAttached();
    const content = await robots.getAttribute("content");
    expect(content).toContain("noindex");
  });
});

// ─── Heading Hierarchy ────────────────────────────────────────────────────────

test.describe("SEO — Heading Hierarchy", () => {
  const pagesWithH1 = [
    { path: "/", h1Pattern: /Themistoklis|Baltzakis/i },
    { path: "/about/", h1Pattern: /About Me/i },
    { path: "/contact/", h1Pattern: /Get In Touch/i },
    { path: "/agents/", h1Pattern: /AI Agents/i },
    { path: "/performance/", h1Pattern: /Performance/i },
    { path: "/blog/", h1Pattern: /Blog/i },
  ];

  for (const pg of pagesWithH1) {
    test(`${pg.path} should have proper H1`, async ({ page }) => {
      await page.goto(pg.path);
      const h1 = page.locator("h1").first();
      await expect(h1).toBeVisible();
      await expect(h1).toHaveText(pg.h1Pattern);
    });
  }
});

// ─── Resource Hints ──────────────────────────────────────────────────────────

test.describe("SEO — Resource Hints", () => {
  test("should have preconnect for Google Tag Manager", async ({ page }) => {
    await page.goto("/");
    const preconnect = page.locator('link[rel="preconnect"][href*="googletagmanager"]');
    await expect(preconnect).toBeAttached();
  });
});
