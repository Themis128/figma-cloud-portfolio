import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright Configuration for Real API Integration Testing
 *
 * This configuration is specifically for testing with REAL external APIs
 * Use with: pnpm test:e2e:real
 *
 * Requirements:
 * - Real API credentials in .env.test
 * - Backend server running (npm run dev:all)
 * - Internet connection
 *
 * Warning: These tests will:
 * - Make real API calls (costs may apply)
 * - Be slower than mocked tests
 * - Be affected by network issues
 * - Count against API rate limits
 */

export default defineConfig({
  testDir: './playwright-tests/real-api',
  testMatch: /.*\.real\.spec\.ts$/,

  // Real API tests need more time
  timeout: 60000, // 60 seconds per test
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },

  // Real APIs are less predictable
  fullyParallel: false, // Run sequentially to avoid rate limits
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 1, // Retry on network failures
  workers: process.env['CI'] ? 1 : 2, // Limit parallel workers

  // Reporters
  reporter: [
    ['html', { outputFolder: 'playwright-report-real-api' }],
    ['json', { outputFile: 'test-results/real-api-results.json' }],
    ['list'],
  ],

  // Output directory for test artifacts
  outputDir: 'test-results/real-api',

  use: {
    // Base URL for testing
    baseURL: process.env['BASE_URL'] || 'http://localhost:3001',

    // Longer timeouts for real API calls
    actionTimeout: 15000,
    navigationTimeout: 30000,

    // Collect trace on failure
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Extra HTTP headers for API authentication
    extraHTTPHeaders: {
      'X-Test-Mode': 'real-api',
    },
  },

  // Test against multiple browsers
  projects: [
    {
      name: 'chromium-real-api',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox-real-api',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  // Web server configuration
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env['CI'],
    timeout: 120000,
  },
})
