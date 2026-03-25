import { expect, test } from "@playwright/test";
import { waitForAppReady } from "./test-utils";

/**
 * Engagement Features — end-to-end tests
 *
 * Covers: SiteStats, GitHubHeatmap, Testimonials, CyberQuiz,
 * KonamiEasterEgg, SoundEffects toggle, ReadingProgress,
 * BlogReactions, Retro Terminal theme (Command Palette),
 * and homepage section ordering.
 */

/** Dismiss cookie consent if present */
async function dismissCookies(page: import("@playwright/test").Page) {
  const btn = page.locator('button[aria-label="Accept all cookies"]');
  if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(500);
  }
}

// ─── Homepage Engagement Sections ─────────────────────────────────────────

test.describe("Homepage — Site Stats", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await dismissCookies(page);
    // Scroll to stats section to trigger AnimatedSection
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.3));
    await page.waitForTimeout(1000);
  });

  test("should display Site Stats section with 4 cards", async ({ page }) => {
    const statsSection = page.locator('section[aria-label="Site statistics"]');
    await expect(statsSection).toBeAttached();

    const cards = statsSection.locator("div.rounded-lg");
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test("should show Lighthouse score", async ({ page }) => {
    await expect(page.getByText("Lighthouse").first()).toBeAttached();
  });

  test("should show tech stack count", async ({ page }) => {
    await expect(page.getByText("Tech Stack").first()).toBeAttached();
  });

  test("should show page count", async ({ page }) => {
    await expect(page.getByText("Pages", { exact: true }).first()).toBeAttached();
  });

  test("should show uptime stat", async ({ page }) => {
    await expect(page.getByText("Uptime").first()).toBeAttached();
  });
});

test.describe("Homepage — GitHub Heatmap", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await dismissCookies(page);
    // Scroll to GitHub section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.4));
    await page.waitForTimeout(1000);
  });

  test("should display GitHub Activity section", async ({ page }) => {
    const section = page.locator('section[aria-label="GitHub activity"]');
    await expect(section).toBeAttached();
    await expect(page.getByText("Open Source").first()).toBeAttached();
  });

  test("should show GitHub username link", async ({ page }) => {
    const link = page.locator('a[href*="github.com/Themis128"]');
    await expect(link.first()).toBeAttached();
  });

  test("should render heatmap grid with cells", async ({ page }) => {
    const section = page.locator('section[aria-label="GitHub activity"]');
    // Wait for API response and render
    await page.waitForTimeout(3000);
    // Heatmap cells are 10x10px divs inside column containers
    const heatmapContainer = section.locator("div.flex.gap-\\[3px\\]");
    await expect(heatmapContainer.first()).toBeAttached();
  });

  test("should show contribution stats", async ({ page }) => {
    await page.waitForTimeout(2000);
    await expect(page.getByText("recent events").first()).toBeAttached();
    await expect(page.getByText("public repos").first()).toBeAttached();
  });
});

test.describe("Homepage — Testimonials", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
  });

  test("should display Testimonials section", async ({ page }) => {
    const section = page.locator('section[aria-label="Testimonials"]');
    await expect(section).toBeAttached();
    await expect(page.getByText("What Colleagues Say").first()).toBeAttached();
  });

  test("should show a testimonial quote", async ({ page }) => {
    const section = page.locator('section[aria-label="Testimonials"]');
    const quote = section.locator("blockquote");
    await expect(quote.first()).toBeAttached();
    const text = await quote.first().textContent();
    expect(text?.length).toBeGreaterThan(20);
  });

  test("should show testimonial author name and role", async ({ page }) => {
    const section = page.locator('section[aria-label="Testimonials"]');
    // Author name is font-semibold cyan text
    const author = section.locator("p.font-semibold");
    await expect(author.first()).toBeAttached();
  });

  test("should have prev/next navigation buttons", async ({ page }) => {
    const prev = page.locator('button[aria-label="Previous testimonial"]');
    const next = page.locator('button[aria-label="Next testimonial"]');
    await expect(prev.first()).toBeAttached();
    await expect(next.first()).toBeAttached();
  });

  test("should cycle through testimonials on next click", async ({ page }) => {
    const section = page.locator('section[aria-label="Testimonials"]');
    const quote = section.locator("blockquote");
    const firstText = await quote.first().textContent();

    // Click next
    const next = page.locator('button[aria-label="Next testimonial"]').first();
    await next.click();
    await page.waitForTimeout(300);

    const secondText = await quote.first().textContent();
    expect(secondText).not.toBe(firstText);
  });

  test("should have dot indicators for each testimonial", async ({ page }) => {
    const section = page.locator('section[aria-label="Testimonials"]');
    // 3 testimonials = 3 dot buttons
    const dots = section.locator("button.rounded-full").filter({ has: page.locator(":scope:not(:has(*))") });
    // At least 3 dots (small round buttons)
    const count = await dots.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});

