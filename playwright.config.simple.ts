import {
  createPlaywrightConfig,
  VALIDATION_CONSTANTS,
  validateConfiguration,
} from './playwright.config.shared'

/**
 * Simple Playwright Configuration
 *
 * A simplified configuration for basic testing needs with:
 * - Standard browser coverage (Chromium, Firefox, WebKit)
 * - Balanced timeouts and retries
 * - Essential reporting and artifacts
 * - Mobile device testing
 *
 * Use this configuration for:
 * - Basic functionality testing
 * - Learning and experimentation
 * - Simple CI/CD pipelines
 */

// Configuration constants for simple setup using shared validation constants
const CI_WORKERS = 2
const DEVELOPMENT_WORKERS = 2
const CI_RETRIES = 2
const DEVELOPMENT_RETRIES = 1

// Create simple configuration using the shared factory
const config = createPlaywrightConfig('development', {
  // Simple-specific overrides for basic testing
  retries: process.env.CI ? CI_RETRIES : DEVELOPMENT_RETRIES, // Basic retry strategy
  workers: process.env.CI ? CI_WORKERS : DEVELOPMENT_WORKERS, // Limited workers for simplicity

  // Basic reporting setup
  reporter: [
    ['line'], // Console output
    [
      'html',
      {
        open: 'never',
        outputFolder: 'playwright-report/html',
        attachmentsBaseURL: `file://${process.cwd()}/playwright-report/`,
      },
    ],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  // Simple metadata
  metadata: {
    environment: process.env.NODE_ENV || 'development',
    testType: 'e2e-simple',
    framework: 'playwright',
    simplified: true,
    timestamp: new Date().toISOString(),
  },
})

// Validate simple configuration
const validationIssues = validateConfiguration(config)
if (validationIssues.length > 0) {
  // biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for simple setup
  console.warn('Simple Playwright Configuration Warnings:')
  validationIssues.forEach((issue) => {
    // biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for simple setup
    console.warn(`   - ${issue}`)
  })
}

// Simple configuration logging
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for simple setup
console.log('Simple Playwright Configuration Loaded:')
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for simple setup
console.log(`   - Workers: ${config.workers} (balanced for simplicity)`)
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for simple setup
console.log(`   - Test Timeout: ${config.timeout}ms`)
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for simple setup
console.log(`   - Retries: ${config.retries}`)
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for simple setup
console.log(`   - Browsers: Full coverage (Chromium, Firefox, WebKit, Mobile)`)
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for simple setup
console.log(`   - Reporting: Console + HTML + JSON + JUnit`)

export default config
