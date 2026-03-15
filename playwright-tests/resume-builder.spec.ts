import { expect, test } from "@playwright/test";
import { waitForAppReady } from "./test-utils";

/* ────────────────────────────────────────────────────────────
   Helper: navigate to /resume/ and wait for the builder to load
   ──────────────────────────────────────────────────────────── */
async function openBuilder(page: import("@playwright/test").Page) {
  await page.goto("/resume/");
  await waitForAppReady(page);
  await page.waitForLoadState("domcontentloaded");
  // Wait for the dynamic-import builder to render
  await expect(page.getByText("Template")).toBeVisible({ timeout: 15000 });
}

/* ────────────────────────────────────────────────────────────
   1. Page Load & Layout
   ──────────────────────────────────────────────────────────── */
test.describe("Resume Builder — Page Load & Layout", () => {
  test.beforeEach(async ({ page }) => {
    await openBuilder(page);
  });

  test("should display hero heading with CV Builder", async ({ page }) => {
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    const text = await h1.textContent();
    expect(text).toContain("CV Builder");
  });

  test("should show both tab buttons", async ({ page }) => {
    await expect(page.getByText("Build Your CV")).toBeVisible();
    await expect(page.getByText("ATS Guide")).toBeVisible();
  });

  test("should show CV builder by default", async ({ page }) => {
    await expect(page.getByText("Template")).toBeVisible();
    await expect(page.getByText("Download PDF")).toBeVisible();
  });

  test("should display form tabs", async ({ page }) => {
    await expect(page.getByRole("tab", { name: "Personal" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Summary" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Experience" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Education" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Certs" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Skills" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Projects" })).toBeVisible();
  });

  test("should show live preview iframe", async ({ page }) => {
    await expect(page.getByText("Live Preview")).toBeVisible();
    const iframe = page.locator('iframe[title="Resume Preview"]');
    await expect(iframe).toBeAttached();
  });
});

/* ────────────────────────────────────────────────────────────
   2. Template Selector
   ──────────────────────────────────────────────────────────── */
test.describe("Resume Builder — Template Selector", () => {
  test.beforeEach(async ({ page }) => {
    await openBuilder(page);
  });

  test("should display all 7 templates", async ({ page }) => {
    const templates = ["Classic", "Modern", "Minimal", "Executive", "Creative", "Bold", "Emerald"];
    for (const tmpl of templates) {
      await expect(
        page.getByRole("button").filter({ hasText: tmpl }),
      ).toBeVisible();
    }
  });

  test("should show color dots for each template", async ({ page }) => {
    // Each template button has a color dot (w-3 h-3 rounded-full)
    const dots = page.locator(".rounded-full.w-3.h-3");
    await expect(dots).toHaveCount(7);
  });

  test("should switch active template", async ({ page }) => {
    const classicBtn = page.getByRole("button").filter({ hasText: "Classic" });
    await classicBtn.click();
    await expect(classicBtn).toHaveClass(/border-cyan-400/);

    // Modern should no longer be active
    const modernBtn = page.getByRole("button").filter({ hasText: "Modern" });
    await expect(modernBtn).not.toHaveClass(/border-cyan-400/);
  });

  test("should persist template choice in localStorage", async ({ page }) => {
    await page.getByRole("button").filter({ hasText: "Bold" }).click();
    const stored = await page.evaluate(() => localStorage.getItem("resume-builder-template"));
    expect(stored).toBe("bold");
  });
});

/* ────────────────────────────────────────────────────────────
   3. Personal Info Form
   ──────────────────────────────────────────────────────────── */
test.describe("Resume Builder — Personal Info Form", () => {
  test.beforeEach(async ({ page }) => {
    await openBuilder(page);
  });

  test("should show personal info form by default", async ({ page }) => {
    await expect(page.getByText("Personal Information")).toBeVisible();
    await expect(page.getByPlaceholder("Alex Johnson")).toBeVisible();
  });

  test("should fill personal info fields", async ({ page }) => {
    await page.getByPlaceholder("Alex Johnson").fill("John Doe");
    await page.getByPlaceholder("Senior Network Engineer").fill("Software Engineer");
    await page.getByPlaceholder("alex@example.com").fill("john@test.com");

    await expect(page.getByPlaceholder("Alex Johnson")).toHaveValue("John Doe");
    await expect(page.getByPlaceholder("Senior Network Engineer")).toHaveValue("Software Engineer");
    await expect(page.getByPlaceholder("alex@example.com")).toHaveValue("john@test.com");
  });

  test("should show filled name in preview", async ({ page }) => {
    await page.getByPlaceholder("Alex Johnson").fill("Jane Smith");
    // Wait for debounced preview update
    await page.waitForTimeout(500);

    const iframe = page.locator('iframe[title="Resume Preview"]');
    const iframeContent = iframe.contentFrame();
    await expect(iframeContent.locator("body")).toContainText("Jane Smith");
  });
});

