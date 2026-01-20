import { defineConfig, devices } from '@playwright/test'

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './playwright-tests',
  /* Run tests in files in parallel */
  fullyParallel: false, // Disable parallel to avoid conflicts
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Enhanced retry strategy for automatic issue resolution */
  retries: process.env.CI ? 3 : 1, // More retries for better reliability
  /* Opt out of parallel tests on CI. */
  workers: 1, // Single worker to avoid conflicts

  /* Enhanced reporting for issue tracking and resolution */
  reporter: [
    ['line'], // Console output
    ['html', { open: 'never' }], // HTML report for detailed analysis
    ['json', { outputFile: 'test-results/results.json' }], // JSON for CI/CD integration
    ['junit', { outputFile: 'test-results/junit.xml' }], // JUnit for external tools
  ],

  /* Global setup and teardown for test environment preparation */
  globalSetup: './playwright-tests/global-setup.ts',
  globalTeardown: './playwright-tests/global-teardown.ts',

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:8081',

    /* Enhanced tracing and debugging */
    trace: 'retain-on-failure', // Keep traces for failed tests
    screenshot: 'only-on-failure', // Capture screenshots on failures
    video: 'retain-on-failure', // Record videos for failed tests

    /* Optimized timeouts for better reliability */
    actionTimeout: 10000,
    navigationTimeout: 30000,
    expectTimeout: 10000,

    /* Enhanced browser context for better isolation */
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    /* Performance monitoring */
    extraHTTPHeaders: {
      'X-Test-Session': 'playwright-e2e',
    },
  },

  /* Test execution metadata */
  metadata: {
    environment: process.env.NODE_ENV || 'development',
    testType: 'e2e',
    framework: 'playwright',
    timestamp: new Date().toISOString(),
  },

  /* Expect configuration for better assertions */
  expect: {
    toHaveScreenshot: {
      threshold: 0.2, // Allow 20% difference for visual comparisons
      maxDiffPixels: 100, // Maximum pixel difference
    },
    toMatchSnapshot: {
      threshold: 0.2,
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        // Firefox specific settings to handle potential issues
        launchOptions: {
          args: ['--disable-web-security', '--allow-running-insecure-content'],
        },
        // Reduce action timeout for Firefox to fail faster on slow operations
        actionTimeout: 5000,
      },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:8081',
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
  },
})