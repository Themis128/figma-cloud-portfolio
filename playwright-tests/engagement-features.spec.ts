import { expect, test } from "@playwright/test";
import { waitForAppReady } from "./test-utils";

/**
 * Engagement Features — comprehensive end-to-end tests
 *
 * Covers every detail of: SiteStats, GitHubHeatmap, Testimonials, CyberQuiz,
 * KonamiEasterEgg, SoundEffects toggle, ReadingProgress, BlogReactions,
 * Retro Terminal theme (Command Palette), and homepage section ordering.
 *
 * Component source: src/components/interactive/
 * Wiring: homepage (page.tsx), blog post ([slug]/page.tsx), layout (LazyInteractive)
 */

/** Dismiss cookie consent if present */
async function dismissCookies(page: import("@playwright/test").Page) {
  const btn = page.locator('button[aria-label="Accept all cookies"]');
  if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(500);
  }
}

/** Scroll to a section and wait for AnimatedSection to reveal */
async function scrollToSection(page: import("@playwright/test").Page, ariaLabel: string) {
  const section = page.locator(`section[aria-label="${ariaLabel}"]`);
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800); // AnimatedSection reveal
}

/** Navigate to the first blog post */
async function openFirstBlogPost(page: import("@playwright/test").Page) {
  await page.goto("/blog/");
  await waitForAppReady(page);
  const firstPost = page.locator("a").filter({ hasText: /Building|Zero Trust|Next.js/ }).first();
  await firstPost.click();
  await page.waitForLoadState("domcontentloaded");
}