/* ────────────────────────────────────────────────────────────
   4. Summary Form
   ──────────────────────────────────────────────────────────── */
test.describe("Resume Builder — Summary Form", () => {
  test.beforeEach(async ({ page }) => {
    await openBuilder(page);
    await page.getByRole("tab", { name: "Summary" }).click();
  });

  test("should show summary textarea with char count", async ({ page }) => {
    await expect(page.getByText("Professional Summary")).toBeVisible();
    await expect(page.getByText("0/500")).toBeVisible();
  });

  test("should update char count as user types", async ({ page }) => {
    const textarea = page.locator("textarea");
    await textarea.fill("Test summary text");
    await expect(page.getByText("17/500")).toBeVisible();
  });
});

/* ────────────────────────────────────────────────────────────
   5. Experience Form
   ──────────────────────────────────────────────────────────── */
test.describe("Resume Builder — Experience Form", () => {
  test.beforeEach(async ({ page }) => {
    await openBuilder(page);
    await page.getByRole("tab", { name: "Experience" }).click();
  });

  test("should show empty state", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Work Experience" })).toBeVisible();
    await expect(page.getByText("No work experience added yet")).toBeVisible();
  });

  test("should add an experience entry", async ({ page }) => {
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByText("#1")).toBeVisible();
    await expect(page.getByPlaceholder("Senior Network Engineer")).toBeVisible();
  });

  test("should fill experience fields", async ({ page }) => {
    await page.getByRole("button", { name: "Add" }).click();
    await page.getByPlaceholder("Senior Network Engineer").fill("DevOps Lead");
    await page.getByPlaceholder("CloudTech Solutions").fill("Google");

    await expect(page.getByPlaceholder("Senior Network Engineer")).toHaveValue("DevOps Lead");
    await expect(page.getByPlaceholder("CloudTech Solutions")).toHaveValue("Google");
  });

  test("should toggle currently working checkbox", async ({ page }) => {
    await page.getByRole("button", { name: "Add" }).click();
    const checkbox = page.getByLabel("Currently working here");
    await expect(checkbox).toBeVisible();
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  });

  test("should remove an experience entry", async ({ page }) => {
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByText("#1")).toBeVisible();

    // Remove button uses Trash2 icon — it's the button with red styling inside the entry
    const trashBtn = page.locator(".text-red-400").first();
    await trashBtn.click();
    await expect(page.getByText("No work experience added yet")).toBeVisible();
  });

  test("should add multiple entries", async ({ page }) => {
    await page.getByRole("button", { name: "Add" }).click();
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByText("#1")).toBeVisible();
    await expect(page.getByText("#2")).toBeVisible();
  });
});

/* ────────────────────────────────────────────────────────────
   6. Education Form
   ──────────────────────────────────────────────────────────── */
test.describe("Resume Builder — Education Form", () => {
  test.beforeEach(async ({ page }) => {
    await openBuilder(page);
    await page.getByRole("tab", { name: "Education" }).click();
  });

  test("should show empty state", async ({ page }) => {
    await expect(page.getByText("No education added yet")).toBeVisible();
  });

  test("should add an education entry", async ({ page }) => {
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByPlaceholder("University of Texas at Austin")).toBeVisible();
    await expect(page.getByPlaceholder("Computer Science")).toBeVisible();
  });

  test("should remove an education entry", async ({ page }) => {
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByText("#1")).toBeVisible();
    const trashBtn = page.locator(".text-red-400").first();
    await trashBtn.click();
    await expect(page.getByText("No education added yet")).toBeVisible();
  });
});

/* ────────────────────────────────────────────────────────────
   7. Certifications Form
   ──────────────────────────────────────────────────────────── */
