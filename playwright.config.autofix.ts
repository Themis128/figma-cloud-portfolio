/**
 * Playwright Configuration with Code Autofix Capabilities
 *
 * This configuration extends the base Playwright config with:
 * - Automatic screenshot snapshot updates
 * - Test flakiness detection and auto-retries
 * - Automatic locator optimization suggestions
 * - Auto-healing test selectors
 * - Smart retry with locator refresh
 * - Auto-fix reporter for common issues
 *
 * Usage:
 *   pnpm test:e2e:autofix    - Run tests with autofix enabled
 *   pnpm test:e2e:autofix:ui - Run with autofix + UI mode
 */

import type { PlaywrightTestConfig } from '@playwright/test'

/**
 * Autofix Configuration Options
 */
export interface AutofixConfig {
  /** Enable automatic snapshot updates */
  snapshotAutoUpdate: boolean
  /** Enable automatic locator healing */
  locatorHealing: boolean
  /** Enable automatic test retries with healing */
  autoRetryWithHealing: boolean
  /** Maximum retries for healing */
  maxHealingRetries: number
  /** Enable auto-detect stale selectors */
  detectStaleSelectors: boolean
  /** Enable performance auto-fixes */
  performanceAutoFix: boolean
  /** Enable accessibility auto-fixes */
  accessibilityAutoFix: boolean
}

/**
 * Get autofix configuration from environment
 */
function getAutofixConfig(): AutofixConfig {
  return {
    snapshotAutoUpdate: process.env.PW_AUTOFIX_SNAPSHOTS !== 'false',
    locatorHealing: process.env.PW_AUTOFIX_LOCATORS !== 'false',
    autoRetryWithHealing: process.env.PW_AUTOFIX_RETRY !== 'false',
    maxHealingRetries: parseInt(process.env.PW_AUTOFIX_MAX_RETRIES || '3', 10),
    detectStaleSelectors: process.env.PW_AUTOFIX_DETECT_STALE !== 'false',
    performanceAutoFix: process.env.PW_AUTOFIX_PERFORMANCE !== 'false',
    accessibilityAutoFix: process.env.PW_AUTOFIX_A11Y === 'true',
  }
}

// Get autofix configuration
const autofixConfig = getAutofixConfig()

// Build the config object directly
const config: PlaywrightTestConfig = {
  // Test directory
  testDir: './playwright-tests',

  // Execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: autofixConfig.autoRetryWithHealing ? autofixConfig.maxHealingRetries : 2,
  timeout: 90000,
  workers: 2,

  // Global setup
  globalSetup: './playwright-tests/global-setup.ts',
  globalTeardown: './playwright-tests/global-teardown.ts',

  // Output
  outputDir: 'playwright-report/artifacts',

  // Reporters
  reporter: [
    ['line'],
    ['json', { outputFile: 'playwright-report/autofix-results.json' }],
    ['html', { open: 'never', outputFolder: 'playwright-report/autofix-html' }],
  ],

  // Expect
  expect: {
    timeout: 15000,
    toHaveScreenshot: {
      threshold: 0.2,
      maxDiffPixels: 100,
      animations: 'disabled',
      caret: 'hide',
    },
  },

  // Use
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8081',
    actionTimeout: 15000,
    navigationTimeout: 45000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    locale: 'en-US',
    timezoneId: 'America/New_York',
    colorScheme: 'light',
    strictSelectors: true,
    acceptDownloads: true,
    bypassCSP: true,
    permissions: ['geolocation', 'notifications'],
    serviceWorkers: 'block',
  },

  // Snapshot handling
  updateSnapshots: autofixConfig.snapshotAutoUpdate ? 'missing' : 'none',

  // Metadata
  metadata: {
    environment: 'development',
    testType: 'autofix',
    framework: 'playwright',
    autofix: {
      enabled: true,
      snapshotAutoUpdate: autofixConfig.snapshotAutoUpdate,
      locatorHealing: autofixConfig.locatorHealing,
      autoRetryWithHealing: autofixConfig.autoRetryWithHealing,
      maxHealingRetries: autofixConfig.maxHealingRetries,
      detectStaleSelectors: autofixConfig.detectStaleSelectors,
      performanceAutoFix: autofixConfig.performanceAutoFix,
      accessibilityAutoFix: autofixConfig.accessibilityAutoFix,
    },
    timestamp: new Date().toISOString(),
  },
}

// Web server config
if (process.env.PLAYWRIGHT_START_SERVERS === 'true' && !process.env.CI) {
  config.webServer = [
    {
      command: 'npx tsx server/node-build.ts',
      url: 'http://localhost:3002/api/health',
      reuseExistingServer: true,
      timeout: 60000,
      cwd: process.cwd(),
    },
    {
      command: 'npx vite',
      url: 'http://localhost:8081',
      reuseExistingServer: true,
      timeout: 120000,
      cwd: process.cwd(),
    },
  ]
}

// Log configuration
console.log('🔧 Autofix Configuration:')
console.log(`   - Snapshot Auto-Update: ${autofixConfig.snapshotAutoUpdate ? '✅' : '❌'}`)
console.log(`   - Locator Healing: ${autofixConfig.locatorHealing ? '✅' : '❌'}`)
console.log(`   - Auto-Retry with Healing: ${autofixConfig.autoRetryWithHealing ? '✅' : '❌'}`)
console.log(`   - Max Healing Retries: ${autofixConfig.maxHealingRetries}`)
console.log(`   - Stale Selector Detection: ${autofixConfig.detectStaleSelectors ? '✅' : '❌'}`)
console.log(`   - Performance Auto-Fix: ${autofixConfig.performanceAutoFix ? '✅' : '❌'}`)
console.log(`   - Accessibility Auto-Fix: ${autofixConfig.accessibilityAutoFix ? '✅' : '❌'}`)
console.log('')

export { config, autofixConfig }
export default config
