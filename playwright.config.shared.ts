import { devices, type PlaywrightTestConfig } from "@playwright/test";
import os from "node:os";

/**
 * Shared Playwright Configuration Factory
 *
 * This module provides a factory pattern for creating consistent, environment-aware
 * Playwright configurations that address all common issues and best practices.
 *
 * Key Features:
 * - Dynamic worker allocation based on environment and CPU cores
 * - Consistent timeout strategies with environment-based scaling
 * - Consolidated browser launch arguments (no duplicates)
 * - Proper global setup/teardown configuration
 * - Environment-aware settings with validation
 */

// =============================================================================
// CONFIGURATION TYPES AND INTERFACES
// =============================================================================

export type ConfigEnvironment = "development" | "ci" | "fast" | "isolated";

export interface EnvironmentSettings {
  timeouts: {
    action: number;
    navigation: number;
    expect: number;
    test: number;
    webServer: number;
  };
  workers: {
    min: number;
    max: number;
    cpuFraction: number;
  };
  retries: number;
  artifacts: {
    trace: string;
    screenshot: string;
    video: string;
  };
  reporting: {
    reporters: string[];
    outputDir: string;
  };
  features: {
    enableGlobalSetup: boolean;
    enableWebServer: boolean;
    enableSharding: boolean;
    enableVisualComparison: boolean;
  };
}

// =============================================================================
// SHARED CONSTANTS AND UTILITIES
// =============================================================================

/**
 * Consolidated Browser Launch Arguments
 * Removes duplicates and provides optimized settings for different scenarios
 */
export const BROWSER_LAUNCH_ARGS = {
  // Performance optimization arguments
  PERFORMANCE: [
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "--disable-features=TranslateUI",
    "--disable-ipc-flooding-protection",
    "--disable-component-extensions-with-background-pages",
    "--disable-default-apps",
    "--metrics-recording-only",
    "--no-first-run",
    "--enable-features=NetworkService,NetworkServiceInProcess",
  ],

  // Security and isolation arguments
  SECURITY: [
    "--disable-web-security",
    "--disable-features=VizDisplayCompositor",
    "--no-sandbox",
    "--disable-setuid-sandbox",
  ],

  // Resource optimization arguments
  RESOURCES: [
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--disable-software-rasterizer",
    "--disable-background-networking",
    "--disable-extensions",
  ],

  // Get all arguments for a specific scenario
  getArgs(scenario: "fast" | "stable" | "ci"): string[] {
    const base = [...this.PERFORMANCE, ...this.SECURITY];

    switch (scenario) {
      case "fast":
        return [...base, ...this.RESOURCES];
      case "ci":
        return [...base, ...this.RESOURCES];
      case "stable":
        return base;
      default:
        return base;
    }
  },
} as const;

/**
 * Visual Comparison Thresholds
 * Consistent settings for screenshot and snapshot comparisons
 */
export const VISUAL_COMPARISON = {
  THRESHOLD: 0.2,
  MAX_DIFF_PIXELS: 100,
  ANIMATION_HANDLING: "disabled" as const,
} as const;

/**
 * Default HTTP Headers for Test Identification
 */
export const TEST_HEADERS = {
  "X-Test-Session": "playwright-e2e",
  "X-Test-Framework": "playwright",
  "X-Test-Environment": (env: string) => env,
  "X-Test-Run-ID": process.env.GITHUB_RUN_ID || process.env.CI_RUN_ID || "local",
} as const;

/**
 * Validation Constants
 * Thresholds for configuration validation
 */
export const VALIDATION_CONSTANTS = {
  MIN_TEST_TIMEOUT_MS: 10000, // 10 seconds
  MIN_ACTION_TIMEOUT_MS: 1000, // 1 second
} as const;

// =============================================================================
// ENVIRONMENT-SPECIFIC SETTINGS
// =============================================================================

/**
 * Get optimized settings for specific environments
 */