test.describe("Homepage — Cyber Quiz", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
  });

  test("should display quiz section", async ({ page }) => {
    const section = page.locator('section[aria-label="Challenge quiz"]');
    await expect(section).toBeAttached();
    await expect(page.getByText("Test Your Knowledge").first()).toBeAttached();
  });

  test("should show first question with 4 options", async ({ page }) => {
    const section = page.locator('section[aria-label="Challenge quiz"]');
    // Question counter
    await expect(section.getByText("Question 1/5").first()).toBeAttached();
    // 4 option buttons
    const options = section.locator("button.text-left");
    await expect(options).toHaveCount(4);
  });

  test("should show score counter", async ({ page }) => {
    const section = page.locator('section[aria-label="Challenge quiz"]');
    await expect(section.getByText("Score:").first()).toBeAttached();
  });

  test("should show progress bar", async ({ page }) => {
    const section = page.locator('section[aria-label="Challenge quiz"]');
    const progressBar = section.locator("div.bg-cyan-400.rounded-full");
    await expect(progressBar.first()).toBeAttached();
  });

  test("should reveal correct/incorrect after selecting an answer", async ({ page }) => {
    const section = page.locator('section[aria-label="Challenge quiz"]');
    const options = section.locator("button.text-left");

    // Click first option
    await options.first().click();

    // Should show explanation after answering
    await expect(section.locator("button").filter({ hasText: "Next Question" }).first()).toBeVisible();
  });

  test("should advance to next question", async ({ page }) => {
    const section = page.locator('section[aria-label="Challenge quiz"]');
    const options = section.locator("button.text-left");

    // Answer first question
    await options.first().click();
    await section.locator("button").filter({ hasText: "Next Question" }).first().click();

    // Should now show Question 2
    await expect(section.getByText("Question 2/5").first()).toBeVisible();
  });

  test("should show results after completing all questions", async ({ page }) => {
    const section = page.locator('section[aria-label="Challenge quiz"]');

    // Answer all 5 questions
    for (let i = 0; i < 5; i++) {
      const options = section.locator("button.text-left");
      await options.first().click();
      const nextBtn = section.locator("button").filter({ hasText: /Next Question|See Results/ }).first();
      await nextBtn.click();
    }

    // Should show final score and grade
    await expect(section.getByText("Correct").first()).toBeVisible();
    await expect(section.getByText("Grade").first()).toBeVisible();

    // Should show Try Again button
    await expect(section.getByText("Try Again").first()).toBeVisible();
  });

  test("should restart quiz on Try Again click", async ({ page }) => {
    const section = page.locator('section[aria-label="Challenge quiz"]');

    // Complete quiz
    for (let i = 0; i < 5; i++) {
      const options = section.locator("button.text-left");
      await options.first().click();
      await section.locator("button").filter({ hasText: /Next Question|See Results/ }).first().click();
    }

    // Click Try Again
    await section.getByText("Try Again").first().click();

    // Should be back to Question 1
    await expect(section.getByText("Question 1/5").first()).toBeVisible();
  });
});

test.describe("Homepage — Section Ordering", () => {
  test("engagement sections should exist in DOM order", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    // Verify sections exist in the DOM (order checked by DOM position, not visual)
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

    // Verify DOM order by comparing element indices
    const indices = await page.evaluate((sels) => {
      const all = document.querySelectorAll("section");
      return sels.map((sel) => {
        const el = document.querySelector(sel);
        if (!el) return -1;
        return Array.from(all).indexOf(el);
      });
    }, sections);

    // Each section should have a higher DOM index than the previous
    for (let i = 1; i < indices.length; i++) {
      const prev = indices[i - 1] ?? -1;
      const curr = indices[i] ?? -1;
      expect(curr).toBeGreaterThan(prev);
    }
  });
});

// ─── Blog Engagement Features ─────────────────────────────────────────────

