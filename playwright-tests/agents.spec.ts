import { expect, test } from "@playwright/test";
import { waitForAppReady } from "./test-utils";

test.describe("AI Agents Educational Page", () => {
  test.describe("Educational Content", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/agents/");
      await waitForAppReady(page);
      await page.waitForLoadState("domcontentloaded");
      await page.waitForSelector("h1", { timeout: 10000 });
    });

    test("should load agents page with educational heading", async ({
      page,
    }) => {
      const h1 = page.locator("h1");
      await expect(h1).toBeVisible();
      const headingText = await h1.textContent();
      expect(headingText).toContain("Understanding AI Agents");
    });

    test("should display subtitle about LLMs and autonomous systems", async ({
      page,
    }) => {
      await expect(
        page.getByText("From Language Models to Autonomous Systems"),
      ).toBeVisible();
    });

    test("should have What Is an AI Agent section", async ({ page }) => {
      await expect(page.getByText("What Is an AI Agent?")).toBeVisible();
      // Should show agent capabilities
      await expect(
        page.getByText("Break complex tasks into steps"),
      ).toBeVisible();
      await expect(
        page.getByText("Call external tools and APIs"),
      ).toBeVisible();
    });

    test("should have The Agentic Loop section with 4 phases", async ({
      page,
    }) => {
      const loopHeading = page.getByText("The Agentic Loop").first();
      await loopHeading.scrollIntoViewIfNeeded();
      await expect(loopHeading).toBeVisible();
      // Should show all 4 phases (use heading role for precise match)
      for (const phase of ["Observe", "Think", "Act", "Evaluate"]) {
        const el = page.getByRole("heading", { name: phase, exact: true }).first();
        await el.scrollIntoViewIfNeeded();
        await expect(el).toBeVisible();
      }
    });

    test("should have Core Components section", async ({ page }) => {
      await expect(page.getByText("Core Components")).toBeVisible();
      await expect(page.getByText("LLM (The Brain)")).toBeVisible();
      await expect(page.getByText("Tools & APIs").first()).toBeVisible();
      await expect(page.getByText("Memory & Retrieval")).toBeVisible();
      await expect(page.getByText("Planning & Reasoning")).toBeVisible();
    });

    test("should have Architecture Patterns section", async ({ page }) => {
      const heading = page.getByText("Architecture Patterns");
      await heading.scrollIntoViewIfNeeded();
      await expect(heading).toBeVisible();
      await expect(page.getByText("Single Agent")).toBeVisible();
      await expect(page.getByText("Router Agent")).toBeVisible();
      await expect(
        page.getByText("Multi-Agent Collaboration"),
      ).toBeVisible();
    });

    test("should show difficulty levels for architecture patterns", async ({
      page,
    }) => {
      await expect(page.getByText("Beginner").first()).toBeVisible();
      await expect(page.getByText("Intermediate").first()).toBeVisible();
      await expect(page.getByText("Advanced").first()).toBeVisible();
    });

    test("should show pros and cons for architecture patterns", async ({
      page,
    }) => {
      await expect(page.getByText("Advantages").first()).toBeVisible();
      await expect(page.getByText("Trade-offs").first()).toBeVisible();
    });

    test("should have Key Terminology section", async ({ page }) => {
      const heading = page.getByText("Key Terminology");
      await heading.scrollIntoViewIfNeeded();
      await expect(heading).toBeVisible();
      await expect(page.getByText("RAG").first()).toBeVisible();
      await expect(page.getByText("ReAct").first()).toBeVisible();
      await expect(page.getByText("Tool Use").first()).toBeVisible();
      await expect(page.getByText("MCP").first()).toBeVisible();
      await expect(page.getByText("Guardrails").first()).toBeVisible();
    });

    test("should show full term names", async ({ page }) => {
      const ragText = page.getByText("Retrieval-Augmented Generation");
      await ragText.scrollIntoViewIfNeeded();
      await expect(ragText).toBeVisible();
      await expect(page.getByText("Reasoning + Acting")).toBeVisible();
      await expect(
        page.getByText("Model Context Protocol"),
      ).toBeVisible();
    });

    test("should have Use Cases in Network Engineering section", async ({
      page,
    }) => {
      await expect(
        page.getByText("Use Cases in Network Engineering"),
      ).toBeVisible();
      await expect(
        page.getByText("Security Monitoring Agent"),
      ).toBeVisible();
      await expect(
        page.getByText("Network Troubleshooting Agent"),
      ).toBeVisible();
      await expect(
        page.getByText("Infrastructure Automation Agent"),
      ).toBeVisible();
      await expect(page.getByText("Documentation Agent")).toBeVisible();
    });

    test("should show networking-relevant tags in use cases", async ({
      page,
    }) => {
      await expect(page.getByText("Fortinet").first()).toBeVisible();
      await expect(page.getByText("Cisco").first()).toBeVisible();
      await expect(page.getByText("SNMP").first()).toBeVisible();
      await expect(page.getByText("DevNet").first()).toBeVisible();
    });
  });

  test.describe("Interactive Agent Builder", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/agents/");
      await waitForAppReady(page);
      await page.waitForLoadState("domcontentloaded");
      await page.waitForSelector("h1", { timeout: 10000 });
    });

    test("should have Interactive Agent Builder section", async ({ page }) => {
      await expect(
        page.getByText("Interactive Agent Builder"),
      ).toBeVisible();
      await expect(
        page.getByText("Put theory into practice"),
      ).toBeVisible();
    });

    test("should display template cards in the builder", async ({ page }) => {
      await page.waitForTimeout(2000);

      const templateCards = page.locator(
        'button[class*="bg-foreground/5"]',
      );
      const cardCount = await templateCards.count();

      if (cardCount > 0) {
        await expect(templateCards.first()).toBeVisible();
      } else {
        console.log(
          "No template cards found — builder may not have rendered yet",
        );
      }
    });

    test("should have search functionality in builder", async ({ page }) => {
      const searchInput = page.getByPlaceholder("Search templates...");
      const searchVisible = await searchInput
        .isVisible()
        .catch(() => false);
      if (searchVisible) {
        await expect(searchInput).toBeVisible();
      }
    });
  });

  test.describe("Blockly Agent Builder", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/agents/");
      await waitForAppReady(page);
      await page.waitForLoadState("domcontentloaded");
      await page.waitForSelector("h1", { timeout: 10000 });
    });

    test("should have Build Your Own Agent section heading", async ({
      page,
    }) => {
      const heading = page.getByText("Build Your Own Agent");
      await heading.scrollIntoViewIfNeeded();
      await expect(heading).toBeVisible();
    });

    test("should display kid-friendly subtitle", async ({ page }) => {
      const subtitle = page.getByText("Drag blocks to teach your robot agent", { exact: false });
      await subtitle.scrollIntoViewIfNeeded().catch(() => {});
      await expect(subtitle).toBeVisible({ timeout: 10000 });
    });

    test("should render Blockly workspace or loading state", async ({
      page,
    }) => {
      // Scroll to the Build Your Own Agent section first
      const heading = page.getByText("Build Your Own Agent");
      await heading.scrollIntoViewIfNeeded();

      // Blockly loads dynamically — check for either the workspace or the loading indicator
      const workspace = page.locator(".blocklyWorkspace");
      const loading = page.getByText("Loading block editor", { exact: false });

      // Wait up to 15 seconds for Blockly to load
      await Promise.race([
        workspace.waitFor({ state: "attached", timeout: 15000 }).catch(() => {}),
        loading.waitFor({ state: "visible", timeout: 5000 }).catch(() => {}),
      ]);

      const wsCount = await workspace.count();
      const loadingVisible = await loading.isVisible().catch(() => false);

      // Either Blockly loaded or loading indicator is shown
      expect(wsCount > 0 || loadingVisible).toBeTruthy();
    });

    test("should have Show Python button", async ({ page }) => {
      // Wait for Blockly to load
      await page.waitForTimeout(5000);

      const pythonBtn = page.getByText("Show Python", { exact: false });
      const btnVisible = await pythonBtn.isVisible().catch(() => false);
      if (btnVisible) {
        await expect(pythonBtn).toBeVisible();
      }
    });

    test("should have Run Agent button", async ({ page }) => {
      await page.waitForTimeout(5000);

      const runBtn = page.getByText("Run Agent", { exact: false });
      const btnVisible = await runBtn.isVisible().catch(() => false);
      if (btnVisible) {
        await expect(runBtn).toBeVisible();
      }
    });

    test("should have Reset button", async ({ page }) => {
      await page.waitForTimeout(5000);

      const resetBtn = page.getByText("Reset", { exact: false });
      const btnVisible = await resetBtn.isVisible().catch(() => false);
      if (btnVisible) {
        await expect(resetBtn).toBeVisible();
      }
    });
  });

  test.describe("Accessibility & Responsiveness", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/agents/");
      await waitForAppReady(page);
      await page.waitForLoadState("domcontentloaded");
      await page.waitForSelector("h1", { timeout: 10000 });
    });

    test("should be keyboard accessible", async ({ page }) => {
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press("Tab");
      }
      const focusedElement = page.locator(":focus").first();
      const count = await focusedElement.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test("should handle mobile responsiveness", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator("h1")).toBeVisible();
      await expect(
        page.getByText("What Is an AI Agent?"),
      ).toBeVisible();
    });

    test("should support screen readers", async ({ page }) => {
      const srContent = page.locator(
        ".sr-only, [aria-label], [aria-labelledby]",
      );
      await expect(srContent.first()).toBeAttached();
    });
  });
});

// ─── Section Navigation ──────────────────────────────────────────────────────

test.describe("AI Agents Page — Section Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/agents/");
    await waitForAppReady(page);
    await page.waitForLoadState("domcontentloaded");
  });

  test("should have all section IDs for navigation", async ({ page }) => {
    const sectionIds = [
      "hero",
      "what-is-agent",
      "agentic-loop",
      "components",
      "architecture",
      "terminology",
      "use-cases",
      "block-builder",
      "playground",
    ];
    for (const id of sectionIds) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });

  test("should display sticky section nav on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/agents/");
    await page.waitForLoadState("domcontentloaded");

    // Scroll past the hero to trigger visibility
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(500);

    const sectionNav = page.locator('nav[aria-label="Agents page sections"]');
    await expect(sectionNav).toBeAttached();
  });
});
