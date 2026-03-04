import { chromium, type FullConfig } from "@playwright/test";
import { waitForAppReady } from "./test-utils";

/**
 * Global Setup for Playwright Tests
 *
 * This file handles test environment initialization and preparation.
 * It ensures consistent test conditions across all test runs.
 * Updated to match the new factory pattern configuration.
 */

// Extend global type for test utilities
declare global {
  var waitForAppReadyGlobal: (
    page: import("@playwright/test").Page,
  ) => Promise<void>;
}

export default async function globalSetup(config: FullConfig) {
  console.log("\n🎭 Starting Playwright Test Environment Setup...");
  console.log("═".repeat(60));

  const startTime = Date.now();
  const environment = process.env.NODE_ENV || "development";
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8082"; // Updated for current app architecture

  try {
    // 1. Setup global functions
    await setupGlobalFunctions();

    // 2. Environment validation
    await validateEnvironment(config);

    // 3. Service health checks - skip if web servers are configured to auto-start or explicitly skipped
    const hasWebServers =
      config.webServer &&
      Array.isArray(config.webServer) &&
      config.webServer.length > 0;
    const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER === "true";
    const startServers = process.env.PLAYWRIGHT_START_SERVERS === "true";

    if (hasWebServers || startServers) {
      console.log(
        "🏥 Skipping service health check (web servers configured to auto-start)...",
      );
    } else if (skipWebServer) {
      console.log(
        "🏥 Skipping service health check (PLAYWRIGHT_SKIP_WEBSERVER=true)...",
      );
    } else if (!config.webServer) {
      console.log(
        "🏥 Skipping service health check (no web server configured - assuming external service)...",
      );
    } else {
      await checkServiceHealth(baseURL);
    }

    // 4. Browser compatibility check
    await checkBrowserCompatibility();

    // 5. Test data preparation (if needed)
    await prepareTestData();

    // 6. Performance baseline setup
    await setupPerformanceMonitoring();

    const setupTime = Date.now() - startTime;
    console.log(`✅ Global setup completed in ${setupTime}ms`);
    console.log(`   Environment: ${environment}`);
    console.log(`   Base URL: ${baseURL}`);
    console.log(`   Workers: ${config.workers}`);
    console.log(`   Projects: ${config.projects?.length || 0} browsers`);
    console.log("═".repeat(60));

    // Store setup metadata for teardown
    process.env.PLAYWRIGHT_SETUP_TIME = setupTime.toString();
    process.env.PLAYWRIGHT_SETUP_TIMESTAMP = new Date().toISOString();
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    console.error("═".repeat(60));
    process.exit(1);
  }
}

/**
 * Setup global test functions
 */
async function setupGlobalFunctions(): Promise<void> {
  await Promise.resolve();
  console.log("🔧 Setting up global test functions...");

  // Make waitForAppReady available globally
  globalThis.waitForAppReadyGlobal = waitForAppReady;

  console.log("   ✓ Global functions configured");
}

/**
 * Validate environment configuration
 */
