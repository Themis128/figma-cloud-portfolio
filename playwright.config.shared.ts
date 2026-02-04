import * as os from 'node:os'
import { devices, type PlaywrightTestConfig } from '@playwright/test'

/**
 * Shared Playwright Configuration Factory
 *
 * This module provides a factory pattern for creating consistent, environment-aware
 * Playwright configurations that address all common issues and best practices.
 *
 * Key Features:
 * - Dynamic worker allocation based on environment and CPU cores
 * - Consistent timeout strategies with environment-based scaling
 * - Consolidated browser launch arguments (no duplicates)
 * - Proper global setup/teardown configuration
 * - Environment-aware settings with validation
 */

// =============================================================================
// CONFIGURATION TYPES AND INTERFACES
// =============================================================================

export type ConfigEnvironment = 'development' | 'ci' | 'fast' | 'isolated'

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
// SHARED CONSTANTS AND UTILITIES
// =============================================================================

/**
 * Consolidated Browser Launch Arguments
 * Removes duplicates and provides optimized settings for different scenarios
 * Updated for Playwright 1.58+ with latest performance optimizations
 */
export const BROWSER_LAUNCH_ARGS = {
  // Performance optimization arguments (Playwright 1.58+ optimized, no duplicates)
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
    // Modern performance flags (Playwright 1.58+)
    '--memory-pressure-off',
    '--max_old_space_size=4096',
    '--disable-accelerated-2d-canvas',
    '--disable-software-rasterizer',
  ],

  // Security and isolation arguments (enhanced for modern browsers, no conflicts)
  SECURITY: [
    '--disable-blink-features=AutomationControlled',
    '--disable-extensions-except',
    '--disable-extensions',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu', // Safe for headless testing
  ],

  // Resource optimization arguments (memory and CPU focused)
  RESOURCES: [
    '--disable-dev-shm-usage',
    '--disable-software-rasterizer',
    '--disable-background-networking',
    '--disable-extensions',
    '--disable-plugins',
    '--disable-images',
    '--disable-javascript-harmony-shipping',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    '--memory-pressure-off',
    '--max_old_space_size=4096',
    '--optimize-for-size',
    '--disable-logging',
    '--disable-dev-tools',
  ],

  // CI-specific optimizations (streamlined, removed redundancy and conflicts)
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
    '--disable-component-extensions-with-background-pages',
    '--disable-default-apps',
    '--disable-hang-monitor',
    '--disable-prompt-on-repost',
    '--force-color-profile=srgb',
    '--metrics-recording-only',
    '--mute-audio',
    '--no-crash-upload',
    '--no-default-browser-check',
    '--no-first-run',
  ],

  // Browser-specific argument sets for optimal performance
  CHROMIUM_SPECIFIC: [
    '--disable-blink-features=AutomationControlled',
    '--enable-features=NetworkService,NetworkServiceInProcess',
    '--disable-dev-shm-usage',
    '--disable-gpu', // Safe for headless CI
    '--disable-software-rasterizer',
  ],

  FIREFOX_SPECIFIC: [
    // Firefox supports fewer args but gets key performance optimizations
    '--disable-dev-shm-usage',
    '--memory-pressure-off',
    '--max_old_space_size=4096',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
  ],

  WEBKIT_SPECIFIC: [
    // WebKit has limited flag support but gets essential performance args
    '--disable-dev-shm-usage',
    '--memory-pressure-off',
    '--max_old_space_size=4096',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
  ],

  // Get all arguments for a specific scenario and browser
  getArgs(
    scenario: 'fast' | 'stable' | 'ci' | 'debug',
    browser?: 'chromium' | 'firefox' | 'webkit',
  ): string[] {
    const base = [...this.PERFORMANCE, ...this.SECURITY]

    let scenarioArgs: string[] = []
    switch (scenario) {
      case 'fast':
        scenarioArgs = [...base, ...this.RESOURCES]
        break
      case 'ci':
        scenarioArgs = [...this.CI]
        break
      case 'debug':
        scenarioArgs = [...this.PERFORMANCE] // Keep some features for debugging
        break
      case 'stable':
        scenarioArgs = base
        break
    }

    // Add browser-specific optimizations
    if (browser) {
      switch (browser) {
        case 'chromium':
          scenarioArgs = [...scenarioArgs, ...this.CHROMIUM_SPECIFIC]
          break
        case 'firefox':
          scenarioArgs = [...scenarioArgs, ...this.FIREFOX_SPECIFIC]
          break
        case 'webkit':
          scenarioArgs = [...scenarioArgs, ...this.WEBKIT_SPECIFIC]
          break
      }
    }

    // Remove duplicates while preserving order
    return [...new Set(scenarioArgs)]
  },
} as const

