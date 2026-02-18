/**
 * Unified Playwright Configuration
 * 
 * Consolidated configuration for all testing needs:
 * - E2E tests
 * - Visual regression
 * - Accessibility testing
 * - API integration tests
 * - Auto-fix capabilities
 * 
 * Usage:
 *   pnpm test:e2e           - Run all tests
 *   pnpm test:e2e:fast     - Fast execution mode
 *   pnpm test:e2e:ci       - CI-optimized mode
 *   pnpm test:e2e:ui       - UI mode for debugging
 *   pnpm test:e2e:autofix  - Auto-fix mode
 */

import * as os from 'node:os'
import { devices, type PlaywrightTestConfig } from '@playwright/test'

// =============================================================================
// TYPES
// =============================================================================

export type ConfigEnvironment = 'development' | 'ci' | 'fast' | 'autofix'

export interface EnvironmentSettings {
  timeouts: {
    action: number
    navigation: number
    expect: number
    test: number
    webServer: number
  }
  workers: {
    min: number
    max: number
    cpuFraction: number
  }
  retries: number
  artifacts: {
    trace: string
    screenshot: string
    video: string
  }
  reporting: {
    reporters: string[]
    outputDir: string
  }
  features: {
    enableGlobalSetup: boolean
    enableWebServer: boolean
    enableSharding: boolean
    enableVisualComparison: boolean
  }
}

// =============================================================================
// BROWSER LAUNCH ARGUMENTS
// =============================================================================

const BROWSER_LAUNCH_ARGS = {
  PERFORMANCE: [
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-features=TranslateUI,BlinkGenPropertyTrees',
    '--disable-ipc-flooding-protection',
    '--disable-component-extensions-with-background-pages',
    '--disable-default-apps',
    '--disable-hang-monitor',
    '--disable-prompt-on-repost',
    '--force-color-profile=srgb',
    '--metrics-recording-only',
    '--no-first-run',
    '--enable-features=NetworkService,NetworkServiceInProcess,VizDisplayCompositor',
    '--disable-background-networking',
    '--disable-sync',
    '--disable-translate',
    '--hide-scrollbars',
    '--mute-audio',
    '--no-crash-upload',
    '--no-default-browser-check',
    '--disable-logging',
    '--disable-dev-tools',
    '--memory-pressure-off',
    '--max_old_space_size=4096',
    '--disable-accelerated-2d-canvas',
    '--disable-software-rasterizer',
  ],

  SECURITY: [
    '--disable-blink-features=AutomationControlled',
    '--disable-extensions-except',
    '--disable-extensions',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
  ],

  RESOURCES: [
    '--disable-dev-shm-usage',
    '--disable-software-rasterizer',
    '--disable-background-networking',
    '--disable-extensions',
    '--disable-plugins',
    '--disable-images',
    '--disable-javascript-harmony-shipping',
    '--memory-pressure-off',
    '--max_old_space_size=4096',
    '--optimize-for-size',
  ],

  CI: [
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
  ],
}

// =============================================================================
// ENVIRONMENT SETTINGS
// =============================================================================

