import { expect, test } from "@playwright/test";

/**
 * CrUX Field Data — Performance Page Tests
 *
 * Tests the Chrome UX Report (CrUX) Field Data section on /performance/.
 * Uses route interception to mock API responses since the CrUX API
 * may not be available in the test environment.
 */

const MOCK_CRUX_DATA = {
  origin: "https://www.baltzakisthemis.com",
  formFactor: "PHONE",
  timestamp: "2026-03-25T12:00:00.000Z",
  lcp: { p75: 2100, good: 75, needsImprovement: 15, poor: 10 },
  fcp: { p75: 1500, good: 80, needsImprovement: 12, poor: 8 },
  cls: { p75: 0.05, good: 90, needsImprovement: 7, poor: 3 },
  inp: { p75: 150, good: 85, needsImprovement: 10, poor: 5 },
  ttfb: { p75: 600, good: 70, needsImprovement: 20, poor: 10 },
};

const METRIC_LABELS = ["LCP", "FCP", "CLS", "INP", "TTFB"];

test.describe("CrUX Field Data — Section Structure", () => {
  test("should have field-data section with correct id and aria attributes", async ({ page }) => {
    await page.goto("/performance/");
    await page.waitForLoadState("domcontentloaded");

    const section = page.locator("#field-data");
    await expect(section).toBeAttached();
    await expect(section).toHaveAttribute("aria-labelledby", "field-data-heading");
  });

  test("should display Real-User Field Data heading", async ({ page }) => {
    await page.goto("/performance/");
    await page.waitForLoadState("domcontentloaded");

    const heading = page.locator("#field-data-heading");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Real-User Field Data");
  });
});

test.describe("CrUX Field Data — Loading State", () => {
  test("should show loading skeleton while fetching data", async ({ page }) => {
    // Mock a slow API response to catch the loading state
    await page.route("**/api/crux", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_CRUX_DATA),
      });
    });

    await page.goto("/performance/");
    await page.waitForLoadState("domcontentloaded");

    // The loading skeleton should have animate-pulse class
    const skeleton = page.locator("#field-data .animate-pulse");
    await expect(skeleton).toBeVisible({ timeout: 5000 });
  });
});

