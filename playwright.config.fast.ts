import {
  BROWSER_LAUNCH_ARGS,
  createPlaywrightConfig,
  VALIDATION_CONSTANTS,
  validateConfiguration,
} from "./playwright.config.shared";

/**
 * Fast Playwright Configuration
 *
 * Optimized for maximum execution speed with:
 * - Balanced aggressive timeouts (no more ultra-low 3s settings)
 * - Smart CPU utilization (100% for speed, but controlled)
 * - Consolidated launch arguments (no duplicates)
 * - Single browser testing for speed (Chromium only)
 * - Minimal artifacts and tracing for performance
 * - Optional retries for critical tests
 *
 * Use this configuration for:
 * - Quick feedback loops during development
 * - Smoke testing
 * - Performance testing
 */

// Create fast configuration with optimizations
const config = createPlaywrightConfig("fast", {
  // Fast-specific overrides for edge cases
  retries: process.env.FAST_WITH_RETRIES === "true" ? 1 : 0, // Allow override for critical tests

  // Disable webServer since we start it manually
  webServer: undefined,

  // Override baseURL to match actual server port
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3001",
  },

  // Custom test filtering for fast execution using new annotation system
  grep: process.env.FAST_TEST_PATTERN ? new RegExp(process.env.FAST_TEST_PATTERN) : /@fast|@smoke/, // Run only tests marked as fast or smoke

  // Single project override (ensure only Chromium) with improved launch args
  projects: [
    {
      name: "chromium-fast",
      testIgnore: /.*\.(slow|integration)\.spec\.ts$/, // Skip slow tests
      use: {
        // Use optimized fast browser args from shared config
        launchOptions: {
          args: BROWSER_LAUNCH_ARGS.getArgs("fast"),
          // Fast execution settings
          headless: true,
        },
        // Fast context settings
        contextOptions: {
          reducedMotion: "reduce",
          strictSelectors: true,
        },
        // Minimal viewport for speed
        viewport: { width: 1024, height: 768 },
        // Use fast timeouts from shared constants
        actionTimeout: VALIDATION_CONSTANTS.FAST_ACTION_TIMEOUT_MS,
        navigationTimeout: VALIDATION_CONSTANTS.FAST_NAVIGATION_TIMEOUT_MS,
      },
    },
  ],

  // Additional fast-specific metadata
  metadata: {
    environment: "fast",
    testType: "smoke",
    optimized: true,
    skipSlowTests: true,
    timestamp: new Date().toISOString(),
  },
});

// Validate and provide fast-specific warnings
const validationIssues = validateConfiguration(config);
const fastWarnings: string[] = [];

// Add fast-specific validations
// biome-ignore lint/style/noMagicNumbers: 60000ms (60s) is a clear threshold for fast execution validation
if (config.timeout && config.timeout > 60000) {
  fastWarnings.push("Test timeout > 60s may reduce fast execution benefits");
}

if (config.retries && config.retries > 1) {
  fastWarnings.push("Multiple retries may reduce speed benefits");
}

if (config.projects && config.projects.length > 1) {
  fastWarnings.push("Multiple browser projects may reduce speed benefits");
}

// Report issues and warnings
if (validationIssues.length > 0 || fastWarnings.length > 0) {
  // biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
  console.log("Fast Playwright Configuration Analysis:");

  if (validationIssues.length > 0) {
    // biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
    console.warn("   Issues:");
    validationIssues.forEach((issue) => {
      // biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
      console.warn(`   - ${issue}`);
    });
  }

  if (fastWarnings.length > 0) {
    // biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
    console.log("   Speed Optimization Notes:");
    fastWarnings.forEach((warning) => {
      // biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
      console.log(`   - ${warning}`);
    });
  }
  // biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
  console.log("");
}

// Fast configuration summary
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log("Fast Playwright Configuration:");
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Workers: ${config.workers} (max CPU utilization)`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Test Timeout: ${config.timeout}ms`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Action Timeout: ${config.use?.actionTimeout}ms`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Retries: ${config.retries}`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Browsers: ${config.projects?.length || 0} (Chromium only for speed)`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Artifacts: Disabled for maximum speed`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(
  `   - Test Filter: ${config.grep && typeof config.grep === "object" && "source" in config.grep ? config.grep.source : "All tests"}`,
);

export default config;

/**
 * Helper function to run only critical tests in fast mode
 */
export const fastCriticalConfig = createPlaywrightConfig("fast", {
  ...config,
  retries: 1, // Some retries for critical tests
  grep: /@critical|@smoke/,
});

export { config };