/**
 * Visual Comparison Thresholds
 * Consistent settings for screenshot and snapshot comparisons
 * Updated for Playwright 1.58+ with better defaults
 */
export const VISUAL_COMPARISON = {
  THRESHOLD: 0.15, // Slightly more lenient for stability
  MAX_DIFF_PIXELS: 50, // Reduced for better accuracy
  MAX_DIFF_PIXEL_RATIO: 0.01, // New: maximum ratio of different pixels
  ANIMATION_HANDLING: 'disabled' as const,
  CARETS: 'hide' as const, // Hide text carets in screenshots
  SCALE: 'css' as const, // Use CSS scaling for consistency
} as const

/**
 * Test Annotation Constants
 * Standardized annotations for test categorization
 */
export const TEST_ANNOTATIONS = {
  // Test types
  SMOKE: { type: 'smoke', description: 'Critical path tests' },
  REGRESSION: { type: 'regression', description: 'Regression tests' },
  INTEGRATION: { type: 'integration', description: 'Integration tests' },
  E2E: { type: 'e2e', description: 'End-to-end tests' },

  // Test priorities
  CRITICAL: { type: 'priority', description: 'Critical priority' },
  HIGH: { type: 'priority', description: 'High priority' },
  MEDIUM: { type: 'priority', description: 'Medium priority' },
  LOW: { type: 'priority', description: 'Low priority' },

  // Test environments
  VISUAL: { type: 'visual', description: 'Visual regression tests' },
  ACCESSIBILITY: { type: 'accessibility', description: 'Accessibility tests' },
  PERFORMANCE: { type: 'performance', description: 'Performance tests' },

  // Browser compatibility
  LEGACY: { type: 'compatibility', description: 'Legacy browser tests' },
  MODERN: { type: 'compatibility', description: 'Modern browser tests' },
} as const

/**
 * Test Grouping Configuration
 * Organize tests into logical groups for better execution control
 */
export const TEST_GROUPS = {
  CRITICAL: ['@critical', '@smoke'],
  FAST: ['@fast', '@smoke'],
  VISUAL: ['@visual'],
  ACCESSIBILITY: ['@accessibility'],
  PERFORMANCE: ['@performance'],
  REGRESSION: ['@regression'],
  INTEGRATION: ['@integration'],
} as const

/**
 * Default HTTP Headers for Test Identification
 */
export const TEST_HEADERS = {
  'X-Test-Session': 'playwright-e2e',
  'X-Test-Framework': 'playwright',
  'X-Test-Environment': (env: string) => env,
  'X-Test-Run-ID': process.env.GITHUB_RUN_ID || process.env.CI_RUN_ID || 'local',
} as const

/**
 * Validation Constants
 * Thresholds for configuration validation
 */
export const VALIDATION_CONSTANTS = {
  MIN_TEST_TIMEOUT_MS: 10000, // 10 seconds
  MIN_ACTION_TIMEOUT_MS: 1000, // 1 second
  MAX_CI_WORKERS: 4, // Maximum workers in CI environment
  MAX_CI_RETRIES: 3, // Maximum retries in CI
  CI_CPU_FRACTION: 0.6, // CPU fraction for CI environments
  DEV_SLOW_MO_MS: 100, // Slow motion delay for development debugging
  FAST_TIMEOUT_MS: 30000, // 30 seconds for fast execution
  FAST_ACTION_TIMEOUT_MS: 5000, // 5 seconds for fast actions
  FAST_NAVIGATION_TIMEOUT_MS: 10000, // 10 seconds for fast navigation
  DEBUG_ACTION_TIMEOUT_MS: 30000, // 30 seconds for debugging
  DEBUG_NAVIGATION_TIMEOUT_MS: 60000, // 60 seconds for debugging
  MAX_LOCAL_WORKERS: 8, // Maximum workers in local development
} as const

