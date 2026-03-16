import { expect, test } from "@playwright/test";

test.describe("Resume & Career Guide Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/resume");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should load resume page with educational hero section", async ({
    page,
  }) => {
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    const headingText = await h1.textContent();
    expect(headingText).toContain("CV Builder & Career Guide");
  });

  test("should display ATS subtitle", async ({ page }) => {
    await expect(
      page.getByText("Build Your Professional CV or Master ATS Optimization"),
    ).toBeVisible();
  });

  test("should have How ATS Systems Work section", async ({ page }) => {
    // Switch to the ATS Guide tab
    await page.getByRole("tab", { name: "ATS Guide" }).click();
    await expect(page.getByText("How ATS Systems Work")).toBeVisible();
    // Should show the 4 ATS pipeline steps
    await expect(page.getByText("Parsing").first()).toBeVisible();
    await expect(page.getByText("Keyword Matching").first()).toBeVisible();
    await expect(page.getByText("Ranking").first()).toBeVisible();
    await expect(page.getByText("Human Review").first()).toBeVisible();
  });

  test("should have Anatomy of a Strong IT Resume section", async ({
    page,
  }) => {
    await page.getByRole("tab", { name: "ATS Guide" }).click();
    await expect(
      page.getByText("Anatomy of a Strong IT Resume"),
    ).toBeVisible();
    // Should show the 4 resume sections
    await expect(page.getByText("Professional Summary").first()).toBeVisible();
    await expect(page.getByText("Work Experience").first()).toBeVisible();
    await expect(page.getByText("Certifications").first()).toBeVisible();
    await expect(page.getByText("Technical Skills").first()).toBeVisible();
  });

  test("should show good and bad examples for resume sections", async ({
    page,
  }) => {
    await page.getByRole("tab", { name: "ATS Guide" }).click();
    // Should have Good Example and Avoid This labels
    const goodExamples = page.getByText("Good Example");
    const badExamples = page.getByText("Avoid This");
    expect(await goodExamples.count()).toBeGreaterThanOrEqual(4);
    expect(await badExamples.count()).toBeGreaterThanOrEqual(4);
  });

  test("should have common mistakes section", async ({ page }) => {
    await page.getByRole("tab", { name: "ATS Guide" }).click();
    await expect(
      page.getByText("6 Mistakes That Get Resumes Rejected"),
    ).toBeVisible();
    // Should show numbered mistakes
    await expect(
      page.getByText("Using graphics-heavy templates"),
    ).toBeVisible();
    await expect(
      page.getByText("No quantified achievements"),
    ).toBeVisible();
  });

  test("should have ATS Keywords section with IT categories", async ({
    page,
  }) => {
    await page.getByRole("tab", { name: "ATS Guide" }).click();
    await expect(
      page.getByText("ATS Keywords for IT Professionals"),
    ).toBeVisible();
    // Should show keyword categories
    await expect(page.getByText("Network Infrastructure").first()).toBeVisible();
    await expect(page.getByText("Network Security").first()).toBeVisible();
    await expect(page.getByText("Cloud & Identity").first()).toBeVisible();
    await expect(page.getByText("DevOps & Automation").first()).toBeVisible();
  });

  test("should show specific IT keywords", async ({ page }) => {
    await page.getByRole("tab", { name: "ATS Guide" }).click();
    // Should contain specific technology keywords
    await expect(page.getByText("Cisco IOS").first()).toBeVisible();
    await expect(page.getByText("Fortinet").first()).toBeVisible();
    await expect(page.getByText("Azure AD").first()).toBeVisible();
    await expect(page.getByText("Kubernetes").first()).toBeVisible();
  });

  test("should have Career Tips for Network Engineers section", async ({
    page,
  }) => {
    await page.getByRole("tab", { name: "ATS Guide" }).click();
    await expect(
      page.getByText("Career Tips for Network Engineers"),
    ).toBeVisible();
    await expect(page.getByText("Build a Home Lab").first()).toBeVisible();
    await expect(
      page.getByText("Stack Certifications Strategically").first(),
    ).toBeVisible();
  });

  test("should have Pre-Submission Checklist", async ({ page }) => {
    await page.getByRole("tab", { name: "ATS Guide" }).click();
    await expect(page.getByText("Pre-Submission Checklist")).toBeVisible();
    // Should have checklist items
    await expect(
      page.getByText("Single-column layout").first(),
    ).toBeVisible();
    await expect(
      page.getByText("PDF format").first(),
    ).toBeVisible();
  });

  test("should have navigation links to About and Work Experience", async ({
    page,
  }) => {
    await page.getByRole("tab", { name: "ATS Guide" }).click();
    const profileLink = page.getByRole("link", { name: "View My Profile" });
    await expect(profileLink).toBeVisible();
    await expect(profileLink).toHaveAttribute("href", "/about/");

    const experienceLink = page.getByRole("link", {
      name: "Work Experience",
    });
    await expect(experienceLink).toBeVisible();
    await expect(experienceLink).toHaveAttribute("href", "/product/");
  });

  test("should be responsive on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("h1")).toBeVisible();
    await page.getByRole("tab", { name: "ATS Guide" }).click();
    await expect(page.getByText("How ATS Systems Work")).toBeVisible();
  });
});
