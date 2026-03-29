import { expect, test } from "@playwright/test";

/**
 * Blog — Listing and Post Page Tests
 *
 * Verifies the blog listing page, individual post pages, search/filter,
 * table of contents, social sharing, author bio, and related posts.
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

test.describe("Blog — Search & Filtering", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display search input", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search articles...");
    await expect(searchInput).toBeVisible();
  });

  test("should display tag filter pills", async ({ page }) => {
    // Tag pills are buttons within the filter bar
    const tagButtons = page.locator("button").filter({ hasText: /\w+/ });
    const count = await tagButtons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("should filter posts by search query", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search articles...");
    await searchInput.fill("Zero Trust");
    // Should show filtered results count
    await expect(page.getByText(/article[s]? found/)).toBeVisible();
  });

  test("should show clear button when search has text", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search articles...");
    await searchInput.fill("test");
    const clearButton = page.getByLabel("Clear search");
    await expect(clearButton).toBeVisible();
  });

  test("should clear search when clear button is clicked", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search articles...");
    await searchInput.fill("test query");
    await page.getByLabel("Clear search").click();
    await expect(searchInput).toHaveValue("");
  });

  test("should toggle tag filter on click", async ({ page }) => {
    // Find the first tag button and click it
    const firstTag = page.locator("button").filter({ hasText: /^(?!.*Read).*\w+/ }).first();
    await firstTag.click();
    // Active tag should have cyan styling
    await expect(firstTag).toHaveClass(/text-cyan-400/);
  });

  test("should show empty state when no posts match", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search articles...");
    await searchInput.fill("xyznonexistentquery12345");
    await expect(page.getByText("No articles match your search")).toBeVisible();
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

test.describe("Blog — Social Share", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog/building-resilient-cloud-architectures/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display share buttons", async ({ page }) => {
    await expect(page.getByText("Share")).toBeVisible();
  });

  test("should display X share button", async ({ page }) => {
    const xButton = page.getByLabel("Share on X");
    await expect(xButton).toBeVisible();
  });

  test("should display LinkedIn share button", async ({ page }) => {
    const linkedinButton = page.getByLabel("Share on LinkedIn");
    await expect(linkedinButton).toBeVisible();
  });

  test("should display copy link button", async ({ page }) => {
    const copyButton = page.getByLabel("Copy link");
    await expect(copyButton).toBeVisible();
  });
});

test.describe("Blog — Author Bio", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog/building-resilient-cloud-architectures/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display author name in bio", async ({ page }) => {
    const bio = page.locator("section").filter({ hasText: "Cloud Architect & Cybersecurity Specialist" });
    await expect(bio.first()).toBeVisible();
  });

  test("should display author description", async ({ page }) => {
    await expect(
      page.getByText("Building secure, scalable cloud infrastructure"),
    ).toBeVisible();
  });

  test("should display social links in author bio", async ({ page }) => {
    const githubLink = page.getByLabel("GitHub");
    await expect(githubLink.first()).toBeVisible();
    const linkedinLink = page.getByLabel("LinkedIn");
    await expect(linkedinLink.first()).toBeVisible();
  });
});

test.describe("Blog — Table of Contents", () => {
  // TOC only appears on xl+ screens (1280px+)
  test.use({ viewport: { width: 1400, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/blog/zero-trust-network-security/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display table of contents on desktop", async ({ page }) => {
    const toc = page.getByLabel("Table of contents");
    await expect(toc).toBeVisible();
  });

  test("should display 'On this page' heading", async ({ page }) => {
    await expect(page.getByText("On this page")).toBeVisible();
  });

  test("should list article headings in TOC", async ({ page }) => {
    const toc = page.getByLabel("Table of contents");
    // The zero-trust post has multiple h2 headings
    const links = toc.locator("a");
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("should scroll to heading when TOC link is clicked", async ({ page }) => {
    const toc = page.getByLabel("Table of contents");
    const firstLink = toc.locator("a").first();
    await firstLink.click();
    // Wait for smooth scroll
    await page.waitForTimeout(500);
    // The heading should now be near the top of the viewport
    const headingId = await firstLink.getAttribute("href");
    if (headingId) {
      const heading = page.locator(headingId);
      await expect(heading).toBeInViewport();
    }
  });
});

test.describe("Blog — Related Posts", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog/building-resilient-cloud-architectures/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display related articles section", async ({ page }) => {
    await expect(page.getByText("Related Articles")).toBeVisible();
  });

  test("should display related post cards with titles", async ({ page }) => {
    const relatedSection = page.locator("section").filter({ hasText: "Related Articles" });
    const links = relatedSection.locator("a");
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("should link to other blog posts", async ({ page }) => {
    const relatedSection = page.locator("section").filter({ hasText: "Related Articles" });
    const firstLink = relatedSection.locator("a").first();
    const href = await firstLink.getAttribute("href");
    expect(href).toContain("/blog/");
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