/**
 * Modern Web API Testing Configuration
 * Updated for React 19 and Next.js 16 features
 */
export const MODERN_WEB_API_CONFIG = {
  // React 19 specific features
  REACT_19: {
    serverComponents: true,
    automaticBatching: true,
    errorHandling: true,
    suspense: true,
  },
  // Next.js 16 specific features
  NEXT_16: {
    appRouter: true,
    serverActions: true,
    streaming: true,
    caching: true,
  },
  // Performance monitoring
  PERFORMANCE: {
    lighthouse: true,
    webVitals: true,
    coverage: true,
  },
  // Security features
  SECURITY: {
    csp: true,
    xss: true,
    headers: true,
  },
  // Accessibility
  ACCESSIBILITY: {
    wcag21: true,
    aria: true,
    keyboard: true,
  },
  // Real-time features
  REAL_TIME: {
    websockets: true,
    serverSentEvents: true,
  },
} as const;

// =============================================================================
// ENVIRONMENT-SPECIFIC SETTINGS
// =============================================================================

/**
 * Get optimized settings for specific environments
 */
export function getEnvironmentSettings(environment: ConfigEnvironment): EnvironmentSettings {
  const baseSettings: Record<ConfigEnvironment, EnvironmentSettings> = {
    development: {
      timeouts: {
        action: 10000, // Reduced for better responsiveness
        navigation: 30000, // Balanced for development
        expect: 20000, // Reasonable for assertions
        test: 90000, // 90 seconds for complex tests
        webServer: 60000, // Faster server startup
      },
      workers: {
        min: 1,
        max: Math.max(1, os.cpus().length - 1),
        cpuFraction: 0.8, // Use 80% of CPUs for better system responsiveness
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
        action: 15000, // Slightly higher for CI stability
        navigation: 45000, // More time for slower CI environments
        expect: 25000, // Higher for CI reliability
        test: 120000, // 2 minutes for complex CI scenarios
        webServer: 90000, // More time for CI server startup
      },
      workers: {
        min: 1,
        max: Math.min(
          VALIDATION_CONSTANTS.MAX_CI_WORKERS,
          Math.floor(os.cpus().length * VALIDATION_CONSTANTS.CI_CPU_FRACTION),
        ), // Limit for CI resource management
        cpuFraction: VALIDATION_CONSTANTS.CI_CPU_FRACTION, // Conservative CPU usage in CI
      },
      retries: 2, // Reduced from 3 for faster feedback
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
        enableWebServer: false, // Assume pre-started in CI
        enableSharding: true,
        enableVisualComparison: true,
      },
    },

    fast: {
      timeouts: {
        action: 3000, // Aggressive but reasonable timeouts
        navigation: 10000, // Fast navigation timeout
        expect: 3000, // Quick assertions
        test: 30000, // 30 seconds max per test
        webServer: 15000, // Fast server startup
      },
      workers: {
        min: 1,
        max: os.cpus().length, // Use all available CPUs for speed
        cpuFraction: 1.0,
      },
      retries: 0, // No retries for maximum speed
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
        enableGlobalSetup: false, // Skip for speed
        enableWebServer: true,
        enableSharding: false,
        enableVisualComparison: false, // Disable for speed
      },
    },

    isolated: {
      timeouts: {
        action: 8000, // Moderate timeouts for debugging
        navigation: 25000, // Reasonable navigation time
        expect: 12000, // Good for debugging assertions
        test: 60000, // 1 minute for debugging scenarios
        webServer: 30000, // Moderate server startup time
      },
      workers: {
        min: 1,
        max: 1, // Single worker for isolation
        cpuFraction: 1.0,
      },
      retries: 1, // Single retry for debugging
      artifacts: {
        trace: 'on', // Full tracing for debugging
        screenshot: 'on', // Screenshots for all tests
        video: 'on', // Video recording for debugging
      },
      reporting: {
        reporters: ['line', 'html', 'json'],
        outputDir: 'playwright-report-isolated',
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

/**
 * Calculate optimal worker count based on environment and CPU cores
 */
export function getOptimalWorkers(environment: ConfigEnvironment): number {
  const settings = getEnvironmentSettings(environment)
  const cpuCount = os.cpus().length || 2 // Fallback to 2 if detection fails
  const isCI = !!process.env.CI
  const isGitHubActions = !!process.env.GITHUB_ACTIONS

  // Special handling for known CI environments
  if (isGitHubActions) {
    return Math.min(2, settings.workers.max)
  }

  if (isCI) {
    return Math.min(
      settings.workers.max,
      Math.max(settings.workers.min, Math.floor(cpuCount * settings.workers.cpuFraction)),
    )
  }

  // Local development - be more conservative to avoid resource contention
  const recommendedWorkers = Math.min(
    settings.workers.max,
    Math.max(
      settings.workers.min,
      Math.min(cpuCount - 1, Math.floor(cpuCount * settings.workers.cpuFraction)),
    ),
  )

  return recommendedWorkers
}

/**
 * Get browser projects configuration based on environment
 */
export function getBrowserProjects(environment: ConfigEnvironment) {
  const scenario = environment === 'fast' ? 'fast' : environment === 'ci' ? 'ci' : 'stable'

  const baseBrowserConfig = {
    launchOptions: {
      // Browser-specific args will be added per project
      ignoreDefaultArgs: ['--enable-automation'], // Remove automation indicators
      ignoreHTTPSErrors: true,
    },
    contextOptions: {
      reducedMotion: 'reduce',
      strictSelectors: true,
      acceptDownloads: true,
      bypassCSP: environment === 'development', // Allow CSP bypass in development
      permissions: ['geolocation', 'notifications'],
    },
  }

  const baseProjects = [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...baseBrowserConfig,
        launchOptions: {
          ...baseBrowserConfig.launchOptions,
          args: BROWSER_LAUNCH_ARGS.getArgs(scenario, 'chromium'),
        },
        contextOptions: {
          ...baseBrowserConfig.contextOptions,
          // Chromium-specific settings
          colorScheme: 'light',
          viewport: { width: 1280, height: 720 },
        },
      },
    },
  ]

  // Add additional browsers for non-fast environments
  if (environment !== 'fast') {
    baseProjects.push(
      {
        name: 'firefox',
        use: {
          ...devices['Desktop Firefox'],
          ...baseBrowserConfig,
          launchOptions: {
            ...baseBrowserConfig.launchOptions,
            args: BROWSER_LAUNCH_ARGS.getArgs(scenario, 'firefox'),
          },
          contextOptions: {
            ...baseBrowserConfig.contextOptions,
            // Firefox-specific settings
            colorScheme: 'light',
            viewport: { width: 1280, height: 720 },
          },
        },
      },
      {
        name: 'webkit',
        use: {
          ...devices['Desktop Safari'],
          ...baseBrowserConfig,
          launchOptions: {
            ...baseBrowserConfig.launchOptions,
            args: BROWSER_LAUNCH_ARGS.getArgs(scenario, 'webkit'),
          },
          contextOptions: {
            ...baseBrowserConfig.contextOptions,
            // WebKit-specific settings
            colorScheme: 'light',
            viewport: { width: 1280, height: 720 },
          },
        },
      },
    )
  }

  // Add mobile projects for comprehensive testing (except fast mode)
  if (environment === 'development' || environment === 'ci' || environment === 'isolated') {
    baseProjects.push(
      {
        name: 'Mobile Chrome',
        use: {
          ...devices['Pixel 7'],
          ...baseBrowserConfig,
          launchOptions: {
            ...baseBrowserConfig.launchOptions,
            args: BROWSER_LAUNCH_ARGS.getArgs(scenario, 'chromium'),
          },
          contextOptions: {
            ...baseBrowserConfig.contextOptions,
            // Mobile-specific settings
            colorScheme: 'light',
            viewport: { width: 412, height: 915 }, // Pixel 7 viewport
          },
        },
      },
      {
        name: 'Mobile Safari',
        use: {
          ...devices['iPhone 14'],
          ...baseBrowserConfig,
          launchOptions: {
            ...baseBrowserConfig.launchOptions,
            args: BROWSER_LAUNCH_ARGS.getArgs(scenario, 'webkit'),
          },
          contextOptions: {
            ...baseBrowserConfig.contextOptions,
            // Mobile Safari-specific settings
            colorScheme: 'light',
            viewport: { width: 390, height: 844 }, // iPhone 14 viewport
          },
        },
      },
    )
  }

  return baseProjects as typeof baseProjects
}

