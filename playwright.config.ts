import { createPlaywrightConfig, validateConfiguration } from "./playwright.config.shared";

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

// Create development configuration with full features
const config = createPlaywrightConfig("development", {
  // Development-specific overrides for comprehensive testing
  retries: 1, // Single retry for development stability

  // Enhanced reporting for development
  reporter: [
    ["line"], // Console output
    ["html", {
      open: "never",
      outputFolder: "playwright-report/html",
      attachmentsBaseURL: `file://${process.cwd()}/playwright-report/`,
    }],
  ],

  // Additional metadata for development tracking
  metadata: {
    environment: "development",
    testType: "comprehensive",
    fullBrowserCoverage: true,
    mobileTesting: true,
    timestamp: new Date().toISOString(),
  },
});

// Validate and provide warnings
const validationIssues = validateConfiguration(config);

if (validationIssues.length > 0) {
  // biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
  console.log("Development Configuration Issues:");
  validationIssues.forEach((issue) => {
    // biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
    console.warn(`   - ${issue}`);
  });
}

// Configuration summary
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log("🚀 Development Configuration:");
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Browser: Full coverage (Chromium, Firefox, WebKit)`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Workers: ${config.workers} (parallel execution)`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Test Timeout: ${config.timeout}ms (120s per test)`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Action Timeout: 15s, Navigation: 45s`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Retries: ${config.retries} (single retry for stability)`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Artifacts: On first retry, screenshots/videos on failure`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Web Server: Auto-starts both frontend (8081) and backend (3000)`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log(`   - Mobile Testing: Enabled for comprehensive coverage`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for setup feedback
console.log("");

export { config, validationIssues };

export default config;
