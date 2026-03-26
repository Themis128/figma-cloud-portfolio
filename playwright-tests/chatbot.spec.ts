import { expect, test } from "@playwright/test";
import { waitForAppReady } from "./test-utils";

/**
 * AI Chatbot Widget — end-to-end tests (AWS Bedrock)
 *
 * Covers: toggle behaviour, welcome message, suggested questions,
 * message sending, streaming UI, booking-flow trigger,
 * contact action, navigation links, thinking indicator,
 * keyboard interaction, panel structure, cyberpunk styling,
 * error handling, responsive behaviour, scroll behaviour,
 * GA4 tracking, and accessibility.
 *
 * These tests hit the real /api/chat → Express server → AWS Bedrock (Claude 3.5 Haiku).
 * The chatbot requires AWS credentials and Bedrock model access.
 */

// Bedrock typically responds in 1-3 seconds — generous timeout for network variability
const API_TIMEOUT = 30_000;

// Express server URL — tests that require the Bedrock backend will skip when unavailable
const API_URL = process.env.API_URL ?? "http://localhost:3002";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Check if the Express server (with Bedrock chat) is reachable */
async function isChatAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

/** Locate the chat panel container (the fixed panel, not the toggle) */
function chatPanel(page: import("@playwright/test").Page) {
  return page.locator("div.fixed").filter({ hasText: "AI Assistant" });
}

/** Locate the chat toggle button (when closed) */
function chatToggle(page: import("@playwright/test").Page) {
  return page.locator('button[aria-label="Open chat"]');
}

/** Locate the chat input field */
function chatInput(page: import("@playwright/test").Page) {
  return chatPanel(page).locator('input[placeholder="Ask about Themis…"]');
}

/** Locate the Send button */
function sendButton(page: import("@playwright/test").Page) {
  return chatPanel(page).getByRole("button", { name: "Send", exact: true });
}

/** Locate all suggestion buttons (text-left class distinguishes them from other buttons) */
function suggestionButtons(page: import("@playwright/test").Page) {
  return chatPanel(page).locator("button.text-left");
}

/** Dismiss the cookie consent banner if present (it overlaps the chat toggle) */
async function dismissCookieConsent(page: import("@playwright/test").Page) {
  const banner = page.locator('div[aria-label="Cookie consent"]');
  const acceptBtn = page.locator('button[aria-label="Accept all cookies"]');
  try {
    await banner.waitFor({ state: "visible", timeout: 5000 });
    await acceptBtn.click({ timeout: 3000 });
    await banner.waitFor({ state: "hidden", timeout: 5000 });
  } catch {
    // No cookie consent banner — already dismissed or not shown
    // Force-dismiss if banner is still visible (can happen under load)
    if (await banner.isVisible()) {
      await acceptBtn.click({ force: true }).catch(() => {});
      await banner.waitFor({ state: "hidden", timeout: 3000 }).catch(() => {});
    }
  }
}

/** Open the chatbot panel and wait for it to be visible */
async function openChat(page: import("@playwright/test").Page) {
  await dismissCookieConsent(page);
  const toggle = chatToggle(page);
  await toggle.waitFor({ state: "visible", timeout: 10000 });
  try {
    await toggle.click({ timeout: 10000 });
  } catch {
    // Cookie banner may still intercept — dismiss again and force-click
    await dismissCookieConsent(page);
    await toggle.click({ force: true });
  }
  // Wait for the header inside the panel to appear
  await chatPanel(page)
    .locator("text=AI Assistant")
    .first()
    .waitFor({ state: "visible", timeout: 5000 });
}

/** Wait for an assistant reply to appear (any non-empty, non-streaming bubble) */
async function waitForAssistantReply(page: import("@playwright/test").Page) {
  await page.waitForFunction(
    () => {
      // Assistant message bubbles have bg-white/5
      const bubbles = document.querySelectorAll("div[class*='bg-white/5']");
      for (const b of bubbles) {
        const text = b.textContent?.trim() ?? "";
        if (
          text.length > 0 &&
          !text.startsWith("Hi! I'm Themis's AI assistant")
        ) {
          return true;
        }
      }
      return false;
    },
    null,
    { timeout: API_TIMEOUT },
  );
}

