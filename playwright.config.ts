import { createPlaywrightConfig, validateConfiguration } from "./playwright.config.shared";

/**
 * Optimized Playwright Configuration for Fast E2E Testing
 *
 * This configuration is optimized for speed while maintaining reliability:
 * - Single browser (Chromium) for maximum speed
 * - Reduced timeouts for faster execution
 * - Minimal artifacts and reporting
 * - No retries to avoid slowdowns
 * - Disabled visual comparison and global setup
 */

// Create optimized configuration for fast E2E testing
const config = createPlaywrightConfig("fast", {
  // Override fast config with even more aggressive optimizations
  timeout: 30000, // 30 seconds per test (down from 60s)
  retries: 0, // No retries for maximum speed

  // Disable webServer since we start it manually
  webServer: undefined, // Explicitly disable webServer

  // Override baseURL to match actual server port
  use: {
    baseURL: "http://localhost:8081",
  },
  projects: [
    {
      name: "chromium-fast",
      testIgnore: /.*\.(slow|integration)\.spec\.ts$/, // Skip slow tests
      use: {
        // Fast browser args from shared config
        launchOptions: {
          args: [
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
            "--disable-features=TranslateUI",
            "--disable-web-security",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--no-sandbox",
            "--disable-extensions",
            "--disable-default-apps",
            "--metrics-recording-only",
            "--no-first-run",
          ],
          headless: true,
        },
        // Fast context settings
        contextOptions: {
          reducedMotion: "reduce",
          strictSelectors: true,
        },
        // Minimal viewport for speed
        viewport: { width: 1024, height: 768 },
        // Aggressive timeouts
        actionTimeout: 3000, // 3 seconds
        navigationTimeout: 10000, // 10 seconds
      },
    },
  ],

  // Minimal reporting for speed
  reporter: [
    ["line"], // Only console output for speed
  ],

  // Additional metadata
  metadata: {
    environment: "fast-optimized",
    testType: "e2e",
    optimized: true,
    singleBrowser: true,
    timestamp: new Date().toISOString(),
  },
});

// Validate and provide warnings
const validationIssues = validateConfiguration(config);

if (validationIssues.length > 0) {
  // biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
  console.log("Fast E2E Configuration Issues:");
  validationIssues.forEach((issue) => {
    // biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
    console.warn(`   - ${issue}`);
  });
}

// Configuration summary
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log("🚀 Optimized Fast E2E Configuration:");
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Browser: Chromium only (fastest)`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Workers: ${config.workers} (parallel execution)`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Test Timeout: ${config.timeout}ms (30s per test)`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Action Timeout: 3s, Navigation: 10s`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Retries: ${config.retries} (no retries for speed)`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Artifacts: Disabled for maximum speed`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Visual Comparison: Disabled`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Global Setup: Disabled`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log("");

export { config, validationIssues };

export default config;