test.describe("CrUX Field Data — Success State", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/crux", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_CRUX_DATA),
      });
    });

    await page.goto("/performance/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display all 5 metric cards", async ({ page }) => {
    const fieldDataSection = page.locator("#field-data");

    for (const label of METRIC_LABELS) {
      await expect(
        fieldDataSection.getByText(label, { exact: true }),
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test("should display p75 values for each metric", async ({ page }) => {
    const fieldDataSection = page.locator("#field-data");

    // LCP: 2100 → "2,100"
    await expect(fieldDataSection.getByText("2,100")).toBeVisible({ timeout: 10000 });

    // FCP: 1500 → "1,500"
    await expect(fieldDataSection.getByText("1,500")).toBeVisible();

    // CLS: 0.05 → "0.05"
    await expect(fieldDataSection.getByText("0.05")).toBeVisible();

    // INP: 150
    await expect(fieldDataSection.getByText("150")).toBeVisible();

    // TTFB: 600
    await expect(fieldDataSection.getByText("600")).toBeVisible();
  });

  test("should display full metric names", async ({ page }) => {
    const fieldDataSection = page.locator("#field-data");

    const fullNames = [
      "Largest Contentful Paint",
      "First Contentful Paint",
      "Cumulative Layout Shift",
      "Interaction to Next Paint",
      "Time to First Byte",
    ];

    for (const name of fullNames) {
      await expect(fieldDataSection.getByText(name)).toBeVisible({ timeout: 10000 });
    }
  });

  test("should display distribution bars with good and poor percentages", async ({ page }) => {
    const fieldDataSection = page.locator("#field-data");

    // Check that good/poor percentage labels exist for LCP
    await expect(fieldDataSection.getByText("75% good")).toBeVisible({ timeout: 10000 });
    await expect(fieldDataSection.getByText("10% poor").first()).toBeVisible();

    // Check FCP percentages
    await expect(fieldDataSection.getByText("80% good")).toBeVisible();
    await expect(fieldDataSection.getByText("8% poor")).toBeVisible();

    // Check CLS percentages
    await expect(fieldDataSection.getByText("90% good")).toBeVisible();
    await expect(fieldDataSection.getByText("3% poor")).toBeVisible();
  });

  test("should display distribution bar segments with correct colors", async ({ page }) => {
    const fieldDataSection = page.locator("#field-data");

    // Wait for data to load
    await expect(fieldDataSection.getByText("LCP", { exact: true })).toBeVisible({ timeout: 10000 });

    // Each metric card should have green, yellow, and red bar segments
    const greenSegments = fieldDataSection.locator(".bg-green-400\\/80");
    const yellowSegments = fieldDataSection.locator(".bg-yellow-400\\/80");
    const redSegments = fieldDataSection.locator(".bg-red-400\\/80");

    // 5 metrics = 5 segments of each color
    await expect(greenSegments).toHaveCount(5);
    await expect(yellowSegments).toHaveCount(5);
    await expect(redSegments).toHaveCount(5);
  });

  test("should color-code p75 values based on thresholds — good values in green", async ({ page }) => {
    const fieldDataSection = page.locator("#field-data");
    await expect(fieldDataSection.getByText("LCP", { exact: true })).toBeVisible({ timeout: 10000 });

    // LCP: 2100 < 2500 (good) → text-green-400
    const lcpValue = fieldDataSection.locator(".text-green-400").filter({ hasText: "2,100" });
    await expect(lcpValue).toBeVisible();

    // CLS: 0.05 < 0.1 (good) → text-green-400
    const clsValue = fieldDataSection.locator(".text-green-400").filter({ hasText: "0.05" });
    await expect(clsValue).toBeVisible();

    // INP: 150 < 200 (good) → text-green-400
    const inpValue = fieldDataSection.locator(".text-green-400").filter({ hasText: "150" });
    await expect(inpValue).toBeVisible();
  });

  test("should display source metadata with Chrome UX Report", async ({ page }) => {
    const fieldDataSection = page.locator("#field-data");

    await expect(
      fieldDataSection.getByText("Chrome UX Report"),
    ).toBeVisible({ timeout: 10000 });
  });

  test("should display form factor in metadata", async ({ page }) => {
    const fieldDataSection = page.locator("#field-data");

    await expect(
      fieldDataSection.getByText("PHONE"),
    ).toBeVisible({ timeout: 10000 });
  });

  test("should display origin URL in metadata", async ({ page }) => {
    const fieldDataSection = page.locator("#field-data");

    await expect(
      fieldDataSection.getByText("https://www.baltzakisthemis.com"),
    ).toBeVisible({ timeout: 10000 });
  });

  test("should display timestamp as formatted date", async ({ page }) => {
    const fieldDataSection = page.locator("#field-data");

    // The timestamp "2026-03-25T12:00:00.000Z" should be formatted as a date
    // The exact format depends on locale, but "Updated" prefix should be present
    await expect(
      fieldDataSection.getByText(/Updated/),
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe("CrUX Field Data — Error / Unavailable State", () => {
  test("should show unavailable message when API returns error", async ({ page }) => {
    await page.route("**/api/crux", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ error: "No data", message: "Field data not available yet" }),
      });
    });

    await page.goto("/performance/");
    await page.waitForLoadState("domcontentloaded");

    const fieldDataSection = page.locator("#field-data");
    await expect(
      fieldDataSection.getByText("Field data not available yet"),
    ).toBeVisible({ timeout: 10000 });
  });

  test("should show default unavailable message when API fails", async ({ page }) => {
    await page.route("**/api/crux", async (route) => {
      await route.fulfill({ status: 500 });
    });

    await page.goto("/performance/");
    await page.waitForLoadState("domcontentloaded");

    const fieldDataSection = page.locator("#field-data");

    // When API fails (non-ok status), data is null → shows default message
    await expect(
      fieldDataSection.getByText(/Field data not available yet/),
    ).toBeVisible({ timeout: 10000 });
  });

  test("should show globe icon in unavailable state", async ({ page }) => {
    await page.route("**/api/crux", async (route) => {
      await route.fulfill({ status: 500 });
    });

    await page.goto("/performance/");
    await page.waitForLoadState("domcontentloaded");

    const fieldDataSection = page.locator("#field-data");
    // The unavailable state shows a message about field data not being available
    const unavailableMsg = fieldDataSection.getByText(/Field data not available/);
    await expect(unavailableMsg).toBeVisible({ timeout: 10000 });
    // The Globe SVG icon should be rendered above the message
    const svg = fieldDataSection.locator("svg").first();
    await expect(svg).toBeAttached();
  });
});

test.describe("CrUX Field Data — Color Coding Thresholds", () => {
  test("should show yellow for needs-improvement values", async ({ page }) => {
    const needsImprovementData = {
      ...MOCK_CRUX_DATA,
      lcp: { p75: 3000, good: 50, needsImprovement: 30, poor: 20 },
    };

    await page.route("**/api/crux", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(needsImprovementData),
      });
    });

    await page.goto("/performance/");
    await page.waitForLoadState("domcontentloaded");

    const fieldDataSection = page.locator("#field-data");
    await expect(fieldDataSection.getByText("LCP", { exact: true })).toBeVisible({ timeout: 10000 });

    // LCP: 3000 > 2500 (good) but < 4000 (poor) → text-yellow-400
    const lcpValue = fieldDataSection.locator(".text-yellow-400").filter({ hasText: "3,000" });
    await expect(lcpValue).toBeVisible();
  });

  test("should show red for poor values", async ({ page }) => {
    const poorData = {
      ...MOCK_CRUX_DATA,
      lcp: { p75: 5000, good: 20, needsImprovement: 30, poor: 50 },
    };

    await page.route("**/api/crux", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(poorData),
      });
    });

    await page.goto("/performance/");
    await page.waitForLoadState("domcontentloaded");

    const fieldDataSection = page.locator("#field-data");
    await expect(fieldDataSection.getByText("LCP", { exact: true })).toBeVisible({ timeout: 10000 });

    // LCP: 5000 > 4000 (poor) → text-red-400
    const lcpValue = fieldDataSection.locator(".text-red-400").filter({ hasText: "5,000" });
    await expect(lcpValue).toBeVisible();
  });
});