function getEnvironmentSettings(environment: ConfigEnvironment): EnvironmentSettings {
  const baseSettings: Record<ConfigEnvironment, EnvironmentSettings> = {
    development: {
      timeouts: {
        action: 10000,
        navigation: 30000,
        expect: 20000,
        test: 90000,
        webServer: 60000,
      },
      workers: {
        min: 1,
        max: Math.max(1, os.cpus().length - 1),
        cpuFraction: 0.8,
      },
      retries: 1,
      artifacts: {
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
      },
      reporting: {
        reporters: ['line', 'html', 'json'],
        outputDir: 'playwright-report',
      },
      features: {
        enableGlobalSetup: true,
        enableWebServer: true,
        enableSharding: false,
        enableVisualComparison: true,
      },
    },

    ci: {
      timeouts: {
        action: 15000,
        navigation: 45000,
        expect: 25000,
        test: 120000,
        webServer: 90000,
      },
      workers: {
        min: 1,
        max: 4,
        cpuFraction: 0.6,
      },
      retries: 2,
      artifacts: {
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
      },
      reporting: {
        reporters: ['github', 'junit', 'json', 'html'],
        outputDir: 'playwright-report-ci',
      },
      features: {
        enableGlobalSetup: true,
        enableWebServer: false,
        enableSharding: true,
        enableVisualComparison: true,
      },
    },

    fast: {
      timeouts: {
        action: 3000,
        navigation: 10000,
        expect: 3000,
        test: 30000,
        webServer: 15000,
      },
      workers: {
        min: 1,
        max: os.cpus().length,
        cpuFraction: 1.0,
      },
      retries: 0,
      artifacts: {
        trace: 'off',
        screenshot: 'off',
        video: 'off',
      },
      reporting: {
        reporters: ['line', 'json'],
        outputDir: 'playwright-report-fast',
      },
      features: {
        enableGlobalSetup: false,
        enableWebServer: true,
        enableSharding: false,
        enableVisualComparison: false,
      },
    },

    autofix: {
      timeouts: {
        action: 15000,
        navigation: 45000,
        expect: 15000,
        test: 90000,
        webServer: 60000,
      },
      workers: {
        min: 1,
        max: 2,
        cpuFraction: 0.8,
      },
      retries: 3,
      artifacts: {
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
      },
      reporting: {
        reporters: ['line', 'html', 'json'],
        outputDir: 'playwright-report-autofix',
      },
      features: {
        enableGlobalSetup: true,
        enableWebServer: true,
        enableSharding: false,
        enableVisualComparison: true,
      },
    },
  }

  return baseSettings[environment]
}

function getOptimalWorkers(environment: ConfigEnvironment): number {
  const settings = getEnvironmentSettings(environment)
  const cpuCount = os.cpus().length || 2
  const isCI = !!process.env['CI']
  const isGitHubActions = !!process.env['GITHUB_ACTIONS']

  if (isGitHubActions) {
    return Math.min(2, settings.workers.max)
  }

  if (isCI) {
    return Math.min(
      settings.workers.max,
      Math.max(settings.workers.min, Math.floor(cpuCount * settings.workers.cpuFraction)),
    )
  }

  return Math.min(
    settings.workers.max,
    Math.max(settings.workers.min, Math.min(cpuCount - 1, Math.floor(cpuCount * settings.workers.cpuFraction))),
  )
}

// =============================================================================
// CONFIGURATION
// =============================================================================

// Determine environment
function getEnvironment(): ConfigEnvironment {
  if (process.env['TEST_ENV'] === 'ci') return 'ci'
  if (process.env['TEST_ENV'] === 'fast') return 'fast'
  if (process.env['TEST_ENV'] === 'autofix') return 'autofix'
  return 'development'
}

const environment = getEnvironment()
const settings = getEnvironmentSettings(environment)
const workers = getOptimalWorkers(environment)

// Get browser projects
const getBrowserProjects = () => {
  const baseProjects = [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [...BROWSER_LAUNCH_ARGS.PERFORMANCE, ...BROWSER_LAUNCH_ARGS.SECURITY, ...(environment === 'ci' ? BROWSER_LAUNCH_ARGS.CI : [])],
          ignoreDefaultArgs: ['--enable-automation'],
          ignoreHTTPSErrors: true,
        },
        viewport: { width: 1280, height: 720 },
      },
    },
  ]

  if (environment !== 'fast') {
    baseProjects.push(
      {
        name: 'firefox',
        use: {
          ...devices['Desktop Firefox'],
          launchOptions: {
            args: [...BROWSER_LAUNCH_ARGS.PERFORMANCE, ...BROWSER_LAUNCH_ARGS.SECURITY],
            ignoreDefaultArgs: ['--enable-automation'],
            ignoreHTTPSErrors: true,
          },
          viewport: { width: 1280, height: 720 },
        },
      },
      {
        name: 'webkit',
        use: {
          ...devices['Desktop Safari'],
          launchOptions: {
            args: [...BROWSER_LAUNCH_ARGS.PERFORMANCE, ...BROWSER_LAUNCH_ARGS.SECURITY],
            ignoreDefaultArgs: ['--enable-automation'],
            ignoreHTTPSErrors: true,
          },
          viewport: { width: 1280, height: 720 },
        },
      },
    )
  }

  // Add mobile for development
  if (environment === 'development') {
    baseProjects.push(
      {
        name: 'Mobile Chrome',
        use: {
          ...devices['Pixel 7'],
          launchOptions: {
            args: [...BROWSER_LAUNCH_ARGS.PERFORMANCE, ...BROWSER_LAUNCH_ARGS.SECURITY],
            ignoreDefaultArgs: ['--enable-automation'],
            ignoreHTTPSErrors: true,
          },
          viewport: { width: 412, height: 915 },
        },
      },
      {
        name: 'Mobile Safari',
        use: {
          ...devices['iPhone 14'],
          launchOptions: {
            args: [...BROWSER_LAUNCH_ARGS.PERFORMANCE, ...BROWSER_LAUNCH_ARGS.SECURITY],
            ignoreDefaultArgs: ['--enable-automation'],
            ignoreHTTPSErrors: true,
          },
          viewport: { width: 390, height: 844 },
        },
      },
    )
  }

  return baseProjects
}

