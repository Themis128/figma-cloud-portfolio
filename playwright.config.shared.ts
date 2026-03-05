import { type Config, type Project, type FullProject } from "@playwright/test";
import { devices } from "@playwright/test";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { cpus } from "os";

/**
 * Playwright Configuration Factory
 *
 * This file implements a factory pattern for creating consistent, maintainable
 * Playwright configurations across different environments (development, CI, fast, isolated).
 *
 * @see https://playwright.dev/docs/test-configuration
 */

// Get the directory of the current file
const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Environment-specific settings
interface EnvironmentConfig {
  timeouts: Record<string, number>;
  workers: { default: number; max: number };
  browsers: string[];
  retries?: number;
  trace?: string;
  video?: string;
  screenshot?: string;
  webServer?: {
    command: string;
    url: string;
    reuseExistingServer: boolean;
    timeout: number;
  };
}

interface TestOptions {
  testDir?: string;
  timeout?: number;
  workers?: number;
  retries?: number;
  trace?: string;
  video?: string;
  screenshot?: string;
  use?: any;
  projects?: any[];
  webServer?: any;
  globalSetup?: string;
  globalTeardown?: string;
  testTimeout?: number;
  reporter?: any[];
  forbidOnly?: boolean;
  fullyParallel?: boolean;
}