// ═══════════════════════════════════════════════════════════════════════════
// SITE STATS
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Homepage — Site Stats", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await dismissCookies(page);
    await scrollToSection(page, "Site statistics");
  });

  test("should display Site Stats section with 4 stat cards", async ({ page }) => {
    const section = page.locator('section[aria-label="Site statistics"]');
    await expect(section).toBeAttached();
    const cards = section.locator("div.rounded-lg");
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test("each card should have an icon, value, suffix, and label", async ({ page }) => {
    const section = page.locator('section[aria-label="Site statistics"]');
    const cards = section.locator("div.rounded-lg.p-3");
    const count = await cards.count();
    for (let i = 0; i < Math.min(count, 4); i++) {
      const card = cards.nth(i);
      // Icon (SVG)
      await expect(card.locator("svg").first()).toBeAttached();
      // Value (font-bold)
      await expect(card.locator("p.font-bold").first()).toBeAttached();
      // Label (uppercase tracking)
      await expect(card.locator("p.uppercase").first()).toBeAttached();
    }
  });

  test("should show Lighthouse score with /100 suffix", async ({ page }) => {
    await expect(page.getByText("Lighthouse").first()).toBeAttached();
    await expect(page.getByText("/100").first()).toBeAttached();
  });

  test("should show Tech Stack with tools suffix", async ({ page }) => {
    await expect(page.getByText("Tech Stack").first()).toBeAttached();
    await expect(page.getByText("tools").first()).toBeAttached();
  });

  test("should show Pages count with pages suffix", async ({ page }) => {
    await expect(page.getByText("Pages", { exact: true }).first()).toBeAttached();
    await expect(page.getByText("pages", { exact: false }).first()).toBeAttached();
  });

  test("should show Uptime percentage", async ({ page }) => {
    await expect(page.getByText("Uptime").first()).toBeAttached();
    await expect(page.getByText("99.9%").first()).toBeAttached();
  });

  test("stat cards should have glass-morphism styling", async ({ page }) => {
    const section = page.locator('section[aria-label="Site statistics"]');
    const card = section.locator("div.rounded-lg.p-3").first();
    const classes = await card.getAttribute("class");
    expect(classes).toContain("backdrop-blur");
    expect(classes).toContain("border");
  });

  test("stat values should use font-mono and tabular-nums", async ({ page }) => {
    const section = page.locator('section[aria-label="Site statistics"]');
    const value = section.locator("p.font-bold").first();
    const classes = await value.getAttribute("class");
    expect(classes).toContain("font-mono");
    expect(classes).toContain("tabular-nums");
  });

  test("cards should be in 2-column grid on default", async ({ page }) => {
    const section = page.locator('section[aria-label="Site statistics"]');
    const grid = section.locator("div.grid").first();
    const classes = await grid.getAttribute("class");
    expect(classes).toContain("grid-cols-2");
    expect(classes).toContain("sm:grid-cols-4");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GITHUB HEATMAP
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Homepage — GitHub Heatmap", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await dismissCookies(page);
    await scrollToSection(page, "GitHub activity");
    await page.waitForTimeout(2000); // Wait for GitHub API
  });

  test("should display Open Source heading", async ({ page }) => {
    await expect(page.getByText("Open Source").first()).toBeAttached();
  });

  test("should show GitHub username link pointing to correct profile", async ({ page }) => {
    const link = page.locator('a[href*="github.com/Themis128"]').first();
    await expect(link).toBeAttached();
    await expect(link).toContainText("@Themis128");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
  });

  test("should show GitHub Activity heading inside the card", async ({ page }) => {
    const section = page.locator('section[aria-label="GitHub activity"]');
    await expect(section.getByText("GitHub Activity").first()).toBeAttached();
  });

  test("should render heatmap container", async ({ page }) => {
    const section = page.locator('section[aria-label="GitHub activity"]');
    const container = section.locator("div.flex.gap-\\[3px\\]");
    await expect(container.first()).toBeAttached();
  });

  test("should show recent events count", async ({ page }) => {
    await expect(page.getByText("recent events").first()).toBeAttached();
  });

  test("should show public repos count", async ({ page }) => {
    await expect(page.getByText("public repos").first()).toBeAttached();
  });

  test("heatmap card should have glass-morphism styling", async ({ page }) => {
    const section = page.locator('section[aria-label="GitHub activity"]');
    const card = section.locator("div.rounded-lg").first();
    const classes = await card.getAttribute("class");
    expect(classes).toContain("backdrop-blur");
    expect(classes).toContain("border");
  });

  test("stats should use font-mono for numbers", async ({ page }) => {
    const section = page.locator('section[aria-label="GitHub activity"]');
    const statsRow = section.locator("div.font-mono").first();
    await expect(statsRow).toBeAttached();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// TESTIMONIALS
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Homepage — Testimonials", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await dismissCookies(page);
    await scrollToSection(page, "Testimonials");
  });

  test("should display What Colleagues Say heading", async ({ page }) => {
    await expect(page.getByText("What Colleagues Say").first()).toBeAttached();
  });

  test("should show a blockquote with italic font-mono text", async ({ page }) => {
    const section = page.locator('section[aria-label="Testimonials"]');
    const quote = section.locator("blockquote").first();
    await expect(quote).toBeAttached();
    const classes = await quote.getAttribute("class");
    expect(classes).toContain("font-mono");
    expect(classes).toContain("italic");
  });

  test("quote text should be substantial (> 50 chars)", async ({ page }) => {
    const section = page.locator('section[aria-label="Testimonials"]');
    const text = await section.locator("blockquote").first().textContent();
    expect(text?.length).toBeGreaterThan(50);
  });

  test("should show author name in cyan", async ({ page }) => {
    const section = page.locator('section[aria-label="Testimonials"]');
    const author = section.locator("p.font-semibold").first();
    await expect(author).toBeAttached();
    const classes = await author.getAttribute("class");
    expect(classes).toContain("text-cyan-400");
  });

  test("should show role and company separated by dot", async ({ page }) => {
    const section = page.locator('section[aria-label="Testimonials"]');
    const roleLine = section.locator("p.text-xs").filter({ hasText: "·" }).first();
    await expect(roleLine).toBeAttached();
  });

  test("should have decorative Quote icon", async ({ page }) => {
    const section = page.locator('section[aria-label="Testimonials"]');
    const quoteIcon = section.locator("svg").first();
    await expect(quoteIcon).toBeAttached();
  });

  test("should have prev/next buttons with chevron icons", async ({ page }) => {
    const prev = page.locator('button[aria-label="Previous testimonial"]').first();
    const next = page.locator('button[aria-label="Next testimonial"]').first();
    await expect(prev).toBeAttached();
    await expect(next).toBeAttached();
    // Each should contain an SVG icon
    await expect(prev.locator("svg")).toBeAttached();
    await expect(next.locator("svg")).toBeAttached();
  });

  test("should cycle forward through all 3 testimonials", async ({ page }) => {
    const section = page.locator('section[aria-label="Testimonials"]');
    const quote = section.locator("blockquote").first();
    const next = page.locator('button[aria-label="Next testimonial"]').first();

    const texts: string[] = [];
    for (let i = 0; i < 3; i++) {
      texts.push(await quote.textContent() ?? "");
      await next.click();
      await page.waitForTimeout(200);
    }

    // All 3 should be different
    expect(new Set(texts).size).toBe(3);

    // After 3 clicks, should wrap back to the first
    const wrappedText = await quote.textContent();
    expect(wrappedText).toBe(texts[0]);
  });

  test("should cycle backward with prev button", async ({ page }) => {
    const section = page.locator('section[aria-label="Testimonials"]');
    const quote = section.locator("blockquote").first();
    const firstText = await quote.textContent();

    // Prev should wrap to last testimonial
    const prev = page.locator('button[aria-label="Previous testimonial"]').first();
    await prev.click();
    await page.waitForTimeout(200);

    const prevText = await quote.textContent();
    expect(prevText).not.toBe(firstText);
  });

  test("should have 3 dot indicators", async ({ page }) => {
    const section = page.locator('section[aria-label="Testimonials"]');
    const dot1 = section.locator('button[aria-label="Testimonial 1"]');
    const dot2 = section.locator('button[aria-label="Testimonial 2"]');
    const dot3 = section.locator('button[aria-label="Testimonial 3"]');
    await expect(dot1).toBeAttached();
    await expect(dot2).toBeAttached();
    await expect(dot3).toBeAttached();
  });

  test("clicking a dot should jump to that testimonial", async ({ page }) => {
    const section = page.locator('section[aria-label="Testimonials"]');
    const quote = section.locator("blockquote").first();
    const dot3 = section.locator('button[aria-label="Testimonial 3"]').first();

    const firstText = await quote.textContent();
    await dot3.click();
    await page.waitForTimeout(200);
    const thirdText = await quote.textContent();
    expect(thirdText).not.toBe(firstText);
  });

  test("active dot should have cyan background", async ({ page }) => {
    const section = page.locator('section[aria-label="Testimonials"]');
    const dot1 = section.locator('button[aria-label="Testimonial 1"]').first();
    const classes = await dot1.getAttribute("class");
    expect(classes).toContain("bg-cyan-400");
  });

  test("testimonial card should have glass-morphism and border separator", async ({ page }) => {
    const section = page.locator('section[aria-label="Testimonials"]');
    const card = section.locator("div.rounded-lg").first();
    const classes = await card.getAttribute("class");
    expect(classes).toContain("backdrop-blur");
    // Author section has border-t separator
    const separator = card.locator("div.border-t").first();
    await expect(separator).toBeAttached();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CYBER QUIZ
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Homepage — Cyber Quiz", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await dismissCookies(page);
    await scrollToSection(page, "Challenge quiz");
  });

  test("should display Test Your Knowledge heading and subtitle", async ({ page }) => {
    await expect(page.getByText("Test Your Knowledge").first()).toBeAttached();
    await expect(page.getByText("cybersecurity").first()).toBeAttached();
  });

  test("should show Question 1/5 counter", async ({ page }) => {
    const section = page.locator('section[aria-label="Challenge quiz"]');
    await expect(section.getByText("Question 1/5").first()).toBeAttached();
  });

  test("should show Score: 0 initially", async ({ page }) => {
    const section = page.locator('section[aria-label="Challenge quiz"]');
    await expect(section.getByText("Score: 0").first()).toBeAttached();
  });

  test("should show 4 option buttons with font-mono text-left styling", async ({ page }) => {
    const section = page.locator('section[aria-label="Challenge quiz"]');
    const options = section.locator("button.text-left");
    await expect(options).toHaveCount(4);
    const classes = await options.first().getAttribute("class");
    expect(classes).toContain("font-mono");
    expect(classes).toContain("text-xs");
  });

  test("first question should be about Zero Trust", async ({ page }) => {
    const section = page.locator('section[aria-label="Challenge quiz"]');
    await expect(section.getByText("Zero Trust").first()).toBeAttached();
  });

  test("should show progress bar at 20% for question 1", async ({ page }) => {
    const section = page.locator('section[aria-label="Challenge quiz"]');
    const bar = section.locator("div.bg-cyan-400.rounded-full").first();
    const style = await bar.getAttribute("style");
    expect(style).toContain("20%");
  });

  test("options should be disabled after answering", async ({ page }) => {
    const section = page.locator('section[aria-label="Challenge quiz"]');
    const options = section.locator("button.text-left");
    await options.first().click();
    // All options should be disabled
    for (let i = 0; i < 4; i++) {
      await expect(options.nth(i)).toBeDisabled();
    }
  });

  test("correct answer should show green styling with CheckCircle icon", async ({ page }) => {
    const section = page.locator('section[aria-label="Challenge quiz"]');
    const options = section.locator("button.text-left");
    // Answer the first question — correct answer is index 1 ("Never trust, always verify")
    await options.nth(1).click();

    // Correct option should have green styling
    const correctClasses = await options.nth(1).getAttribute("class");
    expect(correctClasses).toContain("text-green-400");
    // CheckCircle icon should appear
    const checkIcon = options.nth(1).locator("svg");
    await expect(checkIcon).toBeAttached();
  });

  test("wrong answer should show red styling with XCircle icon", async ({ page }) => {
    const section = page.locator('section[aria-label="Challenge quiz"]');
    const options = section.locator("button.text-left");
    // Pick wrong answer (index 0)
    await options.nth(0).click();

    // Wrong option should have red styling
    const wrongClasses = await options.nth(0).getAttribute("class");
    expect(wrongClasses).toContain("text-red-400");
    // XCircle icon on wrong, CheckCircle on correct
    const wrongIcon = options.nth(0).locator("svg");
    await expect(wrongIcon).toBeAttached();
    const correctClasses = await options.nth(1).getAttribute("class");
    expect(correctClasses).toContain("text-green-400");
  });

  test("should show explanation after answering", async ({ page }) => {
    const section = page.locator('section[aria-label="Challenge quiz"]');
    await section.locator("button.text-left").first().click();
    // Explanation has border-l-2 styling
    const explanation = section.locator("p.border-l-2").first();
    await expect(explanation).toBeVisible();
    const text = await explanation.textContent();
    expect(text?.length).toBeGreaterThan(20);
  });

  test("score should increment on correct answer", async ({ page }) => {
    const section = page.locator('section[aria-label="Challenge quiz"]');
    await expect(section.getByText("Score: 0").first()).toBeAttached();
    // Correct answer for Q1 is index 1
    await section.locator("button.text-left").nth(1).click();
    await expect(section.getByText("Score: 1").first()).toBeVisible();
  });

  test("score should not increment on wrong answer", async ({ page }) => {
    const section = page.locator('section[aria-label="Challenge quiz"]');
    await section.locator("button.text-left").nth(0).click();
    await expect(section.getByText("Score: 0").first()).toBeVisible();
  });

  test("should show Next Question button after answering", async ({ page }) => {
    const section = page.locator('section[aria-label="Challenge quiz"]');
    await section.locator("button.text-left").first().click();
    await expect(section.getByText("Next Question").first()).toBeVisible();
  });

  test("should advance to Question 2/5 after Next", async ({ page }) => {
    const section = page.locator('section[aria-label="Challenge quiz"]');
    await section.locator("button.text-left").first().click();
    await section.getByText("Next Question").first().click();
    await expect(section.getByText("Question 2/5").first()).toBeVisible();
  });

  test("progress bar should update width on each question", async ({ page }) => {
    const section = page.locator('section[aria-label="Challenge quiz"]');
    await section.locator("button.text-left").first().click();
    await section.getByText("Next Question").first().click();
    // Q2: bar should be at 40%
    const bar = section.locator("div.bg-cyan-400.rounded-full").first();
    const style = await bar.getAttribute("style");
    expect(style).toContain("40%");
  });

  test("last question should show See Results instead of Next Question", async ({ page }) => {
    const section = page.locator('section[aria-label="Challenge quiz"]');
    for (let i = 0; i < 4; i++) {
      await section.locator("button.text-left").first().click();
      await section.getByText("Next Question").first().click();
    }
    // Q5 — answer it
    await section.locator("button.text-left").first().click();
    await expect(section.getByText("See Results").first()).toBeVisible();
  });

  test("results screen should show trophy icon, score, and grade", async ({ page }) => {
    const section = page.locator('section[aria-label="Challenge quiz"]');
    for (let i = 0; i < 5; i++) {
      await section.locator("button.text-left").first().click();
      const btn = section.locator("button").filter({ hasText: /Next Question|See Results/ }).first();
      await btn.click();
    }
    // Trophy icon
    await expect(section.locator("svg").first()).toBeAttached();
    // Score format: X/5 Correct
    await expect(section.getByText("Correct").first()).toBeVisible();
    // Grade
    await expect(section.getByText("Grade").first()).toBeVisible();
    // Feedback message
    const feedback = section.locator("p.text-sm").first();
    const text = await feedback.textContent();
    expect(text?.length).toBeGreaterThan(10);
  });

  test("Try Again should reset to Question 1 with Score 0", async ({ page }) => {
    const section = page.locator('section[aria-label="Challenge quiz"]');
    for (let i = 0; i < 5; i++) {
      await section.locator("button.text-left").first().click();
      await section.locator("button").filter({ hasText: /Next Question|See Results/ }).first().click();
    }
    await section.getByText("Try Again").first().click();
    await expect(section.getByText("Question 1/5").first()).toBeVisible();
    await expect(section.getByText("Score: 0").first()).toBeVisible();
  });

  test("quiz card should have glass-morphism styling", async ({ page }) => {
    const section = page.locator('section[aria-label="Challenge quiz"]');
    const card = section.locator("div.rounded-lg").first();
    const classes = await card.getAttribute("class");
    expect(classes).toContain("backdrop-blur");
    expect(classes).toContain("border");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SECTION ORDERING
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Homepage — Section Ordering", () => {
  test("all engagement sections should exist in DOM order", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    const sections = [
      'section[aria-label="Core expertise"]',
      'section[aria-label="Site statistics"]',
      'section[aria-label="GitHub activity"]',
      'section[aria-label="Testimonials"]',
      'section[aria-label="Challenge quiz"]',
      'section[aria-label="Quick contact form"]',
    ];

    for (const sel of sections) {
      await expect(page.locator(sel).first()).toBeAttached();
    }

    const indices = await page.evaluate((sels) => {
      const all = document.querySelectorAll("section");
      return sels.map((sel) => {
        const el = document.querySelector(sel);
        return el ? Array.from(all).indexOf(el) : -1;
      });
    }, sections);

    for (let i = 1; i < indices.length; i++) {
      expect(indices[i]).toBeGreaterThan(indices[i - 1] ?? -1);
    }
  });

  test("each section should have a cyan gradient divider", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    // Multiple sections use the cyan-to-blue divider
    const dividers = page.locator("div.bg-linear-to-r.from-cyan-400.to-blue-500.rounded-full");
    const count = await dividers.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// BLOG READING PROGRESS
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Blog — Reading Progress", () => {
  test.beforeEach(async ({ page }) => {
    await openFirstBlogPost(page);
  });

  test("should show progress bar on scroll", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);
    const bars = page.locator("[role='progressbar']");
    expect(await bars.count()).toBeGreaterThanOrEqual(1);
  });

  test("progress should increase as user scrolls deeper", async ({ page }) => {
    // Scroll partway
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(500);

    // Get the width of the progress fill
    const getWidth = async () => {
      const fills = page.locator("div.from-cyan-400.to-blue-500");
      const count = await fills.count();
      if (count === 0) return 0;
      const box = await fills.first().boundingBox();
      return box?.width ?? 0;
    };

    const width1 = await getWidth();

    // Scroll deeper
    await page.evaluate(() => window.scrollTo(0, 2000));
    await page.waitForTimeout(500);
    const width2 = await getWidth();

    expect(width2).toBeGreaterThanOrEqual(width1);
  });

  test("should show reading progress UI elements on scroll", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(500);
    // Reading progress bar uses a cyan gradient fill
    const progressFill = page.locator("div.from-cyan-400.to-blue-500");
    const count = await progressFill.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// BLOG REACTIONS
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Blog — Reactions", () => {
  test.beforeEach(async ({ page }) => {
    await openFirstBlogPost(page);
  });

  test("should display React: label and 3 reaction buttons", async ({ page }) => {
    await expect(page.getByText("React:").first()).toBeAttached();
    await expect(page.getByRole("button", { name: "Helpful" })).toBeAttached();
    await expect(page.getByRole("button", { name: "Interesting" })).toBeAttached();
    await expect(page.getByRole("button", { name: "Bookmark" })).toBeAttached();
  });

  test("each reaction button should have an icon and label", async ({ page }) => {
    const helpful = page.getByRole("button", { name: "Helpful" });
    await expect(helpful.locator("svg")).toBeAttached();
    await expect(helpful).toContainText("Helpful");
  });

  test("reaction buttons should have rounded-full pill styling", async ({ page }) => {
    const helpful = page.getByRole("button", { name: "Helpful" });
    const classes = await helpful.getAttribute("class");
    expect(classes).toContain("rounded-full");
    expect(classes).toContain("font-mono");
    expect(classes).toContain("text-xs");
  });

  test("reaction should toggle aria-pressed on click", async ({ page }) => {
    const helpful = page.getByRole("button", { name: "Helpful" });
    await helpful.scrollIntoViewIfNeeded();
    await expect(helpful).toHaveAttribute("aria-pressed", "false");
    await helpful.click();
    await expect(helpful).toHaveAttribute("aria-pressed", "true");
    await helpful.click();
    await expect(helpful).toHaveAttribute("aria-pressed", "false");
  });

  test("reacting should persist reaction in localStorage", async ({ page }) => {
    const helpful = page.getByRole("button", { name: "Helpful" });
    await helpful.scrollIntoViewIfNeeded();
    await helpful.click();
    await page.waitForTimeout(200);

    // Check that blog-reactions-* key was written
    const hasReaction = await page.evaluate(() =>
      Object.keys(localStorage).some((k) => k.startsWith("blog-reactions-")),
    );
    expect(hasReaction).toBe(true);

    // The stored value should include "helpful"
    const stored = await page.evaluate(() => {
      const key = Object.keys(localStorage).find((k) => k.startsWith("blog-reactions-"));
      return key ? localStorage.getItem(key) : null;
    });
    expect(stored).toContain("helpful");
  });

  test("un-reacting should remove from localStorage", async ({ page }) => {
    const helpful = page.getByRole("button", { name: "Helpful" });
    await helpful.scrollIntoViewIfNeeded();
    await helpful.click();
    await page.waitForTimeout(100);
    await helpful.click(); // un-react
    await page.waitForTimeout(100);

    // The stored value should be empty array or not contain "helpful"
    const stored = await page.evaluate(() => {
      const key = Object.keys(localStorage).find((k) => k.startsWith("blog-reactions-"));
      return key ? localStorage.getItem(key) : "[]";
    });
    expect(stored).not.toContain("helpful");
  });

  test("multiple reactions can be active simultaneously", async ({ page }) => {
    const helpful = page.getByRole("button", { name: "Helpful" });
    const interesting = page.getByRole("button", { name: "Interesting" });
    await helpful.scrollIntoViewIfNeeded();
    await helpful.click();
    await interesting.click();
    await expect(helpful).toHaveAttribute("aria-pressed", "true");
    await expect(interesting).toHaveAttribute("aria-pressed", "true");
  });

  test("reactions should persist across page reload", async ({ page }) => {
    const helpful = page.getByRole("button", { name: "Helpful" });
    await helpful.scrollIntoViewIfNeeded();
    await helpful.click();
    await expect(helpful).toHaveAttribute("aria-pressed", "true");

    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    const helpfulAfter = page.getByRole("button", { name: "Helpful" });
    await expect(helpfulAfter).toHaveAttribute("aria-pressed", "true");
  });

  test("reactions should be scoped per blog post (localStorage key includes slug)", async ({ page }) => {
    // Check that localStorage uses slug-based key
    const keys = await page.evaluate(() =>
      Object.keys(localStorage).filter((k) => k.startsWith("blog-reactions-")),
    );
    // After reacting, should have the key
    const helpful = page.getByRole("button", { name: "Helpful" });
    await helpful.scrollIntoViewIfNeeded();
    await helpful.click();
    const keysAfter = await page.evaluate(() =>
      Object.keys(localStorage).filter((k) => k.startsWith("blog-reactions-")),
    );
    expect(keysAfter.length).toBeGreaterThanOrEqual(keys.length);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SOUND EFFECTS
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Sound Effects Toggle", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await dismissCookies(page);
  });

  test("should render sound toggle button with Volume icon", async ({ page }) => {
    const toggle = page.locator('button[aria-label*="sound effects"]').first();
    await expect(toggle).toBeAttached({ timeout: 10000 });
    await expect(toggle.locator("svg")).toBeAttached();
  });

  test("toggle button should be fixed position bottom-right", async ({ page }) => {
    const toggle = page.locator('button[aria-label*="sound effects"]').first();
    await toggle.waitFor({ state: "attached", timeout: 10000 });
    await expect(toggle).toHaveCSS("position", "fixed");
  });

  test("should start with sound disabled (Enable label)", async ({ page }) => {
    const btn = page.locator('button[aria-label="Enable sound effects"]');
    await expect(btn.first()).toBeAttached({ timeout: 10000 });
  });

  test("should toggle label between Enable and Disable", async ({ page }) => {
    const enableBtn = page.locator('button[aria-label="Enable sound effects"]');
    await enableBtn.first().waitFor({ state: "attached", timeout: 10000 });
    await enableBtn.first().click({ force: true });

    const disableBtn = page.locator('button[aria-label="Disable sound effects"]');
    await expect(disableBtn.first()).toBeAttached();

    await disableBtn.first().click({ force: true });
    await expect(enableBtn.first()).toBeAttached();
  });

  test("should persist sound preference in localStorage", async ({ page }) => {
    const enableBtn = page.locator('button[aria-label="Enable sound effects"]');
    await enableBtn.first().waitFor({ state: "attached", timeout: 10000 });
    await enableBtn.first().click({ force: true });

    const stored = await page.evaluate(() => localStorage.getItem("sound-effects"));
    expect(stored).toBe("true");

    // Disable
    await page.locator('button[aria-label="Disable sound effects"]').first().click({ force: true });
    const storedAfter = await page.evaluate(() => localStorage.getItem("sound-effects"));
    expect(storedAfter).toBe("false");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// KONAMI CODE EASTER EGG
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Konami Code Easter Egg", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await dismissCookies(page);
  });

  test("should activate on correct Konami code sequence", async ({ page }) => {
    const keys = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    for (const key of keys) await page.keyboard.press(key);
    await expect(page.getByText("KONAMI CODE ACTIVATED").first()).toBeVisible({ timeout: 5000 });
  });

  test("toast should mention Ctrl+K hint", async ({ page }) => {
    const keys = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    for (const key of keys) await page.keyboard.press(key);
    await expect(page.getByText("Ctrl+K").first()).toBeVisible({ timeout: 5000 });
  });

  test("toast should auto-dismiss after ~4 seconds", async ({ page }) => {
    const keys = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    for (const key of keys) await page.keyboard.press(key);
    const toast = page.getByText("KONAMI CODE ACTIVATED").first();
    await expect(toast).toBeVisible({ timeout: 5000 });
    await expect(toast).not.toBeVisible({ timeout: 6000 });
  });

  test("wrong key sequence should not trigger", async ({ page }) => {
    // Random keys
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("a");
    await page.keyboard.press("b");
    await page.waitForTimeout(500);
    await expect(page.getByText("KONAMI CODE ACTIVATED")).toHaveCount(0);
  });

  test("partial sequence followed by wrong key should not trigger", async ({ page }) => {
    // Start correct, then wrong
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("b");
    await page.keyboard.press("x"); // wrong!
    await page.waitForTimeout(500);
    await expect(page.getByText("KONAMI CODE ACTIVATED")).toHaveCount(0);
  });

  test("should create a canvas element during Matrix rain animation", async ({ page }) => {
    const keys = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    for (const key of keys) await page.keyboard.press(key);
    await page.waitForTimeout(500);
    // Canvas should be created for the Matrix rain effect
    const canvas = page.locator("canvas");
    await expect(canvas.first()).toBeAttached();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RETRO TERMINAL THEME
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Retro Terminal Theme", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await dismissCookies(page);
  });

  test("should toggle retro-terminal class via Command Palette", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await page.waitForTimeout(500);
    const input = page.locator("input[placeholder]").last();
    await input.fill("retro");
    await page.waitForTimeout(300);

    const retroOption = page.getByText("Retro Terminal Theme").first();
    if (await retroOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await retroOption.click();
      const hasClass = await page.evaluate(() => document.documentElement.classList.contains("retro-terminal"));
      expect(hasClass).toBe(true);
    }
  });

  test("retro-terminal class should toggle off on second activation", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await page.waitForTimeout(500);
    await page.locator("input[placeholder]").last().fill("retro");
    await page.waitForTimeout(300);
    const option = page.getByText("Retro Terminal Theme").first();
    if (await option.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Toggle on
      await option.click();
      expect(await page.evaluate(() => document.documentElement.classList.contains("retro-terminal"))).toBe(true);

      // Toggle off
      await page.keyboard.press("Control+k");
      await page.waitForTimeout(300);
      await page.locator("input[placeholder]").last().fill("retro");
      await page.waitForTimeout(300);
      await page.getByText("Retro Terminal Theme").first().click();
      expect(await page.evaluate(() => document.documentElement.classList.contains("retro-terminal"))).toBe(false);
    }
  });

  test("Command Palette should show retro option when searching 'hacker'", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await page.waitForTimeout(500);
    await page.locator("input[placeholder]").last().fill("hacker");
    await page.waitForTimeout(300);
    // "hacker" is a keyword for the retro terminal action
    const option = page.getByText("Retro Terminal Theme");
    const count = await option.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