test.describe("Resume Builder — Certifications Form", () => {
  test.beforeEach(async ({ page }) => {
    await openBuilder(page);
    await page.getByRole("tab", { name: "Certs" }).click();
  });

  test("should show empty state", async ({ page }) => {
    await expect(page.getByText("No certifications added yet")).toBeVisible();
  });

  test("should add a certification entry", async ({ page }) => {
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByPlaceholder("AWS Solutions Architect Professional")).toBeVisible();
    await expect(page.getByPlaceholder("Amazon Web Services")).toBeVisible();
  });
});

/* ────────────────────────────────────────────────────────────
   8. Skills Form
   ──────────────────────────────────────────────────────────── */
test.describe("Resume Builder — Skills Form", () => {
  test.beforeEach(async ({ page }) => {
    await openBuilder(page);
    await page.getByRole("tab", { name: "Skills" }).click();
  });

  test("should show empty state", async ({ page }) => {
    await expect(page.getByText("No skill categories added yet")).toBeVisible();
  });

  test("should add a skill category and tag", async ({ page }) => {
    await page.getByRole("button", { name: "Add Category" }).click();
    await page.getByPlaceholder("e.g., Networking, Cloud & DevOps, Security").fill("Cloud");

    // Add a skill tag via Enter key
    const tagInput = page.getByPlaceholder("Type a skill and press Enter");
    await tagInput.fill("AWS");
    await tagInput.press("Enter");

    // Tag should appear — the input should be cleared and "AWS" text visible in the skill tags area
    await expect(tagInput).toHaveValue("");
    await expect(page.getByText("AWS").first()).toBeVisible();
  });

  test("should remove a skill tag", async ({ page }) => {
    await page.getByRole("button", { name: "Add Category" }).click();
    const tagInput = page.getByPlaceholder("Type a skill and press Enter");
    await tagInput.fill("Docker");
    await tagInput.press("Enter");

    // "Docker" text should be visible
    await expect(page.getByText("Docker").first()).toBeVisible();

    // Click the X button next to "Docker" to remove it
    // The X button is inside the same container as the skill text
    const dockerTag = page.getByText("Docker").first().locator("..");
    await dockerTag.locator("button").click();

    // The tag text should be gone
    await expect(page.getByText("Docker")).toHaveCount(0);
  });
});

/* ────────────────────────────────────────────────────────────
   9. Projects Form
   ──────────────────────────────────────────────────────────── */
test.describe("Resume Builder — Projects Form", () => {
  test.beforeEach(async ({ page }) => {
    await openBuilder(page);
    await page.getByRole("tab", { name: "Projects" }).click();
  });

  test("should show empty state", async ({ page }) => {
    await expect(page.getByText("No projects added yet")).toBeVisible();
  });

  test("should add a project with tech tags", async ({ page }) => {
    await page.getByRole("button", { name: "Add" }).click();
    await page.getByPlaceholder("Network Automation Framework").fill("Portfolio");

    const tagInput = page.getByPlaceholder("Type a technology and press Enter");
    await tagInput.fill("Next.js");
    await tagInput.press("Enter");

    await expect(tagInput).toHaveValue("");
    await expect(page.getByText("Next.js").first()).toBeVisible();
  });
});

/* ────────────────────────────────────────────────────────────
   10. Load Sample & Reset
   ──────────────────────────────────────────────────────────── */
