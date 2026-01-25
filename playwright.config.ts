import { defineConfig, devices } from "@playwright/test";
import os from "os";

// Constants for configuration
const DEFAULT_CPU_COUNT = 2;
const WORKER_CPU_FRACTION = 0.75;
const VISUAL_SNAPSHOT_THRESHOLD = 0.2;
const VISUAL_SNAPSHOT_MAX_DIFF = 100;

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./playwright-tests",
  /* Run tests in files in parallel */
  fullyParallel: true, // Enable parallel for better performance
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Enhanced retry strategy for automatic issue resolution */
  retries: process.env.CI ? 2 : 1,
  /* Dynamic worker count: use most of available cores locally, limit on CI */
  workers: process.env.CI
    ? 2
    : Math.max(1, Math.floor((os.cpus()?.length || DEFAULT_CPU_COUNT) * WORKER_CPU_FRACTION)),

  /* Circuit breaker configuration */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:8082",

    /* Enhanced tracing and debugging */
    trace: "retain-on-failure", // Keep traces for failed tests
    screenshot: "only-on-failure", // Capture screenshots on failures
    video: "retain-on-failure", // Record videos for failed tests

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
    ["line"], // Console output with Inter font styling
    [
      "html",
      {
        open: "never",
        outputFolder: "playwright-html-report",
        // Custom HTML report styling to match app fonts
        attachmentsBaseURL: `file://${process.cwd()}/playwright-report/`,
      },
    ], // HTML report for detailed analysis
    ["json", { outputFile: "test-results/results.json" }], // JSON for CI/CD integration
    ["junit", { outputFile: "test-results/junit.xml" }], // JUnit for external tools
    // ["./scripts/playwright-mcp-integration.ts"], // MCP integration for real-time progress - temporarily disabled
  ],

  /* Global setup and teardown for test environment preparation */
  // globalSetup: "./playwright-tests/global-setup.ts",
  globalTeardown: "./playwright-tests/global-teardown.ts",

  /* Where to store test artifacts (videos, traces, screenshots) */
  outputDir: "playwright-report/artifacts",

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
      threshold: VISUAL_SNAPSHOT_THRESHOLD, // Allow threshold for visual comparisons
      maxDiffPixels: VISUAL_SNAPSHOT_MAX_DIFF, // Maximum pixel difference
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
        // Chromium specific settings for better React 19 hydration
        launchOptions: {
          args: ["--disable-web-security", "--disable-features=VizDisplayCompositor"],
        },
        // Longer timeouts for React 19 hydration
        actionTimeout: 10000,
        navigationTimeout: 30000,
      },
    },

    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        // Firefox specific settings to handle potential issues
        launchOptions: {
          args: ["--disable-web-security", "--allow-running-insecure-content"],
        },
        // Longer timeouts for Firefox React hydration
        actionTimeout: 15000,
        navigationTimeout: 45000,
      },
    },

    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        // WebKit specific settings
        launchOptions: {
          args: ["--disable-web-security"],
        },
        // Longer timeouts for WebKit React hydration
        actionTimeout: 15000,
        navigationTimeout: 45000,
      },
    },

    /* Test against mobile viewports. */
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
        // Mobile Chrome settings
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
        // Mobile Safari settings
        actionTimeout: 15000,
        navigationTimeout: 45000,
      },
    },
  ],

  /* Run your local dev servers before starting the tests. Playwright will
     start the backend and frontend when running tests locally and will reuse
     existing servers when present to speed up iteration. */
  // webServer: [
  //   {
  //     command: 'npx tsx server/dev-server.ts',
  //     url: 'http://localhost:3000/api/ping',
  //     reuseExistingServer: !process.env.CI,
  //     timeout: WEB_SERVER_TIMEOUT_MS,
  //     cwd: process.cwd(),
  //   },
  //   {
  //     command: 'npx vite --host localhost --port 8082',
  //     url: 'http://localhost:8082',
  //     reuseExistingServer: !process.env.CI,
  //     timeout: WEB_SERVER_TIMEOUT_MS,
  //     cwd: process.cwd(),
  //   },
  // ],
});
