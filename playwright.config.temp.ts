// @ts-check
/// <reference types="node" />

import {
  createPlaywrightConfig,
  VALIDATION_CONSTANTS,
  validateConfiguration,
} from "./playwright.config.shared";

/**
 * Temporary/Experimental Playwright Configuration
 *
 * A temporary configuration for experimental testing with:
 * - Flexible settings for testing new approaches
 * - Enhanced debugging capabilities
 * - Customizable timeouts and retries
 * - Experimental features enabled
 *
 * ⚠️  WARNING: This is a temporary configuration for experimentation
 * Use only for testing new approaches, not for production CI/CD
 */

// Configuration constants for experimental setup using shared validation constants
const EXPERIMENTAL_RETRIES_CI = VALIDATION_CONSTANTS.MAX_CI_RETRIES;
const EXPERIMENTAL_RETRIES_LOCAL = 2;
const EXPERIMENTAL_WORKERS_CI = 1;
const EXPERIMENTAL_WORKERS_LOCAL = VALIDATION_CONSTANTS.MAX_LOCAL_WORKERS;

// Create temporary configuration using the shared factory
const config = createPlaywrightConfig("development", {
  // Experimental overrides for testing new approaches
  retries: process.env.CI ? EXPERIMENTAL_RETRIES_CI : EXPERIMENTAL_RETRIES_LOCAL, // Higher retries for experimentation
  workers: process.env.CI ? EXPERIMENTAL_WORKERS_CI : EXPERIMENTAL_WORKERS_LOCAL, // Flexible worker count

  // Enhanced debugging for experimental testing
  use: {
    trace: "on", // Full tracing for debugging experiments
    screenshot: "on", // Screenshots for all tests
    video: "on", // Video recording for analysis
  },

  // Experimental reporting setup
  reporter: [
    ["line"], // Console output
    [
      "html",
      {
        open: "never",
        outputFolder: "playwright-report-temp/html",
        attachmentsBaseURL: `file://${process.cwd()}/playwright-report-temp/`,
      },
    ],
    ["json", { outputFile: "test-results/results-temp.json" }],
    ["junit", { outputFile: "test-results/junit-temp.xml" }],
  ],

  // Experimental metadata
  metadata: {
    environment: process.env.NODE_ENV || "experimental",
    testType: "e2e-experimental",
    framework: "playwright",
    temporary: true,
    experimental: true,
    warning: "Temporary configuration - use with caution",
    timestamp: new Date().toISOString(),
  },
});

// Validate temporary configuration
const validationIssues = validateConfiguration(config);
if (validationIssues.length > 0) {
  // biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for experimental setup
  console.warn("⚠️  Temporary Playwright Configuration Warnings:");
  validationIssues.forEach((issue) => {
    // biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for experimental setup
    console.warn(`   - ${issue}`);
  });
}

// Temporary configuration logging
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for experimental setup
console.log("⚠️ Temporary/Experimental Playwright Configuration Loaded:");
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for experimental setup
console.log(`   - Workers: ${config.workers} (flexible for experimentation)`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for experimental setup
console.log(`   - Test Timeout: ${config.timeout}ms`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for experimental setup
console.log(`   - Retries: ${config.retries} (higher for experimental testing)`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for experimental setup
console.log(`   - Tracing: Full tracing enabled for debugging`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for experimental setup
console.log(`   - Artifacts: All artifacts enabled for analysis`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for experimental setup
console.log(`   ⚠️  WARNING: This is a temporary configuration for experimentation only`);

export default config;
