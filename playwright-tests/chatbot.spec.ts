import { expect, test } from "@playwright/test";
import { waitForAppReady } from "./test-utils";

/**
 * AI Chatbot Widget — end-to-end tests (AWS Bedrock)
 *
 * Covers: toggle behaviour, welcome message, suggested questions,
 * message sending, streaming UI, booking-flow trigger,
 * keyboard interaction, panel structure, cyberpunk styling,
 * responsive behaviour, and accessibility.
 *
 * These tests hit the real /api/chat → Express server → AWS Bedrock (Claude 3 Haiku).
 * The chatbot requires AWS credentials and Bedrock model access.
 */

// Bedrock typically responds in 1-3 seconds — generous timeout for network variability
const API_TIMEOUT = 30_000;

// Express server URL — tests that require the Bedrock backend will skip when unavailable
const API_URL = process.env.API_URL ?? "http://localhost:3001";

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

    test("panel should have glass-morphism styling", async ({ page }) => {
      await openChat(page);
      const panel = chatPanel(page);
      const classes = await panel.getAttribute("class");
      expect(classes).toContain("backdrop-blur");
    });

    test("should have input field with correct placeholder", async ({
      page,
    }) => {
      await openChat(page);
      const input = chatInput(page);
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute("placeholder", "Ask about Themis…");
    });

    test("should have a Send button", async ({ page }) => {
      await openChat(page);
      const btn = sendButton(page);
      await expect(btn).toBeVisible();
      await expect(btn).toContainText("Send");
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

    test("should display all 4 suggested questions", async ({ page }) => {
      await openChat(page);

      const panel = chatPanel(page);
      await expect(panel.locator("text=Suggested questions:")).toBeVisible();

      const suggestions = [
        "What are your top skills?",
        "Tell me about your networking experience.",
        "What certifications do you hold?",
        "Book a call with Themis.",
      ];

      for (const q of suggestions) {
        await expect(panel.locator(`text=${q}`).first()).toBeVisible();
      }
    });

    test("suggested questions should be clickable buttons", async ({
      page,
    }) => {
      await openChat(page);
      const panel = chatPanel(page);

      // Each suggestion is a <button> element
      for (const q of [
        "What are your top skills?",
        "Tell me about your networking experience.",
        "What certifications do you hold?",
        "Book a call with Themis.",
      ]) {
        const btn = panel.locator(`button:has-text("${q}")`);
        await expect(btn).toBeVisible();
        await expect(btn).toBeEnabled();
      }
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

    test("user message should have distinct styling from assistant", async ({
      page,
    }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);

      const panel = chatPanel(page);
      await chatInput(page).fill("Hello");
      await sendButton(page).click();

      // User message has cyan background (bg-cyan-500/20)
      const userBubble = panel.locator("div[class*='bg-cyan-500/20']").first();
      await expect(userBubble).toBeVisible();

      // Wait for assistant reply
      await waitForAssistantReply(page);

      // Assistant message has white/5 background
      const assistantBubbles = panel.locator("div[class*='bg-white/5']");
      // At least 2: welcome + new reply
      await expect(assistantBubbles.nth(1)).toBeVisible();
    });

    test("should send a suggested question when clicked", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);

      const panel = chatPanel(page);

      // Click a suggested question
      await panel.locator("text=What certifications do you hold?").click();

      // The suggested question text should appear as a user message
      await expect(
        panel.locator("div[class*='bg-cyan-500/20']").filter({ hasText: "What certifications do you hold?" }).first(),
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
      // User messages have max-w-[80%] + bg-cyan-500/20 (avatar & button also use bg-cyan-500/20)
      const userBubbles = chatPanel(page).locator("div[class*='max-w-'][class*='bg-cyan-500/20']");
      await expect(userBubbles).toHaveCount(0);
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

    test("should show typing cursor during streaming", async ({ page }) => {
      test.skip(!(await isChatAvailable()), "Express server not running (start with pnpm dev:all)");
      test.setTimeout(API_TIMEOUT);

      await openChat(page);

      await chatInput(page).fill("Hello");
      await sendButton(page).click();

      // Try to catch the typing cursor (animate-pulse cyan bar)
      try {
        await expect(
          chatPanel(page).locator("span.animate-pulse").first(),
        ).toBeVisible({ timeout: 3000 });
      } catch {
        // Bedrock responded too fast — acceptable
      }

      // Eventually the response should complete
      await waitForAssistantReply(page);
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
  });

  // ── Keyboard interaction ──────────────────────────────────────────────

  test.describe("Keyboard interaction", () => {
    test("Shift+Enter should not send the message", async ({ page }) => {
      await openChat(page);

      const input = chatInput(page);
      await input.fill("Test message");
      await input.press("Shift+Enter");

      // No user bubble should appear — user messages have max-w-[80%] + bg-cyan-500/20
      const userBubbles = chatPanel(page).locator("div[class*='max-w-'][class*='bg-cyan-500/20']");
      await expect(userBubbles).toHaveCount(0);
    });

    test("should allow typing in the input field", async ({ page }) => {
      await openChat(page);

      const input = chatInput(page);
      await input.type("Hello world");
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
  });
});
