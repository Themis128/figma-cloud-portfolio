import type { Page } from "@playwright/test";

/**
 * Real API Test Utilities
 * Helper functions for testing with real external APIs
 */

export interface RealAPITestConfig {
  enableGitHub: boolean;
  enableFirebase: boolean;
  enableAnalytics: boolean;
  enableSentry: boolean;
  enableSocketIO: boolean;
  enableAnthropic: boolean;
  enableOpenAI: boolean;
  rateLimitDelay: number;
  maxConcurrentRequests: number;
}

/**
 * Load real API test configuration from environment variables
 */
export function loadRealAPIConfig(): RealAPITestConfig {
  return {
    enableGitHub: process.env.TEST_GITHUB_API === "true",
    enableFirebase: process.env.TEST_FIREBASE === "true",
    enableAnalytics: process.env.TEST_ANALYTICS === "true",
    enableSentry: process.env.TEST_SENTRY === "true",
    enableSocketIO: process.env.TEST_SOCKETIO === "true",
    enableAnthropic: process.env.TEST_ANTHROPIC === "true",
    enableOpenAI: process.env.TEST_OPENAI === "true",
    rateLimitDelay: parseInt(process.env.RATE_LIMIT_DELAY_MS || "1000", 10),
    maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS || "2", 10),
  };
}

/**
 * Validate required environment variables for an API
 */
export function validateAPICredentials(apiName: string, requiredVars: string[]): boolean {
  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.warn(`⚠️  ${apiName}: Missing required environment variables: ${missing.join(", ")}`);
    return false;
  }

  return true;
}

/**
 * Wait for rate limit delay between API calls
 */
export async function rateLimitDelay(delayMs: number = 1000): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

/**
 * Retry an API call with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const delay = baseDelay * 2 ** attempt;
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

/**
 * Make a real API call and measure performance
 */
export async function measureAPICall<T>(
  name: string,
  apiCall: () => Promise<T>,
): Promise<{ result: T; duration: number }> {
  const startTime = Date.now();

  try {
    const result = await apiCall();
    const duration = Date.now() - startTime;
    console.log(`✅ ${name} completed in ${duration}ms`);
    return { result, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ ${name} failed after ${duration}ms:`, error);
    throw error;
  }
}

/**
 * Setup page for real API testing
 */
export async function setupRealAPIPage(page: Page): Promise<void> {
  // Don't mock any API calls - let them go through
  // Add logging for debugging
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.error(`Browser console error: ${msg.text()}`);
    }
  });

  page.on("pageerror", (error) => {
    console.error(`Page error: ${error.message}`);
  });

  page.on("requestfailed", (request) => {
    console.warn(`Request failed: ${request.url()} - ${request.failure()?.errorText}`);
  });

  // Log API calls for monitoring
  page.on("request", (request) => {
    const url = request.url();
    if (
      url.includes("/api/") ||
      url.includes("firebase") ||
      url.includes("github") ||
      url.includes("sentry") ||
      url.includes("anthropic")
    ) {
      console.log(`📡 API Request: ${request.method()} ${url}`);
    }
  });

  page.on("response", (response) => {
    const url = response.url();
    if (
      url.includes("/api/") ||
      url.includes("firebase") ||
      url.includes("github") ||
      url.includes("sentry") ||
      url.includes("anthropic")
    ) {
      console.log(`📥 API Response: ${response.status()} ${url}`);
    }
  });
}

/**
 * Cleanup test data after real API testing
 */
export async function cleanupTestData(
  apiName: string,
  cleanupFn: () => Promise<void>,
): Promise<void> {
  if (process.env.CLEANUP_TEST_DATA !== "true") {
    console.log(`⏭️  Skipping cleanup for ${apiName} (CLEANUP_TEST_DATA=false)`);
    return;
  }

  try {
    console.log(`🧹 Cleaning up test data for ${apiName}...`);
    await cleanupFn();
    console.log(`✅ Cleanup complete for ${apiName}`);
  } catch (error) {
    console.error(`❌ Cleanup failed for ${apiName}:`, error);
    // Don't throw - cleanup failures shouldn't fail tests
  }
}

/**
 * Check if an API service is available
 */
export async function checkAPIAvailability(
  apiName: string,
  healthCheckUrl: string,
): Promise<boolean> {
  try {
    const response = await fetch(healthCheckUrl, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    const available = response.ok;
    console.log(`${available ? "✅" : "❌"} ${apiName} availability: ${response.status}`);
    return available;
  } catch (error) {
    console.error(`❌ ${apiName} health check failed:`, error);
    return false;
  }
}

/**
 * Wait for app to be fully ready for testing
 */
export async function waitForAppReady(page: Page, timeout: number = 30000): Promise<void> {
  try {
    await page.waitForSelector("body", { timeout });
    await page.waitForLoadState("domcontentloaded", { timeout });
    await page.waitForLoadState("networkidle", { timeout: timeout / 2 });
  } catch (_error) {
    console.warn("App readiness check timed out, proceeding anyway");
  }
}

/**
 * Track API usage metrics for cost monitoring
 */
export class APIUsageTracker {
  private metrics: Map<
    string,
    {
      calls: number;
      totalDuration: number;
      errors: number;
      estimatedCost: number;
    }
  > = new Map();

  recordCall(apiName: string, duration: number, cost: number = 0, success: boolean = true) {
    const current = this.metrics.get(apiName) || {
      calls: 0,
      totalDuration: 0,
      errors: 0,
      estimatedCost: 0,
    };

    this.metrics.set(apiName, {
      calls: current.calls + 1,
      totalDuration: current.totalDuration + duration,
      errors: current.errors + (success ? 0 : 1),
      estimatedCost: current.estimatedCost + cost,
    });
  }

  getReport(): string {
    let report = "\n📊 Real API Usage Report:\n";
    report += `${"━".repeat(50)}\n`;

    this.metrics.forEach((metrics, apiName) => {
      const avgDuration = metrics.calls > 0 ? metrics.totalDuration / metrics.calls : 0;
      const successRate = metrics.calls > 0 ? (1 - metrics.errors / metrics.calls) * 100 : 0;

      report += `\n${apiName}:\n`;
      report += `  Calls: ${metrics.calls}\n`;
      report += `  Avg Duration: ${avgDuration.toFixed(0)}ms\n`;
      report += `  Success Rate: ${successRate.toFixed(1)}%\n`;
      if (metrics.estimatedCost > 0) {
        report += `  Est. Cost: $${metrics.estimatedCost.toFixed(4)}\n`;
      }
    });

    report += "━".repeat(50);
    return report;
  }
}

// Global usage tracker
export const usageTracker = new APIUsageTracker();
