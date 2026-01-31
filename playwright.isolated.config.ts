import {
  createPlaywrightConfig,
  VALIDATION_CONSTANTS,
  validateConfiguration,
} from "./playwright.config.shared";

/**
 * Isolated Playwright Configuration
 *
 * Optimized for isolated testing scenarios with:
 * - Single worker to avoid conflicts with other test suites
 * - Comprehensive tracing and debugging
 * - Full artifact collection for detailed analysis
 * - Separate test directory for isolated test cases
 *
 * Use this configuration for:
 * - Testing specific components in isolation
 * - Debugging complex test scenarios
 * - Running tests that might conflict with main test suite
 */

// Create isolated configuration using the shared factory
const config = createPlaywrightConfig("isolated", {
  // Isolated-specific overrides
  testDir: "./isolated-tests", // Separate test directory
  fullyParallel: false, // Single worker for isolation
  workers: 1, // Explicit single worker

  // Enhanced debugging and tracing with extended timeouts for debugging
  use: {
    baseURL: "http://localhost:8081", // Match main app port
    trace: "on", // Full tracing for debugging
    screenshot: "on", // Screenshots for all tests
    video: "on", // Video recording for debugging
    actionTimeout: VALIDATION_CONSTANTS.DEBUG_ACTION_TIMEOUT_MS, // Extended timeout for debugging
    navigationTimeout: VALIDATION_CONSTANTS.DEBUG_NAVIGATION_TIMEOUT_MS, // Extended navigation timeout
  },

  // Simplified reporting for isolated testing
  reporter: [
    ["line"], // Console output
    [
      "html",
      {
        open: "never",
        outputFolder: "playwright-report-isolated/html",
      },
    ],
  ],

  // Isolated-specific metadata
  metadata: {
    environment: "isolated",
    testType: "component-isolation",
    singleWorker: true,
    enhancedTracing: true,
    timestamp: new Date().toISOString(),
  },
});

// Validate isolated configuration
const validationIssues = validateConfiguration(config);
if (validationIssues.length > 0) {
  // biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for isolated setup
  console.error("Isolated Playwright Configuration Issues:");
  validationIssues.forEach((issue) => {
    // biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for isolated setup
    console.error(`   - ${issue}`);
  });
  process.exit(1); // Fail fast for isolated config issues
}

// Isolated configuration logging
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for isolated setup
console.log("Isolated Playwright Configuration Loaded:");
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for isolated setup
console.log(`   - Test Directory: ${config.testDir}`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for isolated setup
console.log(`   - Workers: ${config.workers} (single worker for isolation)`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for isolated setup
console.log(`   - Test Timeout: ${config.timeout}ms`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for isolated setup
console.log(`   - Tracing: Full tracing enabled`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for isolated setup
console.log(`   - Artifacts: All artifacts enabled for debugging`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for isolated setup
console.log(`   - Parallel Execution: Disabled for isolation`);

export default config;
