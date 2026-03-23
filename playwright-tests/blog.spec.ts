import { expect, test } from "@playwright/test";

/**
 * Blog — Listing and Post Page Tests
 *
 * Verifies the blog listing page and individual post pages.
 */

test.describe("Blog — Listing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display blog heading", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Blog");
  });

  test("should display article count badge", async ({ page }) => {
    await expect(page.getByText("Articles Published")).toBeVisible();
  });

  test("should display blog description", async ({ page }) => {
    await expect(
      page.getByText("Insights on cloud architecture"),
    ).toBeVisible();
  });

  test("should display post cards", async ({ page }) => {
    const articles = page.locator("article");
    await expect(articles.first()).toBeVisible();
    const count = await articles.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("should display post titles in cards", async ({ page }) => {
    const firstPostTitle = page.locator("article h2").first();
    await expect(firstPostTitle).toBeVisible();
    const text = await firstPostTitle.textContent();
    expect(text?.length).toBeGreaterThan(0);
  });

  test("should display tags on post cards", async ({ page }) => {
    const tags = page.locator("article").first().locator("span").first();
    await expect(tags).toBeVisible();
  });

  test("should display date and reading time on post cards", async ({
    page,
  }) => {
    await expect(
      page.locator("article").first().getByText(/min( read)?/),
    ).toBeVisible();
  });

  test("should display topics section with tag counts", async ({ page }) => {
    const topicsHeading = page.getByRole("heading", { name: "Topics" });
    await expect(topicsHeading).toBeVisible();
  });

  test("should display featured latest post section", async ({ page }) => {
    await expect(page.getByText("Latest Post")).toBeVisible();
  });

  test("should display 'Read article' hint on featured post hover", async ({
    page,
  }) => {
    const readArticle = page.getByText("Read article");
    await expect(readArticle).toBeAttached();
  });

  test("should navigate to a post when clicking a card", async ({ page }) => {
    // Click the featured post link (the whole article is wrapped in <a>)
    const firstPostLink = page.locator("article").first().locator("..").locator("a").first();
    const postTitle = await page.locator("article h2").first().textContent();
    await firstPostLink.click();
    await page.waitForLoadState("domcontentloaded");

    // Should be on a post page
    expect(page.url()).toContain("/blog/");
    await expect(page.locator("h1")).toContainText(postTitle ?? "");
  });
});

test.describe("Blog — Post Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog/building-resilient-cloud-architectures/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display post title", async ({ page }) => {
    await expect(page.locator("h1")).toContainText(
      "Building Resilient Cloud Architectures",
    );
  });

  test("should display post description", async ({ page }) => {
    await expect(
      page.getByText("practical guide to designing fault-tolerant"),
    ).toBeVisible();
  });

  test("should display author name in article metadata", async ({ page }) => {
    // Scope to the main article area to avoid matching footer/chatbot
    const articleMeta = page.locator("main article");
    await expect(
      articleMeta.getByText("Themistoklis Baltzakis"),
    ).toBeVisible();
  });

  test("should display date", async ({ page }) => {
    await expect(page.getByText("March 20, 2026")).toBeVisible();
  });

  test("should display reading time", async ({ page }) => {
    await expect(page.getByText("min read")).toBeVisible();
  });

  test("should display tags", async ({ page }) => {
    // Scope to the article header to avoid matching nav/footer
    const header = page.locator("main article header");
    await expect(header.getByText("AWS")).toBeVisible();
    await expect(header.getByText("Cloud Architecture")).toBeVisible();
  });

  test("should display article content with headings", async ({ page }) => {
    await expect(page.locator("h2").first()).toBeVisible();
  });

  test("should display code blocks", async ({ page }) => {
    const codeBlock = page.locator("pre code");
    await expect(codeBlock.first()).toBeVisible();
  });

  test("should display back to blog link", async ({ page }) => {
    const backLink = page.getByRole("link", { name: /Back to all posts/i });
    await expect(backLink).toBeVisible();
  });

  test("should navigate back to blog listing", async ({ page }) => {
    const backLink = page
      .getByRole("link", { name: /Back to all posts/i })
      .first();
    await backLink.click();
    await page.waitForURL(/\/blog\//);
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/blog");
    await expect(page.locator("h1")).toContainText("Blog");
  });

  test("should display post navigation (older/newer)", async ({ page }) => {
    const olderLink = page.getByText("Older");
    await expect(olderLink).toBeVisible();
  });

  test("should have breadcrumb structured data", async ({ page }) => {
    const breadcrumbSchema = page.locator(
      'script[type="application/ld+json"]',
    );
    const count = await breadcrumbSchema.count();
    expect(count).toBeGreaterThanOrEqual(1);

    let foundBreadcrumb = false;
    for (let i = 0; i < count; i++) {
      const content = await breadcrumbSchema.nth(i).textContent();
      if (content?.includes("BreadcrumbList")) {
        foundBreadcrumb = true;
        break;
      }
    }
    expect(foundBreadcrumb).toBe(true);
  });

  test("should have article structured data", async ({ page }) => {
    const schemas = page.locator('script[type="application/ld+json"]');
    const count = await schemas.count();

    let foundArticle = false;
    for (let i = 0; i < count; i++) {
      const content = await schemas.nth(i).textContent();
      if (content?.includes("BlogPosting")) {
        foundArticle = true;
        break;
      }
    }
    expect(foundArticle).toBe(true);
  });
});

test.describe("Blog — Navigation", () => {
  test("should have blog link in navigation", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const blogLink = page.getByRole("link", { name: "Blog" });
    await expect(blogLink.first()).toBeVisible();
  });

  test("should highlight blog nav link when on blog page", async ({
    page,
  }) => {
    await page.goto("/blog/");
    await page.waitForLoadState("domcontentloaded");
    const blogLink = page
      .locator("nav")
      .getByRole("link", { name: "Blog" })
      .first();
    await expect(blogLink).toHaveClass(/text-cyan-400/);
  });
});

test.describe("Blog — SEO", () => {
  test("blog listing should have correct meta title", async ({ page }) => {
    await page.goto("/blog/");
    await page.waitForLoadState("domcontentloaded");
    const title = await page.title();
    expect(title).toContain("Blog");
  });

  test("blog post should have correct meta title", async ({ page }) => {
    await page.goto("/blog/building-resilient-cloud-architectures/");
    await page.waitForLoadState("domcontentloaded");
    const title = await page.title();
    expect(title).toContain("Building Resilient Cloud Architectures");
  });

  test("blog listing should have canonical URL", async ({ page }) => {
    await page.goto("/blog/");
    await page.waitForLoadState("domcontentloaded");
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute(
      "href",
      /baltzakisthemis\.com\/blog\//,
    );
  });
});