// Build reporters
const reporters = settings.reporting.reporters.map((reporter) => {
  switch (reporter) {
    case 'html':
      return ['html', { open: 'never', outputFolder: `${settings.reporting.outputDir}/html` }]
    case 'junit':
      return ['junit', { outputFile: `${settings.reporting.outputDir}/junit.xml` }]
    case 'json':
      return ['json', { outputFile: `${settings.reporting.outputDir}/results.json` }]
    default:
      return [reporter]
  }
})

// Create config
const config: PlaywrightTestConfig = {
  testDir: './playwright-tests',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: settings.retries,
  timeout: settings.timeouts.test,
  workers,

  // Skip global setup/teardown for now - can be enabled when needed
  // globalSetup: './playwright-tests/global-setup.ts',
  // globalTeardown: './playwright-tests/global-teardown.ts',

  outputDir: `${settings.reporting.outputDir}/artifacts`,
  reporter: reporters as unknown as PlaywrightTestConfig['reporter'],

  expect: {
    timeout: settings.timeouts.expect,
    toHaveScreenshot: {
      threshold: 0.15,
      maxDiffPixels: 50,
      animations: 'disabled',
      caret: 'hide',
    },
  },

  use: {
    baseURL: process.env['PLAYWRIGHT_BASE_URL'] || 'http://localhost:8081',
    actionTimeout: settings.timeouts.action,
    navigationTimeout: settings.timeouts.navigation,
    trace: settings.artifacts.trace as 'on' | 'off' | 'on-first-retry' | 'retain-on-failure',
    screenshot: settings.artifacts.screenshot as 'on' | 'off' | 'only-on-failure',
    video: settings.artifacts.video as 'on' | 'off' | 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    locale: 'en-US',
    timezoneId: 'America/New_York',
    colorScheme: 'light',
    acceptDownloads: true,
    bypassCSP: environment === 'development',
    permissions: ['geolocation', 'notifications'],
    serviceWorkers: 'block',
  },

  projects: getBrowserProjects() as PlaywrightTestConfig['projects'],

  // Auto-fix settings
  updateSnapshots: environment === 'autofix' || process.env['UPDATE_SNAPSHOTS'] === 'true' ? 'missing' : 'none',

  // Web server - always reuse existing to avoid port conflicts
  webServer: process.env['PLAYWRIGHT_START_SERVERS'] === 'true' ? [
    {
      command: 'npx tsx server/node-build.ts',
      url: 'http://localhost:3002/api/health',
      reuseExistingServer: true,
      timeout: settings.timeouts.webServer,
    },
    {
      command: 'npx vite --port 8081',
      url: 'http://localhost:8081',
      reuseExistingServer: true,
      timeout: settings.timeouts.webServer * 2,
    },
  ] : undefined,

  metadata: {
    environment,
    testType: 'e2e',
    framework: 'playwright',
    timestamp: new Date().toISOString(),
    workers,
  },
}

// Log configuration
console.log(`\n🧪 Playwright Configuration (${environment}):`)
console.log(`   - Workers: ${config.workers}`)
console.log(`   - Retries: ${config.retries}`)
console.log(`   - Timeout: ${config.timeout}ms`)
console.log(`   - Reporters: ${settings.reporting.reporters.join(', ')}`)
console.log('')

export default config
export { config }