const environmentSettings: Record<string, EnvironmentConfig> = {
  development: {
    timeouts: {
      action: 15000,
      navigation: 45000,
      expect: 30000,
      test: 120000,
      webServer: 120000,
    },
    workers: {
      default: Math.max(1, Math.floor(cpus().length * 0.75)),
      max: 4,
    },
    browsers: ["chromium", "firefox", "webkit"],
    retries: 2,
    trace: "on-first-retry",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  ci: {
    timeouts: {
      action: 10000,
      navigation: 30000,
      expect: 20000,
      test: 60000,
      webServer: 60000,
    },
    workers: {
      default: Math.min(4, Math.max(1, Math.floor(cpus().length * 0.5))),
      max: 4,
    },
    browsers: ["chromium", "firefox"],
    retries: 2,
    trace: "on",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  fast: {
    timeouts: {
      action: 5000,
      navigation: 15000,
      expect: 10000,
      test: 30000,
      webServer: 30000,
    },
    workers: {
      default: Math.max(1, Math.floor(cpus().length * 1.0)),
      max: 8,
    },
    browsers: ["chromium"],
    retries: 0,
    trace: "off",
    video: "off",
    screenshot: "off",
  },
  isolated: {
    timeouts: {
      action: 30000,
      navigation: 60000,
      expect: 45000,
      test: 300000,
      webServer: 300000,
    },
    workers: {
      default: 1,
      max: 1,
    },
    browsers: ["chromium", "firefox", "webkit"],
    retries: 3,
    trace: "on",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
};

// Browser launch arguments
const BROWSER_LAUNCH_ARGS = {
  chromium: [
    "--disable-dev-shm-usage",
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-accelerated-2d-canvas",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-default-apps",
    "--disable-popup-blocking",
    "--disable-translate",
    "--disable-extensions",
    "--disable-background-networking",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-breakpad",
    "--disable-client-side-phishing-detection",
    "--disable-features=Translate",
    "--disable-ipc-flooding-protection",
    "--disable-renderer-backgrounding",
    "--enable-features=NetworkService,NetworkServiceInProcess",
    "--force-color-profile=srgb",
    "--metrics-recording-only",
    "--mute-audio",
    "--no-default-browser-check",
    "--no-first-run",
    "--password-store=basic",
    "--use-gl=swiftshader",
    "--use-mock-keychain",
    "--disable-web-security",
    "--allow-running-insecure-content",
    "--ignore-certificate-errors",
    "--allow-file-access-from-files",
  ],
  firefox: [
    "--width=1920",
    "--height=1080",
    "--headless",
    "--disable-web-security",
    "--allow-running-insecure-content",
    "--ignore-certificate-errors",
  ],
  webkit: [
    "--disable-web-security",
    "--allow-running-insecure-content",
    "--ignore-certificate-errors",
  ],
};

// Next.js 15 specific configurations
const NEXTJS_15_CONFIG = {
  timeouts: {
    action: 15000,
    navigation: 45000,
    expect: 30000,
    test: 120000,
    webServer: 120000,
  },
  workers: {
    default: Math.max(1, Math.floor(cpus().length * 0.75)),
    max: 4,
  },
  browsers: ["chromium", "firefox", "webkit"],
  retries: 2,
  trace: "on-first-retry",
  video: "retain-on-failure",
  screenshot: "only-on-failure",
};

// Test file patterns
const TEST_FILE_PATTERNS = {
  all: "**/*.spec.ts",
  unit: "**/*.unit.spec.ts",
  integration: "**/*.integration.spec.ts",
  e2e: "**/*.e2e.spec.ts",
  accessibility: "**/*.accessibility.spec.ts",
  performance: "**/*.performance.spec.ts",
  visual: "**/*.visual.spec.ts",
  api: "**/*.api.spec.ts",
};

// Helper functions
function getOptimalWorkers(environment: string): number {
  const cpuCount = cpus().length;
  const settings = environmentSettings[environment];

  if (!settings) {
    throw new Error(`Unknown environment: ${environment}`);
  }

  const { default: defaultWorkers, max } = settings.workers;
  return Math.min(max, Math.max(1, defaultWorkers));
}

function getBrowserArgs(browser: string, environment: string): string[] {
  const baseArgs =
    BROWSER_LAUNCH_ARGS[browser as keyof typeof BROWSER_LAUNCH_ARGS] || [];
  const settings = environmentSettings[environment];

  if (!settings) {
    throw new Error(`Unknown environment: ${environment}`);
  }

  // Add environment-specific arguments
  if (environment === "ci") {
    return [...baseArgs, "--disable-gpu", "--disable-software-rasterizer"];
  }

  if (environment === "fast") {
    return [...baseArgs, "--disable-background-timer-throttling"];
  }

  return baseArgs;
}

function getTimeoutSettings(environment: string): Record<string, number> {
  const settings = environmentSettings[environment];

  if (!settings) {
    throw new Error(`Unknown environment: ${environment}`);
  }

  return settings.timeouts;
}

function getBrowserProjects(environment: string): Project[] {
  const settings = environmentSettings[environment];

  if (!settings) {
    throw new Error(`Unknown environment: ${environment}`);
  }

  const browserNames = settings.browsers;
  const projects: Project[] = [];

  for (const browserName of browserNames) {
    // Create browser-specific projects without using devices
    projects.push({
      name: browserName,
      use: {
        launchOptions: {
          args: getBrowserArgs(browserName, environment),
        },
        // Add environment-specific viewport if needed
        viewport: {
          width: 1920,
          height: 1080,
        },
      },
    });
  }

  return projects;
}

// Main configuration factory
export function createPlaywrightConfig(
  environment: string,
  overrides: Partial<TestOptions> = {},
): Config {
  const timeouts = getTimeoutSettings(environment);
  const workers = getOptimalWorkers(environment);
  const projects = getBrowserProjects(environment);

  const baseConfig: Config = {
    testDir: join(__dirname, "playwright-tests"),
    testMatch: Object.values(TEST_FILE_PATTERNS) as string[],
    timeout: timeouts.test,
    workers: workers as number,
    fullyParallel: true,
    forbidOnly: environment === "ci",
    retries: environmentSettings[environment]?.retries ?? 0,
    reporter: [
      ["html"],
      ["json", { outputFile: "playwright-report/results.json" }],
      ["junit", { outputFile: "playwright-report/results.xml" }],
      ["list"],
    ],
    use: {
      baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8082", // Updated for current app architecture
      trace: environmentSettings[environment]?.trace ?? "off",
      video: environmentSettings[environment]?.video ?? "off",
      screenshot: environmentSettings[environment]?.screenshot ?? "off",
      actionTimeout: timeouts.action,
      navigationTimeout: timeouts.navigation,
      expectTimeout: timeouts.expect,
      // Add custom matchers and expect extensions
      expect: {
        // timeout: 5000,
      },
    },
    projects,
    webServer: (() => {
      // Check if we should skip web server startup
      const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER === "true";
      const hasWebServer = process.env.PLAYWRIGHT_HAS_WEBSERVER === "true";
      
      if (skipWebServer || hasWebServer) {
        return undefined; // No web server needed
      }

      return {
        command: "pnpm dev",
        url: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8082", // Updated for current app architecture
        reuseExistingServer: !!(
          environment === "development" || environment === "isolated"
        ),
        timeout: timeouts.webServer,
      };
    })(),
    globalSetup: join(__dirname, "playwright-tests/global-setup.ts"),
    globalTeardown: join(__dirname, "playwright-tests/global-teardown.ts"),
  };

  // Apply overrides
  return { ...baseConfig, ...overrides };
}

// Configuration validation
export function validateConfiguration(config: Config): {
  score: number;
  grade: string;
  issues: Array<{ severity: string; message: string; recommendation: string }>;
} {
  const issues: Array<{
    severity: string;
    message: string;
    recommendation: string;
  }> = [];
  let score = 10;

  // Check for required properties
  if (!config.testDir) {
    issues.push({
      severity: "critical",
      message: "testDir is not configured",
      recommendation: "Set testDir to the directory containing your test files",
    });
    score -= 3;
  }

  if (!config.projects || config.projects.length === 0) {
    issues.push({
      severity: "critical",
      message: "No browser projects configured",
      recommendation: "Add at least one browser project to the configuration",
    });
    score -= 3;
  }

  // Check timeout settings
  if (config.timeout && config.timeout < 5000) {
    issues.push({
      severity: "warning",
      message: "Test timeout is very low",
      recommendation:
        "Increase timeout to at least 5000ms for better stability",
    });
    score -= 1;
  }

  // Check worker settings
  if (config.workers && config.workers <= 0) {
    issues.push({
      severity: "warning",
      message: "Worker count is zero or negative",
      recommendation: "Set workers to a positive number based on CPU cores",
    });
    score -= 1;
  }

  // Check for common issues
  if (config.use?.baseURL?.includes("localhost") && process.env.CI) {
    issues.push({
      severity: "warning",
      message: "Using localhost in CI environment",
      recommendation: "Configure a proper base URL for CI",
    });
    score -= 1;
  }

  // Calculate grade
  const grade =
    score === 10
      ? "A+"
      : score >= 8
        ? "A"
        : score >= 6
          ? "B"
          : score >= 4
            ? "C"
            : score >= 2
              ? "D"
              : "F";

  return {
    score,
    grade,
    issues,
  };
}

// Health check
export function healthCheckConfig(config: Config): {
  score: number;
  grade: string;
  issues: Array<{ severity: string; message: string; recommendation: string }>;
  recommendations: string[];
} {
  const validation = validateConfiguration(config);
  const recommendations: string[] = [];

  // Add additional health checks
  if (validation.score < 10) {
    recommendations.push(
      "Consider addressing the configuration issues to improve test reliability",
    );
  }

  if (config.workers && config.workers > 4 && process.env.CI) {
    recommendations.push(
      "High worker count in CI may cause resource contention",
    );
  }

  if (config.retries && config.retries > 2) {
    recommendations.push("High retry count may indicate unstable tests");
  }

  return {
    ...validation,
    recommendations,
  };
}

// Test file patterns
export const TEST_PATTERNS = TEST_FILE_PATTERNS;

// Export for external use
export { devices };