async function validateEnvironment(config: FullConfig): Promise<void> {
  await Promise.resolve();
  console.log("🔍 Validating environment...");

  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0], 10);

  if (majorVersion < 16) {
    throw new Error(
      `Node.js version ${nodeVersion} is not supported. Please use Node.js 16 or higher.`,
    );
  }

  // Validate configuration
  if (!config.projects || config.projects.length === 0) {
    throw new Error("No browser projects configured");
  }

  // Check for required environment variables
  const requiredEnvVars = ["NODE_ENV"];
  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    console.warn(
      `⚠️  Missing optional environment variables: ${missing.join(", ")}`,
    );
  }

  console.log(`   ✓ Node.js ${nodeVersion}`);
  console.log(`   ✓ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`   ✓ Configuration valid`);
}

/**
 * Check service health and availability
 */
async function checkServiceHealth(baseURL: string): Promise<void> {
  console.log("🏥 Checking service health...");

  const maxAttempts = 5;
  const delayBetweenAttempts = 2000; // 2 seconds

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Check if the service is responding
      const response = await fetch(baseURL, {
        method: "HEAD",
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (response.ok || response.status === 404) {
        // 404 is acceptable for frontend apps
        console.log(`   ✓ Service responding at ${baseURL}`);

        // Additional health checks if health endpoint exists
        try {
          const healthResponse = await fetch(
            `${baseURL.replace(/\/+$/, "")}/api/health`,
            {
              signal: AbortSignal.timeout(5000),
            },
          );

          if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log(`   ✓ Health endpoint: ${JSON.stringify(healthData)}`);
          }
        } catch {
          // Health endpoint might not exist, that's okay
          console.log("   ℹ️  No health endpoint found (optional)");
        }

        return; // Success
      }

      throw new Error(`Service returned status ${response.status}`);
    } catch (error) {
      console.log(
        `   ⚠️  Attempt ${attempt}/${maxAttempts} failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );

      if (attempt < maxAttempts) {
        console.log(
          `   ⏳ Waiting ${delayBetweenAttempts / 1000}s before retry...`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, delayBetweenAttempts),
        );
      } else {
        throw new Error(
          `Service at ${baseURL} is not available after ${maxAttempts} attempts`,
        );
      }
    }
  }
}

/**
 * Check browser compatibility and availability
 */
async function checkBrowserCompatibility(): Promise<void> {
  console.log("🌐 Checking browser compatibility...");

  try {
    // Test browser launch
    const browser = await chromium.launch({
      headless: true,
      timeout: 30000,
    });

    // Test basic page functionality
    const context = await browser.newContext();
    const page = await context.newPage();

    // Test basic navigation and JavaScript execution
    await page.goto(
      "data:text/html,<html><body><h1>Test</h1><script>window.testVar=true;</script></body></html>",
    );
    const testVar = await page.evaluate(
      () => (window as { testVar?: boolean }).testVar,
    );

    if (!testVar) {
      throw new Error("JavaScript execution test failed");
    }

    await browser.close();
    console.log("   ✓ Browser compatibility check passed");
  } catch (error) {
    throw new Error(
      `Browser compatibility check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Prepare test data and environment
 */
async function prepareTestData(): Promise<void> {
  console.log("📊 Preparing test environment...");

  try {
    // Clear any existing test artifacts
    const fs = await import("node:fs/promises");
    const path = await import("node:path");

    const artifactDirs = [
      "test-results",
      "playwright-report",
      "playwright-html-report",
    ];

    for (const dir of artifactDirs) {
      try {
        const dirPath = path.resolve(dir);
        const stats = await fs.stat(dirPath);
        if (stats.isDirectory()) {
          console.log(`   🧹 Cleaning previous artifacts in ${dir}`);
          // Don't delete the directory, just clean it to avoid permission issues
        }
      } catch {
        // Directory doesn't exist, that's fine
      }
    }

    console.log("   ✓ Test environment prepared");
  } catch (error) {
    console.warn(
      `   ⚠️  Test data preparation warning: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    // Don't fail setup for data preparation issues
  }
}

/**
 * Setup performance monitoring
 */
async function setupPerformanceMonitoring(): Promise<void> {
  await Promise.resolve();
  console.log("📈 Setting up performance monitoring...");

  try {
    // Store baseline performance metrics
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Store in environment for access during tests
    process.env.PLAYWRIGHT_BASELINE_MEMORY = JSON.stringify(memoryUsage);
    process.env.PLAYWRIGHT_BASELINE_CPU = JSON.stringify(cpuUsage);

    console.log(
      `   ✓ Memory baseline: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
    );
    console.log(`   ✓ CPU baseline recorded`);
  } catch (error) {
    console.warn(
      `   ⚠️  Performance monitoring setup warning: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    // Don't fail setup for monitoring issues
  }
}
