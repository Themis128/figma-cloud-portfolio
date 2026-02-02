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
  // CI-specific overrides with enhanced provider detection
  metadata: {
    // Inherit base metadata and add CI-specific info
    ci: true,
    ciProvider: detectCIProvider(),
    pr: process.env.GITHUB_PR_NUMBER || process.env.CI_MERGE_REQUEST_IID,
    run: process.env.GITHUB_RUN_ID || process.env.CI_PIPELINE_ID,
    buildNumber: process.env.GITHUB_RUN_NUMBER || process.env.CI_BUILD_NUMBER,
    actor: process.env.GITHUB_ACTOR || process.env.CI_COMMIT_AUTHOR,
    branch: process.env.GITHUB_REF_NAME || process.env.CI_BRANCH || "unknown",
    commit: process.env.GITHUB_SHA || process.env.CI_COMMIT_SHA || "unknown",
    repository: process.env.GITHUB_REPOSITORY || process.env.CI_PROJECT_NAME || "unknown",
  },

  // Enhanced CI reporting with better artifact handling
  reporter: [
    ["github"], // GitHub Actions annotations
    [
      "junit",
      {
        outputFile: "test-results/junit-ci.xml",
        includeProjectInTestName: true,
        suiteName: "E2E Tests",
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
        outputFolder: "playwright-html-report",
        attachmentsBaseURL: getCIArtifactsURL(),
      },
    ],
    // Add blob reporter for GitHub Actions if available
    ...(process.env.GITHUB_ACTIONS ? [["blob"] as const] : []),
  ],

  // Enhanced CI environment configuration
  use: {
    baseURL: getCIBaseURL(),
    // CI-specific browser context
    // Note: Removed extraHTTPHeaders to avoid CORS issues with external resources
  },

  // CI-specific test configuration
  grep: process.env.CI_TEST_GREP ? new RegExp(process.env.CI_TEST_GREP) : undefined, // Only filter if explicitly requested
  updateSnapshots: process.env.CI_UPDATE_SNAPSHOTS === "true" ? "all" : "none", // Never update snapshots in CI unless explicitly requested

  // Web server configuration - auto-start production server before tests
  webServer: {
    command: "node dist/server/node-build.mjs",
    port: 3002, // Using 3002 to avoid port conflicts (dev uses 3001, old prod was 3000)
    url: "http://localhost:3002/api/health",
    timeout: 180000, // 3 minutes to start in CI
    reuseExistingServer: false, // Always start fresh in CI
    stdout: "pipe",
    stderr: "pipe",
    env: {
      PORT: "3002",
      NODE_ENV: "production",
    },
  },
});

/**
 * Detect CI provider from environment variables
 */
function detectCIProvider(): string {
  if (process.env.GITHUB_ACTIONS) return "github-actions";
  if (process.env.GITLAB_CI) return "gitlab";
  if (process.env.JENKINS_URL) return "jenkins";
  if (process.env.CIRCLECI) return "circleci";
  if (process.env.TRAVIS) return "travis";
  if (process.env.BUILDKITE) return "buildkite";
  if (process.env.CI) return "generic-ci";
  return "unknown";
}

/**
 * Get CI provider-specific reporter configuration
 */
function _getCIProviderReporter() {
  const provider = detectCIProvider();

  switch (provider) {
    case "github-actions":
      return [
        [
          "github",
          {
            title: "Playwright E2E Tests",
            summary: true,
            annotations: true,
          },
        ],
      ];
    case "gitlab":
      return [
        [
          "junit",
          {
            outputFile: "test-results/gitlab-junit.xml",
            includeProjectInTestName: true,
          },
        ],
      ];
    case "jenkins":
      return [
        [
          "junit",
          {
            outputFile: "test-results/jenkins-junit.xml",
            includeProjectInTestName: true,
          },
        ],
      ];
    default:
      return [["line"]]; // Fallback to console output
  }
}

/**
 * Get appropriate base URL for CI environment
 */
function getCIBaseURL(): string {
  // Check for explicit CI base URL
  if (process.env.CI_BASE_URL) return process.env.CI_BASE_URL;

  // GitHub Pages deployment
  if (process.env.GITHUB_PAGES_URL) return process.env.GITHUB_PAGES_URL;

  // Vercel deployment
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  // Netlify deployment
  if (process.env.NETLIFY_URL) return process.env.NETLIFY_URL;

  // AWS Amplify deployment
  if (process.env.AWS_AMPLIFY_URL) return process.env.AWS_AMPLIFY_URL;

  // Local development fallback - production server runs on port 3002
  return "http://localhost:3002";
}

/**
 * Get artifacts URL for CI environment
 */
function getCIArtifactsURL(): string {
  const provider = detectCIProvider();

  switch (provider) {
    case "github-actions":
      return process.env.GITHUB_PAGES_URL
        ? `${process.env.GITHUB_PAGES_URL}/playwright-html-report/`
        : `file://${process.cwd()}/playwright-html-report/`;
    case "gitlab":
      return process.env.CI_PAGES_URL
        ? `${process.env.CI_PAGES_URL}/playwright-html-report/`
        : `file://${process.cwd()}/playwright-html-report/`;
    default:
      return `file://${process.cwd()}/playwright-html-report/`;
  }
}

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
