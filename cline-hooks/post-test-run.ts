#!/usr/bin/env tsx
/**
 * Post-Test Run Hook
 * Executes after tests complete
 * Analyzes test results and provides feedback
 *
 * Usage: Run automatically by Cline or manually via: npx tsx cline-hooks/post-test-run.ts
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

interface TestResult {
  success: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
  timestamp: string;
  testSuite: string;
}

function parseTestOutput(output: string): TestResult {
  const lines = output.split("\n");
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let duration = 0;

  // Parse test results from various test runners
  for (const line of lines) {
    if (line.includes("passed")) {
      passedTests = parseInt(line.match(/(\d+)\s+passed/)?.[1] || "0", 10);
    }
    if (line.includes("failed")) {
      failedTests = parseInt(line.match(/(\d+)\s+failed/)?.[1] || "0", 10);
    }
    if (line.includes("total")) {
      totalTests = parseInt(line.match(/(\d+)\s+total/)?.[1] || "0", 10);
    }
    if (line.includes("ms")) {
      duration = parseInt(line.match(/(\d+)\s+ms/)?.[1] || "0", 10);
    }
  }

  return {
    success: failedTests === 0,
    totalTests: totalTests || passedTests + failedTests,
    passedTests,
    failedTests,
    duration,
    timestamp: new Date().toISOString(),
    testSuite: process.argv[2] || "unknown",
  };
}

function generateTestReport(result: TestResult): void {
  const reportDir = path.join(process.cwd(), ".cline", "reports");

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportFile = path.join(reportDir, `test-report-${Date.now()}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(result, null, 2));

  console.log(`📄 Test report saved to: ${reportFile}`);
}

function analyzeTestTrends(): void {
  const logDir = path.join(process.cwd(), ".cline", "logs");
  const logFile = path.join(logDir, "test-log.json");

  if (!fs.existsSync(logFile)) return;

  const logs = JSON.parse(fs.readFileSync(logFile, "utf-8"));
  const recentTests = logs
    .filter((log: any) => log.type === "test_run")
    .slice(-10);

  if (recentTests.length < 3) return;

  const successRate =
    (recentTests.filter((t: any) => t.success).length / recentTests.length) *
    100;

  console.log(`📊 Recent test success rate: ${successRate.toFixed(1)}%`);

  if (successRate < 80) {
    console.warn("⚠️  Test success rate is below 80%");
  }
}

function updateTestMetrics(result: TestResult): void {
  const metricsFile = path.join(process.cwd(), ".cline", "metrics.json");

  let metrics = { tests: [] };
  if (fs.existsSync(metricsFile)) {
    metrics = JSON.parse(fs.readFileSync(metricsFile, "utf-8"));
  }

  metrics.tests.push({
    timestamp: result.timestamp,
    success: result.success,
    total: result.totalTests,
    passed: result.passedTests,
    failed: result.failedTests,
    duration: result.duration,
  });

  // Keep only last 50 test runs
  if (metrics.tests.length > 50) {
    metrics.tests = metrics.tests.slice(-50);
  }

  fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));
}

async function main() {
  const testOutput = process.argv[2] || "";
  const result = parseTestOutput(testOutput);

  console.log("🧪 Cline Post-Test Run Hook");
  console.log("==========================");
  console.log(`📊 Test Suite: ${result.testSuite}`);
  console.log(`✅ Success: ${result.success}`);
  console.log(`📈 Total: ${result.totalTests}`);
  console.log(`✅ Passed: ${result.passedTests}`);
  console.log(`❌ Failed: ${result.failedTests}`);
  console.log(`⏱️  Duration: ${result.duration}ms`);

  // Generate report
  generateTestReport(result);

  // Update metrics
  updateTestMetrics(result);

  // Analyze trends
  analyzeTestTrends();

  if (result.success) {
    console.log("\n✅ All tests passed!");
  } else {
    console.log("\n❌ Some tests failed");
    console.log("💡 Consider running: pnpm test -- --verbose");
  }
}

main().catch(console.error);