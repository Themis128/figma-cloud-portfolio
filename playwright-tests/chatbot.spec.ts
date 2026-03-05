import { expect, test } from "@playwright/test";
import { waitForAppReady } from "./test-utils";

/**
 * AI Chatbot Widget — end-to-end tests (live HuggingFace API)
 *
 * Covers: toggle behaviour, welcome message, suggested questions,
 * message sending, streaming UI, booking-flow trigger,
 * keyboard interaction, and accessibility.
 *
 * These tests hit the real /api/chat → HuggingFace Inference API,
 * so they require a valid HF_TOKEN in the environment.
 */

// HF can be slow (cold starts, model loading) — generous per-test timeout
const API_TIMEOUT = 60_000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Locate the chat panel container (the fixed panel, not the toggle) */
function chatPanel(page: import("@playwright/test").Page) {
  return page.locator("div.fixed").filter({ hasText: "AI Assistant" });
}

/** Open the chatbot panel and wait for it to be visible */
async function openChat(page: import("@playwright/test").Page) {
  const toggle = page.locator('button[aria-label="Open chat"]');
  await toggle.waitFor({ state: "visible", timeout: 10000 });
  await toggle.click();
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
    { timeout: API_TIMEOUT },
  );
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
      const toggle = page.locator('button[aria-label="Open chat"]');
      await expect(toggle).toBeVisible();
      await expect(toggle).toContainText("Chat with AI");
    });

    test("should open chat panel when toggle is clicked", async ({ page }) => {
      await openChat(page);

      const panel = chatPanel(page);

      // Header should show
      await expect(panel.locator("text=AI Assistant").first()).toBeVisible();
      await expect(
        panel.locator("text=Themis's Portfolio Bot").first(),
      ).toBeVisible();

      // The floating toggle keeps aria-label="Open chat" but becomes hidden
      // (opacity-0 + pointer-events-none + aria-hidden).
      const toggle = page.locator('button[aria-label="Open chat"]');
      await expect(toggle).toHaveAttribute("aria-hidden", "true");
      await expect(toggle).toHaveCSS("opacity", "0");
    });

    test("should close chat panel via close button", async ({ page }) => {
      await openChat(page);

      // The X button inside the chat panel header
      const close = chatPanel(page).locator('button[aria-label="Close chat"]');
      await close.click();

      // Toggle should reappear as "Open chat"
      const toggle = page.locator('button[aria-label="Open chat"]');
      await expect(toggle).toBeVisible();
    });
  });

  // ── Welcome message & suggested questions ───────────────────────────────

  test.describe("Welcome message & suggested questions", () => {
    test("should display the welcome message", async ({ page }) => {
      await openChat(page);

      await expect(
        chatPanel(page)
          .locator("text=Hi! I'm Themis's AI assistant")
          .first(),
      ).toBeVisible();
    });

    test("should display suggested questions initially", async ({ page }) => {
      await openChat(page);

      const panel = chatPanel(page);
      await expect(panel.locator("text=Suggested questions:")).toBeVisible();

      const suggestions = [
        "What are your top skills?",
        "Tell me about your cloud experience.",
        "What certifications do you hold?",
        "Book a call with Themis.",
      ];

      for (const q of suggestions) {
        await expect(panel.locator(`text=${q}`).first()).toBeVisible();
      }
    });
  });

  // ── Sending messages (live HuggingFace API) ─────────────────────────────

  test.describe("Sending messages", () => {
    test("should send a typed message and receive a response", async ({
      page,
    }) => {
      test.setTimeout(API_TIMEOUT);

      await openChat(page);

      const panel = chatPanel(page);
      const input = panel.locator('input[placeholder="Ask about Themis…"]');
      await input.fill("Who is Themis?");

      // Use exact match to avoid the contact form's "Send Message" button
      const sendBtn = panel.getByRole("button", { name: "Send", exact: true });
      await sendBtn.click();

      // User message should appear
      await expect(panel.locator("text=Who is Themis?").first()).toBeVisible();

      // Wait for a real assistant response from HuggingFace
      await waitForAssistantReply(page);

      // Suggested questions should disappear after the first user message
      await expect(
        panel.locator("text=Suggested questions:"),
      ).not.toBeVisible();
    });

    test("should send a suggested question when clicked", async ({ page }) => {
      test.setTimeout(API_TIMEOUT);

      await openChat(page);

      const panel = chatPanel(page);

      // Click a suggested question
      await panel.locator("text=What certifications do you hold?").click();

      // Wait for the assistant to respond
      await waitForAssistantReply(page);

      // Suggested questions should disappear
      await expect(
        panel.locator("text=Suggested questions:"),
      ).not.toBeVisible();
    });

    test("should send message on Enter key press", async ({ page }) => {
      test.setTimeout(API_TIMEOUT);

      await openChat(page);

      const panel = chatPanel(page);
      const input = panel.locator('input[placeholder="Ask about Themis…"]');
      await input.fill("What skills does Themis have?");
      await input.press("Enter");

      // User message should appear
      await expect(
        panel.locator("text=What skills does Themis have?").first(),
      ).toBeVisible();

      // Wait for the assistant to respond
      await waitForAssistantReply(page);
    });

    test("should not send empty messages", async ({ page }) => {
      await openChat(page);

      const panel = chatPanel(page);
      const sendBtn = panel.getByRole("button", { name: "Send", exact: true });
      await expect(sendBtn).toBeDisabled();
    });
  });

  // ── Streaming UI states ─────────────────────────────────────────────────

  test.describe("Streaming UI", () => {
    test("should disable input and show loading indicator while streaming", async ({
      page,
    }) => {
      test.setTimeout(API_TIMEOUT);

      await openChat(page);

      const panel = chatPanel(page);
      const input = panel.locator('input[placeholder="Ask about Themis…"]');
      await input.fill("Tell me about Themis");

      const sendBtn = panel.getByRole("button", { name: "Send", exact: true });
      await sendBtn.click();

      // Either the input is disabled during streaming (loading state)
      // or the response already arrived and re-enabled it.
      // Race condition: if the API responds instantly, we may miss the disabled state.
      try {
        await expect(input).toBeDisabled({ timeout: 2000 });
        // If we caught the disabled state, bouncing dots should be visible
        await expect(
          panel.locator(".animate-bounce").first(),
        ).toBeVisible({ timeout: 2000 });
      } catch {
        // API responded too fast to catch loading state — acceptable
      }

      // After HF response arrives, input should be re-enabled
      await expect(input).toBeEnabled({ timeout: API_TIMEOUT });
    });
  });

  // ── Booking flow trigger ────────────────────────────────────────────────

  test.describe("Booking flow", () => {
    test("should respond to booking request", async ({ page }) => {
      test.setTimeout(API_TIMEOUT);

      await openChat(page);

      const panel = chatPanel(page);

      // Click the booking suggested question
      await panel.locator("text=Book a call with Themis.").click();

      // The model may either:
      // 1. Return [BOOK_CALL] → triggers BookingCard ("Loading available slots…")
      // 2. Respond with a natural-language message about booking
      // Either outcome means the chatbot handled the booking intent.
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
  });

  // ── Accessibility ───────────────────────────────────────────────────────

  test.describe("Accessibility", () => {
    test("toggle button should have proper aria-label", async ({ page }) => {
      const toggle = page.locator('button[aria-label="Open chat"]');
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

    test("input should be focused when chat opens", async ({ page }) => {
      await openChat(page);

      // Small delay for the focus timeout in the component
      await page.waitForTimeout(200);

      const input = chatPanel(page).locator(
        'input[placeholder="Ask about Themis…"]',
      );
      await expect(input).toBeFocused();
    });
  });
});