test.describe("Resume Builder — Load Sample & Reset", () => {
  test.beforeEach(async ({ page }) => {
    await openBuilder(page);
  });

  test("should load sample data into all sections", async ({ page }) => {
    await page.getByText("Load Sample").click();
    await page.waitForTimeout(500);

    // Personal info filled
    await expect(page.getByPlaceholder("Alex Johnson")).toHaveValue("Alex Johnson");

    // Switch to Experience — should have entries
    await page.getByRole("tab", { name: "Experience" }).click();
    await expect(page.getByText("#1")).toBeVisible();

    // Switch to Skills — should have categories
    await page.getByRole("tab", { name: "Skills" }).click();
    await expect(page.getByText("#1")).toBeVisible();
  });

  test("should show sample data in preview", async ({ page }) => {
    await page.getByText("Load Sample").click();
    await page.waitForTimeout(800);

    const iframe = page.locator('iframe[title="Resume Preview"]');
    const iframeContent = iframe.contentFrame();
    await expect(iframeContent.locator("body")).toContainText("Alex Johnson");
  });

  test("should reset all form data", async ({ page }) => {
    // Load sample first
    await page.getByText("Load Sample").click();
    await page.waitForTimeout(500);
    await expect(page.getByPlaceholder("Alex Johnson")).toHaveValue("Alex Johnson");

    // Reset
    await page.getByText("Reset").click();
    await page.waitForTimeout(500);

    // Name should be empty
    await expect(page.getByPlaceholder("Alex Johnson")).toHaveValue("");
  });

  test("should clear localStorage on reset", async ({ page }) => {
    await page.getByText("Load Sample").click();
    await page.waitForTimeout(1000);

    await page.getByText("Reset").click();
    await page.waitForTimeout(1000);

    const stored = await page.evaluate(() => localStorage.getItem("resume-builder-data"));
    // After reset, localStorage should either be null or contain empty defaults
    if (stored) {
      const parsed = JSON.parse(stored);
      expect(parsed.personalInfo.name).toBe("");
    }
  });
});

/* ────────────────────────────────────────────────────────────
   11. localStorage Persistence
   ──────────────────────────────────────────────────────────── */
test.describe("Resume Builder — localStorage Persistence", () => {
  test("should persist form data across page reload", async ({ page }) => {
    await openBuilder(page);

    // Fill in a name
    await page.getByPlaceholder("Alex Johnson").fill("Persisted Name");
    // Wait for debounced save
    await page.waitForTimeout(1000);

    // Reload the page
    await page.reload();
    await openBuilder(page);

    // Name should still be there
    await expect(page.getByPlaceholder("Alex Johnson")).toHaveValue("Persisted Name");

    // Clean up
    await page.evaluate(() => localStorage.removeItem("resume-builder-data"));
  });

  test("should persist template choice across reload", async ({ page }) => {
    await openBuilder(page);

    await page.getByRole("button").filter({ hasText: "Executive" }).click();
    await page.waitForTimeout(300);

    await page.reload();
    await openBuilder(page);

    const execBtn = page.getByRole("button").filter({ hasText: "Executive" });
    await expect(execBtn).toHaveClass(/border-cyan-400/);

    // Clean up
    await page.evaluate(() => localStorage.removeItem("resume-builder-template"));
  });
});

/* ────────────────────────────────────────────────────────────
   12. PDF Download
   ──────────────────────────────────────────────────────────── */
test.describe("Resume Builder — PDF Download", () => {
  test("should trigger PDF download with sample data", async ({ page }) => {
    await openBuilder(page);
    await page.getByText("Load Sample").click();
    await page.waitForTimeout(1000);

    // Listen for download
    const downloadPromise = page.waitForEvent("download", { timeout: 30000 });
    await page.getByText("Download PDF").click();
    const download = await downloadPromise;

    // Verify it's a PDF with the expected filename
    expect(download.suggestedFilename()).toMatch(/Alex.Johnson.*\.pdf$/i);
  });

  test("should use default filename when no name is set", async ({ page }) => {
    await openBuilder(page);
    // Make sure form is empty (reset if needed)
    await page.getByText("Reset").click();
    await page.waitForTimeout(500);

    const downloadPromise = page.waitForEvent("download", { timeout: 30000 });
    await page.getByText("Download PDF").click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/resume\.pdf$/i);
  });

  test("should download PDF with non-default template", async ({ page }) => {
    await openBuilder(page);
    await page.getByText("Load Sample").click();
    await page.waitForTimeout(500);

    // Switch to Bold template
    await page.getByRole("button").filter({ hasText: "Bold" }).click();
    await page.waitForTimeout(500);

    const downloadPromise = page.waitForEvent("download", { timeout: 30000 });
    await page.getByText("Download PDF").click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  });
});

/* ────────────────────────────────────────────────────────────
   13. JSON Export
   ──────────────────────────────────────────────────────────── */