// =============================================================================
// CONFIGURATION FACTORY
// =============================================================================

/**
 * Create a Playwright configuration for the specified environment
 *
 * @param environment - Target environment (development, ci, fast, isolated)
 * @param customOverrides - Optional custom configuration overrides
 * @returns Complete Playwright configuration
 */
export function createPlaywrightConfig(
  environment: ConfigEnvironment,
  customOverrides: Partial<PlaywrightTestConfig> = {},
): PlaywrightTestConfig {
  const settings = getEnvironmentSettings(environment)
  const workers = getOptimalWorkers(environment)
  const projects = getBrowserProjects(environment)

  const baseConfig: PlaywrightTestConfig = {
    testDir: './playwright-tests',

    // Execution settings
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: settings.retries,
    timeout: settings.timeouts.test,
    workers,

    // Global setup and teardown (properly enabled)
    ...(settings.features.enableGlobalSetup && {
      globalSetup: './playwright-tests/global-setup.ts',
      globalTeardown: './playwright-tests/global-teardown.ts',
    }),

    // Output configuration
    outputDir: `${settings.reporting.outputDir}/artifacts`,

    // Enhanced reporting
    reporter: settings.reporting.reporters.map((reporter) => {
      switch (reporter) {
        case 'html':
          return [
            'html',
            {
              open: 'never',
              outputFolder: `${settings.reporting.outputDir}/html`,
              attachmentsBaseURL: `file://${process.cwd()}/${settings.reporting.outputDir}/`,
            },
          ]
        case 'junit':
          return ['junit', { outputFile: `${settings.reporting.outputDir}/junit.xml` }]
        case 'json':
          return ['json', { outputFile: `${settings.reporting.outputDir}/results.json` }]
        default:
          return [reporter]
      }
    }),

    // Enhanced expect configuration with modern features
    expect: {
      timeout: settings.timeouts.expect,
      ...(settings.features.enableVisualComparison && {
        toHaveScreenshot: {
          threshold: VISUAL_COMPARISON.THRESHOLD,
          maxDiffPixels: VISUAL_COMPARISON.MAX_DIFF_PIXELS,
          maxDiffPixelRatio: VISUAL_COMPARISON.MAX_DIFF_PIXEL_RATIO,
          animations: VISUAL_COMPARISON.ANIMATION_HANDLING,
          caret: VISUAL_COMPARISON.CARETS,
          scale: VISUAL_COMPARISON.SCALE,
        },
        toMatchSnapshot: {
          threshold: VISUAL_COMPARISON.THRESHOLD,
          maxDiffPixelRatio: VISUAL_COMPARISON.MAX_DIFF_PIXEL_RATIO,
        },
      }),
    },

    // Use configuration with modern browser settings
    use: {
      baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001',

      // Enhanced timeouts
      actionTimeout: settings.timeouts.action,
      navigationTimeout: settings.timeouts.navigation,

      // Enhanced artifacts with better control
      trace: settings.artifacts.trace as 'on' | 'off' | 'on-first-retry' | 'retain-on-failure',
      screenshot: settings.artifacts.screenshot as 'on' | 'off' | 'only-on-failure',
      video: settings.artifacts.video as 'on' | 'off' | 'retain-on-failure',

      // Enhanced browser context
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      locale: 'en-US',
      timezoneId: 'America/New_York',

      // Enhanced context options
      bypassCSP: environment === 'development',
      acceptDownloads: true,
      hasTouch: false,
      isMobile: false,
      colorScheme: 'light',
      serviceWorkers: 'block',
      permissions: [],
      geolocation: undefined,
      extraHTTPHeaders: {
        ...TEST_HEADERS,
        "X-Test-Environment": TEST_HEADERS["X-Test-Environment"](environment),
        "X-Playwright-Config": environment,
        "X-Playwright-Version": "1.58.1",
      },

      // Enhanced browser launch options
      launchOptions: {
        slowMo: environment === 'development' ? VALIDATION_CONSTANTS.DEV_SLOW_MO_MS : 0, // Slight delay in development for debugging
        headless: environment !== 'isolated', // Headless except for isolated debugging
      },
    },

    projects: projects as PlaywrightTestConfig['projects'],

    // Web server configuration (environment-aware)
    ...(settings.features.enableWebServer &&
      !process.env.CI &&
      !process.env.PLAYWRIGHT_SKIP_WEBSERVER && {
        webServer: [
          {
            command: 'npx tsx server/node-build.ts',
            url: 'http://localhost:3000/api/health',
            reuseExistingServer: true, // Reverted to true for manual server management
            timeout: settings.timeouts.webServer,
            cwd: process.cwd(),
          },
          {
            command: 'pnpm dev',
            url: 'http://localhost:3001',
            reuseExistingServer: true, // Reverted to true for manual server management
            timeout: settings.timeouts.webServer * 2, // Double timeout for dev server startup
            cwd: process.cwd(),
          },
        ],
      }),

    // Test sharding for CI (environment-aware)
    ...(settings.features.enableSharding &&
      process.env.SHARD && {
        shard: (() => {
          const shardParts = process.env.SHARD?.split('/')
          if (shardParts && shardParts.length === 2) {
            return {
              current: parseInt(shardParts[0] || '1', 10),
              total: parseInt(shardParts[1] || '1', 10),
            }
          }
          return { current: 1, total: 1 }
        })(),
      }),

    // Enhanced snapshot handling
    updateSnapshots: process.env.UPDATE_SNAPSHOTS === 'true' ? 'all' : 'missing',

    // Metadata for debugging and reporting
    metadata: {
      environment,
      testType: 'e2e',
      framework: 'playwright',
      timestamp: new Date().toISOString(),
      commit: process.env.GITHUB_SHA || process.env.CI_COMMIT_SHA || 'local',
      branch: process.env.GITHUB_REF_NAME || process.env.CI_BRANCH || 'unknown',
      workers,
      ci: !!process.env.CI,
      ...(process.env.CI && {
        pr: process.env.GITHUB_PR_NUMBER,
        run: process.env.GITHUB_RUN_ID,
      }),
    },
  }

  // Apply custom overrides
  return { ...baseConfig, ...customOverrides }
}

