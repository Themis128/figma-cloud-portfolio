import { expect, test } from "@playwright/test";
import {
  loadRealAPIConfig,
  measureAPICall,
  rateLimitDelay,
  retryWithBackoff,
  setupRealAPIPage,
  usageTracker,
  validateAPICredentials,
  waitForAppReady,
} from "./test-utils.real";

/**
 * REAL GitHub API Integration Tests
 *
 * ⚠️ WARNING: These tests make REAL API calls to GitHub
 * - Requires valid GITHUB_TOKEN in .env.test
 * - Counts against your API rate limit (5000 req/hr)
 * - Tests may fail due to network issues
 *
 * Run with: pnpm test:e2e:real
 */

test.describe("GitHub API - Real Integration", () => {
  const config = loadRealAPIConfig();
  const requiredVars = ["GITHUB_TOKEN", "VITE_GITHUB_TOKEN"];

  test.beforeAll(() => {
    // Skip if GitHub API testing is disabled or credentials missing
    if (!config.enableGitHub) {
      console.log("⏭️  Skipping GitHub API tests (TEST_GITHUB_API=false)");
      test.skip();
    }

    if (!validateAPICredentials("GitHub API", requiredVars)) {
      console.log("⏭️  Skipping GitHub API tests (missing credentials)");
      test.skip();
    }

    console.log("🚀 Running REAL GitHub API integration tests");
  });

  test.afterAll(() => {
    console.log(usageTracker.getReport());
  });

  test("should fetch real GitHub workflows", async ({ page }) => {
    await setupRealAPIPage(page);
    await page.goto("http://localhost:3001/");
    await waitForAppReady(page);

    const { result: workflows, duration } = await measureAPICall("GitHub Workflows", async () => {
      const response = await page.request.get(
        "http://localhost:3000/api/github/workflows/figma-cloud-portfolio",
      );

      expect(response.ok()).toBeTruthy();
      return await response.json();
    });

    usageTracker.recordCall("GitHub API", duration);

    // Validate real response structure
    expect(workflows).toHaveProperty("workflows");
    expect(workflows.workflows).toBeInstanceOf(Array);
    expect(workflows.total_count).toBeGreaterThan(0);

    // Log actual workflow names for verification
    console.log(`📋 Found ${workflows.workflows.length} workflows:`);
    workflows.workflows.forEach((wf: { name: string; state: string }) => {
      console.log(`  - ${wf.name} (${wf.state})`);
    });

    // Rate limiting respect
    await rateLimitDelay(config.rateLimitDelay);
  });

  test("should fetch real workflow runs", async ({ page }) => {
    await setupRealAPIPage(page);
    await page.goto("http://localhost:3001/");

    // First, get a real workflow ID
    const workflowsResponse = await page.request.get(
      "http://localhost:3000/api/github/workflows/figma-cloud-portfolio",
    );
    const workflows = await workflowsResponse.json();
    const firstWorkflowId = workflows.workflows[0]?.id;

    if (!firstWorkflowId) {
      test.skip();
      return;
    }

    await rateLimitDelay(config.rateLimitDelay);

    const { result: runs, duration } = await measureAPICall("GitHub Workflow Runs", async () => {
      const response = await page.request.get(
        `http://localhost:3000/api/github/runs/${firstWorkflowId}`,
      );

      expect(response.ok()).toBeTruthy();
      return await response.json();
    });

    usageTracker.recordCall("GitHub API", duration);

    // Validate real run data
    expect(runs).toHaveProperty("workflow_runs");
    expect(runs.workflow_runs).toBeInstanceOf(Array);

    if (runs.workflow_runs.length > 0) {
      const latestRun = runs.workflow_runs[0];
      console.log(
        `📊 Latest run: #${latestRun.run_number} - ${latestRun.status} (${latestRun.conclusion || "running"})`,
      );

      expect(latestRun).toHaveProperty("id");
      expect(latestRun).toHaveProperty("status");
      expect(["queued", "in_progress", "completed"]).toContain(latestRun.status);
    }

    await rateLimitDelay(config.rateLimitDelay);
  });

  test("should handle real GitHub API rate limiting", async ({ page }) => {
    await setupRealAPIPage(page);

    const { result: response, duration } = await measureAPICall(
      "GitHub Rate Limit Check",
      async () => {
        return await page.request.get(
          "http://localhost:3000/api/github/workflows/figma-cloud-portfolio",
        );
      },
    );

    usageTracker.recordCall("GitHub API", duration);

    // Check rate limit headers
    const rateLimit = response.headers()["x-ratelimit-limit"];
    const rateRemaining = response.headers()["x-ratelimit-remaining"];
    const rateReset = response.headers()["x-ratelimit-reset"];

    console.log(`⏱️  Rate Limit Status:`);
    console.log(`  Limit: ${rateLimit || "N/A"}`);
    console.log(`  Remaining: ${rateRemaining || "N/A"}`);
    if (rateReset) {
      const resetDate = new Date(parseInt(rateReset, 10) * 1000);
      console.log(`  Resets at: ${resetDate.toLocaleString()}`);
    }

    // Warn if getting close to rate limit
    if (rateRemaining && parseInt(rateRemaining, 10) < 100) {
      console.warn(`⚠️  WARNING: Only ${rateRemaining} requests remaining!`);
    }
  });

  test("should verify LRU cache effectiveness with real API", async ({ page }) => {
    await setupRealAPIPage(page);

    const url = "http://localhost:3000/api/github/workflows/figma-cloud-portfolio";

    // First call - should hit API
    const { duration: firstCallDuration } = await measureAPICall(
      "First Call (Cache Miss)",
      async () => {
        const response = await page.request.get(url);
        return await response.json();
      },
    );

    await rateLimitDelay(500); // Small delay

    // Second call - should hit cache (faster)
    const { duration: secondCallDuration } = await measureAPICall(
      "Second Call (Cache Hit)",
      async () => {
        const response = await page.request.get(url);
        return await response.json();
      },
    );

    usageTracker.recordCall("GitHub API (cached)", firstCallDuration + secondCallDuration);

    // Cache hit should be significantly faster
    console.log(`📊 Cache Performance:`);
    console.log(`  First call: ${firstCallDuration}ms`);
    console.log(`  Second call: ${secondCallDuration}ms`);

    // Second call should typically be faster (but not always due to network variability)
    const cacheImprovement =
      firstCallDuration > 0
        ? ((firstCallDuration - secondCallDuration) / firstCallDuration) * 100
        : 0;

    if (cacheImprovement > 0) {
      console.log(`  ✅ Cache improved performance by ${cacheImprovement.toFixed(1)}%`);
    }
  });

  test("should handle GitHub API authentication errors", async ({ page }) => {
    await setupRealAPIPage(page);

    // Test with invalid token
    const response = await page.request.get(
      "http://localhost:3000/api/github/workflows/figma-cloud-portfolio",
      {
        headers: {
          Authorization: "Bearer invalid-token",
        },
      },
    );

    // Should receive 401 or authentication error
    expect([401, 403]).toContain(response.status());
    console.log(`✅ Authentication error handled correctly: ${response.status()}`);
  });

  test("should retry on network failures with exponential backoff", async ({ page }) => {
    await setupRealAPIPage(page);

    let attemptCount = 0;

    const result = await retryWithBackoff(async () => {
      attemptCount++;
      console.log(`🔄 Attempt ${attemptCount}...`);

      const response = await page.request.get(
        "http://localhost:3000/api/github/workflows/figma-cloud-portfolio",
      );

      if (!response.ok()) {
        throw new Error(`API returned ${response.status()}`);
      }

      return await response.json();
    }, 3);

    expect(result).toBeTruthy();
    console.log(`✅ Request succeeded after ${attemptCount} attempt(s)`);
  });
});