test.describe("Resume Builder — JSON Export", () => {
  test("should export JSON with resume data", async ({ page }) => {
    await openBuilder(page);
    await page.getByText("Load Sample").click();
    await page.waitForTimeout(500);

    const downloadPromise = page.waitForEvent("download", { timeout: 10000 });
    await page.getByText("Export JSON").click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.json$/i);

    // Read and verify JSON content
    const path = await download.path();
    if (path) {
      const fs = await import("fs");
      const content = JSON.parse(fs.readFileSync(path, "utf-8"));
      expect(content.personalInfo.name).toBe("Alex Johnson");
      expect(content.experience).toBeDefined();
      expect(content.skills).toBeDefined();
    }
  });
});

/* ────────────────────────────────────────────────────────────
   14. Import JSON
   ──────────────────────────────────────────────────────────── */
test.describe("Resume Builder — Import JSON", () => {
  test("should show Import JSON button", async ({ page }) => {
    await openBuilder(page);
    await expect(page.getByText("Import JSON")).toBeVisible();
  });
});

/* ────────────────────────────────────────────────────────────
   15. Preview Updates Across Templates
   ──────────────────────────────────────────────────────────── */
test.describe("Resume Builder — Preview with Different Templates", () => {
  test.beforeEach(async ({ page }) => {
    await openBuilder(page);
    await page.getByText("Load Sample").click();
    await page.waitForTimeout(800);
  });

  const templates = ["Classic", "Modern", "Minimal", "Executive", "Creative", "Bold", "Emerald"];

  for (const tmpl of templates) {
    test(`should render preview with ${tmpl} template`, async ({ page }) => {
      await page.getByRole("button").filter({ hasText: tmpl }).click();
      await page.waitForTimeout(500);

      const iframe = page.locator('iframe[title="Resume Preview"]');
      const iframeContent = iframe.contentFrame();
      await expect(iframeContent.locator("body")).toContainText("Alex Johnson");
    });
  }
});

/* ────────────────────────────────────────────────────────────
   16. ATS Guide Tab
   ──────────────────────────────────────────────────────────── */
test.describe("Resume Builder — ATS Guide Tab", () => {
  test.beforeEach(async ({ page }) => {
    await openBuilder(page);
  });

  test("should switch to ATS Guide tab", async ({ page }) => {
    await page.getByText("ATS Guide").click();
    await expect(page.getByText("How ATS Systems Work")).toBeVisible();
  });

  test("should show all ATS guide sections", async ({ page }) => {
    await page.getByText("ATS Guide").click();
    await expect(page.getByText("How ATS Systems Work")).toBeVisible();
    await expect(page.getByText("Anatomy of a Strong IT Resume")).toBeVisible();
    await expect(page.getByText("6 Mistakes That Get Resumes Rejected")).toBeVisible();
    await expect(page.getByText("ATS Keywords for IT Professionals")).toBeVisible();
  });

  test("should show ATS pipeline phases", async ({ page }) => {
    await page.getByText("ATS Guide").click();
    await expect(page.getByRole("heading", { name: "Parsing" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Keyword Matching" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ranking" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Human Review" })).toBeVisible();
  });

  test("should show pre-submission checklist", async ({ page }) => {
    await page.getByText("ATS Guide").click();
    const checklist = page.getByText("Pre-Submission Checklist");
    await checklist.scrollIntoViewIfNeeded();
    await expect(checklist).toBeVisible();
  });

  test("should switch back to builder tab", async ({ page }) => {
    await page.getByText("ATS Guide").click();
    await expect(page.getByText("How ATS Systems Work")).toBeVisible();

    await page.getByText("Build Your CV").click();
    await expect(page.getByText("Template")).toBeVisible();
    await expect(page.getByText("Download PDF")).toBeVisible();
  });
});

/* ────────────────────────────────────────────────────────────
   17. Responsiveness
   ──────────────────────────────────────────────────────────── */
test.describe("Resume Builder — Responsiveness", () => {
  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/resume/");
    await waitForAppReady(page);
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByText("Build Your CV")).toBeVisible();
  });

  test("should have scrollable template selector on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await openBuilder(page);

    // All 7 templates should still be present (scrollable)
    const templates = ["Classic", "Modern", "Minimal", "Executive", "Creative", "Bold", "Emerald"];
    for (const tmpl of templates) {
      await expect(
        page.getByRole("button").filter({ hasText: tmpl }),
      ).toBeAttached();
    }
  });

  test("should have accessible main content area", async ({ page }) => {
    await page.goto("/resume/");
    await waitForAppReady(page);
    await expect(page.locator("#main-content")).toBeAttached();
  });
});
