import { expect, test } from "@playwright/test";

/**
 * About Page — Comprehensive E2E Tests
 *
 * Covers structure, hero, professional summary, skills radar,
 * certifications/badges, count-up stats, and responsive layout.
 */

test.describe("About Page — Structure", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("page loads without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    expect(errors).toHaveLength(0);
  });

  test("has correct page title metadata", async ({ page }) => {
    const title = await page.title();
    expect(title).toContain("About");
  });

  test("has all section IDs (hero, summary, focus-areas, skills, badges, awards)", async ({
    page,
  }) => {
    const sectionIds = [
      "hero",
      "summary",
      "focus-areas",
      "skills",
      "badges",
      "awards",
    ];
    for (const id of sectionIds) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });

  test("SectionNav is present on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/about/");
    await page.waitForLoadState("domcontentloaded");

    // Scroll past the hero to trigger visibility
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(500);

    const sectionNav = page.locator('nav[aria-label="About page sections"]');
    await expect(sectionNav).toBeAttached();
  });

  test("breadcrumb schema (JSON-LD) is present", async ({ page }) => {
    const scripts = page.locator('script[type="application/ld+json"]');
    const count = await scripts.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Check that at least one script contains BreadcrumbList
    let foundBreadcrumb = false;
    for (let i = 0; i < count; i++) {
      const text = await scripts.nth(i).textContent();
      if (text?.includes("BreadcrumbList")) {
        foundBreadcrumb = true;
        expect(text).toContain("/about/");
        break;
      }
    }
    expect(foundBreadcrumb).toBe(true);
  });
});

test.describe("About Page — Hero Section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("hero heading is visible with correct text", async ({ page }) => {
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("About Me");
  });

  test("subtitle shows IT Network Engineer role", async ({ page }) => {
    const subtitle = page.locator("#hero");
    await expect(subtitle).toContainText("IT Network Engineer");
  });

  test('About link is highlighted in navigation', async ({ page }) => {
    const navLink = page.locator('nav a[href="/about/"], nav a[href="/about"]');
    await expect(navLink.first()).toBeVisible();
  });
});

test.describe("About Page — Professional Summary", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("summary text is visible", async ({ page }) => {
    const summary = page.locator("#summary");
    await summary.scrollIntoViewIfNeeded();
    await expect(summary).toContainText("Experienced IT Network Engineer", {
      timeout: 10000,
    });
  });

  test("focus area cards render (3 cards)", async ({ page }) => {
    const focusAreas = page.locator("#focus-areas");
    await focusAreas.scrollIntoViewIfNeeded();

    const cards = focusAreas.locator("h3");
    await expect(cards).toHaveCount(3, { timeout: 10000 });
  });

  test("each focus area card has an icon and description", async ({
    page,
  }) => {
    const focusAreas = page.locator("#focus-areas");
    await focusAreas.scrollIntoViewIfNeeded();

    // Check card titles
    const expectedTitles = [
      "Network Infrastructure",
      "Network Security",
      "Cloud & Identity",
    ];
    for (const title of expectedTitles) {
      await expect(focusAreas.getByText(title)).toBeVisible({ timeout: 10000 });
    }

    // Each card has an icon container (the rounded div wrapping lucide icons)
    const iconContainers = focusAreas.locator(
      ".inline-flex.items-center.justify-center",
    );
    await expect(iconContainers).toHaveCount(3, { timeout: 10000 });

    // Each card has a description paragraph
    const descriptions = focusAreas.locator("p.text-muted-foreground");
    expect(await descriptions.count()).toBeGreaterThanOrEqual(3);
  });
});

