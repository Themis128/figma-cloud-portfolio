import { defineConfig, devices } from "@playwright/test";
import { cpus } from "node:os";

/**
 * Fast Playwright configuration optimized for CI/CD and local development
 *
 * Key optimizations:
 * - Aggressive timeouts for quick failure detection
 * - Dynamic worker allocation based on CPU cores
 * - Performance-focused browser settings
 * - Minimal resource usage for speed
 * - Environment-aware configuration
 */

// Configuration constants for maintainability
const CONFIG = {
  // Performance timeouts (in milliseconds)
  TIMEOUTS: {
    ACTION: 3000, // Reduced from 5000ms for faster failure detection
    NAVIGATION: 8000, // Reduced from 10000ms
    EXPECT: 3000, // Reduced from 5000ms
    WEB_SERVER: 30000,
  },

  // Browser settings
  BROWSER: {
    VIEWPORT: { width: 1280, height: 720 },
    LAUNCH_ARGS: [
      "--disable-web-security",
      "--disable-features=VizDisplayCompositor",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
      "--disable-features=TranslateUI",
      "--disable-ipc-flooding-protection",
      "--disable-component-extensions-with-background-pages",
      "--disable-extensions",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-software-rasterizer",
      "--disable-background-networking",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
      "--disable-component-extensions-with-background-pages",
      "--disable-default-apps",
      "--disable-features=TranslateUI",
      "--disable-ipc-flooding-protection",
      "--metrics-recording-only",
      "--no-first-run",
      "--enable-features=NetworkService,NetworkServiceInProcess",
      "--disable-features=VizDisplayCompositor",
      "--disable-web-security",
      "--disable-features=VizDisplayCompositor",
    ],
  },

  // Test execution settings
  EXECUTION: {
    RETRIES: 0, // No retries for speed
    FORBID_ONLY: !!process.env.CI, // Fail on test.only in CI
    FULLY_PARALLEL: true, // Run tests in parallel
    TRACE: "off", // Disable for speed
    SCREENSHOT: "off", // Disable for speed
    VIDEO: "off", // Disable for speed
  },

  // Server configuration
  SERVER: {
    COMMAND: "pnpm dev",
    URL: "http://localhost:8082",
    REUSE_EXISTING: !process.env.CI,
    TIMEOUT: 30000,
  },

  // Reporter configuration
  REPORTER: process.env.CI ? "github" : "list",
} as const;

// Calculate optimal worker count based on CPU cores
const getOptimalWorkers = (): number => {
  const cpuCount = cpus().length;
  const isCI = !!process.env.CI;
  const isGitHubActions = !!process.env.GITHUB_ACTIONS;

  // GitHub Actions typically has 2 cores, use 2 workers
  if (isGitHubActions) return 2;

  // CI environments: use CPU count - 1 to leave room for other processes
  if (isCI) return Math.max(1, cpuCount - 1);

  // Local development: use CPU count for maximum parallelism
  return cpuCount;
};

export default defineConfig({
  testDir: "./playwright-tests",

  /* Run tests in files in parallel for speed */
  fullyParallel: CONFIG.EXECUTION.FULLY_PARALLEL,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: CONFIG.EXECUTION.FORBID_ONLY,

  /* Reduced retry strategy for faster execution */
  retries: CONFIG.EXECUTION.RETRIES,

  /* Use optimal number of workers for better performance */
  workers: getOptimalWorkers(),

  /* Expect timeout */
  expect: {
    timeout: CONFIG.TIMEOUTS.EXPECT,
  },

  /* Optimized timeouts for faster execution */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: CONFIG.SERVER.URL,

    /* Aggressive timeouts for faster failure detection */
    actionTimeout: CONFIG.TIMEOUTS.ACTION,
    navigationTimeout: CONFIG.TIMEOUTS.NAVIGATION,

    /* Enhanced browser context for better isolation and performance */
    viewport: CONFIG.BROWSER.VIEWPORT,
    ignoreHTTPSErrors: true,

    /* Disable tracing and screenshots for speed */
    trace: CONFIG.EXECUTION.TRACE,
    screenshot: CONFIG.EXECUTION.SCREENSHOT,
    video: CONFIG.EXECUTION.VIDEO,

    /* Additional performance optimizations */
    launchOptions: {
      args: [...CONFIG.BROWSER.LAUNCH_ARGS],
      // Reduce memory usage in CI
      ...(process.env.CI
        ? {
          headless: true,
          devtools: false,
        }
        : {
          headless: false,
          devtools: false,
        }),
    },
  },

  /* Optimized reporter for different environments */
  reporter: CONFIG.REPORTER,

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Additional performance settings for Chrome
        launchOptions: {
          args: [...CONFIG.BROWSER.LAUNCH_ARGS],
        },
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: CONFIG.SERVER.COMMAND,
  //   url: CONFIG.SERVER.URL,
  //   reuseExistingServer: CONFIG.SERVER.REUSE_EXISTING,
  //   timeout: CONFIG.SERVER.TIMEOUT,
  // },

  /* Global setup and teardown for better test isolation */
  // globalSetup: fileURLToPath(new URL("./playwright-tests/global-setup.ts", import.meta.url)),
  // globalTeardown: fileURLToPath(new URL("./playwright-tests/global-teardown.ts", import.meta.url)),

  /* Test metadata for better organization */
  metadata: {
    environment: process.env.NODE_ENV ?? "development",
    ci: !!process.env.CI,
    timestamp: new Date().toISOString(),
  },

  /* Output directories */
  outputDir: "test-results/fast/",

  /* Test filtering for faster execution */
  grep: process.env.TEST_PATTERN ? new RegExp(process.env.TEST_PATTERN) : undefined,
  grepInvert: process.env.TEST_GREP_INVERT ? new RegExp(process.env.TEST_GREP_INVERT) : undefined,
});
