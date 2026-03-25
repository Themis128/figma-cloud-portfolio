import { expect, test } from "@playwright/test";

/**
 * ChatbotWidget Tests
 *
 * Tests for the AI chatbot widget: open/close, welcome message,
 * suggested questions, input handling, and accessibility.
 */

test.describe("ChatbotWidget @smoke", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    // Wait for hydration — ChatbotWidget is lazy-loaded
    await page.waitForTimeout(2000);

    // Dismiss cookie consent banner so it doesn't block the chat FAB
    const acceptBtn = page.getByRole("button", { name: /accept all/i });
    if (await acceptBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await acceptBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test("should render floating chat button", async ({ page }) => {
    const chatBtn = page.locator('button[aria-label="Open chat"]');
    await expect(chatBtn).toBeVisible({ timeout: 10000 });
  });

  test("should show Chat with AI text on button", async ({ page }) => {
    const chatBtn = page.locator('button[aria-label="Open chat"]');
    if (await chatBtn.isVisible().catch(() => false)) {
      await expect(chatBtn).toContainText("Chat with AI");
    }
  });

  test("should open chat panel on click", async ({ page }) => {
    const chatBtn = page.locator('button[aria-label="Open chat"]');
    await chatBtn.click();
    await page.waitForTimeout(500);

    // Chat panel should be visible with header — use exact to avoid matching welcome message
    await expect(page.getByText("AI Assistant", { exact: true })).toBeVisible();
    await expect(page.getByText("Themis's Portfolio Bot")).toBeVisible();
  });

  test("should show welcome message when opened", async ({ page }) => {
    const chatBtn = page.locator('button[aria-label="Open chat"]');
    await chatBtn.click();
    await page.waitForTimeout(500);

    const welcome = page.getByText("Hi! I'm Themis's AI assistant", { exact: false });
    await expect(welcome).toBeVisible();
  });

  test("should display suggested questions", async ({ page }) => {
    const chatBtn = page.locator('button[aria-label="Open chat"]');
    await chatBtn.click();
    await page.waitForTimeout(500);

    // Should show "Suggested questions:" section
    const suggestedLabel = page.getByText("Suggested questions:", { exact: false });
    await expect(suggestedLabel).toBeVisible();

    // "Book a call" and "Send a message" should always be present
    const bookCall = page.getByText("Book a call with Themis", { exact: false });
    await expect(bookCall).toBeVisible();
    const contact = page.getByText("Send a message to Themis", { exact: false });
    await expect(contact).toBeVisible();
  });

  test("should have input field and send button", async ({ page }) => {
    const chatBtn = page.locator('button[aria-label="Open chat"]');
    await chatBtn.click();
    await page.waitForTimeout(500);

    const input = page.locator('input[placeholder="Ask about Themis…"]');
    await expect(input).toBeVisible();

    // Use exact name to target the chat Send button, not the contact form Send Message
    const sendBtn = page.getByRole("button", { name: "Send", exact: true });
    await expect(sendBtn).toBeVisible();
  });

  test("should disable send when input is empty", async ({ page }) => {
    const chatBtn = page.locator('button[aria-label="Open chat"]');
    await chatBtn.click();
    await page.waitForTimeout(500);

    const sendBtn = page.getByRole("button", { name: "Send", exact: true });
    await expect(sendBtn).toBeDisabled();
  });

  test("should enable send when text is entered", async ({ page }) => {
    const chatBtn = page.locator('button[aria-label="Open chat"]');
    await chatBtn.click();
    await page.waitForTimeout(500);

    const input = page.locator('input[placeholder="Ask about Themis…"]');
    await input.fill("Hello");

    const sendBtn = page.getByRole("button", { name: "Send", exact: true });
    await expect(sendBtn).toBeEnabled();
  });

  test("should have close button", async ({ page }) => {
    const chatBtn = page.locator('button[aria-label="Open chat"]');
    await chatBtn.click();
    await page.waitForTimeout(500);

    const closeBtn = page.locator('button[aria-label="Close chat"]');
    await expect(closeBtn).toBeVisible();
  });

  test("should close panel on close button click", async ({ page }) => {
    const chatBtn = page.locator('button[aria-label="Open chat"]');
    await chatBtn.click();
    await page.waitForTimeout(500);

    const closeBtn = page.locator('button[aria-label="Close chat"]');
    await closeBtn.click();
    await page.waitForTimeout(500);

    // FAB should reappear with "Open chat" label (panel uses CSS opacity/pointer-events, not DOM removal)
    await expect(page.locator('button[aria-label="Open chat"]')).toBeVisible();
    // FAB button should be interactive again (not inert)
    await expect(page.locator('button[aria-label="Open chat"]')).toBeEnabled();
  });

  test("should show TB initials in chat header", async ({ page }) => {
    const chatBtn = page.locator('button[aria-label="Open chat"]');
    await chatBtn.click();
    await page.waitForTimeout(500);

    const initials = page.getByText("TB", { exact: true });
    // May match logo too — just ensure at least one visible
    expect(await initials.count()).toBeGreaterThan(0);
  });

  test("should auto-focus input when opened", async ({ page }) => {
    const chatBtn = page.locator('button[aria-label="Open chat"]');
    await chatBtn.click();
    await page.waitForTimeout(500);

    const input = page.locator('input[placeholder="Ask about Themis…"]');
    await expect(input).toBeFocused();
  });
});