export function getEnvironmentSettings(environment: ConfigEnvironment): EnvironmentSettings {
  const baseSettings: Record<ConfigEnvironment, EnvironmentSettings> = {
    development: {
      timeouts: {
        action: 15000,
        navigation: 45000,
        expect: 30000,
        test: 120000,
        webServer: 120000,
      },
      workers: {
        min: 1,
        max: Math.max(1, os.cpus().length - 1),
        cpuFraction: 0.75,
      },
      retries: 1,
      artifacts: {
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
      },
      reporting: {
        reporters: ["line", "html"],
        outputDir: "playwright-report",
      },
      features: {
        enableGlobalSetup: true,
        enableWebServer: true,
        enableSharding: false,
        enableVisualComparison: true,
      },
    },

    ci: {
      timeouts: {
        action: 20000, // Slightly higher for CI stability
        navigation: 60000, // More time for slower CI environments
        expect: 30000,
        test: 180000, // 3 minutes for complex CI scenarios
        webServer: 120000,
      },
      workers: {
        min: 1,
        max: 4, // Limit for CI resource management
        cpuFraction: 0.5,
      },
      retries: 3,
      artifacts: {
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
      },
      reporting: {
        reporters: ["github", "junit", "json", "html"],
        outputDir: "playwright-report-ci",
      },
      features: {
        enableGlobalSetup: true,
        enableWebServer: false, // Assume pre-started in CI
        enableSharding: true,
        enableVisualComparison: true,
      },
    },

    fast: {
      timeouts: {
        action: 5000, // Balanced fast timeouts
        navigation: 15000,
        expect: 5000,
        test: 60000,
        webServer: 30000,
      },
      workers: {
        min: 1,
        max: os.cpus().length,
        cpuFraction: 1.0, // Use all available CPUs for speed
      },
      retries: 0, // No retries for maximum speed
      artifacts: {
        trace: "off",
        screenshot: "off",
        video: "off",
      },
      reporting: {
        reporters: ["line"],
        outputDir: "playwright-report-fast",
      },
      features: {
        enableGlobalSetup: false, // Skip for speed
        enableWebServer: true,
        enableSharding: false,
        enableVisualComparison: false, // Disable for speed
      },
    },

    isolated: {
      timeouts: {
        action: 10000,
        navigation: 30000,
        expect: 15000,
        test: 90000,
        webServer: 60000,
      },
      workers: {
        min: 1,
        max: 1, // Single worker for isolation
        cpuFraction: 1.0,
      },
      retries: 2,
      artifacts: {
        trace: "on",
        screenshot: "on",
        video: "on",
      },
      reporting: {
        reporters: ["line", "html"],
        outputDir: "playwright-report-isolated",
      },
      features: {
        enableGlobalSetup: true,
        enableWebServer: true,
        enableSharding: false,
        enableVisualComparison: true,
      },
    },
  };

  return baseSettings[environment];
}

/**
 * Calculate optimal worker count based on environment and CPU cores
 */
export function getOptimalWorkers(environment: ConfigEnvironment): number {
  const settings = getEnvironmentSettings(environment);
  const cpuCount = os.cpus().length || 2; // Fallback to 2 if detection fails
  const isCI = !!process.env.CI;
  const isGitHubActions = !!process.env.GITHUB_ACTIONS;

  // Special handling for known CI environments
  if (isGitHubActions) {
    return Math.min(2, settings.workers.max);
  }

  if (isCI) {
    return Math.min(
      settings.workers.max,
      Math.max(settings.workers.min, Math.floor(cpuCount * settings.workers.cpuFraction)),
    );
  }

  // Local development
  return Math.min(
    settings.workers.max,
    Math.max(settings.workers.min, Math.floor(cpuCount * settings.workers.cpuFraction)),
  );
}

/**
 * Get browser projects configuration based on environment
 */
