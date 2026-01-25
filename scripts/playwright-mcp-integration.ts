import type { FullConfig, Reporter, Suite, TestCase, TestResult } from "@playwright/test";
import { spawn } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  private requestQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;
  private lastProgressUpdate = 0;
  private progressUpdateInterval = 1000; // 1 second minimum between progress updates
  private logBuffer: Array<{ level: string; suite: string; message: string }> = [];
  private logFlushInterval = 500; // 500ms for log batching
  private logFlushTimer: NodeJS.Timeout | null = null;
  private resultsCheckInterval = 2000; // 2 seconds for results monitoring
  private resultsCheckTimer: NodeJS.Timeout | null = null;
  private maxRetries = 3;
  private retryDelay = 1000;
  private connectionTimeout = 5000;

  constructor() {
    this.progressServerUrl = process.env.PROGRESS_SERVER_URL || "http://localhost:3002";

    // Start periodic log flushing
    this.startLogFlushing();
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
    const _serverProcess = spawn("pnpm", ["exec", "tsx", serverPath], {
      stdio: "inherit",
      detached: true,
    });

    // Wait for server to start
    await new Promise((resolve) => setTimeout(resolve, 3000));
    this.isServerRunning = true;
    console.log("✅ Progress server started");
  }

  /**
   * Cleanup resources and stop timers
   */
  cleanup(): void {
    // Stop log flushing
    if (this.logFlushTimer) {
      clearInterval(this.logFlushTimer);
      this.logFlushTimer = null;
    }

    // Stop results monitoring
    this.stopMonitoringResults();

    // Clear request queue
    this.requestQueue = [];
    this.isProcessingQueue = false;

    // Clear log buffer
    this.logBuffer = [];

    console.log("🧹 Playwright MCP Integration cleanup completed");
  }

  /**
   * Get current integration statistics for monitoring
   */
  getStats(): {
    isServerRunning: boolean;
    queueLength: number;
    isProcessingQueue: boolean;
    logBufferSize: number;
    lastProgressUpdate: number;
  } {
    return {
      isServerRunning: this.isServerRunning,
      queueLength: this.requestQueue.length,
      isProcessingQueue: this.isProcessingQueue,
      logBufferSize: this.logBuffer.length,
      lastProgressUpdate: this.lastProgressUpdate,
    };
  }

  /**
   * Execute HTTP request with retry logic and timeout
   */
  private async executeRequest(
    url: string,
    options: RequestInit,
    operation: string,
  ): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.connectionTimeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          return;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        lastError = error as Error;

        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * 2 ** (attempt - 1); // Exponential backoff
          console.warn(`⚠️  ${operation} failed (attempt ${attempt}/${this.maxRetries}):`, error);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    console.error(`❌ ${operation} failed after ${this.maxRetries} attempts:`, lastError);
  }

  /**
   * Queue HTTP requests to prevent overwhelming the server
   */
  private async queueRequest(requestFn: () => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          await requestFn();
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  /**
   * Process queued requests with concurrency control
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const requestFn = this.requestQueue.shift();
      if (requestFn) {
        try {
          await requestFn();
        } catch (error) {
          console.warn("Request failed:", error);
        }

        // Small delay between requests to prevent overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Send test progress update to the server with throttling
   */
  async updateTestProgress(progress: TestProgress): Promise<void> {
    if (!this.isServerRunning) return;

    // Throttle progress updates
    const now = Date.now();
    if (now - this.lastProgressUpdate < this.progressUpdateInterval) {
      return;
    }
    this.lastProgressUpdate = now;

    await this.queueRequest(async () => {
      await this.executeRequest(
        `${this.progressServerUrl}/api/progress`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(progress),
        },
        "Progress update",
      );
    });
  }

  /**
   * Add log entry to buffer for batch processing
   */
  private addLogToBuffer(level: string, suite: string, message: string): void {
    this.logBuffer.push({ level, suite, message });
  }

  /**
   * Start periodic log flushing
   */
  private startLogFlushing(): void {
    this.logFlushTimer = setInterval(() => {
      this.flushLogs();
    }, this.logFlushInterval);
  }

  /**
   * Flush buffered logs to server
   */
  private async flushLogs(): Promise<void> {
    if (this.logBuffer.length === 0 || !this.isServerRunning) {
      return;
    }

    const logsToFlush = [...this.logBuffer];
    this.logBuffer = [];

    await this.queueRequest(async () => {
      const logEntries: LogEntry[] = logsToFlush.map((log) => ({
        id: Date.now().toString() + Math.random().toString(),
        level: log.level as "info" | "warn" | "error" | "debug",
        suite: log.suite,
        message: log.message,
        timestamp: new Date(),
      }));

      await this.executeRequest(
        `${this.progressServerUrl}/api/log`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(logEntries),
        },
        "Log batch",
      );
    });
  }

  /**
   * Send log entry to the server (buffered)
   */
  async sendLog(level: string, suite: string, message: string): Promise<void> {
    if (!this.isServerRunning) return;
    this.addLogToBuffer(level, suite, message);
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

    await this.queueRequest(async () => {
      await this.executeRequest(
        `${this.progressServerUrl}/api/test-status`,
        {
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
        },
        "Test status update",
      );
    });
  }

  /**
   * Monitor test results with optimized file I/O
   */
  async monitorTestResults(): Promise<void> {
    if (this.resultsCheckTimer) {
      clearInterval(this.resultsCheckTimer);
    }

    const resultsPath = path.join(__dirname, "../test-results/results.json");
    let lastModified = 0;

    const checkResults = async () => {
      try {
        // Check file stats first to avoid unnecessary reads
        if (!fs.existsSync(resultsPath)) {
          return;
        }

        const stats = fs.statSync(resultsPath);
        if (stats.mtime.getTime() <= lastModified) {
          return; // File hasn't changed
        }

        lastModified = stats.mtime.getTime();

        // Read file with error handling
        const data = JSON.parse(fs.readFileSync(resultsPath, "utf8"));
        await this.processTestResults(data);
      } catch (error) {
        console.warn("Failed to read test results:", error);
      }
    };

    // Start monitoring with optimized interval
    this.resultsCheckTimer = setInterval(checkResults, this.resultsCheckInterval);
  }

  /**
   * Stop monitoring test results
   */
  stopMonitoringResults(): void {
    if (this.resultsCheckTimer) {
      clearInterval(this.resultsCheckTimer);
      this.resultsCheckTimer = null;
    }
  }

  /**
   * Process test results and send updates with memory optimization
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

    // Use efficient counting with early returns
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;

    // Process suites with memory-efficient iteration
    for (const suite of testData.suites) {
      if (!suite.specs) continue;

      for (const spec of suite.specs) {
        if (!spec.tests) continue;

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
              default:
                // Unknown status, treat as running
                break;
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
if (import.meta.url === `file://${process.argv[1]}`) {
  mcpIntegration.startProgressServer().then(() => {
    console.log("Playwright MCP Integration ready");
    mcpIntegration.monitorTestResults();
  });
}

// Playwright Reporter Integration
export default class MCPReporter implements Reporter {
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
