import { createPlaywrightConfig, validateConfiguration } from "./playwright.config.shared";

/**
 * CI-Specific Playwright Configuration
 *
 * Optimized for Continuous Integration environments with:
 * - Dynamic worker allocation (no hardcoded limits)
 * - Environment-aware timeout scaling for CI stability
 * - Enhanced CI reporting and metadata
 * - Resource-conscious artifact management
 * - Proper CI/CD integration settings
 *
 * Use this configuration in GitHub Actions and other CI environments.
 * Set the PLAYWRIGHT_CONFIG environment variable to use this config.
 */

// Create CI configuration using the ci preset
const config = createPlaywrightConfig("ci", {
  // CI-specific overrides
  metadata: {
    // Inherit base metadata and add CI-specific info
    ci: true,
    ciProvider: process.env.GITHUB_ACTIONS
      ? "github-actions"
      : process.env.GITLAB_CI
        ? "gitlab"
        : process.env.JENKINS_URL
          ? "jenkins"
          : "unknown",
    pr: process.env.GITHUB_PR_NUMBER || process.env.CI_MERGE_REQUEST_IID,
    run: process.env.GITHUB_RUN_ID || process.env.CI_PIPELINE_ID,
    buildNumber: process.env.GITHUB_RUN_NUMBER || process.env.CI_BUILD_NUMBER,
    actor: process.env.GITHUB_ACTOR || process.env.CI_COMMIT_AUTHOR,
  },

  // Enhanced CI reporting
  reporter: [
    ["github"], // GitHub Actions annotations
    [
      "junit",
      {
        outputFile: "test-results/junit-ci.xml",
        includeProjectInTestName: true,
      },
    ],
    [
      "json",
      {
        outputFile: "test-results/results-ci.json",
      },
    ],
    [
      "html",
      {
        open: "never",
        outputFolder: "playwright-html-report-ci",
        attachmentsBaseURL:
          process.env.CI_PAGES_URL || `file://${process.cwd()}/playwright-report-ci/`,
      },
    ],
    // Add blob reporter for GitHub Actions if available
    ...(process.env.GITHUB_ACTIONS ? [["blob"]] : []),
  ],

  // Override baseURL for CI environment
  use: {
    baseURL: process.env.CI_BASE_URL || "http://localhost:8081",
  },
});

// Validate configuration specifically for CI issues
const validationIssues = validateConfiguration(config);
if (validationIssues.length > 0) {
  // biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for CI setup
  console.error("CI Playwright Configuration Issues:");
  validationIssues.forEach((issue) => {
    // biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for CI setup
    console.error(`   - ${issue}`);
  });
  process.exit(1); // Fail fast in CI
}

// CI Configuration logging
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for CI setup
console.log("CI Playwright Configuration Loaded:");
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for CI setup
console.log(`   - Workers: ${config.workers} (dynamically allocated)`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for CI setup
console.log(`   - Test Timeout: ${config.timeout}ms`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for CI setup
console.log(`   - Retries: ${config.retries}`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for CI setup
console.log(`   - Projects: ${config.projects?.length || 0} browsers`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for CI setup
console.log(`   - Artifacts: Retain on failure only`);
// biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for CI setup
console.log(`   - Reporting: GitHub Actions + JUnit + JSON + HTML`);

// Environment validation for CI
if (!process.env.CI) {
  // biome-ignore lint/suspicious/noConsole: Configuration logging is appropriate for CI setup
  console.warn("Warning: CI config loaded but CI environment variable not set");
}

export default config;

/**
 * Export configuration details for CI tooling
 */
export { config };
