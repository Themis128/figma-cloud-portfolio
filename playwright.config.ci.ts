/**
 * CI-specific Playwright configuration
 *
 * Used by the Playwright GitHub Actions workflow for sharded test runs.
 * Extends the unified config with blob reporter required for shard merging.
 */

import * as os from 'node:os'
import { devices, type PlaywrightTestConfig } from '@playwright/test'

const CI_ARGS = [
  '--disable-dev-shm-usage',
  '--disable-software-rasterizer',
  '--disable-background-timer-throttling',
  '--disable-renderer-backgrounding',
  '--disable-backgrounding-occluded-windows',
  '--no-sandbox',
  '--disable-blink-features=AutomationControlled',
  '--disable-extensions',
  '--disable-plugins',
  '--memory-pressure-off',
  '--max_old_space_size=4096',
  '--disable-logging',
  '--disable-dev-tools',
]

const cpuCount = os.cpus().length || 2
const workers = Math.min(2, Math.max(1, Math.floor(cpuCount * 0.5)))

const config: PlaywrightTestConfig = {
  testDir: './playwright-tests',
  fullyParallel: true,
  forbidOnly: true,
  retries: 2,
  timeout: 120000,
  workers,

  outputDir: 'test-results',

  reporter: [['blob', { outputDir: 'blob-report' }], ['github'], ['line']],

  expect: {
    timeout: 25000,
    toHaveScreenshot: {
      threshold: 0.15,
      maxDiffPixels: 50,
      animations: 'disabled',
      caret: 'hide',
    },
  },

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8082',
    actionTimeout: 15000,
    navigationTimeout: 45000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    locale: 'en-US',
    timezoneId: 'America/New_York',
    colorScheme: 'light',
    acceptDownloads: true,
    serviceWorkers: 'block',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: CI_ARGS,
          ignoreDefaultArgs: ['--enable-automation'],
          ignoreHTTPSErrors: true,
        },
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  webServer:
    process.env.PLAYWRIGHT_START_SERVERS === 'true'
      ? [
          {
            command: 'npx tsx server/node-build.ts',
            url: 'http://localhost:3002/api/health',
            reuseExistingServer: true,
            timeout: 90000,
          },
          {
            command: 'npx vite --port 8082',
            url: 'http://localhost:8082',
            reuseExistingServer: true,
            timeout: 180000,
          },
        ]
      : undefined,
}

export default config