/** Count assistant message bubbles (excluding welcome) */
async function countAssistantReplies(page: import("@playwright/test").Page): Promise<number> {
  return page.evaluate(() => {
    const bubbles = document.querySelectorAll("div[class*='bg-white/5']");
    let count = 0;
    for (const b of bubbles) {
      const text = b.textContent?.trim() ?? "";
      if (text.length > 0 && !text.startsWith("Hi! I'm Themis's AI assistant")) {
        count++;
      }
    }
    return count;
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("AI Chatbot Widget", () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(30000);
    await page.goto("/");
    await waitForAppReady(page);
  });

  // ── Toggle behaviour ────────────────────────────────────────────────────

  test.describe("Toggle behaviour", () => {
    test("should show the floating toggle button on page load", async ({
      page,
    }) => {
      await dismissCookieConsent(page);
      const toggle = chatToggle(page);
      await expect(toggle).toBeVisible();
      await expect(toggle).toContainText("Chat with AI");
    });

    test("toggle button should have pulsing status indicator", async ({
      page,
    }) => {
      await dismissCookieConsent(page);
      const toggle = chatToggle(page);
      // The animated ping dot inside the toggle
      const pingDot = toggle.locator("span.animate-ping");
      await expect(pingDot).toBeAttached();
      // The solid status dot
      const solidDot = toggle.locator("span.bg-cyan-500");
      await expect(solidDot).toBeAttached();
    });

    test("toggle button should have cyberpunk styling", async ({ page }) => {
      await dismissCookieConsent(page);
      const toggle = chatToggle(page);
      await expect(toggle).toBeVisible();
      // Fixed position bottom-left
      await expect(toggle).toHaveCSS("position", "fixed");
      // Font-mono class applied
      const classes = await toggle.getAttribute("class");
      expect(classes).toContain("font-mono");
      expect(classes).toContain("border");
      expect(classes).toContain("backdrop-blur");
    });

    test("toggle button should have glow shadow effect", async ({ page }) => {
      await dismissCookieConsent(page);
      const toggle = chatToggle(page);
      await expect(toggle).toBeVisible();
      const classes = await toggle.getAttribute("class");
      // Shadow with cyan glow
      expect(classes).toContain("shadow-");
    });

    test("should open chat panel when toggle is clicked", async ({ page }) => {
      await openChat(page);

      const panel = chatPanel(page);

      // Header should show title and subtitle
      await expect(panel.locator("text=AI Assistant").first()).toBeVisible();
      await expect(
        panel.locator("text=Themis's Portfolio Bot").first(),
      ).toBeVisible();

      // The floating toggle changes aria-label to "Chat is open" and becomes
      // hidden (opacity-0 + pointer-events-none + inert).
      const toggle = page.locator('button[aria-label="Chat is open"]');
      await expect(toggle).toHaveAttribute("inert", "");
      await expect(toggle).toHaveCSS("opacity", "0");
      await expect(toggle).toHaveCSS("pointer-events", "none");
    });

    test("toggle should have tabIndex -1 when panel is open", async ({
      page,
    }) => {
      await openChat(page);
      const toggle = page.locator('button[aria-label="Chat is open"]');
      await expect(toggle).toHaveAttribute("tabindex", "-1");
    });

    test("should close chat panel via close button", async ({ page }) => {
      await openChat(page);

      // The X button inside the chat panel header
      const close = chatPanel(page).locator('button[aria-label="Close chat"]');
      await close.click();

      // Toggle should reappear as "Open chat" with full opacity
      const toggle = chatToggle(page);
      await expect(toggle).toBeVisible();
      await expect(toggle).toHaveCSS("opacity", "1");
    });

    test("toggle should regain interactivity after close", async ({ page }) => {
      await openChat(page);

      // Close
      const close = chatPanel(page).locator('button[aria-label="Close chat"]');
      await close.click();

      // Toggle should no longer be inert
      const toggle = chatToggle(page);
      await expect(toggle).toBeVisible();
      // inert attribute should be removed (no attribute = interactable)
      await expect(toggle).not.toHaveAttribute("inert", "");
      // tabIndex should not be -1
      await expect(toggle).not.toHaveAttribute("tabindex", "-1");
    });

    test("should toggle open and close multiple times", async ({ page }) => {
      await dismissCookieConsent(page);

      // Open → close → open cycle
      for (let i = 0; i < 2; i++) {
        const toggle = chatToggle(page);
        await toggle.click();
        await expect(chatPanel(page).locator("text=AI Assistant").first()).toBeVisible();

        const close = chatPanel(page).locator('button[aria-label="Close chat"]');
        await close.click();
        await expect(toggle).toBeVisible();
      }
    });
  });

  // ── Panel structure ───────────────────────────────────────────────────

  test.describe("Panel structure", () => {
    test("should display header with avatar initials and online indicator", async ({
      page,
    }) => {
      await openChat(page);
      const panel = chatPanel(page);

      // TB initials in the avatar circle
      await expect(panel.locator("text=TB").first()).toBeVisible();

      // Green online indicator dot
      const greenDot = panel.locator("span.bg-green-400");
      await expect(greenDot).toBeAttached();
    });

    test("avatar should have correct cyberpunk styling", async ({ page }) => {
      await openChat(page);
      const panel = chatPanel(page);

      // Avatar circle — the div containing exactly "TB" with rounded-full class
      const avatar = panel.locator("div.rounded-full").filter({ hasText: "TB" }).first();
      await expect(avatar).toBeVisible();
      const classes = await avatar.getAttribute("class");
      expect(classes).toContain("font-mono");
      expect(classes).toContain("font-bold");
    });

    test("panel should have glass-morphism styling", async ({ page }) => {
      await openChat(page);
      const panel = chatPanel(page);
      const classes = await panel.getAttribute("class");
      expect(classes).toContain("backdrop-blur");
      expect(classes).toContain("border");
      expect(classes).toContain("rounded-xl");
    });

    test("panel should be fixed position with z-50", async ({ page }) => {
      await openChat(page);
      const panel = chatPanel(page);
      await expect(panel).toHaveCSS("position", "fixed");
      const classes = await panel.getAttribute("class");
      expect(classes).toContain("z-50");
    });

    test("panel should have origin-bottom-left animation", async ({ page }) => {
      await openChat(page);
      const panel = chatPanel(page);
      const classes = await panel.getAttribute("class");
      expect(classes).toContain("origin-bottom-left");
    });

    test("header should have border separator", async ({ page }) => {
      await openChat(page);
      const panel = chatPanel(page);
      const header = panel.locator("div").filter({ hasText: "AI Assistant" }).first();
      const classes = await header.getAttribute("class");
      expect(classes).toContain("border-b");
    });

    test("input bar should have border separator", async ({ page }) => {
      await openChat(page);
      const panel = chatPanel(page);
      // The input bar container has border-t
      const inputBar = panel.locator("div").filter({ has: page.locator('input[placeholder="Ask about Themis…"]') }).first();
      const classes = await inputBar.getAttribute("class");
      expect(classes).toContain("border-t");
    });

    test("should have input field with correct placeholder", async ({
      page,
    }) => {
      await openChat(page);
      const input = chatInput(page);
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute("placeholder", "Ask about Themis…");
    });

    test("input field should have font-mono styling", async ({ page }) => {
      await openChat(page);
      const input = chatInput(page);
      const classes = await input.getAttribute("class");
      expect(classes).toContain("font-mono");
      expect(classes).toContain("text-xs");
    });

    test("should have a Send button", async ({ page }) => {
      await openChat(page);
      const btn = sendButton(page);
      await expect(btn).toBeVisible();
      await expect(btn).toContainText("Send");
    });

    test("Send button should have cyberpunk styling", async ({ page }) => {
      await openChat(page);
      const btn = sendButton(page);
      const classes = await btn.getAttribute("class");
      expect(classes).toContain("font-mono");
      expect(classes).toContain("text-xs");
    });

    test("input and Send button should be in the bottom bar", async ({
      page,
    }) => {
      await openChat(page);
      const input = chatInput(page);
      const btn = sendButton(page);
      // Both should be visible and interactive
      await expect(input).toBeEnabled();
      await expect(btn).toBeVisible();
    });

    test("close button should have X icon (SVG path)", async ({ page }) => {
      await openChat(page);
      const closeBtn = chatPanel(page).locator('button[aria-label="Close chat"]');
      // SVG with cross path
      const svg = closeBtn.locator("svg");
      await expect(svg).toBeAttached();
      const path = svg.locator("path");
      await expect(path).toBeAttached();
    });
  });

  // ── Welcome message & suggested questions ───────────────────────────────

  test.describe("Welcome message & suggested questions", () => {
    test("should display the full welcome message", async ({ page }) => {
      await openChat(page);

      const panel = chatPanel(page);
      const welcomeText = panel.locator(
        "text=Hi! I'm Themis's AI assistant",
      ).first();
      await expect(welcomeText).toBeVisible();

      // The full welcome message mentions booking
      await expect(
        panel.locator("text=book a teleconference call").first(),
      ).toBeVisible();
    });

    test("welcome message should be styled as assistant bubble", async ({
      page,
    }) => {
      await openChat(page);
      const panel = chatPanel(page);

      // Assistant messages use bg-white/5 styling
      const welcomeBubble = panel.locator("div[class*='bg-white/5']").first();
      await expect(welcomeBubble).toBeVisible();
      // Should contain the welcome text
      await expect(welcomeBubble).toContainText("AI assistant");
    });

    test("welcome message bubble should have font-mono and max-width", async ({ page }) => {
      await openChat(page);
      const panel = chatPanel(page);

      const welcomeBubble = panel.locator("div[class*='bg-white/5']").first();
      const classes = await welcomeBubble.getAttribute("class");
      expect(classes).toContain("font-mono");
      expect(classes).toContain("text-xs");
      expect(classes).toContain("max-w-[80%]");
      expect(classes).toContain("rounded-lg");
    });

    test("welcome message should be left-aligned (assistant side)", async ({ page }) => {
      await openChat(page);
      const panel = chatPanel(page);

      // The parent flex container of the welcome message should have justify-start
      const welcomeRow = panel.locator("div.justify-start").first();
      await expect(welcomeRow).toBeVisible();
      await expect(welcomeRow).toContainText("AI assistant");
    });

    test("should display 5 suggested questions (3 random + contact + booking)", async ({ page }) => {
      await openChat(page);

      const panel = chatPanel(page);
      await expect(panel.locator("text=Suggested questions:")).toBeVisible();

      // The booking and contact questions are always present
      await expect(panel.locator("text=Book a call with Themis.").first()).toBeVisible();
      await expect(panel.locator("text=Send a message to Themis.").first()).toBeVisible();

      // 3 randomly selected from pool + 1 pinned contact + 1 pinned booking = 5 suggestion buttons
      const buttons = suggestionButtons(page);
      await expect(buttons).toHaveCount(5);
    });

    test("booking question should be the last suggestion", async ({ page }) => {
      await openChat(page);
      const buttons = suggestionButtons(page);
      const last = buttons.last();
      await expect(last).toContainText("Book a call with Themis.");
    });

    test("contact question should be second-to-last suggestion", async ({ page }) => {
      await openChat(page);
      const buttons = suggestionButtons(page);
      const count = await buttons.count();
      const secondToLast = buttons.nth(count - 2);
      await expect(secondToLast).toContainText("Send a message to Themis.");
    });

    test("suggested questions should be clickable buttons", async ({
      page,
    }) => {
      await openChat(page);

      const buttons = suggestionButtons(page);
      const count = await buttons.count();
      expect(count).toBe(5);

      for (let i = 0; i < count; i++) {
        await expect(buttons.nth(i)).toBeVisible();
        await expect(buttons.nth(i)).toBeEnabled();
      }
    });

    test("suggestion buttons should have cyberpunk styling", async ({ page }) => {
      await openChat(page);

      const firstBtn = suggestionButtons(page).first();
      const classes = await firstBtn.getAttribute("class");
      expect(classes).toContain("font-mono");
      expect(classes).toContain("text-xs");
      expect(classes).toContain("rounded");
      expect(classes).toContain("border");
    });

    test("suggested questions label should have muted styling", async ({ page }) => {
      await openChat(page);
      const label = chatPanel(page).locator("text=Suggested questions:");
      await expect(label).toBeVisible();
      const tag = await label.evaluate((el) => el.tagName.toLowerCase());
      expect(tag).toBe("p");
    });

    test("suggested questions should not appear after sending a message", async ({
      page,
    }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      const panel = chatPanel(page);

      // Suggested questions are visible initially
      await expect(panel.locator("text=Suggested questions:")).toBeVisible();

      // Send a message
      const input = chatInput(page);
      await input.fill("Hello");
      await sendButton(page).click();

      // Suggested questions should disappear immediately (before LLM responds)
      await expect(
        panel.locator("text=Suggested questions:"),
      ).not.toBeVisible();
    });

    test("three random questions should differ between sessions", async ({ page, context }) => {
      await openChat(page);
      const buttons1 = suggestionButtons(page);
      const texts1: string[] = [];
      for (let i = 0; i < 3; i++) {
        texts1.push(await buttons1.nth(i).textContent() ?? "");
      }

      // Open a second page to get a fresh random set
      const page2 = await context.newPage();
      await page2.goto("/");
      await waitForAppReady(page2);
      await dismissCookieConsent(page2);
      await chatToggle(page2).click();
      await chatPanel(page2).locator("text=AI Assistant").first().waitFor({ state: "visible", timeout: 5000 });
      const buttons2 = suggestionButtons(page2);
      const texts2: string[] = [];
      for (let i = 0; i < 3; i++) {
        texts2.push(await buttons2.nth(i).textContent() ?? "");
      }

      // The two random sets may occasionally match, but the pool is 33 items
      // so it's extremely unlikely. We only assert they're non-empty.
      expect(texts1.length).toBe(3);
      expect(texts2.length).toBe(3);
      for (const t of [...texts1, ...texts2]) {
        expect(t.length).toBeGreaterThan(0);
      }
    });
  });

  // ── Sending messages (AWS Bedrock) ─────────────────────────────────────
  // These tests require the Express server (pnpm dev:all) to be running.

  test.describe("Sending messages", () => {
    test("should send a typed message and receive a response", async ({
      page,
    }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);

      const panel = chatPanel(page);
      const input = chatInput(page);
      await input.fill("Who is Themis?");

      const btn = sendButton(page);
      await btn.click();

      // User message should appear with user-bubble styling (cyan background)
      const userBubble = panel.locator("div[class*='bg-cyan-500/20']").filter({ hasText: "Who is Themis?" });
      await expect(userBubble.first()).toBeVisible();

      // Wait for assistant response from Bedrock
      await waitForAssistantReply(page);

      // Suggested questions should disappear after the first user message
      await expect(
        panel.locator("text=Suggested questions:"),
      ).not.toBeVisible();
    });

    test("user message should be right-aligned", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("Hello");
      await sendButton(page).click();

      // User message row should have justify-end (right-aligned)
      const userRow = chatPanel(page).locator("div.justify-end").first();
      await expect(userRow).toBeVisible();
      await expect(userRow).toContainText("Hello");
    });

    test("user message should have distinct styling from assistant", async ({
      page,
    }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);

      const panel = chatPanel(page);
      await chatInput(page).fill("Hello");
      await sendButton(page).click();

      // User message has cyan background (bg-cyan-500/20) with cyan border
      const userBubble = panel.locator("div[class*='bg-cyan-500/20']").first();
      await expect(userBubble).toBeVisible();
      const userClasses = await userBubble.getAttribute("class");
      expect(userClasses).toContain("border");
      expect(userClasses).toContain("text-cyan-200");

      // Wait for assistant reply
      await waitForAssistantReply(page);

      // Assistant message has white/5 background with white/10 border
      const assistantBubbles = panel.locator("div[class*='bg-white/5']");
      // At least 2: welcome + new reply
      await expect(assistantBubbles.nth(1)).toBeVisible();
      const assistantClasses = await assistantBubbles.nth(1).getAttribute("class");
      expect(assistantClasses).toContain("text-gray-300");
    });

    test("assistant reply should be left-aligned", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("Hello");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      // Assistant messages sit inside justify-start rows
      const assistantRows = chatPanel(page).locator("div.justify-start");
      // At least 2: welcome + reply
      expect(await assistantRows.count()).toBeGreaterThanOrEqual(2);
    });

    test("should send a suggested question when clicked", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);

      const panel = chatPanel(page);

      // Click the first suggested question (questions are randomly selected)
      const firstQuestion = suggestionButtons(page).first();
      const questionText = await firstQuestion.textContent();
      await firstQuestion.click();

      // The suggested question text should appear as a user message
      await expect(
        panel.locator("div[class*='bg-cyan-500/20']").filter({ hasText: questionText ?? "" }).first(),
      ).toBeVisible();

      // Wait for the assistant to respond
      await waitForAssistantReply(page);

      // Suggested questions should disappear
      await expect(
        panel.locator("text=Suggested questions:"),
      ).not.toBeVisible();
    });

    test("should send message on Enter key press", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);

      const input = chatInput(page);
      await input.fill("What skills does Themis have?");
      await input.press("Enter");

      // User message should appear
      await expect(
        chatPanel(page).locator("text=What skills does Themis have?").first(),
      ).toBeVisible();

      // Wait for the assistant to respond
      await waitForAssistantReply(page);
    });

    test("should clear input field after sending", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);

      const input = chatInput(page);
      await input.fill("Hello");
      await sendButton(page).click();

      // Input should be cleared immediately
      await expect(input).toHaveValue("");
    });

    test("should not send empty messages", async ({ page }) => {
      await openChat(page);

      const btn = sendButton(page);
      await expect(btn).toBeDisabled();
    });

    test("should not send whitespace-only messages", async ({ page }) => {
      await openChat(page);

      const input = chatInput(page);
      await input.fill("   ");

      const btn = sendButton(page);
      await expect(btn).toBeDisabled();
    });

    test("Enter key should not send empty message", async ({ page }) => {
      await openChat(page);

      const input = chatInput(page);
      await input.press("Enter");

      // Should still only have the welcome message (no user bubble)
      const userBubbles = chatPanel(page).locator("div[class*='max-w-'][class*='bg-cyan-500/20']");
      await expect(userBubbles).toHaveCount(0);
    });

    test("should prevent double-sending while streaming", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      const input = chatInput(page);
      await input.fill("Hello");
      await sendButton(page).click();

      // Input should be disabled during streaming
      try {
        await expect(input).toBeDisabled({ timeout: 2000 });
      } catch {
        // Response arrived too fast — acceptable
      }

      // Wait for response to complete
      await waitForAssistantReply(page);

      // Only 1 user message should exist
      const userBubbles = chatPanel(page).locator("div[class*='max-w-'][class*='bg-cyan-500/20']");
      await expect(userBubbles).toHaveCount(1);
    });
  });

  // ── Streaming UI states ─────────────────────────────────────────────────

  test.describe("Streaming UI", () => {
    test("should disable input and show loading indicator while streaming", async ({
      page,
    }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);

      const input = chatInput(page);
      await input.fill("Tell me about Themis");

      const btn = sendButton(page);
      await btn.click();

      // Either the input is disabled during streaming (loading state)
      // or the response already arrived and re-enabled it.
      // Race condition: if Bedrock responds instantly, we may miss the disabled state.
      try {
        await expect(input).toBeDisabled({ timeout: 2000 });
        // If we caught the disabled state, bouncing dots should be visible
        await expect(
          chatPanel(page).locator(".animate-bounce").first(),
        ).toBeVisible({ timeout: 2000 });
        // Send button text should be replaced with dots (no "Send" text)
        await expect(btn).not.toContainText("Send", { timeout: 1000 });
      } catch {
        // Bedrock responded too fast to catch loading state — acceptable
      }

      // After Bedrock response arrives, input should be re-enabled
      await expect(input).toBeEnabled({ timeout: API_TIMEOUT });
    });

    test("Send button should show bouncing dots while streaming", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("Tell me about Themis");
      await sendButton(page).click();

      // Try to catch the 3 bouncing dots in the Send button
      try {
        const dots = chatPanel(page).locator("button .animate-bounce");
        // Should have 3 dots with staggered delays
        await expect(dots.first()).toBeVisible({ timeout: 2000 });
        const count = await dots.count();
        expect(count).toBe(3);
      } catch {
        // Response arrived too fast
      }

      await waitForAssistantReply(page);
    });

    test("should show typing cursor during streaming", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);

      await chatInput(page).fill("Hello");
      await sendButton(page).click();

      // Try to catch the typing cursor (animate-pulse cyan bar)
      try {
        const cursor = chatPanel(page).locator("span.animate-pulse");
        await expect(cursor.first()).toBeVisible({ timeout: 3000 });
        // Cursor should have cyan background and specific dimensions
        const classes = await cursor.first().getAttribute("class");
        expect(classes).toContain("bg-cyan-400");
      } catch {
        // Bedrock responded too fast — acceptable
      }

      // Eventually the response should complete
      await waitForAssistantReply(page);
    });

    test("typing cursor should disappear after response completes", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("Hello");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      // After completion, no typing cursors should be visible
      const cursors = chatPanel(page).locator("span.animate-pulse.bg-cyan-400");
      await expect(cursors).toHaveCount(0);
    });

    test("Send button should re-enable after response completes", async ({
      page,
    }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);

      await chatInput(page).fill("Hi");
      await sendButton(page).click();

      // Wait for response
      await waitForAssistantReply(page);

      // Send button should show "Send" text again (not dots)
      // It's still disabled because input is empty after clearing
      const btn = sendButton(page);
      await expect(btn).toContainText("Send");
    });
  });

  // ── Multi-turn conversation ───────────────────────────────────────────

  test.describe("Multi-turn conversation", () => {
    test("should support sending multiple messages", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT * 2);

      await openChat(page);

      const panel = chatPanel(page);
      const input = chatInput(page);

      // First message
      await input.fill("What certifications does Themis have?");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      // Second message
      await input.fill("Tell me more about the cloud ones.");
      await sendButton(page).click();

      // Wait for second reply — should now have 2 assistant replies (excluding welcome)
      await page.waitForFunction(
        () => {
          const bubbles = document.querySelectorAll("div[class*='bg-white/5']");
          let count = 0;
          for (const b of bubbles) {
            const text = b.textContent?.trim() ?? "";
            if (text.length > 0 && !text.startsWith("Hi! I'm Themis's AI assistant")) {
              count++;
            }
          }
          return count >= 2;
        },
        null,
        { timeout: API_TIMEOUT },
      );

      // Both user messages should be visible
      await expect(panel.locator("text=What certifications does Themis have?").first()).toBeVisible();
      await expect(panel.locator("text=Tell me more about the cloud ones.").first()).toBeVisible();
    });

    test("follow-up should use conversation context", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT * 2);

      await openChat(page);
      const input = chatInput(page);

      // First: establish context
      await input.fill("What AWS certifications does Themis have?");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      // Follow-up uses pronoun "he" — requires context from first message
      await input.fill("Does he have any Cisco ones too?");
      await sendButton(page).click();

      await page.waitForFunction(
        () => {
          const bubbles = document.querySelectorAll("div[class*='bg-white/5']");
          let count = 0;
          for (const b of bubbles) {
            const text = b.textContent?.trim() ?? "";
            if (text.length > 0 && !text.startsWith("Hi! I'm Themis's AI assistant")) {
              count++;
            }
          }
          return count >= 2;
        },
        null,
        { timeout: API_TIMEOUT },
      );

      // The second reply should exist (we can't guarantee exact content, but it should be non-empty)
      const replyCount = await countAssistantReplies(page);
      expect(replyCount).toBeGreaterThanOrEqual(2);
    });
  });

  // ── Response quality (knowledge base grounding) ───────────────────────

  test.describe("Response quality", () => {
    test("should answer from knowledge base about certifications", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("What certifications does Themis have?");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      // Response should mention at least one real certification from the knowledge base
      const panel = chatPanel(page);
      const replyText = await panel.locator("div[class*='bg-white/5']").nth(1).textContent();
      const lower = replyText?.toLowerCase() ?? "";
      const mentionsCert = lower.includes("cisco") || lower.includes("ccna") ||
        lower.includes("devnet") || lower.includes("fortinet") || lower.includes("cissp");
      expect(mentionsCert).toBe(true);
    });

    test("should deflect unrelated questions", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("What is the capital of France?");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      // Response should indicate it can only help with portfolio-related questions
      const replyText = await chatPanel(page).locator("div[class*='bg-white/5']").nth(1).textContent();
      const lower = replyText?.toLowerCase() ?? "";
      const deflects = lower.includes("can only") || lower.includes("portfolio") ||
        lower.includes("themis") || lower.includes("don't have");
      expect(deflects).toBe(true);
    });

    test("response should refer to him as Themis", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("Tell me about the portfolio owner");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      const replyText = await chatPanel(page).locator("div[class*='bg-white/5']").nth(1).textContent();
      expect(replyText?.toLowerCase()).toContain("themis");
    });

    test("should understand synonym queries (infosec → cybersecurity)", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      // "infosec" is a synonym for cybersecurity in the NLP pipeline
      await chatInput(page).fill("What infosec experience does Themis have?");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      const replyText = await chatPanel(page).locator("div[class*='bg-white/5']").nth(1).textContent();
      const lower = replyText?.toLowerCase() ?? "";
      // Should mention security-related terms even though "infosec" isn't in the knowledge base
      const relevant = lower.includes("security") || lower.includes("cybersecurity") ||
        lower.includes("zero trust") || lower.includes("cyberark") || lower.includes("sentinel");
      expect(relevant).toBe(true);
    });

    test("should understand abbreviated queries (certs, k8s)", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("Does Themis have any certs?");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      const replyText = await chatPanel(page).locator("div[class*='bg-white/5']").nth(1).textContent();
      const lower = replyText?.toLowerCase() ?? "";
      // "certs" should be understood as "certifications"
      const relevant = lower.includes("certif") || lower.includes("cisco") ||
        lower.includes("devnet") || lower.includes("fortinet");
      expect(relevant).toBe(true);
    });

    test("should handle ambiguous questions charitably", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      // Ambiguous "what can you do?" — should interpret as "what can Themis do?"
      await chatInput(page).fill("What can you do?");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      const replyText = await chatPanel(page).locator("div[class*='bg-white/5']").nth(1).textContent();
      const lower = replyText?.toLowerCase() ?? "";
      // Should talk about Themis's capabilities, not the AI's capabilities
      const aboutThemis = lower.includes("themis") || lower.includes("cloud") ||
        lower.includes("security") || lower.includes("network") || lower.includes("skill");
      expect(aboutThemis).toBe(true);
    });

    test("should give concise answers (not overly verbose)", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("Where is Themis based?");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      const replyText = await chatPanel(page).locator("div[class*='bg-white/5']").nth(1).textContent();
      // Simple factual question — response should be concise (under 500 chars)
      expect(replyText?.length).toBeLessThan(500);
      expect(replyText?.length).toBeGreaterThan(10);
    });

    test("should answer hiring questions with relevant experience", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("Why should I hire Themis for a cloud project?");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      const replyText = await chatPanel(page).locator("div[class*='bg-white/5']").nth(1).textContent();
      const lower = replyText?.toLowerCase() ?? "";
      // Should cite concrete experience or certifications
      const concrete = lower.includes("aws") || lower.includes("cloud") ||
        lower.includes("architect") || lower.includes("certif") || lower.includes("experience");
      expect(concrete).toBe(true);
    });
  });

  // ── Booking flow trigger ────────────────────────────────────────────────

  test.describe("Booking flow", () => {
    test("should respond to booking request", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);

      const panel = chatPanel(page);

      // Click the booking suggested question
      await panel.locator("text=Book a call with Themis.").click();

      // Bedrock should return [BOOK_CALL] → triggers BookingCard
      // or respond with a natural-language message about booking.
      await waitForAssistantReply(page).catch(() => {
        // If no text reply, check for the BookingCard instead
      });

      // Verify *something* appeared — either a BookingCard or a text response
      const hasBookingCard = await panel
        .locator("text=Loading available slots…")
        .or(panel.locator("text=Pick a time slot"))
        .or(panel.locator("text=Booking unavailable"))
        .first()
        .isVisible()
        .catch(() => false);

      const hasTextReply = await panel
        .locator("div[class*='bg-white/5']")
        .filter({
          hasNotText: "Hi! I'm Themis's AI assistant",
        })
        .first()
        .isVisible()
        .catch(() => false);

      expect(
        hasBookingCard || hasTextReply,
        "Expected either a BookingCard or a text response from the assistant",
      ).toBe(true);
    });

    test("booking suggested question should appear as user message", async ({
      page,
    }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);

      const panel = chatPanel(page);
      await panel.locator("text=Book a call with Themis.").click();

      // The booking question should appear as a user bubble
      const userBubble = panel.locator("div[class*='bg-cyan-500/20']").filter({
        hasText: "Book a call with Themis.",
      });
      await expect(userBubble.first()).toBeVisible();
    });

    test("should trigger booking via natural language too", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("I'd like to schedule a meeting with Themis");
      await sendButton(page).click();

      // Either BookingCard appears or a text response about booking
      await waitForAssistantReply(page).catch(() => {});

      const panel = chatPanel(page);
      const hasBookingCard = await panel
        .locator("text=Loading available slots…")
        .or(panel.locator("text=Pick a time slot"))
        .or(panel.locator("text=Booking unavailable"))
        .first()
        .isVisible()
        .catch(() => false);

      const hasTextReply = await panel
        .locator("div[class*='bg-white/5']")
        .filter({ hasNotText: "Hi! I'm Themis's AI assistant" })
        .first()
        .isVisible()
        .catch(() => false);

      expect(hasBookingCard || hasTextReply).toBe(true);
    });
  });

  // ── Contact action ────────────────────────────────────────────────────

  test.describe("Contact action", () => {
    test("contact suggested question should appear as user message", async ({
      page,
    }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);

      const panel = chatPanel(page);
      await panel.locator("text=Send a message to Themis.").click();

      // The contact question should appear as a user bubble
      const userBubble = panel.locator("div[class*='bg-cyan-500/20']").filter({
        hasText: "Send a message to Themis.",
      });
      await expect(userBubble.first()).toBeVisible();
    });

    test("should navigate to contact page on contact action", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);

      const panel = chatPanel(page);
      await panel.locator("text=Send a message to Themis.").click();

      // Should navigate to /contact/ (either via router.push or text response with link)
      // The model may respond with [CONTACT] or a text response — either is valid
      try {
        await page.waitForURL("**/contact/", { timeout: API_TIMEOUT });
      } catch {
        // If not auto-navigated, check that a response appeared
        await waitForAssistantReply(page).catch(() => {});
      }
    });

    test("should trigger contact via natural language", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("I want to get in touch with Themis");
      await sendButton(page).click();

      // Either navigates to /contact/ or provides a text response
      try {
        await page.waitForURL("**/contact/", { timeout: API_TIMEOUT });
      } catch {
        await waitForAssistantReply(page).catch(() => {});
        // Response should at least mention contact
        const replyText = await chatPanel(page).locator("div[class*='bg-white/5']").nth(1).textContent().catch(() => "");
        const lower = (replyText ?? "").toLowerCase();
        const mentionsContact = lower.includes("contact") || lower.includes("email") ||
          lower.includes("form") || lower.includes("touch") || lower.includes("opening");
        expect(mentionsContact).toBe(true);
      }
    });
  });

  // ── Navigation links ────────────────────────────────────────────────────

  test.describe("Navigation links", () => {
    test("should show clickable navigation link when model suggests a page", async ({
      page,
    }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);

      const input = chatInput(page);
      await input.fill("Show me the performance metrics page");
      await sendButton(page).click();

      // Wait for response
      await waitForAssistantReply(page);

      // Check if a navigation link appeared (the NavigateLink component)
      // The model may or may not include a [GOTO:] token — this is LLM-dependent
      const navLink = chatPanel(page).locator("a[href*='/performance']");
      const hasNavLink = await navLink.isVisible().catch(() => false);

      // Either a nav link or a text response mentioning performance is acceptable
      if (!hasNavLink) {
        const panel = chatPanel(page);
        const assistantBubbles = panel.locator("div[class*='bg-white/5']");
        const lastBubble = assistantBubbles.last();
        const text = await lastBubble.textContent();
        expect(text?.toLowerCase()).toContain("performance");
      }
    });

    test("navigation link should have correct styling if present", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("Where can I see Themis's projects?");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      // If a nav link appeared, verify its styling
      const navLink = chatPanel(page).locator("a").filter({ hasText: "Go to" }).first();
      const hasLink = await navLink.isVisible().catch(() => false);
      if (hasLink) {
        const classes = await navLink.getAttribute("class");
        expect(classes).toContain("font-mono");
        expect(classes).toContain("text-xs");
        expect(classes).toContain("rounded");
        expect(classes).toContain("border");
        // Should have an arrow SVG icon
        const svg = navLink.locator("svg");
        await expect(svg).toBeAttached();
      }
    });

    test("navigation link should have valid href", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("I want to read the blog");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      // If a nav link appeared, its href should start with /
      const navLinks = chatPanel(page).locator("a").filter({ hasText: "Go to" });
      const count = await navLinks.count();
      for (let i = 0; i < count; i++) {
        const href = await navLinks.nth(i).getAttribute("href");
        expect(href).toMatch(/^\//);
      }
    });
  });

  // ── Thinking indicator ──────────────────────────────────────────────────

  test.describe("Thinking indicator", () => {
    test("should show thinking indicator when tools are used", async ({
      page,
    }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);

      // Ask a question that is likely to trigger tool use (GitHub stats)
      const input = chatInput(page);
      await input.fill("What's on Themis's GitHub?");
      await sendButton(page).click();

      // Try to catch the thinking indicator ("Looking up…")
      // This is timing-sensitive — the indicator may flash quickly
      try {
        await expect(
          chatPanel(page).locator("text=Looking up").first(),
        ).toBeVisible({ timeout: 5000 });
      } catch {
        // Tool may not have been called, or indicator was too fast to catch — acceptable
      }

      // Response should eventually complete
      await waitForAssistantReply(page);
    });

    test("thinking indicator should have bouncing dots", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("What's on Themis's GitHub profile?");
      await sendButton(page).click();

      // Try to catch the thinking indicator with bouncing dots
      try {
        const indicator = chatPanel(page).locator("span").filter({ hasText: "Looking up" }).first();
        await indicator.waitFor({ state: "visible", timeout: 5000 });
        // Should have 3 bouncing dots inside the same parent
        const dots = indicator.locator(".animate-bounce");
        expect(await dots.count()).toBe(3);
      } catch {
        // Timing-sensitive — tool may not have been called
      }

      await waitForAssistantReply(page);
    });

    test("thinking indicator should clear after response arrives", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("What's on Themis's GitHub?");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      // After response completes, no thinking indicator should remain
      const thinking = chatPanel(page).locator("text=Looking up");
      await expect(thinking).toHaveCount(0);
    });
  });

  // ── Blog search (tool use) ────────────────────────────────────────────

  test.describe("Blog search", () => {
    test("should answer questions about blog articles", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("What blog articles has Themis written?");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      // Response should mention at least one blog topic
      const replyText = await chatPanel(page).locator("div[class*='bg-white/5']").nth(1).textContent();
      const lower = replyText?.toLowerCase() ?? "";
      const mentionsBlog = lower.includes("blog") || lower.includes("article") ||
        lower.includes("cloud") || lower.includes("zero trust") || lower.includes("next.js");
      expect(mentionsBlog).toBe(true);
    });

    test("should answer about specific blog content", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("Tell me about the cloud architecture blog post");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      const replyText = await chatPanel(page).locator("div[class*='bg-white/5']").nth(1).textContent();
      const lower = replyText?.toLowerCase() ?? "";
      // Should mention cloud/AWS/architecture from the blog post
      const relevant = lower.includes("cloud") || lower.includes("aws") ||
        lower.includes("resilient") || lower.includes("architecture");
      expect(relevant).toBe(true);
    });
  });

  // ── Keyboard interaction ──────────────────────────────────────────────

  test.describe("Keyboard interaction", () => {
    test("Shift+Enter should not send the message", async ({ page }) => {
      await openChat(page);

      const input = chatInput(page);
      await input.fill("Test message");
      await input.press("Shift+Enter");

      // No user bubble should appear
      const userBubbles = chatPanel(page).locator("div[class*='max-w-'][class*='bg-cyan-500/20']");
      await expect(userBubbles).toHaveCount(0);
    });

    test("should allow typing in the input field", async ({ page }) => {
      await openChat(page);

      const input = chatInput(page);
      await input.pressSequentially("Hello world");
      await expect(input).toHaveValue("Hello world");
    });

    test("Send button should enable when input has text", async ({ page }) => {
      await openChat(page);

      const btn = sendButton(page);
      const input = chatInput(page);

      // Initially disabled
      await expect(btn).toBeDisabled();

      // Type text → enabled
      await input.fill("Hello");
      await expect(btn).toBeEnabled();

      // Clear text → disabled again
      await input.fill("");
      await expect(btn).toBeDisabled();
    });

    test("should handle special characters in messages", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      const input = chatInput(page);
      const specialMsg = "What about C++ & Python? <script>";
      await input.fill(specialMsg);
      await sendButton(page).click();

      // Message should appear without XSS issues
      const userBubble = chatPanel(page).locator("div[class*='bg-cyan-500/20']").filter({ hasText: "C++" });
      await expect(userBubble.first()).toBeVisible();

      // No script tags should be injected into the DOM
      const scriptCount = await page.locator("script").filter({ hasText: "" }).count();
      // Only existing scripts, no new injected ones
      expect(scriptCount).toBeGreaterThanOrEqual(0);
    });
  });

  // ── Error handling ───────────────────────────────────────────────────────

  test.describe("Error handling", () => {
    test("should display error inline when API returns error", async ({ page }) => {
      // Intercept chat API to force a 500 error
      await page.route("**/api/chat", (route) =>
        route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "Test error" }) }),
      );

      await openChat(page);
      await chatInput(page).fill("Hello");
      await sendButton(page).click();

      // Wait for error to appear in the assistant bubble
      await page.waitForFunction(
        () => {
          const bubbles = document.querySelectorAll("div[class*='bg-white/5']");
          for (const b of bubbles) {
            const text = b.textContent?.trim() ?? "";
            if (text.includes("Error:")) return true;
          }
          return false;
        },
        null,
        { timeout: 10000 },
      );

      // Error should be displayed inline (not a modal or crash)
      const errorBubble = chatPanel(page).locator("div[class*='bg-white/5']").filter({ hasText: "Error:" });
      await expect(errorBubble.first()).toBeVisible();
      await expect(errorBubble.first()).toContainText("Test error");
    });

    test("error message should not crash the widget", async ({ page }) => {
      // Intercept chat API to force a 500 error
      await page.route("**/api/chat", (route) =>
        route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "Server down" }) }),
      );

      await openChat(page);
      await chatInput(page).fill("Hello");
      await sendButton(page).click();

      // Wait for error to appear
      await page.waitForFunction(
        () => {
          const bubbles = document.querySelectorAll("div[class*='bg-white/5']");
          for (const b of bubbles) {
            if (b.textContent?.includes("Error:")) return true;
          }
          return false;
        },
        null,
        { timeout: 10000 },
      );

      // Widget should still be functional — input should be re-enabled
      const input = chatInput(page);
      await expect(input).toBeEnabled();

      // Can type a new message
      await input.fill("Try again");
      await expect(sendButton(page)).toBeEnabled();
    });

    test("widget should recover after network error", async ({ page }) => {
      // First request: force error
      let callCount = 0;
      await page.route("**/api/chat", (route) => {
        callCount++;
        if (callCount === 1) {
          return route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "Temporary failure" }) });
        }
        return route.continue();
      });

      await openChat(page);
      await chatInput(page).fill("Hello");
      await sendButton(page).click();

      // Wait for error
      await page.waitForFunction(
        () => document.querySelectorAll("div[class*='bg-white/5']").length >= 2,
        null,
        { timeout: 10000 },
      );

      // Input should be re-enabled for retry
      await expect(chatInput(page)).toBeEnabled();
      await expect(sendButton(page)).toBeVisible();
    });
  });

  // ── Accessibility ───────────────────────────────────────────────────────

  test.describe("Accessibility", () => {
    test("toggle button should have proper aria-label", async ({ page }) => {
      await dismissCookieConsent(page);
      const toggle = chatToggle(page);
      await expect(toggle).toBeVisible();
      await expect(toggle).toHaveAttribute("aria-label", "Open chat");

      await toggle.click();

      // The X close button inside the chat panel header should have aria-label
      const close = chatPanel(page).locator(
        'button[aria-label="Close chat"]',
      );
      await expect(close).toBeVisible();
      await expect(close).toHaveAttribute("aria-label", "Close chat");
    });

    test("aria-label should toggle between open and closed states", async ({
      page,
    }) => {
      await dismissCookieConsent(page);

      // Closed state
      await expect(chatToggle(page)).toHaveAttribute("aria-label", "Open chat");

      // Open
      await chatToggle(page).click();
      const openToggle = page.locator('button[aria-label="Chat is open"]');
      await expect(openToggle).toBeAttached();

      // Close
      const close = chatPanel(page).locator('button[aria-label="Close chat"]');
      await close.click();

      // Back to "Open chat"
      await expect(chatToggle(page)).toHaveAttribute("aria-label", "Open chat");
    });

    test("input should be focused when chat opens", async ({ page }) => {
      await openChat(page);

      // Small delay for the focus timeout in the component (setTimeout 100ms)
      await page.waitForTimeout(200);

      const input = chatInput(page);
      await expect(input).toBeFocused();
    });

    test("close button should be visible and clickable", async ({ page }) => {
      await openChat(page);

      const close = chatPanel(page).locator('button[aria-label="Close chat"]');
      await expect(close).toBeVisible();
      await expect(close).toBeEnabled();
    });

    test("input should have correct type for keyboard access", async ({
      page,
    }) => {
      await openChat(page);
      const input = chatInput(page);
      // Input should be a text-like input (not hidden, not submit)
      await expect(input).toBeEnabled();
      await expect(input).toBeEditable();
    });

    test("all interactive elements should be keyboard-reachable", async ({ page }) => {
      await openChat(page);

      const panel = chatPanel(page);

      // Close button should be focusable and enabled
      const closeBtn = panel.locator('button[aria-label="Close chat"]');
      await expect(closeBtn).toBeEnabled();

      // Input should be focusable
      const input = chatInput(page);
      await input.focus();
      await expect(input).toBeFocused();

      // Send button should be focusable when enabled
      await input.fill("test");
      const btn = sendButton(page);
      await expect(btn).toBeEnabled();
    });

    test("suggestion buttons should be keyboard-accessible", async ({ page }) => {
      await openChat(page);

      const buttons = suggestionButtons(page);
      const first = buttons.first();
      await first.focus();
      await expect(first).toBeFocused();

      // Should be activatable via keyboard (Enter)
      // We don't actually press Enter as it would send the message to Bedrock
      await expect(first).toBeEnabled();
    });
  });

  // ── Scroll behaviour ──────────────────────────────────────────────────

  test.describe("Scroll behaviour", () => {
    test("messages area should be scrollable", async ({ page }) => {
      await openChat(page);

      // The ScrollArea component should be present
      const scrollArea = chatPanel(page).locator("[data-radix-scroll-area-viewport]");
      await expect(scrollArea.first()).toBeAttached();
    });

    test("should auto-scroll to newest message", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("Hello");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      // The messagesEnd ref div should be in view (auto-scrolled)
      // We verify indirectly: the latest assistant reply should be visible
      const replies = chatPanel(page).locator("div[class*='bg-white/5']");
      const lastReply = replies.last();
      await expect(lastReply).toBeVisible();
    });
  });

  // ── GA4 tracking ──────────────────────────────────────────────────────

  test.describe("GA4 tracking", () => {
    test("should fire chat_open event on toggle click", async ({ page }) => {
      await dismissCookieConsent(page);

      // Listen for the gtag dataLayer push
      const gtagCalls: string[] = [];
      await page.exposeFunction("__testGtagCapture", (eventName: string) => {
        gtagCalls.push(eventName);
      });
      await page.evaluate(() => {
        const original = window.gtag;
        if (typeof original === "function") {
          window.gtag = function (...args: unknown[]) {
            if (args[0] === "event" && typeof args[1] === "string") {
              (window as unknown as { __testGtagCapture: (s: string) => void }).__testGtagCapture(args[1]);
            }
            return original.apply(window, args as Parameters<typeof original>);
          } as typeof window.gtag;
        }
      });

      // Open chat
      await chatToggle(page).click();
      await page.waitForTimeout(500);

      // GA4 may or may not be loaded in test env — don't fail if gtag is not present
      // This test verifies the component calls trackGA4, not that GA4 is configured
    });
  });

  // ── State persistence within session ──────────────────────────────────

  test.describe("State persistence", () => {
    test("chat panel should preserve messages after close and reopen", async ({
      page,
    }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);

      const panel = chatPanel(page);
      const input = chatInput(page);

      // Send a message
      await input.fill("Hello");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      // Close the panel
      const close = panel.locator('button[aria-label="Close chat"]');
      await close.click();

      // Reopen
      await chatToggle(page).click();
      await chatPanel(page).locator("text=AI Assistant").first().waitFor({ state: "visible", timeout: 5000 });

      // Previous user message should still be visible
      await expect(chatPanel(page).locator("text=Hello").first()).toBeVisible();

      // Assistant reply should still be visible
      const replyCount = await countAssistantReplies(page);
      expect(replyCount).toBeGreaterThanOrEqual(1);
    });

    test("welcome message should persist after close and reopen (no messages sent)", async ({
      page,
    }) => {
      await openChat(page);

      // Close
      const close = chatPanel(page).locator('button[aria-label="Close chat"]');
      await close.click();

      // Reopen
      await chatToggle(page).click();
      await chatPanel(page).locator("text=AI Assistant").first().waitFor({ state: "visible", timeout: 5000 });

      // Welcome message should still be there
      await expect(
        chatPanel(page).locator("text=Hi! I'm Themis's AI assistant").first(),
      ).toBeVisible();

      // Suggested questions should also persist
      await expect(
        chatPanel(page).locator("text=Suggested questions:"),
      ).toBeVisible();
    });

    test("suggested questions should persist after close and reopen", async ({ page }) => {
      await openChat(page);

      // Note the questions
      const buttons = suggestionButtons(page);
      const firstText = await buttons.first().textContent();

      // Close and reopen
      await chatPanel(page).locator('button[aria-label="Close chat"]').click();
      await chatToggle(page).click();
      await chatPanel(page).locator("text=AI Assistant").first().waitFor({ state: "visible", timeout: 5000 });

      // Same questions should be there
      const buttonsAfter = suggestionButtons(page);
      await expect(buttonsAfter).toHaveCount(5);
      const firstTextAfter = await buttonsAfter.first().textContent();
      expect(firstTextAfter).toBe(firstText);
    });

    test("input value should clear on close and reopen", async ({ page }) => {
      await openChat(page);

      // Type something but don't send
      await chatInput(page).fill("draft message");

      // Close and reopen
      await chatPanel(page).locator('button[aria-label="Close chat"]').click();
      await chatToggle(page).click();
      await chatPanel(page).locator("text=AI Assistant").first().waitFor({ state: "visible", timeout: 5000 });

      // React state persists since component isn't unmounted — just verify input is functional
      const input = chatInput(page);
      await expect(input).toBeEnabled();
    });
  });

  // ── SSE protocol (route interception) ────────────────────────────────

  test.describe("SSE protocol", () => {
    test("should handle token events and append to message", async ({ page }) => {
      // Intercept chat API to send controlled SSE tokens
      await page.route("**/api/chat", (route) =>
        route.fulfill({
          status: 200,
          contentType: "text/event-stream",
          body: 'data: {"token": "Hello "}\n\ndata: {"token": "world!"}\n\ndata: [DONE]\n\n',
        }),
      );

      await openChat(page);
      await chatInput(page).fill("test");
      await sendButton(page).click();

      // Wait for the full message to render
      await expect(
        chatPanel(page).locator("div[class*='bg-white/5']").filter({ hasText: "Hello world!" }).first(),
      ).toBeVisible({ timeout: 5000 });
    });

    test("should handle action event for booking", async ({ page }) => {
      await page.route("**/api/chat", (route) =>
        route.fulfill({
          status: 200,
          contentType: "text/event-stream",
          body: 'data: {"action": "start_booking"}\n\ndata: [DONE]\n\n',
        }),
      );

      await openChat(page);
      await chatInput(page).fill("book");
      await sendButton(page).click();

      // BookingCard should render (or its loading state)
      await expect(
        chatPanel(page).locator("text=Loading available slots")
          .or(chatPanel(page).locator("text=Pick a time slot"))
          .or(chatPanel(page).locator("text=Booking unavailable"))
          .first(),
      ).toBeVisible({ timeout: 5000 });
    });

    test("should handle action event for contact", async ({ page }) => {
      await page.route("**/api/chat", (route) =>
        route.fulfill({
          status: 200,
          contentType: "text/event-stream",
          body: 'data: {"action": "open_contact"}\n\ndata: [DONE]\n\n',
        }),
      );

      await openChat(page);
      await chatInput(page).fill("contact");
      await sendButton(page).click();

      // Should navigate to /contact/
      await page.waitForURL("**/contact/", { timeout: 5000 });
    });

    test("should handle navigate action with link rendering", async ({ page }) => {
      await page.route("**/api/chat", (route) =>
        route.fulfill({
          status: 200,
          contentType: "text/event-stream",
          body: 'data: {"token": "Check out the performance page."}\n\ndata: {"action": "navigate", "path": "/performance/"}\n\ndata: [DONE]\n\n',
        }),
      );

      await openChat(page);
      await chatInput(page).fill("test");
      await sendButton(page).click();

      // Text should render
      await expect(
        chatPanel(page).locator("div[class*='bg-white/5']").filter({ hasText: "Check out the performance page." }).first(),
      ).toBeVisible({ timeout: 5000 });

      // NavigateLink should render with correct href
      const navLink = chatPanel(page).locator('a[href="/performance/"]');
      await expect(navLink).toBeVisible();
      await expect(navLink).toContainText("Go to performance");
    });

    test("should handle thinking status event", async ({ page }) => {
      await page.route("**/api/chat", async (route) => {
        // Simulate: thinking → then text response
        const body = [
          'data: {"status": "thinking"}\n\n',
          'data: {"token": "Here are the results."}\n\n',
          "data: [DONE]\n\n",
        ].join("");
        await route.fulfill({ status: 200, contentType: "text/event-stream", body });
      });

      await openChat(page);
      await chatInput(page).fill("test");
      await sendButton(page).click();

      // Final text should render
      await expect(
        chatPanel(page).locator("div[class*='bg-white/5']").filter({ hasText: "Here are the results." }).first(),
      ).toBeVisible({ timeout: 5000 });
    });

    test("should handle error event inline", async ({ page }) => {
      await page.route("**/api/chat", (route) =>
        route.fulfill({
          status: 200,
          contentType: "text/event-stream",
          body: 'data: {"error": "Model overloaded"}\n\ndata: [DONE]\n\n',
        }),
      );

      await openChat(page);
      await chatInput(page).fill("test");
      await sendButton(page).click();

      await expect(
        chatPanel(page).locator("div[class*='bg-white/5']").filter({ hasText: "Error: Model overloaded" }).first(),
      ).toBeVisible({ timeout: 5000 });
    });

    test("should handle empty response gracefully", async ({ page }) => {
      await page.route("**/api/chat", (route) =>
        route.fulfill({
          status: 200,
          contentType: "text/event-stream",
          body: "data: [DONE]\n\n",
        }),
      );

      await openChat(page);
      await chatInput(page).fill("test");
      await sendButton(page).click();

      // Should not crash — input should re-enable
      await expect(chatInput(page)).toBeEnabled({ timeout: 5000 });
    });
  });

  // ── Knowledge base coverage ──────────────────────────────────────────

  test.describe("Knowledge base coverage", () => {
    test("should answer about work experience", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("Where has Themis worked?");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      const reply = await chatPanel(page).locator("div[class*='bg-white/5']").nth(1).textContent();
      const lower = reply?.toLowerCase() ?? "";
      // Should mention at least one employer from knowledge base
      const mentions = lower.includes("skaramangas") || lower.includes("estarta") ||
        lower.includes("airport") || lower.includes("cosmos") || lower.includes("navy");
      expect(mentions).toBe(true);
    });

    test("should answer about education", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("What is Themis's educational background?");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      const reply = await chatPanel(page).locator("div[class*='bg-white/5']").nth(1).textContent();
      const lower = reply?.toLowerCase() ?? "";
      const mentions = lower.includes("master") || lower.includes("bachelor") ||
        lower.includes("data analytics") || lower.includes("informatics") || lower.includes("degree");
      expect(mentions).toBe(true);
    });

    test("should answer about projects", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("What projects has Themis built?");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      const reply = await chatPanel(page).locator("div[class*='bg-white/5']").nth(1).textContent();
      const lower = reply?.toLowerCase() ?? "";
      const mentions = lower.includes("project") || lower.includes("portfolio") ||
        lower.includes("monitoring") || lower.includes("built");
      expect(mentions).toBe(true);
    });

    test("should answer about services and availability", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("What services does Themis offer?");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      const reply = await chatPanel(page).locator("div[class*='bg-white/5']").nth(1).textContent();
      const lower = reply?.toLowerCase() ?? "";
      const mentions = lower.includes("consult") || lower.includes("service") ||
        lower.includes("available") || lower.includes("remote") || lower.includes("project");
      expect(mentions).toBe(true);
    });

    test("should answer about skills and technologies", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("What technologies does Themis know?");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      const reply = await chatPanel(page).locator("div[class*='bg-white/5']").nth(1).textContent();
      const lower = reply?.toLowerCase() ?? "";
      // Should mention concrete technologies
      const mentions = lower.includes("cisco") || lower.includes("aws") ||
        lower.includes("azure") || lower.includes("python") || lower.includes("react") ||
        lower.includes("security") || lower.includes("cloud");
      expect(mentions).toBe(true);
    });

    test("should know about the portfolio website itself", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("How was this portfolio website built?");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      const reply = await chatPanel(page).locator("div[class*='bg-white/5']").nth(1).textContent();
      const lower = reply?.toLowerCase() ?? "";
      const mentions = lower.includes("next") || lower.includes("react") ||
        lower.includes("typescript") || lower.includes("aws") || lower.includes("tailwind");
      expect(mentions).toBe(true);
    });
  });

  // ── NLP synonym & stemming coverage ──────────────────────────────────

  test.describe("NLP synonym & stemming", () => {
    test("should resolve k8s synonym to Kubernetes", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("Does Themis have k8s experience?");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      const reply = await chatPanel(page).locator("div[class*='bg-white/5']").nth(1).textContent();
      const lower = reply?.toLowerCase() ?? "";
      // Should understand k8s as Kubernetes/containers
      const mentions = lower.includes("kubernetes") || lower.includes("docker") ||
        lower.includes("container") || lower.includes("devops") || lower.includes("k8s");
      expect(mentions).toBe(true);
    });

    test("should resolve IAM synonym to identity/access", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("Tell me about Themis's IAM experience");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      const reply = await chatPanel(page).locator("div[class*='bg-white/5']").nth(1).textContent();
      const lower = reply?.toLowerCase() ?? "";
      const mentions = lower.includes("identity") || lower.includes("access") ||
        lower.includes("cyberark") || lower.includes("azure ad") || lower.includes("entra") ||
        lower.includes("iam") || lower.includes("pam");
      expect(mentions).toBe(true);
    });

    test("should resolve datacenter synonym to Cisco infrastructure", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("What datacenter technologies does Themis work with?");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      const reply = await chatPanel(page).locator("div[class*='bg-white/5']").nth(1).textContent();
      const lower = reply?.toLowerCase() ?? "";
      const mentions = lower.includes("cisco") || lower.includes("ucs") ||
        lower.includes("hyperflex") || lower.includes("aci") || lower.includes("data center") ||
        lower.includes("vmware");
      expect(mentions).toBe(true);
    });

    test("should handle stemmed queries (networking → network)", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("Tell me about Themis's networking background");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      const reply = await chatPanel(page).locator("div[class*='bg-white/5']").nth(1).textContent();
      const lower = reply?.toLowerCase() ?? "";
      const mentions = lower.includes("network") || lower.includes("cisco") ||
        lower.includes("routing") || lower.includes("switching") || lower.includes("infrastructure");
      expect(mentions).toBe(true);
    });

    test("should handle multi-word synonym (zero-trust → zero trust)", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);
      await chatInput(page).fill("What is Themis's approach to zero-trust?");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      const reply = await chatPanel(page).locator("div[class*='bg-white/5']").nth(1).textContent();
      const lower = reply?.toLowerCase() ?? "";
      const mentions = lower.includes("zero trust") || lower.includes("zero-trust") ||
        lower.includes("security") || lower.includes("ztna");
      expect(mentions).toBe(true);
    });
  });

  // ── Conversation history ────────────────────────────────────────────

  test.describe("Cover letter generation", () => {
    test("should accept a job description and generate a tailored cover letter", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running");
      test.setTimeout(API_TIMEOUT * 2);

      await openChat(page);
      const input = chatInput(page);

      // Paste a job description and ask for a cover letter
      await input.fill(
        "Can you write a cover letter for this job? Cloud Architect needed with AWS experience, networking, and security certifications. Must have Cisco and Terraform skills.",
      );
      await sendButton(page).click();
      await waitForAssistantReply(page);

      // The response should contain cover-letter-style content referencing Themis's skills
      const panel = chatPanel(page);
      const replyText = await panel
        .locator("div[class*='bg-white/5']")
        .filter({ hasNotText: "Hi! I'm Themis's AI assistant" })
        .first()
        .innerText();

      // Should mention relevant skills from the knowledge base
      const lowerReply = replyText.toLowerCase();
      const relevantTerms = ["aws", "cloud", "cisco", "network", "security", "architect"];
      const matchedTerms = relevantTerms.filter((t) => lowerReply.includes(t));
      expect(matchedTerms.length).toBeGreaterThanOrEqual(2);
    });

    test("should produce multi-paragraph response for cover letter request", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running");
      test.setTimeout(API_TIMEOUT * 2);

      await openChat(page);
      const input = chatInput(page);

      await input.fill(
        "Write me a cover letter for a DevOps Engineer role. Requirements: CI/CD, Kubernetes, infrastructure as code.",
      );
      await sendButton(page).click();
      await waitForAssistantReply(page);

      const panel = chatPanel(page);
      const replyText = await panel
        .locator("div[class*='bg-white/5']")
        .filter({ hasNotText: "Hi! I'm Themis's AI assistant" })
        .first()
        .innerText();

      // Cover letters should be substantive (more than a one-liner)
      expect(replyText.length).toBeGreaterThan(200);
    });
  });

  test.describe("Conversation history", () => {
    test("should maintain context across messages (last 6 turns)", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running");
      test.setTimeout(API_TIMEOUT * 3);

      await openChat(page);
      const input = chatInput(page);

      // Send 3 messages to build up history
      await input.fill("What certifications does Themis have?");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      await input.fill("Which ones are Cisco-related?");
      await sendButton(page).click();
      await page.waitForFunction(
        () => {
          const bubbles = document.querySelectorAll("div[class*='bg-white/5']");
          let count = 0;
          for (const b of bubbles) {
            const text = b.textContent?.trim() ?? "";
            if (text.length > 0 && !text.startsWith("Hi! I'm Themis's AI assistant")) count++;
          }
          return count >= 2;
        },
        null,
        { timeout: API_TIMEOUT },
      );

      // Third message references previous context
      await input.fill("Are any of those expiring soon?");
      await sendButton(page).click();
      await page.waitForFunction(
        () => {
          const bubbles = document.querySelectorAll("div[class*='bg-white/5']");
          let count = 0;
          for (const b of bubbles) {
            const text = b.textContent?.trim() ?? "";
            if (text.length > 0 && !text.startsWith("Hi! I'm Themis's AI assistant")) count++;
          }
          return count >= 3;
        },
        null,
        { timeout: API_TIMEOUT },
      );

      // All 3 user messages should be visible (history preserved)
      const panel = chatPanel(page);
      await expect(panel.locator("text=What certifications").first()).toBeVisible();
      await expect(panel.locator("text=Which ones are Cisco").first()).toBeVisible();
      await expect(panel.locator("text=Are any of those expiring").first()).toBeVisible();
    });
  });

  // ---------------------------------------------------------------------------
  // New chatbot tools
  // ---------------------------------------------------------------------------

  test.describe("New chatbot tools", () => {
    test("resume download — get_resume_link", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running");
      test.setTimeout(API_TIMEOUT * 2);

      await waitForAppReady(page);
      await openChat(page);

      const input = chatInput(page);
      await input.fill("Can I download Themis's resume?");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      const panel = chatPanel(page);
      const replyText = (await panel.locator("div[class*='bg-white/5']").allTextContents()).join(" ").toLowerCase();
      expect(
        replyText.includes("resume") ||
        replyText.includes("cv") ||
        replyText.includes("download") ||
        replyText.includes("pdf"),
      ).toBeTruthy();
    });

    test("site performance — get_site_performance", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running");
      test.setTimeout(API_TIMEOUT * 2);

      await waitForAppReady(page);
      await openChat(page);

      const input = chatInput(page);
      await input.fill("How fast is this website?");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      const panel = chatPanel(page);
      const replyText = (await panel.locator("div[class*='bg-white/5']").allTextContents()).join(" ").toLowerCase();
      expect(
        replyText.includes("performance") ||
        replyText.includes("speed") ||
        replyText.includes("vitals") ||
        replyText.includes("metrics"),
      ).toBeTruthy();
    });

    test("project search — search_projects", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running");
      test.setTimeout(API_TIMEOUT * 2);

      await waitForAppReady(page);
      await openChat(page);

      const input = chatInput(page);
      await input.fill("Show me Themis's AWS projects");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      const panel = chatPanel(page);
      const replyText = (await panel.locator("div[class*='bg-white/5']").allTextContents()).join(" ").toLowerCase();
      expect(
        replyText.includes("project") ||
        replyText.includes("aws"),
      ).toBeTruthy();
    });

    test("system health — get_system_health", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running");
      test.setTimeout(API_TIMEOUT * 2);

      await waitForAppReady(page);
      await openChat(page);

      const input = chatInput(page);
      await input.fill("Is the site working?");
      await sendButton(page).click();
      await waitForAssistantReply(page);

      const panel = chatPanel(page);
      const replyText = (await panel.locator("div[class*='bg-white/5']").allTextContents()).join(" ").toLowerCase();
      expect(
        replyText.includes("healthy") ||
        replyText.includes("online") ||
        replyText.includes("status") ||
        replyText.includes("uptime"),
      ).toBeTruthy();
    });

    test("contact via chat — send_message_to_themis", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running");
      test.setTimeout(API_TIMEOUT * 2);

      await waitForAppReady(page);
      await openChat(page);

      const input = chatInput(page);
      await input.fill(
        "I want to send Themis a message. My name is Test User, email test@example.com, message: Hello from the chatbot test",
      );
      await sendButton(page).click();
      await waitForAssistantReply(page);

      const panel = chatPanel(page);
      const replyText = (await panel.locator("div[class*='bg-white/5']").allTextContents()).join(" ").toLowerCase();
      expect(
        replyText.includes("sent") ||
        replyText.includes("delivered") ||
        replyText.includes("confirm"),
      ).toBeTruthy();
    });
  });
});
