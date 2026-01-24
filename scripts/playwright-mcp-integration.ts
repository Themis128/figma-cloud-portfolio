import type { FullConfig, Reporter, Suite, TestCase, TestResult } from "@playwright/test";
import { spawn } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

interface TestProgress {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  running: number;
  progress: number;
  currentTest: string;
  timestamp: number;
}

interface LogEntry {
  id: string;
  level: "info" | "warn" | "error" | "debug";
  suite: string;
  message: string;
  timestamp: Date;
}

class PlaywrightMCPIntegration {
  private progressServerUrl: string;
  private isServerRunning = false;

  constructor() {
    this.progressServerUrl = process.env.PROGRESS_SERVER_URL || "http://localhost:3001";
  }

  /**
   * Start the progress server if not already running
   */
  async startProgressServer(): Promise<void> {
    try {
      const response = await fetch(`${this.progressServerUrl}/api/progress`);
      if (response.ok) {
        console.log("✅ Progress server already running");
        this.isServerRunning = true;
        return;
      }
    } catch (_error) {
      console.log("🚀 Starting progress server...");
    }

    // Start the progress server
    const serverPath = path.join(__dirname, "../server/test-progress-server.ts");
    const _serverProcess = spawn("npx", ["tsx", serverPath], {
      stdio: "inherit",
      detached: true,
    });

    // Wait for server to start
    await new Promise((resolve) => setTimeout(resolve, 3000));
    this.isServerRunning = true;
    console.log("✅ Progress server started");
  }

  /**
   * Send test progress update to the server
   */
  async updateTestProgress(progress: TestProgress): Promise<void> {
    if (!this.isServerRunning) return;

    try {
      await fetch(`${this.progressServerUrl}/api/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(progress),
      });
    } catch (error) {
      console.warn("Failed to update test progress:", error);
    }
  }

  /**
   * Send log entry to the server
   */
  async sendLog(level: string, suite: string, message: string): Promise<void> {
    if (!this.isServerRunning) return;

    const logEntry: LogEntry = {
      id: Date.now().toString() + Math.random().toString(),
      level: level as "info" | "warn" | "error" | "debug",
      suite,
      message,
      timestamp: new Date(),
    };

    try {
      await fetch(`${this.progressServerUrl}/api/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logEntry),
      });
    } catch (error) {
      console.warn("Failed to send log:", error);
    }
  }

  /**
   * Update test status for a specific test
   */
  async updateTestStatus(
    suiteName: string,
    testName: string,
    status: string,
    duration?: number,
  ): Promise<void> {
    if (!this.isServerRunning) return;

    try {
      await fetch(`${this.progressServerUrl}/api/test-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          suiteName,
          testName,
          status,
          duration,
        }),
      });
    } catch (error) {
      console.warn("Failed to update test status:", error);
    }
  }

  /**
   * Monitor test results and send updates
   */
  async monitorTestResults(): Promise<void> {
    const resultsPath = path.join(__dirname, "../test-results/results.json");

    const checkResults = async () => {
      if (fs.existsSync(resultsPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(resultsPath, "utf8"));
          await this.processTestResults(data);
        } catch (error) {
          console.warn("Failed to read test results:", error);
        }
      }
    };

    // Check for results every 5 seconds
    setInterval(checkResults, 5000);
  }

  /**
   * Process test results and send updates
   */
  private async processTestResults(data: unknown): Promise<void> {
    const testData = data as {
      suites?: Array<{
        specs?: Array<{
          tests?: Array<{
            results?: Array<{
              status: string;
            }>;
          }>;
        }>;
      }>;
    };

    if (!testData || !testData.suites) return;

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;

    for (const suite of data.suites) {
      if (suite.specs) {
        for (const spec of suite.specs) {
          if (spec.tests) {
            for (const test of spec.tests) {
              totalTests++;

              if (test.results && test.results.length > 0) {
                const result = test.results[0];
                switch (result.status) {
                  case "passed":
                    passedTests++;
                    break;
                  case "failed":
                    failedTests++;
                    break;
                  case "skipped":
                    skippedTests++;
                    break;
                }
              }
            }
          }
        }
      }
    }

    const runningTests = Math.max(0, totalTests - passedTests - failedTests - skippedTests);
    const progress = Math.round(((passedTests + failedTests + skippedTests) / totalTests) * 100);

    const progressData: TestProgress = {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      skipped: skippedTests,
      running: runningTests,
      progress,
      currentTest: `Processing ${totalTests} tests...`,
      timestamp: Date.now(),
    };

    await this.updateTestProgress(progressData);
  }

  /**
   * Send Playwright test events to the progress server
   */
  async sendTestEvent(event: string, data: unknown): Promise<void> {
    if (!this.isServerRunning) return;

    try {
      await fetch(`${this.progressServerUrl}/api/test-event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.warn("Failed to send test event:", error);
    }
  }
}

// Global integration instance
const mcpIntegration = new PlaywrightMCPIntegration();

// Export for use in test files
export { mcpIntegration, PlaywrightMCPIntegration };

// If running directly, start the server
if (require.main === module) {
  mcpIntegration.startProgressServer().then(() => {
    console.log("Playwright MCP Integration ready");
    mcpIntegration.monitorTestResults();
  });
}

// Playwright Reporter Integration
export class MCPReporter implements Reporter {
  private integration: PlaywrightMCPIntegration;

  constructor() {
    this.integration = mcpIntegration;
  }

  async onBegin(_config: FullConfig, _suite: Suite) {
    await this.integration.startProgressServer();
    await this.integration.sendLog("info", "Playwright", "Test execution started");
  }

  async onTestBegin(test: TestCase) {
    await this.integration.sendLog("info", test.parent.title, `Starting: ${test.title}`);
    await this.integration.sendTestEvent("test-begin", {
      suite: test.parent.title,
      test: test.title,
      startTime: new Date().toISOString(),
    });
  }

  async onTestEnd(test: TestCase, result: TestResult) {
    const status = result.status;
    const duration = result.duration;

    await this.integration.updateTestStatus(test.parent.title, test.title, status, duration);

    await this.integration.sendLog(
      status === "passed" ? "info" : "error",
      test.parent.title,
      `${status === "passed" ? "✓" : "✗"} ${test.title} (${duration}ms)`,
    );

    await this.integration.sendTestEvent("test-end", {
      suite: test.parent.title,
      test: test.title,
      status,
      duration,
      endTime: new Date().toISOString(),
    });
  }

  async onEnd(result: {
    status: string;
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  }) {
    await this.integration.sendLog(
      "info",
      "Playwright",
      `Test execution completed: ${result.status}`,
    );
    await this.integration.sendTestEvent("test-end", {
      total: result.total,
      passed: result.passed,
      failed: result.failed,
      skipped: result.skipped,
      duration: result.duration,
    });
  }
}

// Example usage in test files:
/*
import { test } from '@playwright/test';
import { mcpIntegration } from './scripts/playwright-mcp-integration';

test.beforeAll(async () => {
  await mcpIntegration.startProgressServer();
});

test('example test', async ({ page }) => {
  await mcpIntegration.sendLog('info', 'Example Tests', 'Starting example test');
  
  // Test code here
  await page.goto('/');
  await expect(page).toHaveTitle(/Portfolio/);
  
  await mcpIntegration.sendLog('info', 'Example Tests', 'Example test completed successfully');
});
*/