export function getBrowserProjects(environment: ConfigEnvironment) {
  const launchArgs = BROWSER_LAUNCH_ARGS.getArgs(environment === "fast" ? "fast" : "stable");

  const baseProjects = [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: launchArgs,
        },
        contextOptions: {
          reducedMotion: "reduce",
          strictSelectors: true,
        },
      },
    },
  ];

  // Add additional browsers for non-fast environments
  if (environment !== "fast") {
    baseProjects.push(
      {
        name: "firefox",
        use: {
          ...devices["Desktop Firefox"],
          launchOptions: {
            args: launchArgs.filter((arg) => !arg.includes("disable-features")), // Firefox-specific filtering
          },
          contextOptions: {
            reducedMotion: "reduce",
            strictSelectors: true,
          },
        },
      },
      {
        name: "webkit",
        use: {
          ...devices["Desktop Safari"],
          launchOptions: {
            args: launchArgs.filter((arg) => !arg.includes("sandbox")), // WebKit-specific filtering
          },
          contextOptions: {
            reducedMotion: "reduce",
            strictSelectors: true,
          },
        },
      },
    );
  }

  // Add mobile projects for comprehensive testing (except fast mode)
  if (environment === "development" || environment === "ci") {
    baseProjects.push(
      {
        name: "Mobile Chrome",
        use: {
          ...devices["Pixel 5"],
          launchOptions: {
            args: launchArgs,
          },
          contextOptions: {
            reducedMotion: "reduce",
            strictSelectors: true,
          },
        },
      },
      {
        name: "Mobile Safari",
        use: {
          ...devices["iPhone 12"],
          launchOptions: {
            args: launchArgs.filter((arg) => !arg.includes("sandbox")), // WebKit-specific filtering
          },
          contextOptions: {
            reducedMotion: "reduce",
            strictSelectors: true,
          },
        },
      },
    );
  }

  return baseProjects as typeof baseProjects;
}

// =============================================================================
// CONFIGURATION FACTORY
// =============================================================================

/**
 * Create a Playwright configuration for the specified environment
 *
 * @param environment - Target environment (development, ci, fast, isolated)
 * @param customOverrides - Optional custom configuration overrides
 * @returns Complete Playwright configuration
 */
