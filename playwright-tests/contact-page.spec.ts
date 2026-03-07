import { expect, test } from "@playwright/test";

/**
 * Contact Page UI Tests
 *
 * Tests /contact page content, form structure, contact cards, and interactions.
 */

// ─── Page Content ───────────────────────────────────────────────────────────────

test.describe("Contact Page — Content", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display hero heading and subtitle", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Get In Touch");
    await expect(
      page.getByText("new projects, creative ideas", { exact: false }),
    ).toBeVisible();
  });

  test("should display 6 contact info cards", async ({ page }) => {
    await expect(page.getByText("Email", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("LinkedIn", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("GitHub", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Location", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Mobile", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Portfolio", { exact: true }).first()).toBeVisible();
  });

  test("should show correct email address", async ({ page }) => {
    await expect(
      page.getByText("baltzakis.themis@gmail.com"),
    ).toBeVisible();
  });

  test("should show correct phone number", async ({ page }) => {
    await expect(page.getByText("+30 697 777 7838")).toBeVisible();
  });

  test("should show correct location", async ({ page }) => {
    await expect(page.getByText("Koropi/Athens, Greece")).toBeVisible();
  });

  test("should have email mailto link", async ({ page }) => {
    const emailLink = page.locator(
      'a[href="mailto:baltzakis.themis@gmail.com"]',
    );
    await expect(emailLink).toBeAttached();
  });

  test("should have phone tel link", async ({ page }) => {
    const phoneLink = page.locator('a[href="tel:+30697777838"]');
    await expect(phoneLink).toBeAttached();
  });

  test("should have LinkedIn link with external attributes", async ({
    page,
  }) => {
    const linkedinLink = page.locator('a[href*="linkedin.com/in/baltzakis-themis"]').first();
    await expect(linkedinLink).toBeAttached();
    await expect(linkedinLink).toHaveAttribute("target", "_blank");
    await expect(linkedinLink).toHaveAttribute("rel", /noopener/);
  });

  test("should have GitHub link with external attributes", async ({ page }) => {
    const githubLink = page.locator('a[href*="github.com/Themis128"]');
    await expect(githubLink).toBeAttached();
    await expect(githubLink).toHaveAttribute("target", "_blank");
  });

  test("should display 3 statistics cards", async ({ page }) => {
    await expect(page.getByText("Years Experience")).toBeVisible();
    await expect(page.getByText("Projects Completed")).toBeVisible();
    await expect(page.getByText("Certifications", { exact: true }).first()).toBeVisible();
  });

  test("should display 3 quick action buttons", async ({ page }) => {
    await expect(page.getByText("Send Project Inquiry")).toBeVisible();
    await expect(page.getByText("Connect on LinkedIn")).toBeVisible();
    await expect(page.getByText("View Projects")).toBeVisible();
  });

  test("should display CTA section with navigation links", async ({
    page,
  }) => {
    await expect(page.getByText("Looking for more information?")).toBeVisible();
    await expect(page.getByText("Learn More About Me")).toBeVisible();
    await expect(page.getByText("View Resume")).toBeVisible();
  });

  test("CTA 'Learn More About Me' links to /about", async ({ page }) => {
    const link = page.locator('a[href*="/about"]').filter({ hasText: "Learn More About Me" });
    await expect(link).toBeAttached();
  });

  test("CTA 'View Resume' links to /resume", async ({ page }) => {
    const link = page.locator('a[href*="/resume"]').filter({ hasText: "View Resume" });
    await expect(link).toBeAttached();
  });
});

// ─── Form Structure ─────────────────────────────────────────────────────────────

test.describe("Contact Page — Form Structure", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should have form card with title and description", async ({ page }) => {
    await expect(page.getByText("Send a Message")).toBeVisible();
    await expect(
      page.getByText("Fill out the form below", { exact: false }),
    ).toBeVisible();
  });

  test("should have 4 labeled form fields", async ({ page }) => {
    await expect(page.locator('label[for="name"]')).toBeVisible();
    await expect(page.locator('label[for="email"]')).toBeVisible();
    await expect(page.locator('label[for="subject"]')).toBeVisible();
    await expect(page.locator('label[for="message"]')).toBeVisible();
  });

  test("should have required attributes on name, email, and message", async ({
    page,
  }) => {
    await expect(page.locator("#name")).toHaveAttribute("required", "");
    await expect(page.locator("#email")).toHaveAttribute("required", "");
    await expect(page.locator("#message")).toHaveAttribute("required", "");
  });

  test("should have email type on email input", async ({ page }) => {
    await expect(page.locator("#email")).toHaveAttribute("type", "email");
  });

  test("should have placeholder text on all inputs", async ({ page }) => {
    await expect(page.locator("#name")).toHaveAttribute(
      "placeholder",
      "Your name",
    );
    await expect(page.locator("#email")).toHaveAttribute(
      "placeholder",
      "your@email.com",
    );
    await expect(page.locator("#subject")).toHaveAttribute(
      "placeholder",
      "What is this about?",
    );
    await expect(page.locator("#message")).toHaveAttribute(
      "placeholder",
      "Your message...",
    );
  });

  test("should have submit button with 'Send Message' text", async ({
    page,
  }) => {
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toContainText("Send Message");
  });
});

// ─── Form Interaction ───────────────────────────────────────────────────────────

test.describe("Contact Page — Form Interaction", () => {
  test("should accept input in all fields", async ({ page }) => {
    await page.goto("/contact");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("#name").fill("Test User");
    await page.locator("#email").fill("test@example.com");
    await page.locator("#subject").fill("Test Subject");
    await page.locator("#message").fill("Test message body");

    await expect(page.locator("#name")).toHaveValue("Test User");
    await expect(page.locator("#email")).toHaveValue("test@example.com");
    await expect(page.locator("#subject")).toHaveValue("Test Subject");
    await expect(page.locator("#message")).toHaveValue("Test message body");
  });
});
