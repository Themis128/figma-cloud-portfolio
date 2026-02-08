import { createPlaywrightConfig, validateConfiguration } from './playwright.config.shared'

/**
 * Main Playwright Configuration for Development
 *
 * This configuration is optimized for development with:
 * - Full browser coverage (Chromium, Firefox, WebKit)
 * - Mobile device testing
 * - Comprehensive reporting and debugging
 * - Web server auto-start for both frontend and backend
 * - Balanced timeouts for development workflow
 *
 * Use this configuration for:
 * - Local development testing
 * - Feature development and validation
 * - Comprehensive test coverage
 */

// Create development configuration with continuous testing optimizations
const config = createPlaywrightConfig('development', {
  // Optimized for single test execution
  retries: 2, // Balanced retries
  timeout: 60000, // 1 minute per test
  workers: 1, // Single worker for isolated test

  // Enhanced reporting for continuous monitoring
  reporter: [
    ['line'], // Real-time console output
    [
      'html',
      {
        open: 'never',
        outputFolder: 'playwright-report/html',
        attachmentsBaseURL: `file://${process.cwd()}/playwright-report/`,
      },
    ],
    [
      'json',
      {
        outputFile: 'playwright-report/results.json',
      },
    ],
  ],

  // Optimized expect configuration
  expect: {
    timeout: 15000, // Balanced expect timeout
  },

  // Additional metadata for continuous testing tracking
  metadata: {
    environment: 'development',
    testType: 'continuous',
    fullBrowserCoverage: true,
    mobileTesting: true,
    continuousMode: true,
    autoFixEnabled: true,
    timestamp: new Date().toISOString(),
  },

  // Optimized use configuration
  use: {
    baseURL: 'http://localhost:8081',
    actionTimeout: 10000, // Standard action timeout
    navigationTimeout: 30000, // Standard navigation timeout
    launchOptions: {
      slowMo: 0, // No delay for faster execution
    },
  },
})

// Validate and provide warnings
const validationIssues = validateConfiguration(config)

if (validationIssues.length > 0) {
  // biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
  console.log('Development Configuration Issues:')
  validationIssues.forEach((issue) => {
    // biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
    console.warn(`   - ${issue}`)
  })
}

// Configuration summary
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log('🚀 Development Configuration:')
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Browser: Full coverage (Chromium, Firefox, WebKit)`)
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Workers: ${config.workers} (parallel execution)`)
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Test Timeout: ${config.timeout}ms (120s per test)`)
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Action Timeout: 15s, Navigation: 45s`)
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Retries: ${config.retries} (single retry for stability)`)
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Artifacts: On first retry, screenshots/videos on failure`)
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Web Server: Auto-starts both frontend (8081) and backend (3002)`)
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Mobile Testing: Enabled for comprehensive coverage`)
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log('')

export { config, validationIssues }

export default config