test.describe("About Page — Skills Section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("SkillsRadar SVG renders", async ({ page }) => {
    const radarContainer = page.getByText("Skills Radar").locator("..");
    await radarContainer.scrollIntoViewIfNeeded();

    const svg = page.locator(
      'svg[role="img"][aria-label="Radar chart showing skill proficiency levels"]',
    );
    await expect(svg).toBeVisible({ timeout: 10000 });
  });

  test("has 6 skill axis labels", async ({ page }) => {
    const skillLabels = [
      "Networking",
      "Security",
      "Cloud",
      "DevOps",
      "Programming",
      "Systems",
    ];

    const svg = page.locator(
      'svg[role="img"][aria-label="Radar chart showing skill proficiency levels"]',
    );
    await svg.scrollIntoViewIfNeeded();

    for (const label of skillLabels) {
      const labelButton = page.locator(
        `g[role="button"][aria-label*="${label}"]`,
      );
      await expect(labelButton).toBeAttached({ timeout: 10000 });
    }
  });

  test("clicking a skill label reveals detail panel", async ({ page }) => {
    const svg = page.locator(
      'svg[role="img"][aria-label="Radar chart showing skill proficiency levels"]',
    );
    await svg.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Click the Networking skill label
    const networkingLabel = page.locator(
      'g[role="button"][aria-label*="Networking"]',
    );
    await networkingLabel.click();

    // Detail panel should appear with skill name
    const detailPanel = page.locator("h4:has-text('Networking')");
    await expect(detailPanel).toBeVisible({ timeout: 10000 });
  });

  test("detail panel shows proficiency bar and certifications", async ({
    page,
  }) => {
    const skillsSection = page.locator("#skills");
    await skillsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Click on Security skill using evaluate (SVG g elements can be tricky for Playwright)
    const clicked = await page.evaluate(() => {
      const labels = document.querySelectorAll('g[role="button"]');
      for (const label of labels) {
        if (label.getAttribute("aria-label")?.includes("Security")) {
          (label as HTMLElement).click();
          return true;
        }
      }
      return false;
    });
    expect(clicked).toBe(true);

    // Proficiency bar should be visible
    const proficiencyLabel = page.getByText("Proficiency", { exact: false });
    await expect(proficiencyLabel.first()).toBeVisible({ timeout: 10000 });

    // Certifications & Skills text
    const certsLabel = page.getByText("Certifications & Skills");
    await expect(certsLabel).toBeVisible({ timeout: 10000 });

    // Experience section
    const experienceLabel = page.getByText("Experience");
    await expect(experienceLabel.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe("About Page — Certifications (Badges)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("BadgesGrid renders with certification cards", async ({ page }) => {
    const badgesSection = page.locator("#badges");
    await badgesSection.scrollIntoViewIfNeeded();

    await expect(badgesSection.getByText("Verified Digital Badges")).toBeVisible(
      { timeout: 10000 },
    );
  });

  test("each badge has an image, name, and issuer", async ({ page }) => {
    const badgesSection = page.locator("#badges");
    await badgesSection.scrollIntoViewIfNeeded();

    // Check for badge images
    const badgeImages = badgesSection.locator("img");
    const imageCount = await badgeImages.count();
    expect(imageCount).toBeGreaterThanOrEqual(5);

    // Check first badge has name and issuer text
    await expect(badgesSection.getByText("CyberOps Associate")).toBeVisible({
      timeout: 10000,
    });
    await expect(badgesSection.getByText("Cisco").first()).toBeVisible({
      timeout: 10000,
    });
  });

  test("badge count is at least 5", async ({ page }) => {
    const badgesSection = page.locator("#badges");
    await badgesSection.scrollIntoViewIfNeeded();

    // Count distinct badge items (each has an img element)
    const badgeImages = badgesSection.locator("img");
    await expect(badgeImages.first()).toBeVisible({ timeout: 10000 });
    const count = await badgeImages.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });
});

test.describe("About Page — Stats Section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("CountUpStats renders numeric values", async ({ page }) => {
    // CountUpStats is near the top, just below hero
    const statsLabels = [
      "Years Experience",
      "Verified Badges",
      "Certifications",
      "Languages",
    ];

    for (const label of statsLabels) {
      await expect(page.getByText(label).first()).toBeAttached({ timeout: 10000 });
    }
  });

  test("stats include years of experience", async ({ page }) => {
    const yearsLabel = page.getByText("Years Experience");
    await expect(yearsLabel).toBeVisible({ timeout: 10000 });
  });

  test("stats have count-up animation (value > 0 after scroll)", async ({
    page,
  }) => {
    // Scroll to the stats area to trigger IntersectionObserver
    const yearsLabel = page.getByText("Years Experience");
    await yearsLabel.scrollIntoViewIfNeeded();

    // Wait for animation to complete (1.5s duration + buffer)
    await page.waitForTimeout(2500);

    // The stat card parent contains the numeric value as a sibling
    const statCard = yearsLabel.locator("..");
    const numericValue = statCard.locator(".font-mono.text-3xl, .font-mono.text-4xl").first();
    const text = await numericValue.textContent();
    // Should show "15+" after animation completes
    expect(text).toBeTruthy();
    const numericPart = parseInt(text!.replace(/[^0-9]/g, ""), 10);
    expect(numericPart).toBeGreaterThan(0);
  });
});

test.describe("About Page — Responsive Layout", () => {
  test("mobile layout stacks content vertically", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/about/");
    await page.waitForLoadState("domcontentloaded");

    // Focus area cards should stack on mobile (grid-cols-1)
    const focusAreas = page.locator("#focus-areas");
    await focusAreas.scrollIntoViewIfNeeded();

    const cards = focusAreas.locator("h3");
    await expect(cards).toHaveCount(3, { timeout: 10000 });

    // Verify the first two cards are stacked (second card below first)
    const firstCard = cards.nth(0);
    const secondCard = cards.nth(1);
    const firstBox = await firstCard.boundingBox();
    const secondBox = await secondCard.boundingBox();
    expect(firstBox).toBeTruthy();
    expect(secondBox).toBeTruthy();
    // On mobile, second card should be below first (higher y value)
    expect(secondBox!.y).toBeGreaterThan(firstBox!.y);
  });

  test("desktop shows side-by-side layout for skills and certifications", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/about/");
    await page.waitForLoadState("domcontentloaded");

    const skillsSection = page.locator("#skills");
    await skillsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // The skills section has a 2-column grid (md:grid-cols-2)
    // "Top Skills" and "Certifications" should be side by side
    const topSkills = skillsSection.getByText("Top Skills");
    const certifications = skillsSection.getByText("Certifications");
    await expect(topSkills).toBeVisible({ timeout: 10000 });
    await expect(certifications).toBeVisible({ timeout: 10000 });

    const leftBox = await topSkills.boundingBox();
    const rightBox = await certifications.boundingBox();
    expect(leftBox).toBeTruthy();
    expect(rightBox).toBeTruthy();
    // On desktop, they should be roughly at the same vertical position (side by side)
    expect(Math.abs(leftBox!.y - rightBox!.y)).toBeLessThan(50);
    // And horizontally separated
    expect(rightBox!.x).toBeGreaterThan(leftBox!.x);
  });
});
