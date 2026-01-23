#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 *
 * This script runs all the new comprehensive tests for the portfolio application.
 * It includes tests for:
 * - Performance monitoring
 * - Push notifications
 * - Analytics integration
 * - Code quality
 * - PWA features
 * - Accessibility
 * - Security
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path, { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = join(__dirname, "..");
const TESTS_DIR = join(PROJECT_ROOT, "playwright-tests");

console.log("🚀 Starting Comprehensive Test Suite");
console.log("📁 Project Root:", PROJECT_ROOT);
console.log("🧪 Tests Directory:", TESTS_DIR);

// Check if required files exist
const requiredFiles = [
  "performance-monitoring.spec.ts",
  "push-notifications.spec.ts",
  "analytics-integration.spec.ts",
  "code-quality.spec.ts",
  "test-utils.ts",
  "global-setup.ts",
  "global-teardown.ts",
  "comprehensive-tests.config.ts",
];

console.log("\n📋 Checking required test files...");

for (const file of requiredFiles) {
  const filePath = path.join(TESTS_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing required file: ${file}`);
    process.exit(1);
  }
  console.log(`✅ Found: ${file}`);
}

console.log("\n🔧 Installing test dependencies...");

try {
  // Install Playwright browsers
  console.log("📦 Installing Playwright browsers...");
  execSync("npx playwright install", {
    stdio: "inherit",
    cwd: PROJECT_ROOT,
  });
} catch (error) {
  console.error("❌ Failed to install Playwright browsers:", error.message);
  process.exit(1);
}

console.log("\n🧪 Running comprehensive test suite...");

// Test configurations to run
const testConfigs = [
  {
    name: "Performance Monitoring Tests",
    config: "playwright-tests/performance-monitoring.spec.ts",
    description: "Tests Core Web Vitals, analytics integration, and performance monitoring",
  },
  {
    name: "Push Notifications Tests",
    config: "playwright-tests/push-notifications.spec.ts",
    description: "Tests push notification functionality and service worker integration",
  },
  {
    name: "Analytics Integration Tests",
    config: "playwright-tests/analytics-integration.spec.ts",
    description: "Tests Google Analytics 4 integration and custom analytics endpoints",
  },
  {
    name: "Code Quality Tests",
    config: "playwright-tests/code-quality.spec.ts",
    description: "Tests TypeScript compilation, bundle optimization, and code quality",
  },
];

let allTestsPassed = true;

for (const testConfig of testConfigs) {
  console.log(`\n🧪 Running ${testConfig.name}`);
  console.log(`📝 ${testConfig.description}`);

  try {
    execSync(
      `npx playwright test ${testConfig.config} --config=playwright-tests/comprehensive-tests.config.ts`,
      {
        stdio: "inherit",
        cwd: PROJECT_ROOT,
        env: { ...process.env, CI: "true" },
      },
    );
    console.log(`✅ ${testConfig.name} completed successfully`);
  } catch (error) {
    console.error(`❌ ${testConfig.name} failed:`, error.message);
    allTestsPassed = false;
  }
}

// Run all tests together
console.log("\n🎯 Running all comprehensive tests together...");
try {
  execSync(
    "npx playwright test playwright-tests/ --config=playwright-tests/comprehensive-tests.config.ts",
    {
      stdio: "inherit",
      cwd: PROJECT_ROOT,
      env: { ...process.env, CI: "true" },
    },
  );
  console.log("✅ All comprehensive tests completed successfully");
} catch (error) {
  console.error("❌ Some comprehensive tests failed:", error.message);
  allTestsPassed = false;
}

// Generate test report
console.log("\n📊 Generating test reports...");

const reportsDir = path.join(PROJECT_ROOT, "playwright-report");
const testResultsDir = path.join(PROJECT_ROOT, "test-results");

if (fs.existsSync(reportsDir)) {
  console.log(`📄 HTML reports available at: ${reportsDir}`);
}

if (fs.existsSync(testResultsDir)) {
  console.log(`📈 Test results available at: ${testResultsDir}`);
}

// Summary
console.log("\n🏁 Test Suite Summary");
console.log("====================");

if (allTestsPassed) {
  console.log("✅ All tests passed successfully!");
  console.log("🎉 Your portfolio application is ready for production!");
  console.log("\n📋 Test Coverage:");
  console.log("   • Performance monitoring and Core Web Vitals");
  console.log("   • Push notifications and service workers");
  console.log("   • Google Analytics 4 integration");
  console.log("   • Code quality and TypeScript compilation");
  console.log("   • PWA features and accessibility");
  console.log("   • Security and error handling");
  process.exit(0);
} else {
  console.log("❌ Some tests failed. Please review the test output above.");
  console.log("🔧 Check the test reports for detailed information.");
  process.exit(1);
}
