import { defineConfig, devices } from "@playwright/test";

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./playwright-tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Enhanced retry strategy for automatic issue resolution */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 2 : 4,

  /* Circuit breaker configuration */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:8082",

    /* Enhanced tracing and debugging */
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",

    /* Optimized timeouts for better reliability */
    actionTimeout: 10000,
    navigationTimeout: 30000,

    /* Enhanced browser context for better isolation */
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    /* Performance monitoring */
    extraHTTPHeaders: {
      "X-Test-Session": "playwright-e2e",
    },
  },

  /* Enhanced reporting for issue tracking and resolution */
  reporter: [
    ["line"],
    [
      "html",
      {
        open: "never",
        attachmentsBaseURL: `file://${process.cwd()}/playwright-report/`,
      },
    ],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
  ],

  /* Global setup and teardown for test environment preparation */
  globalSetup: "./playwright-tests/global-setup.ts",
  globalTeardown: "./playwright-tests/global-teardown.ts",

  /* Test execution metadata */
  metadata: {
    environment: process.env.NODE_ENV || "development",
    testType: "e2e",
    framework: "playwright",
    timestamp: new Date().toISOString(),
  },

  /* Expect configuration for better assertions */
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      threshold: 0.2,
      maxDiffPixels: 100,
    },
    toMatchSnapshot: {
      threshold: 0.2,
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: ["--disable-web-security", "--disable-features=VizDisplayCompositor"],
        },
        actionTimeout: 10000,
        navigationTimeout: 30000,
      },
    },

    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        launchOptions: {
          args: ["--disable-web-security", "--allow-running-insecure-content"],
        },
        actionTimeout: 15000,
        navigationTimeout: 45000,
      },
    },

    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        launchOptions: {
          args: ["--disable-web-security"],
        },
        actionTimeout: 15000,
        navigationTimeout: 45000,
      },
    },

    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
        launchOptions: {
          args: ["--disable-web-security"],
        },
        actionTimeout: 15000,
        navigationTimeout: 45000,
      },
    },
    {
      name: "Mobile Safari",
      use: {
        ...devices["iPhone 12"],
        actionTimeout: 15000,
        navigationTimeout: 45000,
      },
    },
  ],
});