/**
 * Validate configuration for common issues
 */
export function validateConfiguration(config: PlaywrightTestConfig): string[] {
  const issues: string[] = []

  // Check for reasonable timeout values
  if (config.timeout && config.timeout < VALIDATION_CONSTANTS.MIN_TEST_TIMEOUT_MS) {
    issues.push('Test timeout is very low (< 10s), may cause false failures')
  }

  if (
    config.use?.actionTimeout &&
    config.use.actionTimeout < VALIDATION_CONSTANTS.MIN_ACTION_TIMEOUT_MS
  ) {
    issues.push('Action timeout is very low (< 1s), may cause false failures')
  }

  // Check worker configuration
  if (
    config.workers &&
    typeof config.workers === 'number' &&
    config.workers > os.cpus().length * 2
  ) {
    issues.push(
      `Worker count (${config.workers}) exceeds 2x CPU cores, may cause resource contention`,
    )
  }

  // Check for missing essential configuration
  if (!config.testDir) {
    issues.push('Missing testDir configuration')
  }

  if (!config.projects || config.projects.length === 0) {
    issues.push('No browser projects configured')
  }

  return issues
}

/**
 * Export commonly used configurations
 */
export const PRESET_CONFIGS = {
  development: () => createPlaywrightConfig('development'),
  ci: () => createPlaywrightConfig('ci'),
  fast: () => createPlaywrightConfig('fast'),
  isolated: () => createPlaywrightConfig('isolated'),
} as const