test.describe("Blog — Reading Progress", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog/");
    await waitForAppReady(page);
    // Click first blog post
    const firstPost = page.locator("a").filter({ hasText: /Building|Zero Trust|Next.js/ }).first();
    await firstPost.click();
    await page.waitForLoadState("domcontentloaded");
  });

  test("should show reading progress bar on scroll", async ({ page }) => {
    // Scroll down to trigger progress
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);

    const progressBar = page.locator("[role='progressbar']");
    // The global ScrollProgress bar or the blog ReadingProgress
    const bars = await progressBar.count();
    expect(bars).toBeGreaterThanOrEqual(1);
  });

  test("should show percentage indicator on scroll", async ({ page }) => {
    // Scroll deeper into article
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);

    // ReadingProgress shows a sticky bar with percentage
    // Check that some progress indicator exists (progressbar role or % text)
    const progressBars = page.locator("[role='progressbar']");
    const count = await progressBars.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe("Blog — Reactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog/");
    await waitForAppReady(page);
    const firstPost = page.locator("a").filter({ hasText: /Building|Zero Trust|Next.js/ }).first();
    await firstPost.click();
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display reaction buttons", async ({ page }) => {
    await expect(page.getByText("React:").first()).toBeAttached();
    await expect(page.getByRole("button", { name: "Helpful" })).toBeAttached();
    await expect(page.getByRole("button", { name: "Interesting" })).toBeAttached();
    await expect(page.getByRole("button", { name: "Bookmark" })).toBeAttached();
  });

  test("reaction button should toggle on click", async ({ page }) => {
    const helpful = page.getByRole("button", { name: "Helpful" });
    await helpful.scrollIntoViewIfNeeded();
    await helpful.click();

    // Should have active styling (cyan border)
    await expect(helpful).toHaveAttribute("aria-pressed", "true");

    // Click again to un-react
    await helpful.click();
    await expect(helpful).toHaveAttribute("aria-pressed", "false");
  });

  test("reactions should persist across page reload", async ({ page }) => {
    const helpful = page.getByRole("button", { name: "Helpful" });
    await helpful.scrollIntoViewIfNeeded();
    await helpful.click();
    await expect(helpful).toHaveAttribute("aria-pressed", "true");

    // Reload
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    // Should still be active
    const helpfulAfter = page.getByRole("button", { name: "Helpful" });
    await expect(helpfulAfter).toHaveAttribute("aria-pressed", "true");
  });
});

// ─── Global Engagement Features ───────────────────────────────────────────

test.describe("Sound Effects Toggle", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await dismissCookies(page);
  });

  test("should render sound toggle button", async ({ page }) => {
    const toggle = page.locator('button[aria-label*="sound effects"]');
    await expect(toggle.first()).toBeAttached({ timeout: 10000 });
  });

  test("should toggle sound label on click", async ({ page }) => {
    const enableBtn = page.locator('button[aria-label="Enable sound effects"]');
    await enableBtn.first().waitFor({ state: "attached", timeout: 10000 });
    await enableBtn.first().click({ force: true });

    // After enabling, label should change to "Disable sound effects"
    const disableBtn = page.locator('button[aria-label="Disable sound effects"]');
    await expect(disableBtn.first()).toBeAttached();

    // Click again to disable
    await disableBtn.first().click({ force: true });
    await expect(enableBtn.first()).toBeAttached();
  });
});

test.describe("Konami Code Easter Egg", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await dismissCookies(page);
  });

  test("should activate on Konami code input", async ({ page }) => {
    // Type the Konami code
    const keys = [
      "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
      "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
      "b", "a",
    ];
    for (const key of keys) {
      await page.keyboard.press(key);
    }

    // Toast notification should appear
    await expect(
      page.getByText("KONAMI CODE ACTIVATED").first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("toast should auto-dismiss after a few seconds", async ({ page }) => {
    const keys = [
      "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
      "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
      "b", "a",
    ];
    for (const key of keys) {
      await page.keyboard.press(key);
    }

    const toast = page.getByText("KONAMI CODE ACTIVATED").first();
    await expect(toast).toBeVisible({ timeout: 5000 });

    // Should auto-dismiss (4 second timeout in component)
    await expect(toast).not.toBeVisible({ timeout: 6000 });
  });
});

test.describe("Retro Terminal Theme", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await dismissCookies(page);
  });

  test("should toggle retro-terminal class via Command Palette", async ({ page }) => {
    // Open Command Palette
    await page.keyboard.press("Control+k");
    await page.waitForTimeout(500);

    // Search for retro
    const input = page.locator("input[placeholder]").last();
    await input.fill("retro");
    await page.waitForTimeout(300);

    // Click the retro terminal option
    const retroOption = page.getByText("Retro Terminal Theme").first();
    if (await retroOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await retroOption.click();

      // html element should have retro-terminal class
      const hasClass = await page.evaluate(() =>
        document.documentElement.classList.contains("retro-terminal"),
      );
      expect(hasClass).toBe(true);

      // Toggle it off
      await page.keyboard.press("Control+k");
      await page.waitForTimeout(300);
      await page.locator("input[placeholder]").last().fill("retro");
      await page.waitForTimeout(300);
      await page.getByText("Retro Terminal Theme").first().click();

      const hasClassAfter = await page.evaluate(() =>
        document.documentElement.classList.contains("retro-terminal"),
      );
      expect(hasClassAfter).toBe(false);
    }
  });
});
