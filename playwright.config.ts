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

  /* Circuit breaker configuration */
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

  /* Enhanced reporting for issue tracking and resolution */
  reporter: [
    ['line'], // Console output with Inter font styling
    [
      'html',
      {
        open: 'never',
        // Custom HTML report styling to match app fonts
        attachmentsBaseURL: 'file://' + process.cwd() + '/playwright-report/',
      },
    ], // HTML report for detailed analysis
    ['json', { outputFile: 'test-results/results.json' }], // JSON for CI/CD integration
    ['junit', { outputFile: 'test-results/junit.xml' }], // JUnit for external tools
  ],

  /* Global setup and teardown for test environment preparation */
  // globalSetup: './playwright-tests/global-setup.ts',
  globalTeardown: './playwright-tests/global-teardown.ts',

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
      use: {
        ...devices['Desktop Chrome'],
        // Chromium specific settings for better React hydration
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
          ],
        },
        // Longer timeouts for React hydration
        actionTimeout: 10000,
        navigationTimeout: 30000,
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        // Firefox specific settings to handle potential issues
        launchOptions: {
          args: ['--disable-web-security', '--allow-running-insecure-content'],
        },
        // Longer timeouts for Firefox React hydration
        actionTimeout: 15000,
        navigationTimeout: 45000,
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        // WebKit specific settings
        launchOptions: {
          args: ['--disable-web-security'],
        },
        // Longer timeouts for WebKit React hydration
        actionTimeout: 15000,
        navigationTimeout: 45000,
      },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        // Mobile Chrome settings
        launchOptions: {
          args: ['--disable-web-security'],
        },
        actionTimeout: 15000,
        navigationTimeout: 45000,
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
        // Mobile Safari settings
        actionTimeout: 15000,
        navigationTimeout: 45000,
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: [
  //   // Production server that serves both frontend and API
  //   {
  //     command: 'npx tsx server/node-build.ts',
  //     url: 'http://localhost:3000',
  //     reuseExistingServer: true, // Reuse existing server if available
  //     timeout: 30 * 1000, // Reduced timeout for faster failure detection
  //     cwd: process.cwd(), // Ensure correct working directory
  //     env: {
  //       NODE_ENV: 'production',
  //       PORT: '3000',
  //     },
  //   },
  // ],
})