export function createPlaywrightConfig(
  environment: ConfigEnvironment,
  customOverrides: Partial<PlaywrightTestConfig> = {},
): PlaywrightTestConfig {
  const settings = getEnvironmentSettings(environment);
  const workers = getOptimalWorkers(environment);
  const projects = getBrowserProjects(environment);

  const baseConfig: PlaywrightTestConfig = {
    testDir: "./playwright-tests",

    // Execution settings
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: settings.retries,
    timeout: settings.timeouts.test,
    workers,

    // Global setup and teardown (properly enabled)
    ...(settings.features.enableGlobalSetup && {
      globalSetup: "./playwright-tests/global-setup.ts",
      globalTeardown: "./playwright-tests/global-teardown.ts",
    }),

    // Output configuration
    outputDir: `${settings.reporting.outputDir}/artifacts`,

    // Enhanced reporting
    reporter: settings.reporting.reporters.map((reporter) => {
      switch (reporter) {
        case "html":
          return [
            "html",
            {
              open: "never",
              outputFolder: `${settings.reporting.outputDir}/html`,
              attachmentsBaseURL: `file://${process.cwd()}/${settings.reporting.outputDir}/`,
            },
          ];
        case "junit":
          return ["junit", { outputFile: `${settings.reporting.outputDir}/junit.xml` }];
        case "json":
          return ["json", { outputFile: `${settings.reporting.outputDir}/results.json` }];
        default:
          return [reporter];
      }
    }),

    // Expect configuration
    expect: {
      timeout: settings.timeouts.expect,
      ...(settings.features.enableVisualComparison && {
        toHaveScreenshot: {
          threshold: VISUAL_COMPARISON.THRESHOLD,
          maxDiffPixels: VISUAL_COMPARISON.MAX_DIFF_PIXELS,
          animations: VISUAL_COMPARISON.ANIMATION_HANDLING,
        },
        toMatchSnapshot: {
          threshold: VISUAL_COMPARISON.THRESHOLD,
        },
      }),
    },

    // Use configuration
    use: {
      baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8082",

      // Timeouts
      actionTimeout: settings.timeouts.action,
      navigationTimeout: settings.timeouts.navigation,

      // Artifacts
      trace: settings.artifacts.trace as "on" | "off" | "on-first-retry" | "retain-on-failure",
      screenshot: settings.artifacts.screenshot as "on" | "off" | "only-on-failure",
      video: settings.artifacts.video as "on" | "off" | "retain-on-failure",

      // Browser context
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      locale: "en-US",
      timezoneId: "America/New_York",

      // Headers for test identification
      extraHTTPHeaders: {
        ...TEST_HEADERS,
        "X-Test-Environment": TEST_HEADERS["X-Test-Environment"](environment),
      },

      // Context options
      permissions: [],
      geolocation: undefined,
      colorScheme: "light",
      serviceWorkers: "block",
      offline: false,
    },

    projects: projects as PlaywrightTestConfig["projects"],

    // Web server configuration (environment-aware)
    ...(settings.features.enableWebServer &&
      !process.env.CI && {
      webServer: [
        {
          command: "npx tsx server/node-build.ts",
          url: "http://localhost:3000/api/health",
          reuseExistingServer: true,
          timeout: settings.timeouts.webServer,
          cwd: process.cwd(),
        },
        {
          command: "pnpm dev",
          url: "http://localhost:8082",
          reuseExistingServer: true,
          timeout: settings.timeouts.webServer,
          cwd: process.cwd(),
        },
      ],
    }),

    // Test sharding for CI (environment-aware)
    ...(settings.features.enableSharding &&
      process.env.SHARD && {
      shard: {
        current: parseInt(process.env.SHARD.split("/")[0], 10),
        total: parseInt(process.env.SHARD.split("/")[1], 10),
      },
    }),

    // Test filtering
    grep: process.env.TEST_GREP ? new RegExp(process.env.TEST_GREP) : undefined,
    grepInvert: process.env.TEST_GREP_INVERT ? new RegExp(process.env.TEST_GREP_INVERT) : undefined,

    // Snapshot handling
    updateSnapshots: process.env.UPDATE_SNAPSHOTS === "true" ? "all" : "missing",

    // Metadata for debugging and reporting
    metadata: {
      environment,
      testType: "e2e",
      framework: "playwright",
      timestamp: new Date().toISOString(),
      commit: process.env.GITHUB_SHA || process.env.CI_COMMIT_SHA || "local",
      branch: process.env.GITHUB_REF_NAME || process.env.CI_BRANCH || "unknown",
      workers,
      ci: !!process.env.CI,
      ...(process.env.CI && {
        pr: process.env.GITHUB_PR_NUMBER,
        run: process.env.GITHUB_RUN_ID,
      }),
    },
  };

  // Apply custom overrides
  return { ...baseConfig, ...customOverrides };
}

/**
 * Validate configuration for common issues
 */
export function validateConfiguration(config: PlaywrightTestConfig): string[] {
  const issues: string[] = [];

  // Check for reasonable timeout values
  if (config.timeout && config.timeout < VALIDATION_CONSTANTS.MIN_TEST_TIMEOUT_MS) {
    issues.push("Test timeout is very low (< 10s), may cause false failures");
  }

  if (
    config.use?.actionTimeout &&
    config.use.actionTimeout < VALIDATION_CONSTANTS.MIN_ACTION_TIMEOUT_MS
  ) {
    issues.push("Action timeout is very low (< 1s), may cause false failures");
  }

  // Check worker configuration
  if (
    config.workers &&
    typeof config.workers === "number" &&
    config.workers > os.cpus().length * 2
  ) {
    issues.push(
      `Worker count (${config.workers}) exceeds 2x CPU cores, may cause resource contention`,
    );
  }

  // Check for missing essential configuration
  if (!config.testDir) {
    issues.push("Missing testDir configuration");
  }

  if (!config.projects || config.projects.length === 0) {
    issues.push("No browser projects configured");
  }

  return issues;
}

/**
 * Export commonly used configurations
 */
export const PRESET_CONFIGS = {
  development: () => createPlaywrightConfig("development"),
  ci: () => createPlaywrightConfig("ci"),
  fast: () => createPlaywrightConfig("fast"),
  isolated: () => createPlaywrightConfig("isolated"),
} as const;
